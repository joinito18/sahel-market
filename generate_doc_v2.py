#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from datetime import date

OUTPUT = "/home/joel/Documents/sahel-market/Sahel_Market_Documentation.pdf"

VERT       = colors.HexColor("#2D6A4F")
VERT_L     = colors.HexColor("#eff8f3")
VERT_M     = colors.HexColor("#add8bc")
DARK       = colors.HexColor("#111111")
GRAY       = colors.HexColor("#6b7280")
GRAY_L     = colors.HexColor("#f3f4f6")
ORANGE     = colors.HexColor("#d97706")
ORANGE_L   = colors.HexColor("#fef3c7")
RED        = colors.HexColor("#dc2626")
RED_L      = colors.HexColor("#fee2e2")
BLUE       = colors.HexColor("#1d4ed8")
BLUE_L     = colors.HexColor("#dbeafe")
WHITE      = colors.white

def s(name, **kw):
    return ParagraphStyle(name, **kw)

COVER_TITLE = s("ct", fontName="Helvetica-Bold", fontSize=36, textColor=WHITE, alignment=TA_CENTER, spaceAfter=10)
COVER_SUB   = s("cs", fontName="Helvetica", fontSize=15, textColor=colors.HexColor("#d6eddf"), alignment=TA_CENTER, spaceAfter=6)
COVER_DATE  = s("cd", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#78b892"), alignment=TA_CENTER)
H1  = s("h1", fontName="Helvetica-Bold", fontSize=22, textColor=VERT, spaceBefore=22, spaceAfter=6)
H2  = s("h2", fontName="Helvetica-Bold", fontSize=15, textColor=DARK, spaceBefore=16, spaceAfter=5)
H3  = s("h3", fontName="Helvetica-BoldOblique", fontSize=12, textColor=VERT, spaceBefore=12, spaceAfter=4)
BODY = s("body", fontName="Helvetica", fontSize=10, textColor=DARK, leading=16, spaceAfter=5, alignment=TA_JUSTIFY)
SM  = s("sm", fontName="Helvetica", fontSize=9, textColor=GRAY, leading=14, spaceAfter=3)
STEP = s("step", fontName="Helvetica", fontSize=10, textColor=DARK, leading=15, leftIndent=14, spaceAfter=3)
CODE = s("code", fontName="Courier", fontSize=9, textColor=BLUE, backColor=BLUE_L, leading=14, leftIndent=8, spaceAfter=4, spaceBefore=4)
NOTE = s("note", fontName="Helvetica-Oblique", fontSize=9, textColor=GRAY, leading=13, leftIndent=10, spaceAfter=5)
TECH = s("tech", fontName="Courier", fontSize=8, textColor=BLUE, leading=12, leftIndent=14, spaceAfter=2)
FOOT = s("foot", fontName="Helvetica", fontSize=9, textColor=GRAY, alignment=TA_CENTER)

def hr(c=VERT_M, t=0.8):
    return HRFlowable(width="100%", thickness=t, color=c, spaceAfter=8, spaceBefore=4)

def steps(items):
    out = []
    for i, (title, detail) in enumerate(items, 1):
        out.append(Paragraph(
            f"<b>{i}. {title}</b><br/><font color='#6b7280' size='9'>{detail}</font>",
            STEP
        ))
    return out

def box(title, paras, bg=VERT_L, border=VERT_M):
    header = Paragraph(f"<b>{title}</b>", s("bh", fontName="Helvetica-Bold", fontSize=10, textColor=VERT, spaceAfter=5))
    t = Table([[[ header ] + paras]], colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("BOX",           (0,0), (-1,-1), 1.5, border),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
        ("RIGHTPADDING",  (0,0), (-1,-1), 14),
    ]))
    return t

def feat_table(rows):
    data = [[
        Paragraph("<b>Fonctionnalité</b>", SM),
        Paragraph("<b>Description</b>", SM),
        Paragraph("<b>Statut</b>", SM),
    ]]
    for icon, name, desc, status in rows:
        if status == "OK":
            badge = Paragraph("✓ Implémenté", s("ok", fontName="Helvetica-Bold", fontSize=9, textColor=colors.HexColor("#15803d")))
        else:
            badge = Paragraph("✗ À faire", s("todo", fontName="Helvetica-Bold", fontSize=9, textColor=RED))
        data.append([
            Paragraph(f"{icon} <b>{name}</b>", s("fn", fontName="Helvetica-Bold", fontSize=9, textColor=DARK)),
            Paragraph(desc, SM),
            badge,
        ])
    t = Table(data, colWidths=[5*cm, 9.5*cm, 2.8*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  VERT),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0),  9),
        ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_L]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    return t

story = []

doc = SimpleDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title="Sahel Market — Documentation", author="Sahel Market"
)

# ════════════════════════════════════════════════════════════════
# COUVERTURE
# ════════════════════════════════════════════════════════════════
cover = Table([[
    Paragraph("SAHEL MARKET", COVER_TITLE),
    Paragraph("Documentation complète des fonctionnalités", COVER_SUB),
    Paragraph("Guide de test détaillé &amp; Roadmap", COVER_SUB),
    Spacer(1, 0.5*cm),
    Paragraph(f"Version {date.today().strftime('%d/%m/%Y')} — Confidentiel", COVER_DATE),
]], colWidths=[17*cm])
cover.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,-1), VERT),
    ("TOPPADDING",    (0,0), (-1,-1), 70),
    ("BOTTOMPADDING", (0,0), (-1,-1), 70),
    ("LEFTPADDING",   (0,0), (-1,-1), 24),
    ("RIGHTPADDING",  (0,0), (-1,-1), 24),
]))
story += [cover, Spacer(1, 0.8*cm)]

