import random
import json
from groq import Groq
from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

BASE_PROMPT = """Tu es l'assistante IA de Sahel Market — une marketplace artisanale camerounaise qui connecte directement les acheteurs aux artisans du Nord-Cameroun, sans intermédiaire.

Ton identité : tu es "l'assistante Sahel Market". Ne te présente jamais autrement.

━━━ TON RÔLE ━━━
Tu es un véritable concierge d'achat artisanal. Ton objectif est d'aider chaque client à trouver exactement ce qu'il cherche, en lui proposant des liens directs vers les produits et pages pertinentes. Tu ne te contentes pas de répondre — tu guides, tu recommandes, tu accompagnes.

━━━ NAVIGATION DU SITE ━━━
- Catalogue complet        : /products
- Recherche par mot-clé    : /products?q=MOT
- Filtre par catégorie     : /products?category=ID_CATEGORIE
- Page d'un produit        : /products/ID_PRODUIT
- Comment ça marche        : /how-it-works
- Devenir artisan          : /register
- Mes commandes            : /orders
- Mon profil / points      : /profile

━━━ FORMAT DES LIENS ━━━
Toujours créer des liens Markdown pour les produits et pages :
[Nom affiché](/chemin)
Exemples :
  [Voir ce bogolan](/products/45)
  [Textiles traditionnels](/products?category=2)
  [Tout le catalogue](/products)
  [Comment ça marche](/how-it-works)

━━━ INFOS PRATIQUES ━━━
- Livraison partout au Cameroun (Yaoundé, Douala, Bafoussam, Maroua et plus)
- Paiement : Orange Money, MTN Mobile Money, espèces à la livraison
- Programme fidélité : points à chaque achat — Bronze, Argent, Or
- Tous les artisans sont vérifiés physiquement par un agent Sahel Market
- Les produits sont fabriqués à la main, matériaux locaux, techniques ancestrales

━━━ RÈGLES ━━━
- Réponds en français par défaut, en anglais si le client écrit en anglais
- Réponds de manière chaleureuse et guidante (4-6 phrases) — tu es un concierge, pas un FAQ
- Si quelqu'un cherche un produit, propose toujours au moins 2-3 liens concrets du catalogue
- Si quelqu'un hésite, pose-lui une question pour affiner sa recherche
- Ne mens jamais sur les prix ou stocks — renvoie vers la page produit pour confirmation
- Si une catégorie correspond à la demande, propose le lien filtré /products?category=ID
"""


def _build_catalog_context():
    """Construit le contexte catalogue, catégories et ventes flash depuis la BDD."""
    try:
        from apps.products.models import Product, Category
        from django.utils import timezone

        # ── Catégories ──────────────────────────────────────────────────────
        categories = Category.objects.all().order_by('name')
        cat_lines = ["━━━ CATÉGORIES (utilise l'ID pour former /products?category=ID) ━━━"]
        for c in categories:
            cat_lines.append(f"ID:{c.id} | {c.name}")

        # ── Ventes flash actives ─────────────────────────────────────────────
        now = timezone.now()
        flash_products = Product.objects.filter(
            is_available=True,
            stock__gt=0,
            flash_price__isnull=False,
            flash_end__gt=now,
        ).select_related('category', 'producer').order_by('-views_count')[:8]

        flash_lines = []
        if flash_products.exists():
            flash_lines.append("\n━━━ VENTES FLASH EN COURS (prix réduits, durée limitée) ━━━")
            for p in flash_products:
                prix_normal = f"{int(p.price):,} FCFA".replace(',', ' ')
                prix_flash  = f"{int(p.flash_price):,} FCFA".replace(',', ' ')
                flash_lines.append(
                    f"ID:{p.id} | {p.name} | Flash : {prix_flash} (normal : {prix_normal})"
                )
            flash_lines.append("→ Mentionne ces offres en priorité si elles correspondent à la demande.")

        # ── Catalogue principal ──────────────────────────────────────────────
        products = (
            Product.objects
            .filter(is_available=True, stock__gt=0)
            .select_related('category', 'producer')
            .order_by('-views_count')[:40]
        )

        prod_lines = ["\n━━━ CATALOGUE ACTUEL (top 40 produits disponibles) ━━━"]
        for p in products:
            prix = f"{int(p.flash_price if p.flash_price and p.flash_end and p.flash_end > now else p.price):,} FCFA".replace(',', ' ')
            cat  = p.category.name if p.category else "Artisanat"
            art  = p.producer.first_name or p.producer.username if p.producer else ""
            line = f"ID:{p.id} | {p.name} | {cat} | {prix}"
            if art:
                line += f" | Artisan : {art}"
            prod_lines.append(line)

        prod_lines.append("\n→ Pour chaque produit mentionné, crée le lien /products/{ID}.")

        return "\n".join(cat_lines) + "\n".join(flash_lines) + "\n".join(prod_lines)

    except Exception:
        return ""


