import random
from groq import Groq
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

BASE_PROMPT = """Tu es l'assistante IA de Sahel Market — une marketplace artisanale camerounaise qui connecte directement les acheteurs aux artisans du Nord-Cameroun, sans intermédiaire.

Ton identité : tu es "l'assistante Sahel Market". Ne te présente jamais autrement.

━━━ TON RÔLE ━━━
- Guider les clients dans leurs achats et les aider à trouver le bon produit
- Donner des liens directs vers les pages produits quand un client cherche quelque chose
- Expliquer les savoir-faire et traditions artisanales africaines
- Informer sur les commandes, la livraison et le paiement
- Recommander des produits selon les besoins exprimés par le client

━━━ NAVIGATION DU SITE ━━━
- Catalogue complet       : /products
- Recherche par mot-clé   : /products?q=MOT
- Filtre par catégorie    : /products?category=ID
- Page d'un produit       : /products/ID
- Comment ça marche       : /how-it-works
- Devenir artisan         : /register
- Mes commandes           : /orders
- Mon profil / points     : /profile
- Panier                  : (bouton panier en haut de la page)

━━━ FORMAT DES LIENS ━━━
Quand tu mentionnes un produit ou une page, crée un lien en Markdown :
[Nom du produit ou de la page](/chemin)
Exemples :
- [Voir ce bogolan](/products/45)
- [Explorer le catalogue textile](/products?q=textile)
- [Comment ça marche](/how-it-works)

━━━ INFOS PRATIQUES ━━━
- Livraison partout au Cameroun (Yaoundé, Douala, Bafoussam, Maroua et plus)
- Paiement : Orange Money, MTN Mobile Money, espèces à la livraison
- Programme fidélité : points à chaque achat — niveaux Bronze, Argent, Or
- Tous les artisans sont vérifiés physiquement par un agent Sahel Market
- Les produits sont fabriqués à la main avec des matériaux locaux

━━━ RÈGLES ━━━
- Réponds en français par défaut, en anglais si le client écrit en anglais
- Réponses concises (3-5 phrases) sauf si l'utilisateur demande plus de détails
- Si tu ne connais pas le stock ou le prix exact, renvoie vers la page produit
- Quand le client cherche quelque chose, propose toujours au moins un lien concret
- Tu es chaleureuse, professionnelle et passionnée par l'artisanat africain
"""


def _build_catalog_context():
    """Construit le contexte catalogue depuis la base de données."""
    try:
        from apps.products.models import Product
        products = (
            Product.objects
            .filter(is_available=True, stock__gt=0)
            .select_related('category', 'producer')
            .order_by('-views_count')[:40]
        )
        if not products:
            return ""

        lines = ["━━━ CATALOGUE ACTUEL (produits disponibles) ━━━"]
        for p in products:
            price = f"{int(p.price):,} FCFA".replace(',', ' ')
            cat   = p.category.name if p.category else "Artisanat"
            producer_name = (
                p.producer.first_name or p.producer.username
                if p.producer else ""
            )
            line = f"ID:{p.id} | {p.name} | {cat} | {price}"
            if producer_name:
                line += f" | artisan : {producer_name}"
            lines.append(line)

        lines.append(
            "\nPour chaque produit mentionné, génère le lien /products/{ID} correspondant."
        )
        return "\n".join(lines)
    except Exception:
        return ""


def _build_system_prompt(user_context: dict) -> str:
    prompt = BASE_PROMPT
    catalog = _build_catalog_context()
    if catalog:
        prompt += "\n\n" + catalog

    name      = user_context.get('name', '')
    connected = user_context.get('authenticated', False)
    page      = user_context.get('current_page', '')

    ctx_lines = ["━━━ CONTEXTE SESSION ━━━"]
    ctx_lines.append(f"Client connecté : {'Oui' if connected else 'Non'}")
    if name:
        ctx_lines.append(f"Prénom du client : {name}")
    if page:
        ctx_lines.append(f"Page actuelle : {page}")
    if not connected:
        ctx_lines.append(
            "Le client n'est pas connecté — si pertinent, suggère /register ou /login."
        )

    prompt += "\n\n" + "\n".join(ctx_lines)
    return prompt


_MOCK_RESPONSES = [
    "Bonjour ! Sahel Market propose une belle sélection de textiles traditionnels : bogolan, tie-dye, broderies faites à la main. Je vous invite à [explorer le catalogue](/products) pour trouver votre bonheur !",
    "La livraison est disponible partout au Cameroun. Vous pouvez payer par Orange Money, MTN Mobile Money, ou en espèces à la livraison. Votre commande est suivie en temps réel depuis [vos commandes](/orders).",
    "Nos artisans sont vérifiés physiquement par un agent Sahel Market. Chaque produit est fabriqué à la main avec des matériaux locaux. Visitez [le catalogue](/products) pour découvrir leurs créations.",
    "Vous gagnez des points de fidélité à chaque achat ! Consultez votre [profil](/profile) pour voir vos points et votre niveau (Bronze, Argent ou Or).",
    "Je ne peux pas consulter les stocks en temps réel, mais je vous encourage à [visiter la boutique](/products) pour voir la disponibilité exacte. Vous pouvez aussi activer une alerte de réapprovisionnement sur les produits épuisés.",
]


def _api_key_is_valid():
    key = getattr(settings, 'GROQ_API_KEY', '')
    return bool(key) and not key.startswith('gsk_VOTRE')


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        messages     = request.data.get('messages', [])
        user_context = request.data.get('user_context', {})

        if not messages:
            return Response({'error': 'Messages requis'}, status=status.HTTP_400_BAD_REQUEST)

        valid_messages = []
        for msg in messages[-14:]:
            if (isinstance(msg, dict)
                    and msg.get('role') in ('user', 'assistant')
                    and msg.get('content')):
                valid_messages.append({
                    'role':    msg['role'],
                    'content': str(msg['content'])[:2000],
                })

        if not valid_messages:
            return Response({'error': 'Messages invalides'}, status=status.HTTP_400_BAD_REQUEST)

        if not _api_key_is_valid():
            return Response({'response': random.choice(_MOCK_RESPONSES), 'demo': True})

        try:
            system_prompt = _build_system_prompt(user_context)
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model='llama-3.3-70b-versatile',
                messages=[{'role': 'system', 'content': system_prompt}] + valid_messages,
                max_tokens=600,
                temperature=0.65,
            )
            return Response({'response': completion.choices[0].message.content})
        except Exception:
            return Response({'response': random.choice(_MOCK_RESPONSES), 'demo': True})