story.append(Paragraph(
    "Ce document décrit toutes les fonctionnalités de la plateforme Sahel Market — "
    "premier marché en ligne dédié à l'artisanat camerounais. Il contient des instructions "
    "de test pas-à-pas pour chaque module et la roadmap des développements futurs.",
    BODY
))
story.append(Spacer(1, 0.3*cm))

tech = Table([
    ["Stack",       "Django REST Framework + React 18 + Redux Toolkit + PostgreSQL"],
    ["Frontend",    "Vercel — sahel-market-gamma.vercel.app"],
    ["Backend",     "Render — sahel-market-backend.onrender.com"],
    ["Paiement",    "Campay (Orange Money, MTN MoMo)"],
    ["Médias",      "Cloudinary (prod) | FileSystem (dev)"],
    ["Auth",        "JWT SimpleJWT — connexion par numéro de téléphone"],
    ["Déploiement", "CI/CD automatique sur chaque push GitHub main"],
], colWidths=[3.8*cm, 13.2*cm])
tech.setStyle(TableStyle([
    ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
    ("TEXTCOLOR",     (0,0), (0,-1), VERT),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS",(0,0), (-1,-1), [GRAY_L, WHITE]),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
]))
story += [tech, PageBreak()]

# ════════════════════════════════════════════════════════════════
# 1. TABLEAU RÉCAPITULATIF
# ════════════════════════════════════════════════════════════════
story += [
    Paragraph("1. Vue d'ensemble des fonctionnalités", H1),
    hr(),
    Paragraph("Toutes les fonctionnalités de la plateforme avec leur statut actuel.", BODY),
    Spacer(1, 0.3*cm),
    feat_table([
        ("🔐", "Auth par numéro de téléphone",  "Inscription/connexion par numéro camerounais + JWT", "OK"),
        ("🛍️", "Catalogue produits",            "Recherche, filtres, tri, pagination", "OK"),
        ("🛒", "Panier",                         "Redux + sync base de données, variants", "OK"),
        ("💳", "Checkout & paiement",            "Zones de livraison, Orange Money, MTN MoMo, espèces", "OK"),
        ("📦", "Historique des commandes",       "Suivi statut, barre de progression, re-commander", "OK"),
        ("⭐", "Points fidélité",                "1 pt / 500 FCFA, niveaux Bronze / Argent / Or", "OK"),
        ("⚡", "Ventes flash",                   "Prix réduit + compte à rebours temps réel", "OK"),
        ("🔔", "Alerte stock épuisé",            "Notification automatique à la remise en stock", "OK"),
        ("🚚", "Zones de livraison",             "10 zones Cameroun, tarifs admin, sélection checkout", "OK"),
        ("✅", "Badge artisan vérifié",          "Icône visible sur fiches et cartes produits", "OK"),
        ("🔗", "Partage WhatsApp / Facebook",   "Lien produit + message pré-rempli", "OK"),
        ("📧", "Email panier abandonné",         "Relance automatique après 24h d'inactivité", "OK"),
        ("🎨", "Variants produit",               "Taille, couleur, matière — prix ajusté", "OK"),
        ("🔍", "Zoom image (lightbox)",          "Zoom molette, drag, navigation multi-photos", "OK"),
        ("🏪", "Dashboard admin",               "Sidebar, commandes, produits, artisans, validations", "OK"),
        ("📊", "Dashboard artisan",             "Revenus, stats, produits, commandes, export CSV", "OK"),
        ("🤝", "Dashboard agent",               "Gestion commandes terrain", "OK"),
        ("💬", "Messagerie interne",            "Chat client ↔ artisan", "OK"),
        ("🔔", "Notifications push (PWA)",      "Alertes commande, stock, validation artisan", "OK"),
        ("❤️", "Wishlist",                      "Favoris synchronisés avec le compte", "OK"),
        ("📍", "Suivi de commande",             "Barre de progression visuelle étape par étape", "OK"),
        ("🌍", "Profil artisan public",         "Page vitrine avec ses produits", "OK"),
        ("⭐", "Avis & notes clients",          "Note 1-5 étoiles + commentaire post-achat vérifié", "TODO"),
        ("🎁", "Codes promo",                   "Réduction fixe FCFA ou pourcentage", "TODO"),
        ("👥", "Programme de parrainage",       "Code unique, points pour parrain et filleul", "TODO"),
        ("📄", "Facturation PDF automatique",   "Facture générée et envoyée à chaque livraison", "TODO"),
        ("📧", "Newsletter",                    "Abonnement + envoi emails marketing", "TODO"),
        ("↩️", "Retours & remboursements",      "Demande retour, remboursement points ou espèces", "TODO"),
        ("📈", "Analytics avancés",             "Graphiques ventes, conversion, top produits", "TODO"),
        ("🔍", "SEO avancé",                    "Sitemap XML, JSON-LD, Open Graph par produit", "TODO"),
        ("🤖", "Recommandations IA",            "Suggestions basées sur l'historique client", "TODO"),
        ("🌐", "Multi-langue FR/EN",            "Interface bilingue pour le Cameroun anglophone", "TODO"),
        ("📱", "Application mobile native",     "APK Android/iOS React Native", "TODO"),
        ("💰", "Paiement en plusieurs fois",    "2 ou 3 versements échelonnés", "TODO"),
    ]),
    PageBreak(),
]