def _build_system_prompt(user_context: dict) -> str:
    prompt  = BASE_PROMPT
    catalog = _build_catalog_context()
    if catalog:
        prompt += "\n\n" + catalog

    name      = user_context.get('name', '')
    connected = user_context.get('authenticated', False)
    page      = user_context.get('current_page', '')

    lines = ["\n━━━ CONTEXTE SESSION ━━━"]
    lines.append(f"Client connecté : {'Oui' if connected else 'Non'}")
    if name:
        lines.append(f"Prénom : {name} — interpelle-le par son prénom si pertinent")
    if page:
        lines.append(f"Page actuelle : {page}")
    if not connected:
        lines.append("Client non connecté → si pertinent, suggère /register ou /login.")

    prompt += "\n".join(lines)
    return prompt


_MOCK_RESPONSES = [
    "Bonjour ! Sahel Market propose des textiles traditionnels, de la maroquinerie, de la poterie et bien plus encore — tous fabriqués à la main par des artisans vérifiés. Je vous invite à [explorer le catalogue complet](/products) ou à me dire ce que vous cherchez pour que je vous guide !",
    "La livraison est disponible partout au Cameroun : Yaoundé, Douala, Bafoussam, Maroua et plus encore. Vous pouvez payer par Orange Money, MTN MoMo ou en espèces à la livraison. Consultez [comment ça marche](/how-it-works) pour tous les détails.",
    "Nos artisans sont vérifiés physiquement par un agent Sahel Market — chaque produit est authentique, fabriqué à la main avec des matériaux locaux. Découvrez leurs créations dans [le catalogue](/products).",
    "Vous gagnez des points de fidélité à chaque achat, avec trois niveaux : Bronze, Argent et Or. Consultez votre [profil](/profile) pour voir vos points et les avantages disponibles.",
    "Je ne peux pas consulter les stocks en temps réel, mais vous pouvez activer une alerte de réapprovisionnement directement sur la page d'un produit épuisé. Souhaitez-vous que je vous guide vers un produit similaire disponible ?",
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
                max_tokens=700,
                temperature=0.6,
            )
            return Response({'response': completion.choices[0].message.content})
        except Exception:
            return Response({'response': random.choice(_MOCK_RESPONSES), 'demo': True})


class ChatStreamView(APIView):
    """Même logique que ChatView mais en streaming SSE."""
    permission_classes = [AllowAny]

    def post(self, request):
        messages     = request.data.get('messages', [])
        user_context = request.data.get('user_context', {})

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
            return Response({'error': 'Messages invalides'}, status=400)

        # ── Mode démo (pas de clé) — simule un stream ────────────────────
        if not _api_key_is_valid():
            mock_text = random.choice(_MOCK_RESPONSES)

            def mock_gen():
                for ch in mock_text:
                    yield f"data: {json.dumps({'c': ch})}\n\n"
                yield "data: [DONE]\n\n"

            r = StreamingHttpResponse(mock_gen(), content_type='text/event-stream; charset=utf-8')
            r['Cache-Control']      = 'no-cache'
            r['X-Accel-Buffering'] = 'no'
            return r

        # ── Mode réel — stream Groq ───────────────────────────────────────
        system_prompt = _build_system_prompt(user_context)

        def groq_gen():
            try:
                client = Groq(api_key=settings.GROQ_API_KEY)
                stream = client.chat.completions.create(
                    model='llama-3.3-70b-versatile',
                    messages=[{'role': 'system', 'content': system_prompt}] + valid_messages,
                    max_tokens=700,
                    temperature=0.6,
                    stream=True,
                )
                for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield f"data: {json.dumps({'c': content})}\n\n"
            except Exception:
                fallback = random.choice(_MOCK_RESPONSES)
                for ch in fallback:
                    yield f"data: {json.dumps({'c': ch})}\n\n"
            finally:
                yield "data: [DONE]\n\n"

        r = StreamingHttpResponse(groq_gen(), content_type='text/event-stream; charset=utf-8')
        r['Cache-Control']      = 'no-cache'
        r['X-Accel-Buffering'] = 'no'
        return r
