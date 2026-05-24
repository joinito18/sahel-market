from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, ProducerProfile
from .serializers import RegisterSerializer, UserSerializer, UpdateProfileSerializer, ProducerProfileSerializer
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if not user:
            return Response({'error': 'Email ou mot de passe incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)

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