# ════════════════════════════════════════════════════════════════
# 2. GUIDE DE TEST
# ════════════════════════════════════════════════════════════════
story += [
    Paragraph("2. Guide de test détaillé", H1),
    hr(),
    Paragraph(
        "Chaque fonctionnalité est testable indépendamment. "
        "Il est recommandé de tester dans l'ordre ci-dessous, "
        "certains modules nécessitant un compte créé au préalable.",
        BODY
    ),
]

# 2.1 AUTH
story += [Paragraph("2.1  Authentification", H2), hr(VERT_M, 0.5)]

story.append(Paragraph("<b>A. Inscription client</b>", H3))
story += steps([
    ("Ouvrir /register", "Depuis la navbar : cliquer « S'inscrire » ou saisir l'URL directement."),
    ("Remplir le formulaire", "Prénom, nom, numéro de téléphone au format +237 6XX XXX XXX, mot de passe (min. 8 caractères)."),
    ("Soumettre", "Cliquer « Créer mon compte ». Une redirection vers l'accueil confirme la création."),
    ("Vérifier", "Les initiales ou l'avatar apparaissent dans la navbar en haut à droite."),
])

story.append(Paragraph("<b>B. Inscription artisan</b>", H3))
story += steps([
    ("Sur /register, cocher « Je suis artisan »", "Des champs supplémentaires apparaissent : nom de boutique, ville, description."),
    ("Remplir et soumettre", "Le compte est créé avec le statut « en attente de validation »."),
    ("L'artisan ne peut pas se connecter immédiatement", "Un message lui indique que son compte est en cours de validation."),
    ("Validation par l'admin", "Dashboard admin (/dashboard/admin) → onglet Validations → cliquer Approuver."),
    ("Après approbation", "L'artisan peut se connecter et accéder à /dashboard/producer."),
])

story.append(Paragraph("<b>C. Connexion / Déconnexion</b>", H3))
story += steps([
    ("Aller sur /login", "Ou cliquer « Se connecter » dans la navbar."),
    ("Saisir le numéro de téléphone", "Le même numéro utilisé lors de l'inscription (format +237...)."),
    ("Saisir le mot de passe", "Cliquer « Se connecter » — le token JWT est stocké dans le navigateur."),
    ("Déconnexion", "Cliquer sur l'avatar → « Se déconnecter » dans le menu déroulant."),
])

# 2.2 CATALOGUE
story += [Paragraph("2.2  Catalogue & Recherche", H2), hr(VERT_M, 0.5)]
story += steps([
    ("Accéder au catalogue", "Aller sur /products ou cliquer « Catalogue » dans la navbar."),
    ("Recherche par mot-clé", "Taper dans la barre de recherche (ex. « panier ») — les résultats se filtrent en temps réel sans recharger la page."),
    ("Filtrer par catégorie", "Cliquer sur une catégorie dans le panneau latéral gauche (Maroquinerie, Bijoux, Pagnes, etc.)."),
    ("Trier", "Utiliser le menu déroulant en haut à droite : Plus récents, Prix croissant, Prix décroissant."),
    ("Vérifier les badges", "Les produits en vente flash affichent un badge rouge FLASH avec le prix original barré. Les artisans vérifiés ont une icône ✓ verte."),
    ("Pagination", "En bas de page : boutons Précédent / Suivant pour naviguer entre les pages."),
])

# 2.3 FICHE PRODUIT
story += [Paragraph("2.3  Fiche produit", H2), hr(VERT_M, 0.5)]

story.append(Paragraph("<b>A. Photos et zoom</b>", H3))
story += steps([
    ("Cliquer sur un produit", "Ouverture de la fiche /products/:id avec la photo principale en haut."),
    ("Changer de photo", "Cliquer sur les miniatures sous la photo principale."),
    ("Ouvrir le lightbox", "Cliquer sur la photo principale — une lightbox plein écran s'ouvre."),
    ("Zoomer avec la molette", "Faire défiler la molette vers l'avant pour zoomer (jusqu'à ×5)."),
    ("Déplacer l'image zoomée", "Maintenir le clic et faire glisser."),
    ("Boutons zoom", "Utiliser les boutons + et − en bas pour ajuster précisément le niveau de zoom."),
    ("Navigation", "Les flèches gauche/droite permettent de passer à la photo suivante ou précédente."),
    ("Fermer", "Cliquer en dehors de la photo ou sur la croix en haut à droite."),
])

story.append(Paragraph("<b>B. Variants (taille, couleur, matière)</b>", H3))
story += steps([
    ("Identifier un produit avec variants", "Des sélecteurs apparaissent sous la description si le produit a des variantes."),
    ("Sélectionner une couleur", "Les swatches colorées indiquent les coloris disponibles. Cliquer pour sélectionner."),
    ("Sélectionner une taille ou matière", "Des pills (boutons arrondis) listent les options disponibles."),
    ("Observer l'ajustement de prix", "Si un variant a un supplément (ex. +500 FCFA), le prix total se met à jour immédiatement."),
    ("Ajouter au panier avec variant", "Cliquer Ajouter au panier — le variant apparaît dans le détail de l'article dans le panier."),
])

