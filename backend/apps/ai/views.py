import random
from groq import Groq
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

SYSTEM_PROMPT = """Tu es Sahel, l'assistante IA de Sahel Market — une marketplace artisanale camerounaise qui met en valeur les savoir-faire locaux et les producteurs du Sahel.

Ton rôle :
- Aider les acheteurs à trouver les produits qui leur conviennent
- Expliquer les savoir-faire et traditions artisanales africaines
- Informer sur les commandes, la livraison et le processus d'achat
- Recommander des produits selon les besoins exprimés
- Répondre aux questions sur les producteurs et leurs ateliers

Ce que propose Sahel Market :
- Textiles traditionnels (bogolan, tie-dye, broderies)
- Vannerie et tressage
- Maroquinerie et cuir
- Produits alimentaires locaux (épices, miel, huiles)
- Bijoux artisanaux
- Poterie et céramique

Infos pratiques :
- Livraison partout au Cameroun
- Paiement : Orange Money, MTN Mobile Money, espèces à la livraison
- Points de fidélité à chaque achat (Bronze → Argent → Or)
- Les artisans sont vérifiés et accompagnés

Tu réponds en français par défaut, mais adapte-toi si l'utilisateur écrit en anglais.
Tu es chaleureuse, professionnelle et passionnée par l'artisanat africain.
Tes réponses sont concises (2-3 phrases max), sauf si on te demande des détails.
Ne mens jamais sur des prix ou stocks — dis que tu ne peux pas les consulter en temps réel et invite à visiter la boutique."""

# Réponses de démonstration pour les tests sans clé API
_MOCK_RESPONSES = [
    "Bonjour ! 🌿 Sahel Market propose une belle sélection de textiles traditionnels : bogolan, tie-dye, broderies faites à la main par nos artisans vérifiés. Je vous invite à explorer la boutique pour trouver votre bonheur !",
    "Bien sûr ! La livraison est disponible partout au Cameroun. Vous pouvez payer par Orange Money, MTN Mobile Money, ou en espèces à la livraison. Votre commande est suivie en temps réel.",
    "Nos artisans sont soigneusement sélectionnés et accompagnés par Sahel Market. Chaque produit est fabriqué à la main avec des matériaux locaux, ce qui garantit son authenticité et sa qualité.",
    "Vous gagnez des points de fidélité à chaque achat ! Le programme comprend trois niveaux : Bronze, Argent et Or — avec des avantages exclusifs à chaque palier. Consultez votre profil pour voir vos points.",
    "Pour les textiles, nous avons du bogolan du Mali, du tie-dye du Cameroun et des broderies peules. Ces tissus racontent une histoire et sont fabriqués selon des techniques ancestrales transmises de génération en génération.",
    "Je ne peux pas consulter les stocks en temps réel, mais je vous encourage à visiter la boutique pour voir la disponibilité exacte. Vous pouvez aussi activer une alerte de réapprovisionnement sur les produits épuisés !",
    "Sahel Market met en avant les savoir-faire du Cameroun et de la région Sahel. Maroquinerie, vannerie, poterie, bijoux… chaque artisan apporte son talent unique. C'est une belle façon de soutenir l'économie locale ! 🙏",
]


def _mock_reply():
    return random.choice(_MOCK_RESPONSES)


def _api_key_is_valid():
    key = getattr(settings, 'GROQ_API_KEY', '')
    return bool(key) and not key.startswith('gsk_VOTRE')


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        messages = request.data.get('messages', [])
        if not messages:
            return Response({'error': 'Messages requis'}, status=status.HTTP_400_BAD_REQUEST)

        valid_messages = []
        for msg in messages[-12:]:
            if (isinstance(msg, dict)
                    and msg.get('role') in ('user', 'assistant')
                    and msg.get('content')):
                valid_messages.append({
                    'role': msg['role'],
                    'content': str(msg['content'])[:1500],
                })

        if not valid_messages:
            return Response({'error': 'Messages invalides'}, status=status.HTTP_400_BAD_REQUEST)

        if not _api_key_is_valid():
            return Response({'response': _mock_reply(), 'demo': True})

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model='llama-3.3-70b-versatile',
                messages=[{'role': 'system', 'content': SYSTEM_PROMPT}] + valid_messages,
                max_tokens=400,
                temperature=0.7,
            )
            return Response({'response': completion.choices[0].message.content})
        except Exception:
            return Response({'response': _mock_reply(), 'demo': True})
