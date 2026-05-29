from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from .models import User, ProducerProfile, Message, PushSubscription
from .serializers import RegisterSerializer, UserSerializer, UpdateProfileSerializer, ProducerProfileSerializer, MessageSerializer
from django.db import models as djmodels
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email requis.'}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # On renvoie toujours OK pour ne pas révéler si l'email existe
            return Response({'message': 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.'})

        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://sahel-market-gamma.vercel.app')
        reset_link   = f'{frontend_url}/reset-password/{uid}/{token}/'

        try:
            send_mail(
                subject='Réinitialisation de votre mot de passe — Sahel Market',
                message=f'''Bonjour {user.first_name or user.username},

Vous avez demandé la réinitialisation de votre mot de passe Sahel Market.

Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable 24h) :
{reset_link}

Si vous n'avez pas fait cette demande, ignorez ce message.

— L'équipe Sahel Market''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            return Response({'error': "Impossible d'envoyer l'email. Réessayez plus tard."}, status=500)

        return Response({'message': 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid           = request.data.get('uid', '')
        token         = request.data.get('token', '')
        new_password  = request.data.get('new_password', '')
        new_password2 = request.data.get('new_password2', '')

        if not all([uid, token, new_password, new_password2]):
            return Response({'error': 'Tous les champs sont requis.'}, status=400)

        if new_password != new_password2:
            return Response({'error': 'Les mots de passe ne correspondent pas.'}, status=400)

        if len(new_password) < 8:
            return Response({'error': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=400)

        try:
            from django.utils.encoding import force_str
            user_id = force_str(urlsafe_base64_decode(uid))
            user    = User.objects.get(pk=user_id)
        except (TypeError, ValueError, User.DoesNotExist):
            return Response({'error': 'Lien invalide ou expiré.'}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Lien invalide ou expiré.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Mot de passe réinitialisé avec succès.'})


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone    = request.data.get('phone', '').strip().replace(' ', '')
        password = request.data.get('password')
        try:
            user_obj = User.objects.get(phone=phone)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if not user:
            return Response({'error': 'Numéro de téléphone ou mot de passe incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Déconnexion réussie.'})

class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateProfileSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user
    

class SuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject', '').strip()
        message = request.data.get('message', '').strip()

        if not subject or not message:
            return Response(
                {'error': 'Sujet et message requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sauvegarde en base
        from .models import Suggestion
        Suggestion.objects.create(
            user=request.user,
            subject=subject,
            message=message,
        )

        # Envoi email
        try:
            send_mail(
                subject=f'[Sahel Market] Suggestion : {subject}',
                message=f'''
Nouvelle suggestion reçue sur Sahel Market.

De : {request.user.username} ({request.user.email})
Rôle : {request.user.role}
Sujet : {subject}

Message :
{message}
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['sahelmarket@gmail.com'],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({'message': 'Suggestion envoyée. Merci !'})
    


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


class ProducerValidationView(APIView):
    """Liste les artisans en attente et permet à l'admin de les approuver/rejeter."""
    permission_classes = [IsAdmin]

    def get(self, request):
        pending = User.objects.filter(role='producer', is_verified=False).order_by('date_joined')
        return Response(UserSerializer(pending, many=True).data)

    def patch(self, request, user_id):
        try:
            producer = User.objects.get(id=user_id, role='producer')
        except User.DoesNotExist:
            return Response({'error': 'Artisan introuvable.'}, status=404)

        action = request.data.get('action')
        if action == 'approve':
            producer.is_verified = True
            producer.is_active   = True
            producer.save()
            return Response({'message': f'{producer.username} validé.', 'is_verified': True})
        elif action == 'reject':
            producer.is_active = False
            producer.save()
            return Response({'message': f'{producer.username} rejeté.', 'is_active': False})
        return Response({'error': 'Action invalide. Utilisez "approve" ou "reject".'}, status=400)


class ProducerListPublicView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.filter(role='producer', is_active=True, is_verified=True).order_by('-date_joined')


class ProducerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['producer', 'admin']:
            return Response({'error': 'Accès refusé.'}, status=403)
        profile, _ = ProducerProfile.objects.get_or_create(user=request.user)
        return Response(ProducerProfileSerializer(profile).data)

    def patch(self, request):
        if request.user.role not in ['producer', 'admin']:
            return Response({'error': 'Accès refusé.'}, status=403)
        profile, _ = ProducerProfile.objects.get_or_create(user=request.user)
        serializer = ProducerProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProducerPublicProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role='producer', is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'Artisan introuvable.'}, status=404)
        profile, _ = ProducerProfile.objects.get_or_create(user=user)
        products = user.products.filter(is_available=True).prefetch_related('images')
        from apps.products.serializers import ProductListSerializer
        return Response({
            'profile': ProducerProfileSerializer(profile).data,
            'products': ProductListSerializer(products, many=True).data,
        })


class ConversationsView(APIView):
    """Liste toutes les conversations de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        # Tous les interlocuteurs avec qui on a échangé
        partner_ids = Message.objects.filter(
            djmodels.Q(sender=me) | djmodels.Q(recipient=me)
        ).values_list('sender_id', 'recipient_id')

        seen = set()
        for s, r in partner_ids:
            other = r if s == me.id else s
            seen.add(other)

        conversations = []
        for uid in seen:
            try:
                other = User.objects.get(pk=uid)
            except User.DoesNotExist:
                continue
            thread = Message.objects.filter(
                djmodels.Q(sender=me, recipient=other) |
                djmodels.Q(sender=other, recipient=me)
            )
            last = thread.last()
            unread = thread.filter(recipient=me, is_read=False).count()
            conversations.append({
                'user_id':    other.id,
                'username':   other.username,
                'first_name': other.first_name,
                'last_name':  other.last_name,
                'avatar':     request.build_absolute_uri(other.avatar.url) if other.avatar else None,
                'role':       other.role,
                'last_message':   last.content if last else '',
                'last_message_at': last.created_at if last else None,
                'unread':     unread,
            })

        conversations.sort(key=lambda c: c['last_message_at'] or '', reverse=True)
        return Response(conversations)


class ThreadView(APIView):
    """Récupère ou envoie des messages avec un utilisateur donné."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        me = request.user
        try:
            other = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=404)

        messages = Message.objects.filter(
            djmodels.Q(sender=me, recipient=other) |
            djmodels.Q(sender=other, recipient=me)
        )
        # Marquer comme lus
        messages.filter(recipient=me, is_read=False).update(is_read=True)
        return Response({
            'other': {
                'id':         other.id,
                'username':   other.username,
                'first_name': other.first_name,
                'last_name':  other.last_name,
                'avatar':     request.build_absolute_uri(other.avatar.url) if other.avatar else None,
                'role':       other.role,
            },
            'messages': MessageSerializer(messages, many=True).data,
        })

    def post(self, request, user_id):
        me = request.user
        try:
            other = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=404)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message vide.'}, status=400)

        msg = Message.objects.create(sender=me, recipient=other, content=content)
        return Response(MessageSerializer(msg).data, status=201)


class PushSubscribeView(APIView):
    """Enregistre ou supprime un abonnement push PWA."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get('endpoint', '').strip()
        keys = request.data.get('keys', {})
        p256dh = keys.get('p256dh', '')
        auth   = keys.get('auth', '')
        if not endpoint:
            return Response({'error': 'endpoint requis'}, status=400)
        PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={'user': request.user, 'p256dh': p256dh, 'auth': auth},
        )
        return Response({'ok': True})

    def delete(self, request):
        endpoint = request.data.get('endpoint', '')
        if endpoint:
            PushSubscription.objects.filter(user=request.user, endpoint=endpoint).delete()
        return Response({'ok': True})


class VapidPublicKeyView(APIView):
    """Renvoie la clé VAPID publique pour le frontend."""
    permission_classes = []

    def get(self, request):
        from django.conf import settings
        return Response({'public_key': getattr(settings, 'VAPID_PUBLIC_KEY', '')})