story.append(Paragraph("<b>C. Partage et alertes</b>", H3))
story += steps([
    ("Partage WhatsApp", "Cliquer le bouton vert WA — WhatsApp s'ouvre avec un message pré-rempli contenant le lien du produit."),
    ("Partage Facebook", "Cliquer le bouton bleu FB — la boîte de dialogue de partage Facebook s'ouvre."),
    ("Alerte stock épuisé", "Sur un produit avec stock = 0, le bouton d'ajout au panier est remplacé par « M'avertir ». Cliquer pour s'abonner à l'alerte. Une notification push sera envoyée à la remise en stock."),
    ("Vérifier l'abonnement", "Le bouton devient « Alerte active » avec une icône cloche barrée. Cliquer à nouveau pour se désabonner."),
])

story.append(Paragraph("<b>D. Points fidélité estimés</b>", H3))
story += steps([
    ("Sur la fiche produit", "Un encart indique les points que rapporterait l'achat de ce produit (calcul : prix / 500)."),
])

# 2.4 PANIER & CHECKOUT
story += [Paragraph("2.4  Panier & Commande", H2), hr(VERT_M, 0.5)]

story.append(Paragraph("<b>A. Gestion du panier</b>", H3))
story += steps([
    ("Ajouter un article", "Sur une fiche produit, cliquer Ajouter au panier."),
    ("Ouvrir le drawer panier", "Cliquer sur l'icône panier dans la navbar — un panneau glisse depuis la droite."),
    ("Modifier la quantité", "Utiliser les boutons − et + à côté de chaque article."),
    ("Voir les variants", "Si un article a des variants sélectionnés, ils sont affichés sous le nom du produit."),
    ("Supprimer un article", "Cliquer sur la croix rouge à côté de l'article."),
    ("Voir le total", "Le sous-total par article et le total général sont affichés en bas du drawer."),
])

story.append(Paragraph("<b>B. Checkout (/checkout)</b>", H3))
story += steps([
    ("Cliquer Commander", "Depuis le drawer panier, cliquer sur le bouton Commander."),
    ("Remplir l'adresse", "Saisir l'adresse de livraison complète (rue, quartier, ville)."),
    ("Choisir la zone de livraison", "Sélectionner parmi les zones disponibles — le tarif de livraison s'affiche et s'ajoute au total."),
    ("Choisir le mode de paiement", "Orange Money, MTN MoMo (paiement mobile), ou Espèces à la livraison."),
    ("Pour mobile money", "Saisir le numéro de téléphone mobile money. Une demande de paiement Campay est envoyée."),
    ("Valider sur le téléphone", "Confirmer le paiement USSD/notification reçue sur le téléphone."),
    ("Pour espèces", "Pas de validation supplémentaire — la commande est créée directement avec statut pending."),
    ("Confirmation", "Page de confirmation avec le numéro de commande affiché."),
])

# 2.5 COMMANDES & FIDÉLITÉ
story += [Paragraph("2.5  Historique commandes & Points fidélité", H2), hr(VERT_M, 0.5)]
story += steps([
    ("Accéder à /orders", "Cliquer sur l'avatar → Mes commandes, ou naviguer directement vers /orders."),
    ("Liste des commandes", "Chaque commande affiche son numéro, statut coloré, adresse, date et montant total."),
    ("Développer une commande", "Cliquer sur une commande pour voir le détail : articles, mode de paiement, barre de progression."),
    ("Barre de progression", "5 étapes visualisées : Commande placée → Paiement confirmé → En préparation → En livraison → Livré."),
    ("Points fidélité", "Chaque commande indique les points gagnés. Badge ⭐ si livrée (crédités), badge ⏳ si en cours."),
    ("Re-commander", "Bouton Commander à nouveau — tous les articles sont remis dans le panier en un clic."),
    ("Carte fidélité (/profile)", "Le profil affiche le solde de points, le niveau actuel (Bronze/Argent/Or) et la progression vers le niveau suivant."),
    ("Valeur des points", "L'équivalent FCFA des points est affiché (ex. 500 pts = 500 FCFA de réduction possible)."),
])

# 2.6 VENTES FLASH
story += [Paragraph("2.6  Ventes flash", H2), hr(VERT_M, 0.5)]
story += steps([
    ("Créer une vente flash (admin)", "Dashboard admin → Produits → icône crayon → renseigner Prix flash (ex. 3000) et Date/heure de fin."),
    ("Vérifier sur le catalogue", "La carte produit affiche un badge rouge FLASH, le prix normal barré, le prix flash en rouge, et un compte à rebours HH:MM:SS."),
    ("Le compte à rebours est temps réel", "Il se décrémente chaque seconde sans recharger la page."),
    ("Prix dans le panier", "Ajouter le produit au panier : le prix flash est utilisé, pas le prix normal."),
    ("Expiration automatique", "À l'heure définie, le badge FLASH disparaît et le prix normal reprend."),
])

# 2.7 DASHBOARD ADMIN
story += [Paragraph("2.7  Dashboard Administrateur", H2), hr(VERT_M, 0.5)]
story.append(Paragraph(
    "URL : /dashboard/admin — Accessible uniquement avec un compte ayant le rôle <b>admin</b>. "
    "Se connecter avec le numéro de téléphone du compte admin.",
    BODY
))

