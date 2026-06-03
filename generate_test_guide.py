"""
Génère le guide de test complet de Sahel Market.
Usage : python generate_test_guide.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Couleurs ────────────────────────────────────────────────────────────────
SAND      = colors.HexColor('#C4933F')   # beige/or
DARK      = colors.HexColor('#1A1A1A')
GREY      = colors.HexColor('#F5F5F0')
GREY2     = colors.HexColor('#E8E4DC')
GREEN     = colors.HexColor('#2E7D32')
RED_SOFT  = colors.HexColor('#C62828')
BLUE      = colors.HexColor('#1565C0')
ORANGE    = colors.HexColor('#E65100')
WHITE     = colors.white
PAGE_W, PAGE_H = A4

# ─── Styles ──────────────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()
    s = {}

    s['cover_title'] = ParagraphStyle('cover_title',
        fontName='Helvetica-Bold', fontSize=32, textColor=WHITE,
        alignment=TA_CENTER, spaceAfter=6, leading=38)

    s['cover_sub'] = ParagraphStyle('cover_sub',
        fontName='Helvetica', fontSize=15, textColor=colors.HexColor('#F0E6D3'),
        alignment=TA_CENTER, spaceAfter=4, leading=20)

    s['cover_date'] = ParagraphStyle('cover_date',
        fontName='Helvetica-Oblique', fontSize=11, textColor=colors.HexColor('#D4C4A0'),
        alignment=TA_CENTER)

    s['part_title'] = ParagraphStyle('part_title',
        fontName='Helvetica-Bold', fontSize=18, textColor=WHITE,
        alignment=TA_CENTER, spaceAfter=4, spaceBefore=8, leading=22,
        backColor=DARK, borderPadding=(8, 12, 8, 12))

    s['section'] = ParagraphStyle('section',
        fontName='Helvetica-Bold', fontSize=13, textColor=DARK,
        spaceBefore=14, spaceAfter=4, leading=17,
        borderPadding=(6, 10, 6, 10))

    s['subsection'] = ParagraphStyle('subsection',
        fontName='Helvetica-Bold', fontSize=11, textColor=SAND,
        spaceBefore=10, spaceAfter=3, leading=14)

    s['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=10, textColor=DARK,
        spaceAfter=4, leading=15, alignment=TA_JUSTIFY)

    s['step'] = ParagraphStyle('step',
        fontName='Helvetica', fontSize=10, textColor=DARK,
        spaceAfter=3, leading=14, leftIndent=12)

    s['note'] = ParagraphStyle('note',
        fontName='Helvetica-Oblique', fontSize=9.5, textColor=colors.HexColor('#555555'),
        spaceAfter=4, leading=13, leftIndent=10)

    s['url'] = ParagraphStyle('url',
        fontName='Helvetica', fontSize=9.5, textColor=BLUE,
        spaceAfter=4, leading=13)

    s['tag_ok'] = ParagraphStyle('tag_ok',
        fontName='Helvetica-Bold', fontSize=9, textColor=GREEN,
        spaceAfter=2, leading=12)

    s['tag_todo'] = ParagraphStyle('tag_todo',
        fontName='Helvetica-Bold', fontSize=9, textColor=RED_SOFT,
        spaceAfter=2, leading=12)

    s['toc'] = ParagraphStyle('toc',
        fontName='Helvetica', fontSize=10.5, textColor=DARK,
        spaceAfter=5, leading=16, leftIndent=10)

    s['toc_part'] = ParagraphStyle('toc_part',
        fontName='Helvetica-Bold', fontSize=11.5, textColor=SAND,
        spaceAfter=3, spaceBefore=8, leading=16)

    return s


# ─── Helpers ─────────────────────────────────────────────────────────────────
def hr(color=SAND, thickness=0.8):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=6, spaceBefore=6)

def section_banner(text, style):
    data = [[Paragraph(text, style['section'])]]
    t = Table(data, colWidths=[PAGE_W - 40*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREY),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LINEBELOW', (0,0), (-1,-1), 2, SAND),
        ('ROUNDEDCORNERS', [4]),
    ]))
    return t

def step_table(steps, style):
    rows = []
    for i, (num, text) in enumerate(steps):
        rows.append([
            Paragraph(f'<b>{num}</b>', ParagraphStyle('sn',
                fontName='Helvetica-Bold', fontSize=9.5, textColor=WHITE,
                alignment=TA_CENTER, leading=12)),
            Paragraph(text, style['step']),
        ])
    t = Table(rows, colWidths=[8*mm, PAGE_W - 48*mm - 8*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (0,-1), SAND),
        ('BACKGROUND',   (1,0), (1,-1), WHITE),
        ('VALIGN',       (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',   (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ('LEFTPADDING',  (0,0), (0,-1), 2),
        ('RIGHTPADDING', (0,0), (0,-1), 2),
        ('ROWBACKGROUNDS', (1,0),(1,-1), [WHITE, GREY]),
        ('GRID',         (0,0), (-1,-1), 0.3, GREY2),
    ]))
    return t

def result_table(results, style):
    rows = [['Résultat attendu', 'Statut']]
    for text, ok in results:
        icon = '✓ OK' if ok else '✗ À vérifier'
        clr = GREEN if ok else ORANGE
        rows.append([
            Paragraph(text, style['body']),
            Paragraph(f'<b>{icon}</b>', ParagraphStyle('ri',
                fontName='Helvetica-Bold', fontSize=9, textColor=clr,
                alignment=TA_CENTER, leading=12)),
        ])
    t = Table(rows, colWidths=[PAGE_W - 60*mm - 25*mm, 25*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0), DARK),
        ('TEXTCOLOR',    (0,0), (-1,0), WHITE),
        ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',     (0,0), (-1,0), 9),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [WHITE, GREY]),
        ('GRID',         (0,0), (-1,-1), 0.3, GREY2),
        ('TOPPADDING',   (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ('LEFTPADDING',  (0,0), (-1,-1), 8),
        ('VALIGN',       (0,0), (-1,-1), 'TOP'),
    ]))
    return t

def feature_todo_table(features, style):
    rows = [['#', 'Fonctionnalité', 'Priorité', 'Complexité']]
    prio_clr = {'HAUTE': RED_SOFT, 'MOYENNE': ORANGE, 'FAIBLE': GREEN}
    for i, (name, prio, compl) in enumerate(features, 1):
        rows.append([
            Paragraph(f'<b>{i}</b>', ParagraphStyle('fn', fontName='Helvetica-Bold',
                fontSize=9, alignment=TA_CENTER, textColor=SAND, leading=12)),
            Paragraph(name, style['body']),
            Paragraph(f'<b>{prio}</b>', ParagraphStyle('fp', fontName='Helvetica-Bold',
                fontSize=8.5, textColor=prio_clr.get(prio, DARK), alignment=TA_CENTER, leading=12)),
            Paragraph(compl, ParagraphStyle('fc', fontName='Helvetica', fontSize=8.5,
                textColor=DARK, alignment=TA_CENTER, leading=12)),
        ])
    col_w = [(PAGE_W - 40*mm) * r for r in [0.05, 0.55, 0.20, 0.20]]
    t = Table(rows, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0), DARK),
        ('TEXTCOLOR',     (0,0), (-1,0), WHITE),
        ('FONTNAME',      (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0), 9),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [WHITE, GREY]),
        ('GRID',          (0,0), (-1,-1), 0.3, GREY2),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('ALIGN',         (0,0), (0,-1), 'CENTER'),
        ('ALIGN',         (2,0), (3,-1), 'CENTER'),
    ]))
    return t


# ─── Couverture ──────────────────────────────────────────────────────────────
def cover_page(story, s):
    # Fond sombre simulé par un tableau pleine largeur
    bg_data = [['']]
    bg = Table(bg_data, colWidths=[PAGE_W - 40*mm], rowHeights=[60*mm])
    bg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK),
    ]))
    story.append(Spacer(1, 20*mm))
    story.append(bg)

    story.append(Spacer(1, -60*mm))  # Superposition texte
    story.append(Spacer(1, 12*mm))
    story.append(Paragraph('SAHEL MARKET', s['cover_title']))
    story.append(Paragraph('Guide de Test & Feuille de Route', s['cover_sub']))
    story.append(Spacer(1, 50*mm))

    story.append(Paragraph(
        '<b>Version :</b> 1.0 — Mai 2026', s['cover_date']))
    story.append(Paragraph(
        '<b>Environnement :</b> sahel-market-gamma.vercel.app', s['cover_date']))
    story.append(Paragraph(
        '<b>Backend :</b> sahel-market-api.onrender.com', s['cover_date']))
    story.append(Spacer(1, 8*mm))
    story.append(hr(SAND, 1.5))

    intro = (
        "Ce document recense <b>toutes les fonctionnalités implémentées</b> de la plateforme "
        "Sahel Market, avec pour chacune un protocole de test détaillé étape par étape, "
        "les résultats attendus et les comptes de test à utiliser. "
        "La seconde partie liste les <b>fonctionnalités restant à développer</b>, "
        "classées par priorité et complexité, pour guider la feuille de route produit."
    )
    story.append(Paragraph(intro, s['body']))
    story.append(PageBreak())


# ─── Table des matières ───────────────────────────────────────────────────────
def toc_page(story, s):
    story.append(Paragraph('TABLE DES MATIÈRES', s['part_title']))
    story.append(Spacer(1, 6*mm))

    toc_items = [
        ('PARTIE 1 — GUIDE DE TEST DES FONCTIONNALITÉS IMPLÉMENTÉES', None),
        ('1. Inscription & Connexion', '03'),
        ('2. Catalogue & Recherche de produits', '04'),
        ('3. Fiche Produit détaillée', '05'),
        ('4. Panier & Wishlist', '06'),
        ('5. Processus de Commande (Checkout)', '07'),
        ('6. Paiement Mobile Money (Campay)', '08'),
        ('7. Suivi de commande en temps réel', '09'),
        ('8. Programme de Fidélité', '10'),
        ('9. Avis & Notations clients', '11'),
        ('10. Ventes Flash', '11'),
        ('11. Alertes de Stock', '12'),
        ('12. Partage & Réseaux sociaux', '12'),
        ('13. Notifications Push (PWA)', '13'),
        ('14. Codes Promo', '13'),
        ('15. Messagerie Client ↔ Artisan', '14'),
        ('16. Profil public de l\'Artisan', '14'),
        ('17. Dashboard Artisan', '15'),
        ('18. Dashboard Admin & Agent', '16'),
        ('19. Application PWA (installable)', '17'),
        ('20. SEO & Méta-données', '17'),
        ('PARTIE 2 — FONCTIONNALITÉS À IMPLÉMENTER', None),
        ('Tableau de la feuille de route', '18'),
        ('Détails des fonctionnalités prioritaires', '19'),
    ]

    for label, page in toc_items:
        if page is None:
            story.append(Spacer(1, 4*mm))
            story.append(Paragraph(label, s['toc_part']))
        else:
            row_data = [[
                Paragraph(label, s['toc']),
                Paragraph(f'<b>{page}</b>', ParagraphStyle('tp',
                    fontName='Helvetica-Bold', fontSize=10.5, textColor=SAND,
                    alignment=TA_CENTER, leading=16)),
            ]]
            t = Table(row_data, colWidths=[PAGE_W - 60*mm, 20*mm])
            t.setStyle(TableStyle([
                ('LINEBELOW', (0,0), (-1,-1), 0.4, GREY2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(t)

    story.append(PageBreak())


# ─── PARTIE 1 — Tests ────────────────────────────────────────────────────────
def part1_header(story, s):
    story.append(Paragraph(
        'PARTIE 1 — GUIDE DE TEST DES FONCTIONNALITÉS IMPLÉMENTÉES',
        s['part_title']))
    story.append(Spacer(1, 4*mm))

    comptes = [
        ['Rôle', 'Téléphone / Login', 'Mot de passe', 'Usage'],
        ['Admin',     '+237 000 000 001', 'Admin@1234',    'Accès total dashboard'],
        ['Artisan',   '+237 000 000 002', 'Artisan@1234',  'Gestion produits & commandes'],
        ['Agent',     '+237 000 000 003', 'Agent@1234',    'Gestion artisans & stocks'],
        ['Client',    '+237 000 000 004', 'Client@1234',   'Navigation & achat'],
        ['Client 2',  '+237 000 000 005', 'Client@1234',   'Tests avis / messagerie'],
    ]
    col_w = [(PAGE_W - 40*mm)*r for r in [0.15, 0.22, 0.20, 0.43]]
    t = Table(comptes, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SAND),
        ('TEXTCOLOR',  (0,0), (-1,0), WHITE),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GREY]),
        ('GRID',       (0,0), (-1,-1), 0.3, GREY2),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
    ]))

    story.append(Paragraph('<b>Comptes de test</b>', s['subsection']))
    story.append(t)
    story.append(Spacer(1, 4*mm))


def test_feature(story, s, num, title, desc, prereq, steps, results, notes=None):
    elements = []
    elements.append(Spacer(1, 3*mm))
    elements.append(section_banner(f'{num}. {title}', s))
    elements.append(Spacer(1, 2*mm))

    if desc:
        elements.append(Paragraph(desc, s['body']))

    if prereq:
        elements.append(Paragraph(f'<b>Prérequis :</b> {prereq}', s['note']))

    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph('<b>Étapes de test</b>', s['subsection']))
    elements.append(step_table([(str(i+1), st) for i, st in enumerate(steps)], s))

    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph('<b>Résultats attendus</b>', s['subsection']))
    elements.append(result_table(results, s))

    if notes:
        elements.append(Spacer(1, 1*mm))
        for n in notes:
            elements.append(Paragraph(f'⚠ {n}', s['note']))

    story.append(KeepTogether(elements[:6]))
    for el in elements[6:]:
        story.append(el)


def part1_tests(story, s):
    part1_header(story, s)

    # ── 1. Inscription & Connexion
    test_feature(story, s,
        num='1', title='Inscription & Connexion (Auth par téléphone)',
        desc=(
            'Sahel Market utilise le numéro de téléphone comme identifiant principal. '
            'L\'email est optionnel. Deux parcours : nouvelle inscription et connexion d\'un compte existant.'
        ),
        prereq='Aucun compte existant pour le test d\'inscription.',
        steps=[
            'Ouvrir https://sahel-market-gamma.vercel.app',
            'Cliquer sur "Connexion" dans la barre de navigation.',
            'Sur la page de connexion, basculer sur "Créer un compte".',
            'Remplir : Nom d\'utilisateur (ex. TestUser01), Téléphone (+237 6XXXXXXXX), Mot de passe (min 8 caractères).',
            'Cliquer sur "S\'inscrire" — vérifier la redirection vers la page d\'accueil avec le nom affiché.',
            'Se déconnecter via le menu profil.',
            'Se reconnecter avec le numéro de téléphone et le mot de passe saisis.',
            'Tester un mot de passe incorrect — vérifier le message d\'erreur.',
        ],
        results=[
            ('Inscription réussie → JWT token stocké, nom affiché dans la navbar', True),
            ('Redirection automatique vers la page d\'accueil après connexion', True),
            ('Message d\'erreur explicite si téléphone/MDP incorrect', True),
            ('Pas d\'obligation de fournir un email', True),
            ('Token persistant après rechargement de la page (localStorage)', True),
        ],
    )

    # ── 2. Catalogue & Recherche
    test_feature(story, s,
        num='2', title='Catalogue & Recherche Full-Text PostgreSQL',
        desc=(
            'Le catalogue affiche tous les produits disponibles avec filtres par catégorie et localisation. '
            'La recherche utilise PostgreSQL full-text search avec recommandations intelligentes.'
        ),
        prereq='Être sur la page /products ou utiliser la barre de recherche.',
        steps=[
            'Accéder à la page Produits.',
            'Observer la liste de produits avec images, prix et localisation.',
            'Taper un mot-clé dans la barre de recherche (ex. "bogolan", "poterie").',
            'Vérifier l\'affichage instantané des résultats filtrés.',
            'Utiliser le filtre par catégorie (ex. Textiles, Céramique).',
            'Utiliser le filtre par localisation.',
            'Filtrer par note (étoiles ★).',
            'Saisir un terme approximatif (ex. "bogolaan") et observer les suggestions.',
            'Cliquer sur une recommandation suggérée.',
        ],
        results=[
            ('Résultats affichés en temps réel (debounce ~300ms)', True),
            ('Filtre catégorie et localisation fonctionnels et combinables', True),
            ('Filtre par note (1 à 5 étoiles) opérationnel', True),
            ('Suggestions de termes similaires affichées sous la barre', True),
            ('Produits en vente flash affichent le badge "FLASH" et le prix barré', True),
            ('Badge "Vérifié" visible sur les artisans certifiés', True),
        ],
    )

    # ── 3. Fiche Produit
    test_feature(story, s,
        num='3', title='Fiche Produit Détaillée',
        desc=(
            'Page produit complète avec galerie d\'images zoomable, variantes (taille/couleur/matière), '
            'avis clients, recommandations et partage réseaux sociaux.'
        ),
        prereq='Un produit avec plusieurs images et variantes doit exister.',
        steps=[
            'Cliquer sur un produit depuis le catalogue.',
            'Observer la galerie d\'images — cliquer sur une miniature pour changer l\'image principale.',
            'Pincer/zoomer sur l\'image (mobile) ou utiliser le zoom desktop.',
            'Sélectionner une variante (ex. Taille S, Couleur Rouge) — vérifier la mise à jour du prix si extra_price > 0.',
            'Vérifier le stock affiché pour la variante sélectionnée.',
            'Lire la description, la localisation et le prix.',
            'Consulter les avis et la note moyenne affichée en étoiles.',
            'Cliquer sur "Recommandations" pour voir les produits similaires.',
            'Utiliser le bouton de partage Facebook.',
            'Utiliser le bouton de partage WhatsApp.',
            'Cliquer sur le nom de l\'artisan → vérifier la redirection vers son profil public.',
        ],
        results=[
            ('Galerie multi-images fonctionnelle avec miniatures cliquables', True),
            ('Zoom image opérationnel (pinch mobile, hover desktop)', True),
            ('Sélection de variante met à jour le prix et le stock', True),
            ('Note moyenne calculée dynamiquement à partir des avis', True),
            ('Recommandations basées sur la catégorie affichées', True),
            ('Partage Facebook ouvre la bonne URL de partage', True),
            ('Partage WhatsApp génère un message pré-rempli', True),
            ('Compteur de vues incrémenté à chaque consultation', True),
        ],
    )

    # ── 4. Panier & Wishlist
    test_feature(story, s,
        num='4', title='Panier & Wishlist (Favoris)',
        desc=(
            'Le panier est synchronisé entre Redux (frontend) et le backend Django. '
            'La wishlist permet de sauvegarder des produits pour plus tard.'
        ),
        prereq='Être connecté en tant que client.',
        steps=[
            'Sur une fiche produit, cliquer "Ajouter au panier".',
            'Ouvrir le tiroir panier (icône en haut à droite).',
            'Vérifier l\'article ajouté avec quantité, prix unitaire et sous-total.',
            'Modifier la quantité (+/-) et vérifier la mise à jour du total.',
            'Supprimer un article du panier.',
            'Ajouter plusieurs produits différents et vérifier le total global.',
            'Sur une fiche produit, cliquer sur le cœur (♡) pour ajouter aux favoris.',
            'Aller sur la page Wishlist (/wishlist) et vérifier la présence des produits.',
            'Supprimer un produit de la wishlist.',
            'Déconnecter et reconnecter — vérifier que le panier est restauré.',
        ],
        results=[
            ('Panier synchronisé backend — persistant entre sessions', True),
            ('Total du panier recalculé en temps réel', True),
            ('Suppression d\'article fonctionne sans rechargement', True),
            ('Wishlist persistée en base de données', True),
            ('Icône panier dans la navbar affiche le bon nombre d\'articles', True),
        ],
    )

    # ── 5. Checkout
    test_feature(story, s,
        num='5', title='Processus de Commande (Checkout)',
        desc=(
            'Le checkout synchronise le panier Redux → backend avant de créer la commande. '
            'Il inclut : sélection de zone de livraison, code promo, points de fidélité et choix du paiement.'
        ),
        prereq='Panier avec au moins un article. Compte client connecté.',
        steps=[
            'Aller sur /checkout ou cliquer "Commander" depuis le panier.',
            'Remplir l\'adresse de livraison.',
            'Sélectionner une zone de livraison dans le menu déroulant — observer la mise à jour des frais.',
            'Saisir un code promo valide (ex. BIENVENUE10) et cliquer "Appliquer".',
            'Si l\'utilisateur a ≥100 points de fidélité, cocher "Utiliser mes points" — observer la réduction.',
            'Sélectionner le moyen de paiement : Orange Money, MTN MoMo, ou Espèces.',
            'Si Mobile Money : saisir le numéro de téléphone de paiement.',
            'Cliquer "Confirmer la commande".',
            'Vérifier la page de confirmation avec le numéro de commande.',
            'Vérifier la réception d\'un email de confirmation.',
        ],
        results=[
            ('Frais de livraison mis à jour selon la zone sélectionnée', True),
            ('Code promo valide → réduction appliquée sur le total', True),
            ('Code expiré ou invalide → message d\'erreur clair', True),
            ('Points de fidélité déduits après commande (100 pts = 500 FCFA)', True),
            ('Commande créée en base de données avec statut "pending"', True),
            ('Panier vidé après confirmation', True),
            ('Email de confirmation reçu avec détails de la commande', True),
            ('Notification push reçue si PWA installée', True),
        ],
    )

    # ── 6. Paiement Campay
    test_feature(story, s,
        num='6', title='Paiement Mobile Money via Campay',
        desc=(
            'Intégration Campay pour Orange Money et MTN Mobile Money. '
            'Le paiement déclenche une notification USSD sur le téléphone du client. '
            'Un webhook confirme le paiement et met à jour le statut de la commande.'
        ),
        prereq=(
            'Compte Orange Money ou MTN MoMo actif. '
            'En environnement de test, utiliser les numéros sandbox Campay.'
        ),
        steps=[
            'Au checkout, sélectionner "Orange Money" ou "MTN Mobile Money".',
            'Entrer le numéro de téléphone Mobile Money.',
            'Valider la commande — observer le spinner d\'attente.',
            'Sur le téléphone, accepter la notification USSD de paiement.',
            'Revenir sur l\'application — observer la mise à jour automatique du statut.',
            'Aller sur /orders et vérifier que la commande passe à "Payé".',
            'Tester un refus de paiement (appuyer "Non" sur le USSD) — vérifier le statut "cancelled".',
        ],
        results=[
            ('Notification USSD déclenchée sur le téléphone dans les 10 secondes', True),
            ('Statut commande → "paid" après acceptation USSD', True),
            ('Statut commande → "cancelled" après refus USSD', True),
            ('Email de confirmation mis à jour automatiquement', True),
            ('Référence de paiement stockée en base de données', True),
        ],
        notes=[
            'En développement, utiliser le mode sandbox Campay avec des numéros de test fournis par Campay.',
            'Le webhook Campay doit être accessible publiquement (configuré sur Render).',
        ],
    )

    # ── 7. Suivi commande
    test_feature(story, s,
        num='7', title='Suivi de Commande en Temps Réel',
        desc=(
            'Timeline visuelle du statut de la commande. '
            'L\'admin ou l\'agent peut mettre à jour le statut, '
            'ce qui déclenche une notification push et email au client.'
        ),
        prereq='Commande existante. Accès admin pour changer le statut.',
        steps=[
            'Se connecter en tant que client et aller sur /orders.',
            'Cliquer sur "Suivre" pour une commande existante.',
            'Observer la timeline : En attente → Payé → En préparation → Expédié → Livré.',
            'Ouvrir un second onglet en tant qu\'admin sur /dashboard/admin.',
            'Changer le statut de la commande (ex. → "En préparation").',
            'Retourner sur l\'onglet client — la timeline doit se mettre à jour.',
            'Vérifier la réception d\'une notification push sur le client.',
            'Confirmer la livraison depuis l\'interface admin.',
        ],
        results=[
            ('Timeline affiche le statut actuel avec les étapes complètes en couleur', True),
            ('Mise à jour de statut admin → visible côté client après refresh', True),
            ('Notification push reçue à chaque changement de statut', True),
            ('Statut "livré" débloque la possibilité de laisser un avis', True),
        ],
    )

    story.append(PageBreak())

    # ── 8. Fidélité
    test_feature(story, s,
        num='8', title='Programme de Fidélité (Bronze / Argent / Or)',
        desc=(
            'Chaque commande livrée génère des points de fidélité. '
            'Les niveaux Bronze, Argent et Or débloquent des avantages. '
            '100 points = 500 FCFA de réduction au prochain achat.'
        ),
        prereq='Compte client avec au moins une commande livrée.',
        steps=[
            'Se connecter et aller sur /profile.',
            'Observer le solde de points et le niveau actuel (Bronze/Argent/Or).',
            'Vérifier la barre de progression vers le prochain niveau.',
            'Passer une commande et vérifier l\'ajout de points après livraison.',
            'Au checkout suivant, cocher "Utiliser mes points de fidélité".',
            'Vérifier que la réduction est bien appliquée et les points déduits.',
        ],
        results=[
            ('Solde de points affiché dans le profil et sur la page de commande', True),
            ('Niveau Bronze (0-999 pts), Argent (1000-4999 pts), Or (5000+ pts)', True),
            ('Points crédités uniquement après statut "livré"', True),
            ('Réduction fidélité appliquée au checkout (100 pts = 500 FCFA)', True),
            ('Points mis à jour dans le profil après utilisation', True),
        ],
    )

    # ── 9. Avis & Notations
    test_feature(story, s,
        num='9', title='Avis & Notations Clients',
        desc=(
            'Les clients peuvent noter un produit (1-5 étoiles), laisser un commentaire '
            'et joindre une photo. Un seul avis par utilisateur par produit.'
        ),
        prereq='Avoir commandé et reçu (statut "livré") le produit à noter.',
        steps=[
            'Aller sur la fiche produit déjà commandé.',
            'Faire défiler jusqu\'à la section "Avis clients".',
            'Cliquer sur "Laisser un avis".',
            'Sélectionner une note de 1 à 5 étoiles.',
            'Écrire un commentaire (optionnel).',
            'Ajouter une photo (optionnel).',
            'Soumettre l\'avis — vérifier son apparition dans la liste.',
            'Retourner sur le catalogue — la note moyenne doit être mise à jour.',
            'Tenter de soumettre un second avis sur le même produit → refus.',
        ],
        results=[
            ('Formulaire d\'avis accessible uniquement après achat du produit', True),
            ('Note en étoiles interactive et enregistrée correctement', True),
            ('Photo jointe visible dans l\'avis affiché', True),
            ('Note moyenne recalculée immédiatement sur la fiche produit', True),
            ('Doublon d\'avis bloqué avec message explicite', True),
        ],
    )

    # ── 10. Ventes Flash
    test_feature(story, s,
        num='10', title='Ventes Flash (Prix limité dans le temps)',
        desc=(
            'Les artisans ou admins peuvent activer un prix flash avec date d\'expiration. '
            'Un badge "FLASH" et un compte à rebours sont affichés sur le produit.'
        ),
        prereq='Accès artisan ou admin pour créer une vente flash.',
        steps=[
            'Se connecter en tant qu\'artisan → aller sur /dashboard/producer.',
            'Sélectionner un produit et cliquer "Activer une vente flash".',
            'Saisir le prix flash (inférieur au prix normal) et la date/heure d\'expiration.',
            'Sauvegarder et retourner sur le catalogue en mode client.',
            'Vérifier le badge "FLASH" sur la carte produit.',
            'Ouvrir la fiche produit — vérifier le prix barré et le compte à rebours.',
            'Attendre l\'expiration (ou modifier manuellement l\'heure en base) — le prix normal doit réapparaître.',
        ],
        results=[
            ('Badge "FLASH" visible sur la carte produit dans le catalogue', True),
            ('Prix original barré et prix flash affiché en rouge', True),
            ('Compte à rebours mis à jour en temps réel', True),
            ('Prix normal rétabli automatiquement après expiration', True),
        ],
    )

    # ── 11. Alertes Stock
    test_feature(story, s,
        num='11', title='Alertes de Stock (Notification de réapprovisionnement)',
        desc=(
            'Un client peut s\'abonner à une alerte pour être notifié quand '
            'un produit hors stock est de nouveau disponible.'
        ),
        prereq='Produit avec stock = 0.',
        steps=[
            'Aller sur la fiche d\'un produit en rupture de stock.',
            'Cliquer sur "M\'alerter quand disponible".',
            'Se connecter si nécessaire.',
            'En tant qu\'admin, remettre le stock > 0 pour ce produit.',
            'Vérifier la réception d\'une notification push/email.',
        ],
        results=[
            ('Bouton "M\'alerter" visible uniquement si stock = 0', True),
            ('Alerte enregistrée en base de données (StockAlert)', True),
            ('Notification envoyée automatiquement lors du réapprovisionnement', True),
            ('Signal Django déclenché à la sauvegarde du stock', True),
        ],
    )

    # ── 12. Partage social
    test_feature(story, s,
        num='12', title='Partage Réseaux Sociaux',
        desc='Partage direct d\'un produit sur Facebook et WhatsApp depuis la fiche produit.',
        prereq='Être sur une fiche produit.',
        steps=[
            'Sur la fiche produit, repérer les boutons de partage.',
            'Cliquer sur le bouton Facebook — une fenêtre de partage doit s\'ouvrir.',
            'Cliquer sur le bouton WhatsApp — vérifier l\'URL générée.',
            'Sur mobile, WhatsApp doit s\'ouvrir directement avec le message pré-rempli.',
        ],
        results=[
            ('Partage Facebook ouvre dialog.php avec l\'URL correcte du produit', True),
            ('Partage WhatsApp génère : https://wa.me/?text=...URL...', True),
            ('Aperçu OG (titre, image, description) affiché lors du partage', True),
        ],
    )

    story.append(PageBreak())

    # ── 13. Notifications Push
    test_feature(story, s,
        num='13', title='Notifications Push (PWA — Web Push API)',
        desc=(
            'Notifications push via pywebpush (backend) et Service Worker (frontend). '
            'Déclenchées par les changements de statut de commande, réapprovisionnement, etc.'
        ),
        prereq='Navigateur compatible (Chrome/Edge/Firefox). Application installée ou ouverte.',
        steps=[
            'Ouvrir l\'application dans Chrome.',
            'Accepter la demande de permission de notifications si proposée.',
            'Passer une commande ou demander à un admin de changer un statut.',
            'Vérifier la réception de la notification dans la barre système.',
            'Cliquer sur la notification — vérifier la redirection vers le suivi de commande.',
        ],
        results=[
            ('Permission de notification demandée à l\'arrivée sur le site', True),
            ('Notification reçue après changement de statut de commande', True),
            ('Clic sur notification → redirection vers /orders/:id/track', True),
            ('Fonctionne même avec l\'onglet en arrière-plan', True),
        ],
        notes=['Les notifications push ne fonctionnent pas en navigation privée ni sur iOS Safari (limitation Apple).'],
    )

    # ── 14. Codes Promo
    test_feature(story, s,
        num='14', title='Codes Promo (Réduction fixe, %, livraison gratuite)',
        desc=(
            'L\'admin peut créer des codes promo avec différents types de réduction, '
            'date d\'expiration et nombre d\'utilisations maximum.'
        ),
        prereq='Un code promo actif créé en admin. Exemple : BIENVENUE10 (10% de réduction).',
        steps=[
            'Au checkout, trouver le champ "Code promo".',
            'Saisir un code valide et cliquer "Appliquer".',
            'Observer la réduction appliquée sur le total.',
            'Tester un code expiré — message d\'erreur.',
            'Tester un code avec montant minimum non atteint — message spécifique.',
            'Tester un code de livraison gratuite — les frais doivent passer à 0.',
        ],
        results=[
            ('Réduction fixe appliquée : total − valeur FCFA', True),
            ('Réduction pourcentage : total × (1 − %/100)', True),
            ('Livraison gratuite : frais de port = 0 FCFA', True),
            ('Erreur explicite si code invalide, expiré ou quota dépassé', True),
            ('Compteur d\'utilisations incrémenté après validation de commande', True),
        ],
    )

    # ── 15. Messagerie
    test_feature(story, s,
        num='15', title='Messagerie Interne Client ↔ Artisan',
        desc=(
            'Système de messagerie direct entre clients et artisans. '
            'Accessible via la fiche produit (bouton "Contacter l\'artisan") '
            'ou depuis la page /messages.'
        ),
        prereq='Deux comptes : client et artisan.',
        steps=[
            'Connecté en client, aller sur la fiche produit d\'un artisan.',
            'Cliquer "Contacter l\'artisan".',
            'Saisir un message et envoyer.',
            'Se connecter en artisan → aller sur /messages.',
            'Vérifier la réception du message du client.',
            'Répondre au message.',
            'Revenir sur le compte client — vérifier la réponse reçue.',
        ],
        results=[
            ('Message envoyé et reçu instantanément (API REST)', True),
            ('Fil de conversation ordonné par date', True),
            ('Indicateur de messages non lus dans la navbar', True),
            ('Interface adaptée mobile avec clavier virtuel', True),
        ],
    )

    # ── 16. Profil public Artisan
    test_feature(story, s,
        num='16', title='Profil Public de l\'Artisan',
        desc=(
            'Page publique présentant l\'artisan : bio, spécialité, années d\'expérience, '
            'photo d\'atelier, vidéo de fabrication et catalogue de ses produits.'
        ),
        prereq='Artisan avec profil complété (ProducerProfile).',
        steps=[
            'Cliquer sur le nom d\'un artisan depuis une fiche produit ou le catalogue.',
            'Observer la page de profil : photo, bio, spécialité.',
            'Vérifier l\'affichage de la vidéo d\'atelier (si disponible).',
            'Parcourir les produits de l\'artisan sur sa page.',
            'Vérifier le badge "Vérifié" si is_verified = True.',
            'Cliquer "Contacter" pour ouvrir la messagerie.',
        ],
        results=[
            ('Profil public accessible sans connexion (/producer/:id)', True),
            ('Photo et vidéo d\'atelier affichées si renseignées', True),
            ('Liste des produits actifs de l\'artisan visible', True),
            ('Badge vérifié affiché selon le flag is_verified', True),
            ('Bouton "Contacter" redirige vers la messagerie', True),
        ],
    )

    story.append(PageBreak())

    # ── 17. Dashboard Artisan
    test_feature(story, s,
        num='17', title='Dashboard Artisan (Espace Producteur)',
        desc=(
            'Interface de gestion complète pour l\'artisan : '
            'statistiques de ventes, gestion produits, suivi commandes et export CSV.'
        ),
        prereq='Compte avec rôle "producer" ou "admin".',
        steps=[
            'Se connecter en artisan et aller sur /dashboard/producer.',
            'Observer les KPIs : chiffre d\'affaires, commandes, vues, stock faible.',
            'Aller dans "Mes Produits" — créer un nouveau produit avec images.',
            'Ajouter des variantes (taille/couleur) à un produit.',
            'Activer une vente flash sur un produit.',
            'Consulter l\'onglet "Mes Commandes" — vérifier la liste des commandes contenant ses produits.',
            'Mettre à jour le statut d\'une commande.',
            'Cliquer "Exporter mes ventes (CSV)" et vérifier le fichier téléchargé.',
        ],
        results=[
            ('KPIs affichés : CA total, CA semaine, CA mois, nombre de commandes', True),
            ('Alerte stock faible (≤ 3 articles) visible dans le dashboard', True),
            ('Création produit avec upload d\'images Cloudinary fonctionnel', True),
            ('Variantes produit créées et liées correctement', True),
            ('Export CSV contenant toutes les ventes livrées avec colonnes correctes', True),
            ('Onglet commandes affiche uniquement les commandes de l\'artisan', True),
        ],
    )

    # ── 18. Dashboard Admin & Agent
    test_feature(story, s,
        num='18', title='Dashboard Admin & Dashboard Agent',
        desc=(
            'Dashboard Admin : vue globale de la plateforme, gestion utilisateurs, commandes, codes promo et zones de livraison. '
            'Dashboard Agent : gestion des artisans assignés et mise à jour des stocks.'
        ),
        prereq='Compte admin ou agent.',
        steps=[
            'Se connecter en admin → /dashboard/admin.',
            'Vérifier les métriques globales : ventes totales, utilisateurs, commandes en attente.',
            'Aller dans la section Utilisateurs — promouvoir un client en artisan.',
            'Aller dans Commandes — changer le statut d\'une commande.',
            'Créer un code promo dans la section dédiée.',
            'Ajouter une zone de livraison (ville + tarif).',
            'Se connecter en agent → /dashboard/agent.',
            'Ajouter un artisan sous sa gestion (par téléphone).',
            'Mettre à jour le stock d\'un produit d\'un artisan géré.',
        ],
        results=[
            ('Métriques globales : total ventes, utilisateurs actifs, artisans, produits', True),
            ('Changement de statut commande déclenche notification push client', True),
            ('Création de code promo immédiatement utilisable au checkout', True),
            ('Zone de livraison ajoutée visible dans le dropdown checkout', True),
            ('Agent peut voir et modifier uniquement les artisans qu\'il gère', True),
            ('Mise à jour stock agent → visible sur la fiche produit', True),
        ],
    )

    # ── 19. PWA
    test_feature(story, s,
        num='19', title='Application PWA (Progressive Web App)',
        desc=(
            'Sahel Market est installable comme une application native sur Android et iOS. '
            'Le Service Worker gère le cache et les notifications push en arrière-plan.'
        ),
        prereq='Chrome sur Android ou Safari sur iOS.',
        steps=[
            'Ouvrir https://sahel-market-gamma.vercel.app sur Chrome mobile.',
            'Observer la bannière "Installer l\'application" (PwaInstallBanner).',
            'Cliquer "Installer" — confirmer l\'ajout à l\'écran d\'accueil.',
            'Fermer le navigateur et ouvrir l\'application depuis l\'icône.',
            'Vérifier l\'affichage en mode standalone (sans barre d\'URL).',
            'Couper la connexion internet — vérifier l\'affichage de la page hors-ligne.',
        ],
        results=[
            ('Bannière d\'installation affichée sur mobile compatible', True),
            ('Application installée sur l\'écran d\'accueil', True),
            ('Mode standalone : sans barre de navigation navigateur', True),
            ('Service Worker actif (visible dans Chrome DevTools → Application)', True),
            ('Page de cache disponible hors-ligne', True),
        ],
    )

    # ── 20. SEO
    test_feature(story, s,
        num='20', title='SEO & Méta-données (Open Graph, Sitemap)',
        desc=(
            'Chaque page produit génère des balises Open Graph pour un partage enrichi '
            'sur les réseaux sociaux. Un sitemap.xml et robots.txt sont générés automatiquement.'
        ),
        prereq='Accès aux outils de développement du navigateur.',
        steps=[
            'Ouvrir une fiche produit et inspecter le code source (Ctrl+U).',
            'Vérifier les balises <meta property="og:title">, og:image, og:description.',
            'Accéder à https://sahel-market-gamma.vercel.app/sitemap.xml.',
            'Accéder à https://sahel-market-gamma.vercel.app/robots.txt.',
            'Utiliser l\'outil Facebook Sharing Debugger pour valider og:image.',
        ],
        results=[
            ('Balises OG présentes sur chaque page produit', True),
            ('og:image pointe vers l\'image principale du produit', True),
            ('sitemap.xml liste toutes les pages produits', True),
            ('robots.txt autorise l\'indexation des pages publiques', True),
        ],
    )


# ─── PARTIE 2 — À implémenter ─────────────────────────────────────────────────
def part2_todo(story, s):
    story.append(PageBreak())
    story.append(Paragraph(
        'PARTIE 2 — FONCTIONNALITÉS RESTANT À IMPLÉMENTER',
        s['part_title']))
    story.append(Spacer(1, 3*mm))

    intro = (
        'Les fonctionnalités suivantes ont été identifiées pour améliorer la plateforme '
        'et atteindre le niveau d\'une marketplace africaine de référence. '
        'Elles sont classées par <b>priorité business</b> (impact utilisateur) '
        'et <b>complexité technique</b>.'
    )
    story.append(Paragraph(intro, s['body']))
    story.append(Spacer(1, 3*mm))

    features = [
        # (Nom, Priorité, Complexité)
        ('Système de remboursement et litiges (dispute management)', 'HAUTE', '★★★★'),
        ('Chat en temps réel avec WebSocket (Django Channels)', 'HAUTE', '★★★'),
        ('Multi-vendeur : commission Sahel Market sur les ventes (ex. 5%)', 'HAUTE', '★★★'),
        ('Portefeuille artisan avec retrait Mobile Money automatisé', 'HAUTE', '★★★★'),
        ('Tableau de bord analytique avancé : graphiques courbes / barres (Recharts)', 'HAUTE', '★★'),
        ('Système de parrainage client (code de parrainage unique)', 'HAUTE', '★★'),
        ('Application mobile React Native (iOS + Android)', 'HAUTE', '★★★★★'),
        ('Paiement par carte bancaire (Stripe Africa / Flutterwave)', 'HAUTE', '★★★'),
        ('Livraison intégrée avec tracking GPS en temps réel (WebSocket)', 'MOYENNE', '★★★★'),
        ('Gestion des retours produits (return flow)', 'MOYENNE', '★★★'),
        ('Programme de fidélité avancé : récompenses non-monétaires (cadeaux, accès)', 'MOYENNE', '★★'),
        ('Système d\'abonnement artisan (Premium, Vitrine boostée)', 'MOYENNE', '★★★'),
        ('Recherche vocale (Speech-to-Text API)', 'MOYENNE', '★★'),
        ('Marketplace B2B : commandes en gros avec devis', 'MOYENNE', '★★★★'),
        ('Support multilingue complet (Français / Anglais / Fulfulde)', 'MOYENNE', '★★'),
        ('Chatbot IA pour support client (Claude API)', 'MOYENNE', '★★★'),
        ('Vérification identité artisan (KYC — document officiel)', 'MOYENNE', '★★★'),
        ('Tableau de bord fournisseur de matières premières', 'FAIBLE', '★★★'),
        ('Newsletter avec segmentation (Mailchimp / Brevo API)', 'FAIBLE', '★★'),
        ('Gamification : badges artisan (Best Seller, Coup de cœur)', 'FAIBLE', '★'),
        ('Mode sombre (Dark Mode)', 'FAIBLE', '★'),
        ('Export données client (RGPD — droit à la portabilité)', 'FAIBLE', '★★'),
        ('Comparateur de produits (jusqu\'à 3 produits côte à côte)', 'FAIBLE', '★★'),
        ('Calendrier des marchés locaux (événements artisanaux)', 'FAIBLE', '★★'),
    ]

    story.append(feature_todo_table(features, s))
    story.append(Spacer(1, 6*mm))

    # ── Détails prioritaires ──
    story.append(section_banner('Détail des Fonctionnalités Prioritaires', s))
    story.append(Spacer(1, 3*mm))

    details = [
        ('1. Système de Remboursement & Litiges', [
            '<b>Objectif :</b> Permettre à un client de signaler un problème avec sa commande '
            '(produit non reçu, non-conforme, endommagé) et demander un remboursement.',
            '<b>Flux proposé :</b> Client ouvre un litige → Admin est notifié → '
            'Médiation via messagerie interne → Admin décide : remboursement ou rejet → '
            'Si remboursé, Mobile Money inverse automatiquement via Campay.',
            '<b>Modèles à créer :</b> Dispute (order, reason, status, resolution), '
            'DisputeMessage (dispute, user, content).',
            '<b>États du litige :</b> open → under_review → resolved_refund | resolved_rejected | resolved_exchange.',
            '<b>Délai estimé de développement :</b> 3-4 jours.',
        ]),
        ('2. Chat Temps Réel (Django Channels + WebSocket)', [
            '<b>Objectif :</b> Remplacer la messagerie REST actuelle par un WebSocket '
            'pour des échanges instantanés sans rechargement.',
            '<b>Stack :</b> Django Channels (déjà installé), Redis (Render Redis ou Upstash), '
            'frontend React avec useWebSocket hook.',
            '<b>Architecture :</b> Consumer Django Channels gérant les rooms "user_{id}" → '
            'messages broadcastés en temps réel aux participants.',
            '<b>Le modèle Message existant est réutilisable.</b> Seule la couche transport change.',
            '<b>Délai estimé :</b> 2-3 jours.',
        ]),
        ('3. Commission Sahel Market (Multi-vendeur)', [
            '<b>Objectif :</b> Prélever automatiquement un pourcentage (ex. 5%) sur chaque vente '
            'au profit de Sahel Market, et verser le reste à l\'artisan.',
            '<b>Mécanisme :</b> À chaque OrderItem livré, calculer : '
            'commission = unit_price × qty × 5%, net_artisan = total − commission.',
            '<b>Modèles à créer :</b> Commission (order_item, rate, amount, paid_at), '
            'Payout (producer, amount, status, reference_campay).',
            '<b>Dashboard artisan :</b> Afficher le CA brut, la commission déduite et le net.',
            '<b>Délai estimé :</b> 2 jours (configuration) + intégration Campay withdraw (2 jours).',
        ]),
        ('4. Application Mobile React Native', [
            '<b>Objectif :</b> Publier Sahel Market sur Google Play Store et Apple App Store.',
            '<b>Stack :</b> React Native (Expo) avec partage de la logique Redux et des appels API.',
            '<b>Avantage :</b> 80% du code frontend React est réutilisable.',
            '<b>Fonctionnalités natives :</b> Notifications push (Expo Notifications), '
            'appareil photo (upload photo avis), géolocalisation (zones livraison).',
            '<b>Délai estimé :</b> 3-4 semaines (version MVP).',
        ]),
        ('5. Tableau de Bord Analytique Avancé', [
            '<b>Objectif :</b> Remplacer les métriques statiques par des graphiques interactifs '
            '(courbes de ventes, histogrammes produits, camembert catégories).',
            '<b>Stack :</b> Recharts (déjà disponible en React), données agrégées via Django ORM.',
            '<b>Vues à ajouter :</b> Ventes par jour/semaine/mois, Top 10 produits, '
            'répartition par catégorie, taux de conversion panier → commande.',
            '<b>Délai estimé :</b> 2-3 jours.',
        ]),
        ('6. Paiement par Carte Bancaire', [
            '<b>Objectif :</b> Élargir les options de paiement aux cartes Visa/Mastercard '
            'pour les clients disposant d\'un compte bancaire.',
            '<b>Option recommandée :</b> Flutterwave (couverture Cameroun + Afrique subsaharienne) '
            'ou Wave (Cameroun uniquement).',
            '<b>Intégration :</b> SDK Flutterwave côté frontend, webhook côté Django '
            'similaire à l\'intégration Campay existante.',
            '<b>Délai estimé :</b> 2-3 jours.',
        ]),
    ]

    for title, points in details:
        story.append(Spacer(1, 3*mm))
        story.append(Paragraph(title, s['subsection']))
        for pt in points:
            story.append(Paragraph(f'• {pt}', s['step']))
        story.append(hr(GREY2, 0.5))

    # ── Résumé final
    story.append(Spacer(1, 4*mm))
    recap_data = [
        ['Catégorie', 'Nombre', 'Commentaire'],
        ['Fonctionnalités implémentées', '20+', 'Stables et testables en production'],
        ['Fonctionnalités HAUTE priorité', '8',  'Impact direct sur le chiffre d\'affaires'],
        ['Fonctionnalités MOYENNE priorité', '9', 'Expérience utilisateur avancée'],
        ['Fonctionnalités FAIBLE priorité', '7', 'Différenciation & polish'],
        ['Total restant à développer', '24', 'Feuille de route estimée : 6-8 mois'],
    ]
    cw = [(PAGE_W - 40*mm)*r for r in [0.50, 0.15, 0.35]]
    t = Table(recap_data, colWidths=cw)
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0), SAND),
        ('TEXTCOLOR',    (0,0), (-1,0), WHITE),
        ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1), 9.5),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [WHITE, GREY]),
        ('GRID',         (0,0), (-1,-1), 0.3, GREY2),
        ('TOPPADDING',   (0,0), (-1,-1), 7),
        ('BOTTOMPADDING',(0,0), (-1,-1), 7),
        ('LEFTPADDING',  (0,0), (-1,-1), 10),
        ('FONTNAME',     (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('BACKGROUND',   (0,-1), (-1,-1), GREY2),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)


# ─── Page numérotation ────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#888888'))
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(PAGE_W / 2, 12*mm,
        f'Sahel Market — Guide de Test | Page {page_num}')
    canvas.setStrokeColor(GREY2)
    canvas.setLineWidth(0.5)
    canvas.line(20*mm, 16*mm, PAGE_W - 20*mm, 16*mm)
    canvas.restoreState()


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    output = '/home/joel/Documents/sahel-market/Sahel_Market_Guide_Tests.pdf'
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=22*mm,
        title='Sahel Market — Guide de Test',
        author='Sahel Market Team',
    )

    s = build_styles()
    story = []

    cover_page(story, s)
    toc_page(story, s)
    part1_tests(story, s)
    part2_todo(story, s)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'✅  PDF généré : {output}')


if __name__ == '__main__':
    main()
