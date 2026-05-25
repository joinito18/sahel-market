#!/usr/bin/env python3
"""Génère Sahel_Market_Fonctionnalites.pdf v1.3 — Mai 2026"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak,
)
from reportlab.platypus.flowables import Flowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ── Palette ──────────────────────────────────────────────────────
OR   = HexColor('#f97316')
OR_L = HexColor('#fff7ed')
OR_B = HexColor('#fed7aa')
DARK = HexColor('#111111')
TEXT = HexColor('#374151')
MUT  = HexColor('#6B7280')
LITE = HexColor('#9CA3AF')
BDR  = HexColor('#E5E7EB')
BG   = HexColor('#F9FAFB')
GRN  = HexColor('#16a34a')
GRN_L= HexColor('#f0fdf4')
GRN_B= HexColor('#bbf7d0')
BLU  = HexColor('#2563EB')
BLU_L= HexColor('#EFF6FF')
PUR  = HexColor('#7C3AED')
PUR_L= HexColor('#F5F3FF')
RED  = HexColor('#DC2626')
RED_L= HexColor('#FEF2F2')
YEL_L= HexColor('#FEF9C3')
YEL_T= HexColor('#92400e')

W, H = A4

# ── Styles ───────────────────────────────────────────────────────
def ps(name, font='Helvetica', **kw):
    return ParagraphStyle(name, fontName=font, **kw)

BODY   = ps('body',   fontSize=9,   textColor=TEXT,  leading=14)
BOLD   = ps('bold',   font='Helvetica-Bold', fontSize=9,   textColor=DARK,  leading=14)
SMALL  = ps('small',  fontSize=7.5, textColor=MUT,   leading=11)
TITLE  = ps('title',  font='Helvetica-Bold', fontSize=14,  textColor=DARK,  leading=18)
CTITLE = ps('ctitle', font='Helvetica-Bold', fontSize=10,  textColor=DARK,  leading=14)
CBODY  = ps('cbody',  fontSize=8.5, textColor=TEXT,  leading=13)
OR_S   = ps('ors',    font='Helvetica-Bold', fontSize=9,   textColor=OR,    leading=13)
GRN_S  = ps('grns',   font='Helvetica-Bold', fontSize=9,   textColor=GRN,   leading=13)
TOC_N  = ps('tocn',   font='Helvetica-Bold', fontSize=10,  textColor=OR,    leading=16)
TOC_L  = ps('tocl',   font='Helvetica-Bold', fontSize=10,  textColor=DARK,  leading=16)
TH     = ps('th',     font='Helvetica-Bold', fontSize=9,   textColor=DARK,  leading=13)
TD     = ps('td',     fontSize=8.5, textColor=TEXT,  leading=13)
SUB    = ps('sub',    font='Helvetica-Bold', fontSize=11,  textColor=DARK,  leading=15, spaceBefore=10, spaceAfter=4)

def sp(h=6): return Spacer(1, h)

# ── Flowables personnalisés ──────────────────────────────────────

class OrangeLine(Flowable):
    def wrap(self, aw, ah): self._w = aw; return aw, 2
    def draw(self):
        self.canv.setStrokeColor(OR); self.canv.setLineWidth(1.5)
        self.canv.line(0, 1, self._w, 1)

class SectionHeader(Flowable):
    def __init__(self, num, title, new=False, updated=False):
        self.num = str(num); self.title = title; self.new = new; self.updated = updated
        Flowable.__init__(self)
    def wrap(self, aw, ah): self._w = aw; return aw, 54
    def draw(self):
        c = self.canv
        r = 14
        c.setFillColor(OR); c.circle(r, 30, r, fill=1, stroke=0)
        c.setFillColor(white); c.setFont('Helvetica-Bold', 11); c.drawCentredString(r, 26, self.num)
        c.setFillColor(DARK); c.setFont('Helvetica-Bold', 18)
        tx = r*2 + 10; c.drawString(tx, 24, self.title)
        badge_x = tx + c.stringWidth(self.title, 'Helvetica-Bold', 18) + 12
        if self.new:
            c.setFillColor(OR); c.roundRect(badge_x, 26, 34, 15, 4, fill=1, stroke=0)
            c.setFillColor(white); c.setFont('Helvetica-Bold', 7.5); c.drawCentredString(badge_x+17, 30, 'NEW')
        elif self.updated:
            c.setFillColor(GRN); c.roundRect(badge_x, 26, 46, 15, 4, fill=1, stroke=0)
            c.setFillColor(white); c.setFont('Helvetica-Bold', 7.5); c.drawCentredString(badge_x+23, 30, 'UPDATED')
        c.setStrokeColor(OR); c.setLineWidth(1.5); c.line(0, 0, self._w, 0)

def bul(text, bp=False):
    if bp:
        i = text.find(':')
        if i > -1: text = f'<b>{text[:i+1]}</b>{text[i+1:]}'
    return Paragraph(
        text,
        ParagraphStyle('bul', parent=BODY, leftIndent=16, firstLineIndent=0,
                       spaceBefore=2, spaceAfter=2,
                       bulletText='●', bulletColor=OR, bulletFontSize=6,
                       bulletIndent=4, bulletOffsetY=1)
    )

def cards(items, col=2):
    """items = list of (emoji+title, body_text)"""
    dw = W - 36*mm
    if col == 2:
        cw = (dw - 8) / 2
        rows = []
        for i in range(0, len(items), 2):
            pair = items[i:i+2]
            row = []
            for icon_title, body in pair:
                row.append([Paragraph(icon_title, CTITLE), sp(3), Paragraph(body, CBODY)])
            if len(pair) < 2: row.append('')
            rows.append(row)
        t = Table(rows, colWidths=[cw, cw])
        t.setStyle(TableStyle([
            ('BOX',           (0,0), (0,-1), 0.5, BDR),
            ('BOX',           (1,0), (1,-1), 0.5, BDR),
            ('BACKGROUND',    (0,0), (-1,-1), white),
            ('LEFTPADDING',   (0,0), (-1,-1), 12),
            ('RIGHTPADDING',  (0,0), (-1,-1), 12),
            ('TOPPADDING',    (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('RIGHTPADDING',  (0,0), (0,-1), 4),
            ('LEFTPADDING',   (1,0), (1,-1), 4),
        ]))
        return t
    else:  # col == 3
        cw = (dw - 12) / 3
        rows = []
        for i in range(0, len(items), 3):
            triple = items[i:i+3]
            row = []
            for icon_title, body in triple:
                row.append([Paragraph(icon_title, CTITLE), sp(3), Paragraph(body, CBODY)])
            while len(row) < 3: row.append('')
            rows.append(row)
        t = Table(rows, colWidths=[cw, cw, cw])
        t.setStyle(TableStyle([
            ('BOX',           (0,0), (0,-1), 0.5, BDR),
            ('BOX',           (1,0), (1,-1), 0.5, BDR),
            ('BOX',           (2,0), (2,-1), 0.5, BDR),
            ('BACKGROUND',    (0,0), (-1,-1), white),
            ('LEFTPADDING',   (0,0), (-1,-1), 10),
            ('RIGHTPADDING',  (0,0), (-1,-1), 4),
            ('TOPPADDING',    (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ]))
        return t

def dtable(headers, rows, cws=None):
    data = [[Paragraph(h, TH) for h in headers]]
    for r in rows: data.append([Paragraph(str(c), TD) for c in r])
    t = Table(data, colWidths=cws, hAlign='LEFT', repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0), BG),
        ('BOX',           (0,0), (-1,-1), 0.5, BDR),
        ('INNERGRID',     (0,0), (-1,-1), 0.3, BDR),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
    ]))
    return t

def api(method, path, desc='', badge=None):
    mc = {'GET': (BLU_L, BLU), 'POST': (GRN_L, GRN), 'PATCH': (OR_L, OR),
          'DELETE': (RED_L, RED), 'DEL': (RED_L, RED)}
    bg, fg = mc.get(method, (BG, TEXT))
    m_cell = Paragraph(f'<font color="{fg.hexval()}">{method}</font>',
                       ParagraphStyle('mc', parent=TH, fontSize=8))
    txt = path + (f' — {desc}' if desc else '') + (f' <font color="#f97316"><b>{badge}</b></font>' if badge else '')
    p_cell = Paragraph(txt, ParagraphStyle('pc', parent=BODY, fontSize=8.5))
    t = Table([[m_cell, p_cell]], colWidths=[40, None])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (0,0), bg),
        ('BOX',           (0,0), (-1,-1), 0.3, BDR),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return t

def infobox(title, body, bg=OR_L, border=OR_B, fg=OR):
    t = Table([[Paragraph(f'<font color="{fg.hexval()}">{title}</font>',
                          ParagraphStyle('ibt', parent=BOLD, fontSize=10))],
               [sp(2)],
               [Paragraph(body, CBODY)]], colWidths=[None])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), bg),
        ('BOX',           (0,0), (-1,-1), 1, border),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
    ]))
    return t

def status_badge(text, bg, fg):
    t = Table([[Paragraph(f'<font color="{fg.hexval()}">{text}</font>',
                          ParagraphStyle('sb', parent=TH, fontSize=8, fontName='Helvetica-Bold'))]])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), bg),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    return t

# ── Cover page ───────────────────────────────────────────────────
def build_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(OR); canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Cercles décoratifs
    canvas.setFillColor(white); canvas.setFillAlpha(0.05)
    canvas.circle(W - 50, H - 70, 170, fill=1, stroke=0)
    canvas.setFillAlpha(0.03); canvas.circle(-20, 100, 110, fill=1, stroke=0)
    canvas.setFillAlpha(1.0)
    # Label
    canvas.setFont('Helvetica-Bold', 9); canvas.setFillColor(HexColor('#fde68a'))
    canvas.drawString(36*mm, H-100, 'DOCUMENTATION TECHNIQUE')
    # Titre
    canvas.setFont('Helvetica-Bold', 48); canvas.setFillColor(white)
    canvas.drawString(36*mm, H-155, 'Sahel Market')
    # Sous-titre
    canvas.setFont('Helvetica', 14); canvas.setFillColor(HexColor('#fde68a'))
    canvas.drawString(36*mm, H-180, "Plateforme e-commerce pour l’artisanat camerounais")
    # Tags
    tags = ['🇨🇲 Cameroun', 'React + Django', 'PWA', 'Mobile Money', 'Fidélité', 'Codes Promo', 'IA Recommandations']
    tx, ty = 36*mm, H-228
    for tag in tags:
        tw = canvas.stringWidth(tag, 'Helvetica', 9) + 22
        canvas.setFillColor(white); canvas.setFillAlpha(0.15)
        canvas.roundRect(tx, ty, tw, 20, 10, fill=1, stroke=0)
        canvas.setFillAlpha(1.0); canvas.setFont('Helvetica', 9); canvas.setFillColor(white)
        canvas.drawString(tx+11, ty+6, tag); tx += tw+8
        if tx > W-90: tx=36*mm; ty-=28
    # Box description
    box_y = H-330
    canvas.setFillColor(white); canvas.setFillAlpha(0.12)
    canvas.roundRect(36*mm, box_y, W-72*mm, 72, 8, fill=1, stroke=0)
    canvas.setFillAlpha(1.0); canvas.setFont('Helvetica', 10); canvas.setFillColor(white)
    canvas.drawString(36*mm+14, box_y+50, "Sahel Market connecte les artisans de l’Extrême-Nord Cameroun avec des")
    canvas.drawString(36*mm+14, box_y+36, "acheteurs locaux et diaspora via une plateforme moderne, accessible sur")
    canvas.drawString(36*mm+14, box_y+22, "mobile et hors-ligne. IA de recommandation intégrée (sans API externe).")
    # Version
    canvas.setFont('Helvetica', 8); canvas.setFillColor(HexColor('#fde68a'))
    canvas.drawString(36*mm, 40, 'Version 1.3 — Mai 2026 · Confidentiel — Usage investisseurs')
    canvas.restoreState()

def build_page(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5); canvas.setFillColor(LITE)
    canvas.drawString(18*mm, 12*mm,
        'Sahel Market · Documentation technique v1.3 · Mai 2026 · Confidentiel')
    canvas.drawRightString(W-18*mm, 12*mm, f'Page {doc.page}')
    canvas.restoreState()

# ════════════════════════════════════════════════════════════════════
# STORY
# ════════════════════════════════════════════════════════════════════
OUTPUT = '/home/joel/Documents/sahel-market/Sahel_Market_Fonctionnalites.pdf'
doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    rightMargin=18*mm, leftMargin=18*mm, topMargin=20*mm, bottomMargin=22*mm,
    title='Sahel Market — Documentation technique v1.3', author='Sahel Market')

story = []

# ── Cover ────────────────────────────────────────────────────────
story.append(PageBreak())

# ── Table des matières ───────────────────────────────────────────
story.append(Paragraph('Table des matières',
    ParagraphStyle('tocH', parent=TITLE, fontSize=22, textColor=OR, spaceAfter=6)))
story.append(OrangeLine()); story.append(sp(20))

TOC = [
    (1,  'Architecture technique', False, False),
    (2,  'Pages publiques & navigation', False, True),
    (3,  'Authentification & gestion des rôles', False, False),
    (4,  'Catalogue produits & recherche', False, True),
    (5,  "Panier & tunnel d'achat", False, False),
    (6,  'Codes promo', False, False),
    (7,  'Programme de fidélité', False, False),
    (8,  'Notifications en temps réel', False, False),
    (9,  'Dashboard producteur / artisan', False, False),
    (10, 'Dashboard admin & agent', False, False),
    (11, 'Messagerie & avis', False, False),
    (12, 'PWA & mode hors-ligne', False, False),
    (13, 'Référentiel API', False, True),
    (14, 'Roadmap & métriques', False, True),
    (15, 'Stack technique', False, False),
]
for num, label, new, upd in TOC:
    badge = ' <font color="#f97316">↑</font>' if upd else (' <font color="#f97316">NEW</font>' if new else '')
    row = [[Paragraph(str(num), TOC_N), Paragraph(label+badge, TOC_L)]]
    t = Table(row, colWidths=[22, W-36*mm-22])
    t.setStyle(TableStyle([
        ('LEFTPADDING',  (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING',   (0,0), (-1,-1), 5), ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ('LINEBELOW',    (0,0), (-1,-1), 0.3, BDR), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
story.append(PageBreak())

# ════════════════════════════════════════════════════════════════════
# 1 — Architecture technique
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(1, 'Architecture technique'), sp(16),
    cards([
        ('💻 Frontend — React / Vite',
         'SPA React 18 avec Vite, Redux Toolkit pour l\'état global, React Query pour le cache serveur, Framer Motion pour les animations, Lucide pour les icônes.'),
        ('⚙️ Backend — Django REST Framework',
         'API REST Django 4.x, authentification JWT (SimpleJWT), permissions par rôle, django-filters pour le filtrage, Cloudinary pour les images.'),
    ]), sp(8),
    cards([
        ('🗄 Base de données — PostgreSQL',
         'PostgreSQL hébergé sur Neon (serverless). Modèles : User, Product, ProductImage, Cart, CartItem, Order, OrderItem, Notification, PromoCode, Message, Review, ProducerProfile.'),
        ('☁️ Déploiement',
         'Backend sur Render (auto-deploy depuis GitHub), Frontend sur Vercel (CDN global), Base de données Neon PostgreSQL, Images Cloudinary.'),
    ]), sp(14),
    Paragraph('Flux de données', SUB),
    dtable(['Étape', 'Description'], [
        ['Client → API', 'Requête Axios avec Bearer token JWT'],
        ['DRF Views', 'Validation permissions, sérialisation, accès DB'],
        ['PostgreSQL', 'Stockage des données, full-text search en français'],
        ['Cloudinary', 'Upload et CDN des images produit'],
        ['Redux / React Query', 'Mise à jour état global + cache invalidation'],
    ], cws=[120, None]),
    sp(6),
    Paragraph('Les notifications sont récupérées par polling (toutes les 30 secondes). '
              'Le panier est persisté en base de données, synchronisé avec Redux au chargement.',
              BODY),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 2 — Pages publiques & navigation
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(2, 'Pages publiques & navigation', updated=True), sp(16),
    cards([
        ('🏠 Page d\'accueil (Home)',
         'Bannière héros éditoriale (fond #111111, typographie Cormorant Garamond), section Impact (chiffres animés), carrousel produits, section partenaires (Orange, MTN, GIZ, MINCOMMERCE), CTA inscription artisan.'),
        ('📦 Catalogue Produits',
         'Grille responsive, filtres par catégorie/prix/disponibilité, tri (prix, popularité, date), recherche full-text PostgreSQL en français, dropdown avec clic extérieur.'),
    ]), sp(8),
    cards([
        ('🔍 Fiche produit',
         'Galerie images, description, prix en FCFA, note étoilée, avis clients, profil artisan, bouton ajout panier, compteur de vues, recommandations intelligentes (IA interne).'),
        ('👤 Profil artisan public',
         'Page publique par artisan : bio, spécialité, photo, catalogue des produits, note moyenne, badge "vérifié".'),
    ]), sp(8),
    cards([
        ('🗺 Comment ça marche',
         'Page explicative 3 étapes illustrées (parcourir / commander / recevoir), destinée aux nouveaux visiteurs.'),
        ('🚀 Roadmap publique',
         '5 phases (réalisées / actives / planifiées / vision), barre de progression, métriques investisseurs, CTA contact.'),
    ]), sp(14),
    Paragraph('Design mobile haut de gamme', SUB),
    infobox('🎨 Direction éditoriale internationale',
            'Redesign complet avec système de design tokens : fond parcheminé (#F5F4EF), typographie éditoriale Cormorant Garamond, palette minimaliste. '
            'Cohérence visuelle totale sur toutes les pages (Home, Products, Login, Register, Checkout, Profile, OrderHistory).'),
    sp(8),
    cards([
        ('📱 Navigation mobile',
         'BottomNav glassmorphism (56px, backdrop-filter) avec 5 onglets. Navbar réduite mobile : logo serif + bouton recherche + cloche notifications. Aucun menu burger.'),
        ('🃏 ProductCard éditoriale',
         'Ratio portrait 3:4, bouton ajout panier rond noir → orange animé, coeur wishlist toujours visible, nom artisan en small caps au-dessus du titre.'),
    ]), sp(8),
    Paragraph('Navigation & Footer', SUB),
    bul('Navbar : logo Cormorant Garamond, liens contextuels selon le rôle, badge panier animé, cloche notifications, menu profil.', bp=False),
    bul('Footer : liens vers pages légales (CGU, politique de confidentialité, retours, livraison, FAQ), roadmap, mention légale.', bp=False),
    bul('PWA : icône installable, bannière "Ajouter à l\'écran d\'accueil" sur mobile.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 3 — Authentification & gestion des rôles
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(3, 'Authentification & gestion des rôles'), sp(16),
    Paragraph('Rôles utilisateurs', SUB),
    cards([
        ('🛒 Client', 'Parcourir, acheter, suivre les commandes, avis, messagerie, points fidélité, codes promo.'),
        ('🧑‍🎨 Producteur (artisan)', 'Gérer ses produits, consulter ses ventes, exporter en CSV, messagerie, tableau de bord analytique, onboarding guidé.'),
        ('🛡 Admin / Agent', 'Gérer toutes les commandes (changement de statut), dashboard global, statistiques plateforme, gestion utilisateurs.'),
    ], col=3),
    sp(14), Paragraph('Flux d\'authentification', SUB),
    bul('Inscription : username, email, mot de passe, rôle (client / producteur). Validation côté front et back.', bp=False),
    bul('Connexion : JWT access token (15 min) + refresh token (7 jours). Tokens stockés en mémoire Redux.', bp=False),
    bul('Refresh automatique : intercepteur Axios qui renouvelle l\'access token avant expiration.', bp=False),
    bul('Profil : modification du nom, email, téléphone, photo de profil (Cloudinary).', bp=False),
    bul('Onboarding artisan : assistant 5 étapes (bienvenue, profil, premier produit, fonctionnalités, terminé) déclenché une seule fois par compte.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 4 — Catalogue produits & recherche
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(4, 'Catalogue produits & recherche', updated=True), sp(16),
    cards([
        ('🔍 Filtres avancés',
         'Filtrage par catégorie (maroquinerie, textile, poterie…), fourchette de prix, disponibilité (en stock / rupture), note minimale. Fermeture automatique au clic extérieur.'),
        ('📊 Tri',
         'Par pertinence (full-text score), prix croissant/décroissant, nouveautés, popularité (nombre de vues). Dropdown animé.'),
    ]), sp(8),
    cards([
        ('🖼 Gestion des images',
         'Upload multi-images vers Cloudinary. Image principale sélectionnable. Redimensionnement automatique. Fallback placeholder SVG.'),
        ('📦 Gestion du stock',
         'Stock déduit automatiquement à chaque commande. Alerte stock bas (≤ 3 unités) : notification artisan + badge rouge sur la fiche. L\'artisan peut mettre un produit "indisponible".'),
    ]), sp(14),
    Paragraph('Recherche full-text PostgreSQL', SUB),
    infobox('🔎 Recherche intelligente en français',
            'Moteur de recherche full-text natif PostgreSQL avec configuration linguistique française. '
            'Indexation pondérée : nom du produit (poids A) > description (poids B) > localisation (poids C). '
            'Les résultats sont classés par score de pertinence (SearchRank). '
            'Fallback automatique sur ILIKE si PostgreSQL non configuré.'),
    sp(8),
    dtable(['Élément', 'Détail'], [
        ['SearchVector', 'Vecteur de recherche combiné : nom (A) + description (B) + location (C)'],
        ['SearchQuery',  'Requête en langue française (config=\'french\') — stemming et accents'],
        ['SearchRank',   'Score de pertinence — filtrage rank ≥ 0.01'],
        ['Fallback',     'ILIKE sur nom + description si l\'extension n\'est pas activée'],
    ], cws=[120, None]),
    sp(16),
    Paragraph('Recommandations intelligentes (IA sans API externe)', SUB),
    infobox('🤖 Moteur de recommandation collaboratif',
            'Système de recommandation produit en 3 stratégies combinées, basé uniquement sur les données '
            'de commandes PostgreSQL. Aucune API externe payante. Se perfectionne automatiquement '
            'à mesure que les commandes s\'accumulent.',
            bg=GRN_L, border=GRN_B, fg=GRN),
    sp(8),
    dtable(['Stratégie', 'Méthode', 'Résultat'], [
        ['1 — Co-achat', 'Trouver les users qui ont commandé ce produit, puis les autres produits qu\'ils ont achetés. Classement par COUNT.', 'Jusqu\'à 4 produits'],
        ['2 — Même catégorie', 'Produits de la même catégorie triés par views_count (popularité).', 'Complète jusqu\'à 6'],
        ['3 — Même artisan', 'Autres produits du même artisan triés par popularité.', 'Complète jusqu\'à 6'],
    ], cws=[80, None, 70]),
    sp(6),
    bul('Endpoint : GET /products/:id/recommendations/ — retourne jusqu\'à 6 produits.', bp=False),
    bul('Affiché en bas de la fiche produit dans la section "Vous aimerez aussi".', bp=False),
    bul('Utilise les mêmes sérialiseurs et optimisations (select_related, prefetch_related).', bp=False),
    sp(14),
    Paragraph('Modèle produit', SUB),
    dtable(['Champ', 'Type', 'Description'], [
        ['name',         'CharField',             'Nom du produit'],
        ['description',  'TextField',             'Description détaillée'],
        ['price',        'DecimalField',           'Prix en FCFA'],
        ['stock',        'PositiveIntegerField',   'Quantité disponible'],
        ['category',     'FK Category',            'Catégorie artisanale'],
        ['producer',     'FK User',                'Artisan propriétaire'],
        ['location',     'CharField',              'Ville / région de fabrication'],
        ['is_available', 'BooleanField',           'Visible dans le catalogue'],
        ['views_count',  'PositiveIntegerField',   'Compteur de vues (analytics)'],
        ['images',       'ProductImage[]',         'Galerie Cloudinary'],
    ], cws=[100, 120, None]),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 5 — Panier & tunnel d'achat
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(5, "Panier & tunnel d'achat"), sp(16),
    Paragraph('Panier (CartDrawer)', SUB),
    bul('Drawer latéral accessible depuis la navbar. Synchronisé avec la base de données (CartItem par utilisateur).', bp=False),
    bul('Modification des quantités, suppression d\'articles, total dynamique en FCFA.', bp=False),
    bul('Persistance : le panier est conservé entre sessions.', bp=False),
    sp(10), Paragraph('Tunnel de commande (Checkout)', SUB),
    cards([
        ('📍 Livraison', 'Sélection de zone parmi 4 options tarifées (Maroua 500 FCFA, Garoua/Ngaoundéré 1 500, Yaoundé/Douala 2 500, Autres 3 500). Adresse précise en texte libre.'),
        ('💳 Paiement', 'Orange Money, MTN Mobile Money (avec numéro de téléphone optionnel), Espèces à la livraison. Instructions de virement affichées à la confirmation.'),
    ]), sp(8),
    bul('Déduction stock : le stock de chaque produit est decrementé immédiatement à la validation de la commande.', bp=True),
    bul('Référence de paiement : code unique CMD-XXXXXXXX généré pour chaque commande.', bp=True),
    bul('Notifications : le client reçoit une notification "Commande passée", l\'artisan reçoit "Nouvelle commande reçue".', bp=True),
    bul('Suivi des commandes : page historique avec statuts animés (en attente → payé → en préparation → expédié → livré).', bp=True),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 6 — Codes promo
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(6, 'Codes promo', new=True), sp(16),
    infobox('🏷 Système de codes promotionnels complet',
            'Les codes promo permettent d\'offrir des remises ciblées aux utilisateurs : nouveaux clients, '
            'campagnes saisonnières, partenariats. Entièrement géré depuis l\'interface Django Admin.'),
    sp(12), Paragraph('Types de remises', SUB),
    cards([
        ('💰 Montant fixe', 'Ex : ARTISAN500 → −500 FCFA. Applicable dès un montant minimum configurable. Plafonné au sous-total de la commande.'),
        ('📉 Pourcentage', 'Ex : BIENVENUE → −10%. Calculé sur le sous-total hors livraison. Montant minimum d\'achat configurable.'),
        ('🚚 Livraison gratuite', 'Ex : SAHEL1 → livraison offerte quelle que soit la zone. La livraison est affichée barrée puis à 0 FCFA.'),
    ], col=3),
    sp(12), Paragraph('Modèle PromoCode', SUB),
    dtable(['Champ', 'Type', 'Description'], [
        ['code',             'CharField unique',      'Code saisi par l\'utilisateur (ex : SAHEL1)'],
        ['discount_type',    'choices',               'fixed / percent / free_delivery'],
        ['discount_value',   'DecimalField',          'Montant (FCFA) ou pourcentage'],
        ['min_order_amount', 'DecimalField',          'Montant minimum de commande'],
        ['description',      'CharField',             'Libellé affiché au client'],
        ['is_active',        'BooleanField',          'Activation/désactivation immédiate'],
        ['expiry_date',      'DateField (null)',       'Date d\'expiration (optionnelle)'],
        ['max_uses',         'PositiveIntegerField',  'Limite d\'utilisations totales'],
        ['used_count',       'PositiveIntegerField',  'Nombre d\'utilisations réelles'],
    ], cws=[110, 110, None]),
    sp(12), Paragraph('Codes de démonstration', SUB),
    dtable(['Code', 'Type', 'Remise', 'Conditions', 'Limite'], [
        ['SAHEL1',    'Livraison gratuite', 'Frais de port offerts', 'Aucune',           '500 utilisations'],
        ['BIENVENUE', 'Pourcentage',        '−10%',                 'Minimum 5 000 FCFA','200 utilisations'],
        ['ARTISAN500','Montant fixe',       '−500 FCFA',            'Minimum 3 000 FCFA','Illimitée'],
    ], cws=[80, 90, 90, 110, None]),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 7 — Programme de fidélité
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(7, 'Programme de fidélité'), sp(16),
    infobox('⭐ Points fidélité Sahel Market',
            'Chaque achat génère des points réutilisables comme moyen de paiement partiel. Cumulable avec les codes promo.',
            bg=YEL_L, border=OR_B, fg=OR),
    sp(8),
    cards([
        ('📈 Gain de points', '1 point par tranche de 500 FCFA dépensés. Les points sont crédités uniquement après livraison confirmée (évite la fraude).'),
        ('🎁 Utilisation', '100 points = 500 FCFA de réduction. L\'utilisateur active un toggle dans le récapitulatif. Le solde maximal est automatiquement plafonné au sous-total.'),
    ]), sp(8),
    bul('Les points déduits du compte avant la commande, avec calcul précis des points utilisés (par paliers de 100).', bp=False),
    bul('Affichage du solde actuel dans le profil et dans le checkout.', bp=False),
    bul('Badge vert "X FCFA de réduction fidélité appliquée" sur la page de confirmation.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 8 — Notifications en temps réel
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(8, 'Notifications en temps réel'), sp(16),
    Paragraph('Système de notifications in-app par polling (30 secondes). '
              'Pas de WebSocket nécessaire — adapté aux connexions instables d\'Afrique subsaharienne.', BODY),
    sp(12), Paragraph('Événements notifiés', SUB),
    dtable(['Type', 'Destinataire', 'Déclencheur'], [
        ['order_placed',    'Client',  'Commande validée'],
        ['new_order',       'Artisan', 'Commande reçue pour son produit'],
        ['order_paid',      'Client',  'Paiement confirmé par agent'],
        ['order_processing','Client',  'Commande en préparation'],
        ['order_shipped',   'Client',  'Commande expédiée'],
        ['order_delivered', 'Client',  'Livraison confirmée'],
        ['order_cancelled', 'Client',  'Commande annulée'],
        ['low_stock',       'Artisan', 'Stock ≤ 3 unités (get_or_create — pas de doublon)'],
    ], cws=[100, 80, None]),
    sp(8),
    bul('Badge rouge sur la cloche navbar indiquant le nombre de non-lues.', bp=False),
    bul('Marquage "tout lu" en un clic (PATCH /orders/notifications/).', bp=False),
    bul('30 dernières notifications conservées et affichées.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 9 — Dashboard producteur / artisan
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(9, 'Dashboard producteur / artisan'), sp(16),
    cards([
        ('💰 Revenus totaux', 'Somme de tous les OrderItems livrés pour ses produits.'),
        ('📅 Revenus hebdomadaires', '7 derniers jours. Affiché dans la bande analytique sombre.'),
        ('📅 Revenus mensuels', '30 derniers jours. Comparaison visuelle.'),
    ], col=3), sp(8),
    cards([
        ('📦 Nb de produits', 'Total des produits de l\'artisan.'),
        ('👁 Vues totales', 'Somme des views_count de tous ses produits.'),
        ('🛒 Commandes', 'Nombre de commandes distinctes livrées.'),
    ], col=3), sp(12),
    Paragraph('Fonctionnalités clés', SUB),
    bul('Alerte stock bas : bandeau jaune listant les produits avec ≤ 3 unités restantes.', bp=True),
    bul('Export CSV : toutes les ventes (Date, N° commande, Produit, Quantité, Prix unitaire, Sous-total, Client, Ville). BOM UTF-8 pour compatibilité Excel France.', bp=True),
    bul('Gestion produits : tableau avec badge stock faible, disponibilité toggle, lien édition.', bp=True),
    bul('Onboarding guidé : assistant 5 étapes au premier accès (déclenché une seule fois via localStorage).', bp=True),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 10 — Dashboard admin & agent
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(10, 'Dashboard admin & agent'), sp(16),
    Paragraph('Métriques globales (admin)', SUB),
    cards([
        ('Ventes totales', 'Somme de toutes les commandes livrées.'),
        ('Ventes du mois', '30 derniers jours.'),
        ('Utilisateurs actifs', 'Clients avec is_active=True.'),
    ], col=3), sp(8),
    cards([
        ('Total producteurs', 'Artisans enregistrés.'),
        ('Produits en ligne', 'Tous les produits is_available=True.'),
        ('Commandes en attente', 'Status = pending.'),
    ], col=3), sp(12),
    Paragraph('Gestion des commandes (agent + admin)', SUB),
    bul('Vue liste de toutes les commandes, filtrables par statut.', bp=False),
    bul('Changement de statut en un clic : pending → paid → processing → shipped → delivered / cancelled.', bp=False),
    bul('Chaque changement de statut déclenche automatiquement une notification client.', bp=False),
    bul('À la livraison confirmée : points de fidélité crédités automatiquement sur le compte client.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 11 — Messagerie & avis
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(11, 'Messagerie & avis'), sp(16),
    cards([
        ('💬 Messagerie threadée', 'Conversations directes entre client et artisan. Vue liste des conversations (ConversationsView), vue fil de discussion (ThreadView). Messages temps réel via polling.'),
        ('⭐ Système d\'avis', 'Note 1–5 étoiles, commentaire texte, date de publication. Moyenne calculée dynamiquement. Affichée sur la fiche produit et le profil artisan.'),
    ]), sp(8),
    bul('Widget de chat flottant sur les pages produit (ChatWidget).', bp=False),
    bul('Composant Rating réutilisable avec demi-étoiles.', bp=False),
    bul('Widget SuggestionWidget pour proposer de nouveaux produits/catégories.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 12 — PWA & mode hors-ligne
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(12, 'PWA & mode hors-ligne'), sp(16),
    cards([
        ('📱 Progressive Web App', 'manifest.json complet (nom, icônes, thème orange, orientation portrait), Service Worker (sw.js) pour le cache. Installable sur iOS et Android depuis le navigateur.'),
        ('✈️ Mode hors-ligne', 'Les pages déjà visitées sont servies depuis le cache. Stratégie Cache-First pour les assets statiques, Network-First pour les appels API.'),
    ]), sp(8),
    bul('Bannière d\'installation affichée sur mobile après 30 secondes de navigation.', bp=False),
    bul('Score Lighthouse Performance > 85 ciblé (images Cloudinary optimisées, code splitting Vite).', bp=False),
    bul('Adapté aux réseaux 3G/4G instables du nord Cameroun : requêtes minimisées, images lazy-loaded.', bp=False),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 13 — Référentiel API
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(13, 'Référentiel API', updated=True), sp(16),
    Paragraph('Authentification', SUB),
    api('POST', '/auth/register/', 'Inscription'),             sp(2),
    api('POST', '/auth/login/', 'Connexion (retourne access + refresh JWT)'), sp(2),
    api('POST', '/auth/token/refresh/', 'Renouvellement access token'), sp(2),
    api('GET',  '/auth/me/', 'Profil utilisateur connecté'),   sp(2),
    api('PATCH','/auth/me/', 'Modifier le profil'),            sp(2),
    api('PATCH','/auth/producer-profile/', 'Modifier bio / spécialité artisan'), sp(12),
    Paragraph('Produits', SUB),
    api('GET',  '/products/', 'Liste (filtres : category, min_price, max_price, search, ordering)'), sp(2),
    api('GET',  '/products/:id/', 'Détail produit (incrémente views_count)'), sp(2),
    api('POST', '/products/', 'Créer un produit (artisan authentifié, multipart/form-data)'), sp(2),
    api('PATCH','/products/:id/', 'Modifier un produit'),      sp(2),
    api('POST', '/products/:id/reviews/', 'Ajouter un avis'), sp(2),
    api('POST', '/products/:id/like/', 'Ajouter/retirer de la wishlist'), sp(2),
    api('GET',  '/products/:id/recommendations/', 'Recommandations intelligentes (3 stratégies)', badge='NEW'), sp(2),
    api('GET',  '/products/wishlist/', 'Liste des produits likés par l\'utilisateur'), sp(2),
    api('GET',  '/products/locations/', 'Liste des villes/régions disponibles', badge='NEW'), sp(2),
    api('GET',  '/products/stats/', 'Statistiques globales plateforme (artisans, produits, commandes)', badge='NEW'), sp(12),
    Paragraph('Commandes & panier', SUB),
    api('GET',  '/orders/cart/', 'Panier courant'),             sp(2),
    api('POST', '/orders/cart/items/', 'Ajouter au panier'),   sp(2),
    api('DEL',  '/orders/cart/items/:id/', 'Supprimer du panier'), sp(2),
    api('POST', '/orders/checkout/', 'Valider commande (adresse, paiement, fidélité, promo)'), sp(2),
    api('POST', '/orders/promo/validate/', 'Valider un code promo', badge='NEW'), sp(2),
    api('GET',  '/orders/history/', 'Historique commandes'),   sp(2),
    api('PATCH','/orders/history/:id/', 'Confirmer livraison (client)'), sp(2),
    api('GET',  '/orders/notifications/', 'Liste + compteur non-lus'), sp(2),
    api('PATCH','/orders/notifications/', 'Marquer tout comme lu'), sp(12),
    Paragraph('Admin / Agent', SUB),
    api('GET',  '/orders/manage/', 'Toutes les commandes (?status=...)'), sp(2),
    api('PATCH','/orders/manage/:id/', 'Changer le statut d\'une commande'), sp(12),
    Paragraph('Dashboard', SUB),
    api('GET', '/dashboard/global/', 'Métriques globales (admin/agent)'), sp(2),
    api('GET', '/dashboard/producer/', 'Métriques artisan (revenue, stock, vues)'), sp(2),
    api('GET', '/dashboard/producer/export/', 'CSV ventes artisan'), sp(12),
    Paragraph('Messagerie', SUB),
    api('GET',  '/messages/', 'Liste des conversations'),      sp(2),
    api('GET',  '/messages/:userId/', 'Fil de discussion'),    sp(2),
    api('POST', '/messages/:userId/', 'Envoyer un message'),   sp(2),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 14 — Roadmap & métriques
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(14, 'Roadmap & métriques', updated=True), sp(16)]

# Roadmap table with colored status cells
roadmap_data = [
    [Paragraph('Phase', TH), Paragraph('Statut', TH), Paragraph('Fonctionnalités', TH)],
    [
        Paragraph('Phase 1', BOLD),
        status_badge('Terminée', GRN_L, GRN),
        Paragraph('Auth, catalogue, panier, checkout, paiement mobile money, notifications, PWA, '
                  'dashboard artisan, codes promo, fidélité, export CSV, recherche full-text PostgreSQL, '
                  'recommandations intelligentes, design mobile haut de gamme', TD),
    ],
    [
        Paragraph('Phase 2', BOLD),
        status_badge('En cours', OR_L, OR),
        Paragraph('Déploiement prod (Render + Vercel), onboarding artisan, messagerie, avis, roadmap publique', TD),
    ],
    [
        Paragraph('Phase 3', BOLD),
        status_badge('Planifiée', HexColor('#EFF6FF'), BLU),
        Paragraph('Traduction Fulfulde/Haoussa, intégration API livraison GPS, paiement Orange Money/MTN direct (SDK officiel)', TD),
    ],
    [
        Paragraph('Phase 4', BOLD),
        status_badge('Vision', BG, MUT),
        Paragraph('App mobile React Native, programme ambassadeurs, B2B grossistes', TD),
    ],
    [
        Paragraph('Phase 5', BOLD),
        status_badge('Vision', BG, MUT),
        Paragraph('Expansion sous-régionale (Tchad, Niger, Mali), programme micro-crédit artisans', TD),
    ],
]
roadmap_t = Table(roadmap_data, colWidths=[60, 70, None])
roadmap_t.setStyle(TableStyle([
    ('BACKGROUND',    (0,0), (-1,0), BG),
    ('BOX',           (0,0), (-1,-1), 0.5, BDR),
    ('INNERGRID',     (0,0), (-1,-1), 0.3, BDR),
    ('LEFTPADDING',   (0,0), (-1,-1), 8),
    ('RIGHTPADDING',  (0,0), (-1,-1), 8),
    ('TOPPADDING',    (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ('VALIGN',        (0,0), (-1,-1), 'TOP'),
]))
story.append(roadmap_t)
story += [sp(16), Paragraph('Métriques cibles (12 mois)', SUB),
    cards([
        ('🎯 500 artisans', 'Producteurs enregistrés et actifs sur la plateforme.'),
        ('👥 10 000 clients', 'Comptes clients créés, avec 30% récurrents.'),
        ('💵 50M FCFA', 'Volume de transactions annuel facilité.'),
    ], col=3),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════════
# 15 — Stack technique
# ════════════════════════════════════════════════════════════════════
story += [SectionHeader(15, 'Stack technique'), sp(16)]

dw = W - 36*mm
stack_data = [[
    Table([[
        [Paragraph('Frontend', SUB)],
        [bul('React 18 + Vite 5 — SPA ultra-rapide')],
        [bul('Redux Toolkit — état global (auth, cart)')],
        [bul('React Query — cache serveur et invalidation')],
        [bul('React Router v6 — routing SPA avec lazy loading')],
        [bul('Framer Motion — animations fluides')],
        [bul('Lucide React — icônes SVG cohérentes')],
        [bul('React Hook Form — formulaires performants')],
        [bul('React Hot Toast — notifications UI')],
        [bul('Axios — client HTTP avec intercepteurs JWT')],
        [bul('Tailwind CSS v4 — utilitaires + design tokens CSS')],
        [bul('Cormorant Garamond + Inter — typographie éditoriale')],
    ]], style=TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
                          ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)])),
    Table([[
        [Paragraph('Backend', SUB)],
        [bul('Django 4.x + Django REST Framework')],
        [bul('SimpleJWT — authentification JWT')],
        [bul('django-filters — filtrage avancé des produits')],
        [bul('django-cors-headers — CORS pour le frontend')],
        [bul('Cloudinary — stockage et CDN des images')],
        [bul('PostgreSQL / Neon — base de données serverless')],
        [bul('Full-text search PostgreSQL — SearchVector/Rank')],
        [bul('Gunicorn — serveur WSGI pour Render')],
        [bul('WhiteNoise — fichiers statiques Django')],
    ]], style=TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
                          ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)])),
]]

t = Table(stack_data, colWidths=[dw/2-4, dw/2-4])
t.setStyle(TableStyle([
    ('VALIGN',       (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING',  (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t)

# ════════════════════════════════════════════════════════════════════
# Build
# ════════════════════════════════════════════════════════════════════
def onFirstPage(canvas, doc):
    build_cover(canvas, doc)

def onLaterPages(canvas, doc):
    build_page(canvas, doc)

doc.build(story, onFirstPage=onFirstPage, onLaterPages=onLaterPages)
print(f"✅ PDF généré : {OUTPUT}")