story.append(Paragraph("<b>Aperçu (page d'accueil du dashboard)</b>", H3))
story += steps([
    ("Vérifier les 4 KPIs", "Commandes en attente, Artisans actifs, Produits en ligne, Clients inscrits."),
    ("Alerte validations", "Si des artisans attendent une validation, une bannière jaune apparaît avec un bouton direct Valider."),
    ("Revenus", "Bandeau vert foncé montrant les ventes totales (commandes livrées) et les ventes du mois en cours."),
    ("Raccourcis", "Chaque KPI est cliquable et navigue vers l'onglet correspondant."),
])

story.append(Paragraph("<b>Onglet Commandes</b>", H3))
story += steps([
    ("Voir toutes les commandes", "Liste complète de toutes les commandes de la plateforme, triées de la plus récente."),
    ("Filtrer par statut", "Cliquer sur une pill de filtre : Toutes, En attente, Payées, En préparation, Expédiées, Livrées, Annulées."),
    ("Rechercher", "Saisir dans la barre de recherche : numéro de commande, nom du client, ou adresse de livraison."),
    ("Développer une commande", "Cliquer sur une carte de commande pour voir le détail : articles, prix, mode de paiement."),
    ("Changer le statut", "Des boutons de progression apparaissent : ex. depuis En attente → boutons Payé et Annulé. Cliquer pour changer le statut instantanément."),
    ("Progression logique des statuts", "pending → paid → processing → shipped → delivered. Chaque étape ne peut avancer que dans l'ordre."),
    ("Points crédités automatiquement", "Quand une commande passe à Livré, les points fidélité sont ajoutés au compte du client sans action supplémentaire."),
])

story.append(Paragraph("<b>Onglet Produits</b>", H3))
story += steps([
    ("Rechercher un produit", "La recherche filtre en temps réel parmi tous les produits de la plateforme."),
    ("Ajouter un produit", "Cliquer + Ajouter un produit → formulaire : nom, description, prix, stock, localisation, catégorie, artisan, photos."),
    ("Glisser-déposer les photos", "La première photo uploadée devient la photo principale."),
    ("Modifier un produit", "Icône crayon à droite de la ligne → même formulaire pré-rempli."),
    ("Activer / désactiver", "Toggle dans la colonne Disponibilité — change la visibilité sans supprimer le produit."),
    ("Supprimer", "Icône poubelle → une fenêtre de confirmation s'affiche avant suppression définitive."),
    ("Stock faible", "Les produits avec stock ≤ 3 affichent le chiffre en rouge pour alerter."),
])

story.append(Paragraph("<b>Onglet Artisans</b>", H3))
story += steps([
    ("Voir tous les artisans", "Tableau avec nom, email, ville, statut Actif/Inactif, date d'inscription."),
    ("Rechercher un artisan", "Par nom, nom d'utilisateur ou email."),
])

story.append(Paragraph("<b>Onglet Validations</b>", H3))
story += steps([
    ("Badge rouge dans le sidebar", "Indique en temps réel le nombre de comptes artisans en attente."),
    ("Approuver un artisan", "Cliquer Approuver (bouton vert) → le compte devient actif, l'artisan reçoit une notification."),
    ("Rejeter un artisan", "Cliquer Rejeter (bouton rouge) → le compte est désactivé."),
    ("Rafraîchissement automatique", "La liste se met à jour toutes les 30 secondes."),
])

# 2.8 DASHBOARD ARTISAN
story += [Paragraph("2.8  Dashboard Artisan (/dashboard/producer)", H2), hr(VERT_M, 0.5)]
story += steps([
    ("Se connecter", "Numéro de téléphone + mot de passe d'un artisan validé."),
    ("Statistiques globales", "Revenu total, revenu de la semaine, nombre de commandes, nombre de vues sur les produits."),
    ("Gérer ses produits", "Ajouter un nouveau produit, modifier les informations ou le stock, activer/désactiver."),
    ("Voir ses commandes", "Liste des commandes qui contiennent au moins un de ses produits."),
    ("Exporter les ventes", "Bouton Exporter CSV → télécharge un fichier Excel avec toutes les ventes livrées."),
    ("Alertes stock faible", "Un encart liste les produits avec stock ≤ 3 pour que l'artisan pense à réapprovisionner."),
])

# 2.9 PWA
story += [Paragraph("2.9  Application PWA & Notifications push", H2), hr(VERT_M, 0.5)]
story += steps([
    ("Installer l'application", "Sur Chrome ou Edge : une icône d'installation apparaît dans la barre d'adresse. Cliquer pour installer l'app sur le bureau ou l'écran d'accueil."),
    ("Autoriser les notifications", "Au premier lancement, une demande de permission s'affiche. Cliquer Autoriser."),
    ("Types de notifications reçues", "Changement de statut d'une commande (ex. Expédié), alerte de remise en stock d'un produit surveillé, approbation du compte artisan."),
    ("Tester les notifications", "Depuis le dashboard admin, changer le statut d'une commande → le client concerné reçoit une notification push dans les secondes qui suivent."),
    ("Mode hors ligne", "Les pages déjà visitées restent accessibles sans connexion internet grâce au Service Worker."),
])

story.append(PageBreak())

# ════════════════════════════════════════════════════════════════
# 3. ROADMAP
# ════════════════════════════════════════════════════════════════
story += [
    Paragraph("3. Fonctionnalités à implémenter — Roadmap", H1),
    hr(),
    Paragraph(
        "Classées par priorité selon leur impact sur la plateforme et la complexité d'implémentation.",
        BODY
    ),
    Spacer(1, 0.3*cm),
]

# Priorité haute
story += [Paragraph("3.1  Priorité haute", H2), hr(ORANGE, 0.5)]

haute = [
    (
        "Avis & notes clients",
        "Impact direct sur la confiance et le taux de conversion.",
        [
            "Chaque client ayant reçu une commande peut laisser une note de 1 à 5 étoiles et un commentaire texte sur les produits achetés.",
            "Seuls les achats vérifiés (order_item lié à une commande livrée) peuvent publier un avis — pas de faux avis.",
            "La fiche produit affiche la note moyenne (étoiles), le nombre total d'avis, et les derniers commentaires avec la date.",
            "L'artisan peut répondre aux avis depuis son dashboard, la réponse est visible sous l'avis client.",
            "L'admin peut signaler ou supprimer un avis depuis le dashboard admin.",
        ],
        [
            "Backend : modèle Review(user FK, product FK, order_item FK unique, rating IntegerField 1-5, comment TextField, created_at, is_visible BooleanField)",
            "API : POST /products/{id}/review/ | reviews sérialisés dans ProductDetailSerializer",
            "Frontend : composant StarRating sur fiche produit, conditionnel si commande livrée",
            "Dashboard artisan : liste des avis avec champ de réponse",
        ]
    ),
    (
        "Codes promo & réductions",
        "Puissant levier d'acquisition et de rétention à coût maîtrisé.",
        [
            "Types de réduction : montant fixe en FCFA (ex. -2000 FCFA) ou pourcentage (ex. -15%).",
            "Paramètres configurables : code unique, date d'expiration, nombre max d'utilisations, catégories applicables.",
            "Au checkout, un champ « Code promo » valide en temps réel et affiche la réduction déduite.",
            "Dashboard admin : créer, modifier, désactiver les codes ; voir le nombre d'utilisations.",
        ],
        [
            "Backend : modèle PromoCode(code CharField unique, type choice fixe/pct, value, max_uses, used_count, expiry, categories M2M)",
            "L'endpoint POST /orders/promo/validate/ existe déjà — à compléter avec la logique de déduction",
            "Frontend : champ promo dans le récapitulatif checkout avec badge de confirmation de la remise",
        ]
    ),
    (
        "Facturation PDF automatique",
        "Professionnalisme et conformité fiscale.",
        [
            "Une facture PDF est générée automatiquement quand une commande passe au statut Livré.",
            "Contenu : logo Sahel Market, numéro de facture, date, informations client, détail des articles avec quantités et prix unitaires, frais de livraison, total TTC.",
            "Téléchargeable depuis /orders en cliquant sur le bouton Télécharger la facture.",
            "Envoyée en pièce jointe par email au client dès la livraison confirmée.",
        ],
        [
            "Backend : vue GET /orders/{id}/invoice/ utilisant ReportLab (déjà installé dans le projet)",
            "Signal post_save sur Order : déclenche la génération et l'envoi email quand status='delivered'",
            "Frontend : bouton Facture PDF visible sur les commandes avec statut delivered",
        ]
    ),
]

for title, impact, desc_items, tech_items in haute:
    story += [
        KeepTogether([Paragraph(title, H3), Paragraph(impact, NOTE)]),
        Paragraph("<b>Description fonctionnelle :</b>", BODY),
    ]
    for item in desc_items:
        story.append(Paragraph(f"• {item}", STEP))
    story.append(Paragraph("<b>Implémentation technique :</b>", BODY))
    for item in tech_items:
        story.append(Paragraph(f"→ {item}", TECH))
    story.append(Spacer(1, 0.3*cm))

# Priorité moyenne
story += [Paragraph("3.2  Priorité moyenne", H2), hr(BLUE, 0.5)]

moyenne = [
    (
        "Programme de parrainage",
        "Acquisition organique à coût zéro — chaque client devient ambassadeur.",
        [
            "À l'inscription, chaque client reçoit un code de parrainage unique (ex. JOEL2025).",
            "Quand un ami s'inscrit avec ce code et passe sa première commande, le parrain reçoit 200 points fidélité et le filleul 100 points de bienvenue.",
            "Le code est visible et copiable depuis la page profil.",
            "Un tableau affiche le nombre de filleuls actifs et les points gagnés grâce au parrainage.",
        ]
    ),
    (
        "Newsletter & emails marketing",
        "Canal de rétention direct sans dépendre des réseaux sociaux.",
        [
            "Formulaire d'abonnement en pied de page et lors de l'inscription.",
            "Emails automatiques : nouveaux produits de la semaine, démarrage d'une vente flash, promotions saisonnières.",
            "Lien de désabonnement obligatoire dans chaque email (conformité RGPD).",
            "Intégration Brevo (anciennement Sendinblue) — API gratuite jusqu'à 300 emails par jour.",
            "Templates HTML à la charte Sahel Market (vert Sahel, Cormorant Garamond pour les titres).",
        ]
    ),
    (
        "Gestion des retours & remboursements",
        "Réduction des litiges et augmentation de la confiance client.",
        [
            "Le client peut initier une demande de retour dans les 7 jours suivant la confirmation de livraison.",
            "Il choisit le motif parmi une liste : produit non conforme, article endommagé, erreur de commande, autre.",
            "L'admin traite la demande : peut accorder un remboursement en points fidélité ou organiser un retour physique.",
            "L'état de la demande est visible dans /orders : En cours d'examen, Approuvé, Refusé.",
            "Notification push et email au client à chaque changement d'état.",
        ]
    ),
    (
        "Analytics & tableaux de bord avancés",
        "Pilotage de la plateforme par les données.",
        [
            "Graphique de courbe des ventes journalières sur les 30 derniers jours.",
            "Top 10 produits par chiffre d'affaires avec comparaison mois précédent.",
            "Taux de conversion global : visiteurs uniques → ajout panier → commande → livraison.",
            "Répartition des commandes par zone de livraison (carte ou tableau).",
            "Bouton Export CSV / Excel pour tous les rapports depuis le dashboard admin.",
        ]
    ),
    (
        "SEO avancé",
        "Visibilité organique sur Google — trafic gratuit et durable.",
        [
            "Sitemap XML dynamique généré automatiquement : toutes les fiches produits, profils artisans, catégories.",
            "Données structurées JSON-LD de type Product (prix, stock, note, artisan) sur chaque fiche produit.",
            "BreadcrumbList et Organization pour le référencement de marque.",
            "Balises Open Graph individualisées par produit (titre, description, image) pour les partages sociaux.",
            "Pré-rendu côté serveur des fiches produits pour les robots d'indexation.",
        ]
    ),
]

for title, impact, desc_items in moyenne:
    story += [
        KeepTogether([Paragraph(title, H3), Paragraph(impact, NOTE)]),
    ]
    for item in desc_items:
        story.append(Paragraph(f"• {item}", STEP))
    story.append(Spacer(1, 0.2*cm))

# Priorité basse
story += [Paragraph("3.3  Priorité basse — Vision long terme", H2), hr(GRAY, 0.5)]

low_data = [
    ["Fonctionnalité", "Description", "Complexité"],
    ["Application mobile native",
     "APK Android et iOS développé en React Native. Notifications push natives, mode hors ligne avancé, scanner QR pour les ateliers artisans.",
     "Très élevée"],
    ["Multi-langue FR / EN",
     "Interface complète en français et en anglais pour couvrir le Cameroun anglophone. Implémentation avec i18next.",
     "Moyenne"],
    ["Paiement en plusieurs fois",
     "Permettre d'étaler le paiement en 2 ou 3 versements avec rappels automatiques par SMS à chaque échéance.",
     "Élevée"],
    ["Recommandations IA",
     "Moteur de suggestion basé sur l'historique d'achat, les produits consultés et les profils similaires (filtrage collaboratif).",
     "Très élevée"],
    ["Carte interactive des artisans",
     "Carte du Cameroun avec les ateliers géolocalisés, itinéraire Google Maps, photos de l'atelier.",
     "Faible"],
    ["Marketplace B2B",
     "Commandes en gros pour revendeurs avec tarifs dégressifs par palier de quantité et facturation pro.",
     "Élevée"],
    ["Live shopping",
     "Sessions vidéo en direct : l'artisan présente ses créations, les spectateurs peuvent acheter en temps réel.",
     "Très élevée"],
    ["Programme fidélité inter-artisans",
     "Les points gagnés chez un artisan sont utilisables auprès de tous les artisans de la plateforme.",
     "Faible"],
]
lt = Table(low_data, colWidths=[4.2*cm, 10.3*cm, 2.8*cm], repeatRows=1)
lt.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  GRAY),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_L]),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
]))
story += [lt, Spacer(1, 0.4*cm), PageBreak()]

# ════════════════════════════════════════════════════════════════
# 4. DÉMARRAGE LOCAL
# ════════════════════════════════════════════════════════════════
story += [
    Paragraph("4. Démarrage en environnement local", H1),
    hr(),
    Paragraph("<b>Backend Django (port 8000)</b>", H3),
]
for cmd in ["cd backend", "source venv/bin/activate", "pip install -r requirements.txt",
            "python manage.py migrate", "python manage.py runserver"]:
    story.append(Paragraph(cmd, CODE))

story.append(Paragraph("<b>Frontend React / Vite (port 5173)</b>", H3))
for cmd in ["cd frontend", "npm install", "npm run dev",
            "# Ouvrir : http://localhost:5173"]:
    story.append(Paragraph(cmd, CODE))

story.append(Spacer(1, 0.3*cm))
story.append(box(
    "Comptes de test en local",
    [
        Paragraph("• <b>Admin</b> : téléphone +237680757871 — rôle admin (compte username : admin)", BODY),
        Paragraph("• <b>Artisan</b> : créer via /register → cocher Artisan → approuver dans le dashboard admin", BODY),
        Paragraph("• <b>Client</b> : créer via /register", BODY),
        Paragraph("• <b>Django admin classique</b> : /admin/ — username : admin, mot de passe du superuser", BODY),
    ]
))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("<b>Commandes utiles</b>", H3))
for cmd, desc in [
    ("python manage.py send_abandoned_cart_emails", "Envoie les emails de relance pour les paniers abandonnés depuis +24h"),
    ("python manage.py shell", "Ouvre le shell interactif Python/Django"),
    ("python manage.py createsuperuser", "Crée un compte superuser Django"),
    ("python manage.py collectstatic", "Collecte les fichiers statiques pour le déploiement"),
]:
    story.append(Paragraph(cmd, CODE))
    story.append(Paragraph(desc, NOTE))

# ════════════════════════════════════════════════════════════════
# 5. ARCHITECTURE & FLUX
# ════════════════════════════════════════════════════════════════
story += [PageBreak(), Paragraph("5. Architecture & Flux de données", H1), hr()]

arch = Table([
    ["Couche", "Technologie", "Responsabilité"],
    ["Interface utilisateur", "React 18 + Vite + Tailwind CSS 4", "SPA — rendu côté client, routing React Router"],
    ["État global",  "Redux Toolkit + React Query", "Panier et auth (Redux) | données serveur (React Query)"],
    ["API REST",     "Django REST Framework + SimpleJWT", "Endpoints JSON, auth JWT, pagination, filtres"],
    ["Base de données","PostgreSQL 15", "Toutes les données persistantes en production"],
    ["Médias",       "Cloudinary (prod) / FileSystem (dev)", "Photos produits, avatars, images variantes"],
    ["Paiement",     "Campay API (Cameroun)", "Orange Money et MTN MoMo — webhook de confirmation"],
    ["Emails",       "Django email + SMTP Gmail", "Confirmations, relances panier abandonné, alertes stock"],
    ["Notifications","Web Push API (VAPID Keys)", "Notifications navigateur via Service Worker PWA"],
    ["Déploiement",  "Vercel + Render + GitHub", "CI/CD : push main → déploiement automatique en 2-3 min"],
    ["PDF",          "ReportLab (Python)", "Génération de documents PDF (factures, rapports)"],
], colWidths=[4*cm, 5.5*cm, 7.8*cm], repeatRows=1)
arch.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  VERT),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GRAY_L]),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
]))
story += [arch, Spacer(1, 0.5*cm)]

# Flux commande
story += [Paragraph("Flux de statut d'une commande", H2), hr(VERT_M, 0.5)]
flow = Table([[
    Paragraph("pending\nEn attente", s("s1", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#92400e"), alignment=TA_CENTER)),
    Paragraph("→", s("arr", fontName="Helvetica-Bold", fontSize=16, textColor=GRAY, alignment=TA_CENTER)),
    Paragraph("paid\nPayé", s("s2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#1e40af"), alignment=TA_CENTER)),
    Paragraph("→", s("arr2", fontName="Helvetica-Bold", fontSize=16, textColor=GRAY, alignment=TA_CENTER)),
    Paragraph("processing\nPréparation", s("s3", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#5b21b6"), alignment=TA_CENTER)),
    Paragraph("→", s("arr3", fontName="Helvetica-Bold", fontSize=16, textColor=GRAY, alignment=TA_CENTER)),
    Paragraph("shipped\nExpédié", s("s4", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#194328"), alignment=TA_CENTER)),
    Paragraph("→", s("arr4", fontName="Helvetica-Bold", fontSize=16, textColor=GRAY, alignment=TA_CENTER)),
    Paragraph("delivered\nLivré ✓", s("s5", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#15803d"), alignment=TA_CENTER)),
]])
flow.setStyle(TableStyle([
    ("BACKGROUND",    (0,0),(0,0), colors.HexColor("#fef9c3")),
    ("BACKGROUND",    (2,0),(2,0), colors.HexColor("#dbeafe")),
    ("BACKGROUND",    (4,0),(4,0), colors.HexColor("#ede9fe")),
    ("BACKGROUND",    (6,0),(6,0), colors.HexColor("#d6eddf")),
    ("BACKGROUND",    (8,0),(8,0), colors.HexColor("#dcfce7")),
    ("BOX", (0,0),(0,0), 1.2, colors.HexColor("#f59e0b")),
    ("BOX", (2,0),(2,0), 1.2, colors.HexColor("#3b82f6")),
    ("BOX", (4,0),(4,0), 1.2, colors.HexColor("#8b5cf6")),
    ("BOX", (6,0),(6,0), 1.2, colors.HexColor("#22c55e")),
    ("BOX", (8,0),(8,0), 1.2, colors.HexColor("#16a34a")),
    ("TOPPADDING",    (0,0),(-1,-1), 10),
    ("BOTTOMPADDING", (0,0),(-1,-1), 10),
    ("ALIGN",         (0,0),(-1,-1), "CENTER"),
    ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
]))
story += [
    flow, Spacer(1, 0.2*cm),
    Paragraph(
        "→ pending → paid : automatiquement via webhook Campay après confirmation du paiement mobile, "
        "ou manuellement par l'admin pour les paiements en espèces.  "
        "→ paid → delivered : toujours manuel via le dashboard admin ou agent.  "
        "→ À chaque changement de statut : notification push envoyée au client.  "
        "→ À la livraison (delivered) : points fidélité crédités automatiquement (1 pt par 500 FCFA).",
        SM
    ),
    Spacer(1, 0.5*cm),
]

# Pied de page
story += [
    PageBreak(), Spacer(1, 4*cm),
    box(
        "Contact & Liens utiles",
        [
            Paragraph("Email : joinito18@gmail.com", BODY),
            Paragraph("Site production : sahel-market-gamma.vercel.app", BODY),
            Paragraph("Dashboard admin : sahel-market-gamma.vercel.app/dashboard/admin", BODY),
            Paragraph("Django admin : sahel-market-backend.onrender.com/admin/", BODY),
        ]
    ),
    Spacer(1, 0.5*cm),
    Paragraph(f"Document généré le {date.today().strftime('%d %B %Y')} — Sahel Market © 2025", FOOT),
]

doc.build(story)
print(f"PDF généré : {OUTPUT}")
