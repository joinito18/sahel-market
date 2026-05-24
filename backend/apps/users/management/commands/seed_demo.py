"""
Commande de démonstration Sahel Market.
Crée les comptes de base + catégories + produits sans images réelles.

Usage :
    python3 manage.py seed_demo           # crée sans supprimer
    python3 manage.py seed_demo --reset   # repart de zéro
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User, ProducerProfile
from apps.products.models import Category, Product


ACCOUNTS = [
    {
        'username':   'admin',
        'email':      'admin@sahelmarket.cm',
        'password':   'Admin2025!',
        'role':       'admin',
        'first_name': 'Administrateur',
        'last_name':  'Sahel Market',
        'phone':      '+237680757871',
        'is_superuser': True,
        'is_staff':     True,
        'is_verified':  True,
    },
    {
        'username':   'agent_demo',
        'email':      'agent@sahelmarket.cm',
        'password':   'Agent2025!',
        'role':       'agent',
        'first_name': 'Moussa',
        'last_name':  'Abba',
        'phone':      '+237699000000',
        'is_verified': True,
    },
    {
        'username':   'amadou_bello',
        'email':      'amadou@sahelmarket.cm',
        'password':   'Artisan2025!',
        'role':       'producer',
        'first_name': 'Amadou',
        'last_name':  'Bello',
        'phone':      '+237699000001',
        'address':    'Maroua, Extrême-Nord, Cameroun',
        'is_verified': True,
        'profile': {
            'speciality':        'Maroquinerie traditionnelle',
            'years_experience':  18,
            'bio': (
                "Maroquinier de père en fils depuis 18 ans à Maroua. "
                "Je tanne et façonne le cuir selon les techniques ancestrales du Sahel. "
                "Mes sacs et sandales sont exportés vers le Gabon, le Tchad et le Sénégal."
            ),
        },
    },
    {
        'username':   'fatima_wangari',
        'email':      'fatima@sahelmarket.cm',
        'password':   'Artisan2025!',
        'role':       'producer',
        'first_name': 'Fatima',
        'last_name':  'Wangari',
        'phone':      '+237699000002',
        'address':    'Ngaoundéré, Adamaoua, Cameroun',
        'is_verified': True,
        'profile': {
            'speciality':        'Vannerie et paniers en raphia',
            'years_experience':  12,
            'bio': (
                "Vannière depuis l'enfance dans la région de l'Adamaoua. "
                "Je tresse des paniers, corbeilles et nattes en raphia naturel "
                "avec les motifs géométriques traditionnels de mes ancêtres Gbaya."
            ),
        },
    },
    {
        'username':   'ibrahim_sali',
        'email':      'ibrahim@sahelmarket.cm',
        'password':   'Artisan2025!',
        'role':       'producer',
        'first_name': 'Ibrahim',
        'last_name':  'Sali',
        'phone':      '+237699000003',
        'address':    'Garoua, Nord, Cameroun',
        'is_verified': True,
        'profile': {
            'speciality':        'Chaussures et sandales en cuir',
            'years_experience':  22,
            'bio': (
                "Cordonnier depuis 22 ans à Garoua, je fabrique des chaussures, "
                "sandales et babouches en cuir de vache tanné localement. "
                "Mes créations allient confort, durabilité et authenticité Fulani."
            ),
        },
    },
    {
        'username':   'client_demo',
        'email':      'client@sahelmarket.cm',
        'password':   'Client2025!',
        'role':       'client',
        'first_name': 'Marie',
        'last_name':  'Nguema',
        'phone':      '+237699000099',
        'is_verified': True,
    },
]

CATALOG = []  # Les produits viennent de seed_catalog (avec images)

_UNUSED = [
    {
        'name': 'Sacs & Bagages',
        'slug': 'sacs',
        'producer': 'amadou_bello',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {'name': 'Sac à main cuir naturel de Maroua',    'price': 35000, 'stock': 20,
             'desc': "Sac à main en cuir naturel tanné à Maroua. Fermoir magnétique, doublure coton, bandoulière ajustable."},
            {'name': 'Grand sac cabas en cuir souple',        'price': 28000, 'stock': 18,
             'desc': "Grand sac cabas en cuir souple, spacieux et léger. Idéal pour le marché ou la plage. Poignées renforcées, base solide."},
            {'name': 'Sac à bandoulière cuir naturel',        'price': 22000, 'stock': 22,
             'desc': "Sac bandoulière compact en cuir pleine fleur. Compartiment principal + poche avant zippée. Courroie réglable."},
            {'name': 'Sac à dos artisanal en cuir',           'price': 45000, 'stock': 10,
             'desc': "Sac à dos en cuir épais cousu main. Bretelles rembourrées, dos respirant, compartiments multiples. Conçu pour durer 10 ans."},
            {'name': 'Sac ceinture cuir artisanal',           'price': 12000, 'stock': 35,
             'desc': "Sac ceinture en cuir naturel. Pratique pour les sorties, marchés et voyages. Ceinture réglable, deux compartiments."},
        ],
    },
    {
        'name': 'Portefeuilles & Maroquinerie',
        'slug': 'portefeuilles',
        'producer': 'amadou_bello',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {'name': 'Portefeuille homme en cuir naturel',    'price': 12000, 'stock': 40,
             'desc': "Portefeuille bifold en cuir de vache tanné à Maroua. Compartiments cartes, poche billets. Cuir qui se patine avec le temps."},
            {'name': 'Portefeuille femme en cuir tressé',     'price': 9500,  'stock': 35,
             'desc': "Portefeuille femme en cuir souple avec motifs tressés à la main. Doublure intérieure en tissu wax. Fermeture zip solide."},
            {'name': 'Porte-monnaie cuir artisanal',          'price': 6500,  'stock': 50,
             'desc': "Petit porte-monnaie en cuir avec fermeture zip. Pratique et élégant au quotidien. Idéal comme cadeau."},
            {'name': 'Ceinture cuir pleine fleur',            'price': 8000,  'stock': 30,
             'desc': "Ceinture en cuir pleine fleur tannée végétalement. Boucle en métal forgé localement, largeur 3 cm. Tailles 70 à 120 cm."},
            {'name': 'Étui téléphone cuir gravé',             'price': 7500,  'stock': 35,
             'desc': "Étui universel en cuir naturel avec motifs gravés à chaud. Compatible la plupart des smartphones."},
            {'name': 'Porte-clés cuir tressé',                'price': 3500,  'stock': 60,
             'desc': "Porte-clés en lanières de cuir tressées à la main. Anneau en métal chromé solide. Idéal comme cadeau."},
        ],
    },
    {
        'name': 'Chaussures & Sandales',
        'slug': 'chaussures',
        'producer': 'ibrahim_sali',
        'location': 'Garoua, Nord',
        'products': [
            {'name': 'Babouches en cuir de Garoua',           'price': 15000, 'stock': 30,
             'desc': "Babouches tannées et cousues à la main à Garoua. Cuir naturel de vache, semelle renforcée."},
            {'name': 'Sandales artisanales Fulani',            'price': 12500, 'stock': 25,
             'desc': "Sandales plates à lanières tressées, fabriquées par les cordonniers Fulani. Cuir souple travaillé selon les techniques ancestrales."},
            {'name': 'Mocassins brodés du Nord',               'price': 18000, 'stock': 15,
             'desc': "Mocassins en cuir ornés de broderies géométriques traditionnelles. Fabrication entièrement artisanale, idéaux pour les cérémonies."},
            {'name': 'Chaussures en cuir tanné main',          'price': 22000, 'stock': 12,
             'desc': "Chaussures de ville artisanales en cuir tanné localement. Coutures à la main, semelle en cuir épais."},
        ],
    },
    {
        'name': 'Paniers & Vannerie',
        'slug': 'vannerie',
        'producer': 'fatima_wangari',
        'location': 'Ngaoundéré, Adamaoua',
        'products': [
            {'name': 'Panier en raphia naturel',               'price': 8000,  'stock': 35,
             'desc': "Panier multiusage tressé en raphia séché récolté dans les forêts de l'Adamaoua. Solide, écologique et 100% biodégradable."},
            {'name': 'Grand couffin traditionnel',             'price': 15000, 'stock': 20,
             'desc': "Grand panier à couvercle tressé serré. Utilisé pour transporter et conserver les grains et provisions."},
            {'name': 'Corbeille décorative colorée',           'price': 12000, 'stock': 18,
             'desc': "Corbeille plate aux motifs colorés tissés avec des teintures végétales. Parfaite comme cadeau artisanal."},
            {'name': 'Natte de sol tressée',                   'price': 10000, 'stock': 25,
             'desc': "Natte rectangulaire tressée en jonc et raphia. Motifs traditionnels Gbaya, parfaite pour les cérémonies."},
        ],
    },
    {
        'name': 'Chapeaux traditionnels',
        'slug': 'chapeaux',
        'producer': 'amadou_bello',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {'name': 'Chapeau en paille de Maroua',           'price': 8500,  'stock': 15,
             'desc': "Chapeau tressé à la main par les artisans de Maroua à partir de paille de mil séchée. Léger, respirant."},
            {'name': 'Chapeau de berger peul',                'price': 6500,  'stock': 20,
             'desc': "Couvre-chef emblématique des bergers Peuls du Nord Cameroun. Fabriqué en paille fine avec motifs brodés à la main."},
            {'name': 'Chapeau de cérémonie Haoussa',          'price': 12000, 'stock': 8,
             'desc': "Chapeau de fête Haoussa orné de broderies colorées et de fils dorés. Porté lors des mariages."},
        ],
    },
    {
        'name': 'Bijoux & Accessoires',
        'slug': 'bijoux',
        'producer': 'fatima_wangari',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {'name': 'Collier perles artisanal',              'price': 7500,  'stock': 30,
             'desc': "Collier en perles de verre colorées enfilées à la main. Motifs traditionnels du Nord Cameroun. Longueur ajustable."},
            {'name': 'Bracelet cuir tressé',                  'price': 4500,  'stock': 45,
             'desc': "Bracelet en lanières de cuir naturel tressées. Fermeture réglable. Disponible en plusieurs coloris."},
            {'name': 'Parure collier et boucles',             'price': 12000, 'stock': 18,
             'desc': "Parure complète collier + boucles d'oreilles en perles et métal. Fabriquée par les bijoutières de Maroua."},
            {'name': 'Ceinture de hanches festive',           'price': 6500,  'stock': 22,
             'desc': "Ceinture de hanches colorée portée lors des cérémonies. Perles, cauris et fils de couleur."},
        ],
    },
    {
        'name': 'Décoration & Art',
        'slug': 'art',
        'producer': 'fatima_wangari',
        'location': 'Yaoundé, Centre',
        'products': [
            {'name': 'Tableau batik sur tissu local',         'price': 35000, 'stock': 8,
             'desc': "Tableau réalisé par technique du batik sur tissu coton local. Motifs abstraits africains, couleurs naturelles. Format 40×60 cm."},
            {'name': 'Horloge murale en bois sculpté',        'price': 35000, 'stock': 8,
             'desc': "Horloge artisanale en bois de caïlcédrat sculpté à la main. Motifs africains gravés, mécanisme quartz silencieux."},
            {'name': 'Masque décoratif Bamiléké',             'price': 28000, 'stock': 6,
             'desc': "Masque sculpté en bois dur avec motifs Bamiléké. Pièce de décoration murale, poids léger, finition naturelle."},
        ],
    },
    {
        'name': 'Mode & Pagnes',
        'slug': 'mode',
        'producer': 'fatima_wangari',
        'location': 'Douala, Littoral',
        'products': [
            {'name': 'Robe longue en pagne wax',              'price': 25000, 'stock': 20,
             'desc': "Robe longue taillée et cousue à la main dans un pagne wax imprimé. Col V élégant, poches latérales."},
            {'name': 'Boubou femme brodé fil doré',           'price': 35000, 'stock': 12,
             'desc': "Boubou traditionnel en mousseline brodé au fil doré. Coupe ample et élégante. Tailles S à 3XL sur commande."},
            {'name': 'Ensemble pagne kente deux pièces',      'price': 30000, 'stock': 15,
             'desc': "Ensemble top + jupe en tissu kente tissé main. Motifs géométriques traditionnels, couleurs vives."},
        ],
]  # fin _UNUSED


class Command(BaseCommand):
    help = 'Peuple la BDD avec des données de démonstration (sans images)'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='Supprime toutes les données avant de recréer')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('🗑  Suppression des données existantes...')
            Product.objects.all().delete()
            Category.objects.all().delete()
            User.objects.filter(username__in=[a['username'] for a in ACCOUNTS]).delete()

        self.stdout.write('\n👤 Création des comptes...')
        created_users = {}
        for acc in ACCOUNTS:
            profile_data = acc.pop('profile', None)
            username = acc['username']
            user, created = User.objects.get_or_create(
                username=username,
                defaults={k: v for k, v in acc.items() if k != 'password'},
            )
            if created:
                user.set_password(acc['password'])
                if acc.get('is_superuser'):
                    user.is_superuser = True
                    user.is_staff = True
                user.save()
                status = '✅ créé'
            else:
                status = '↩  existant'

            if profile_data and user.role == 'producer':
                ProducerProfile.objects.update_or_create(
                    user=user,
                    defaults=profile_data,
                )

            created_users[username] = user
            self.stdout.write(f'   {status} : {username} ({acc["role"]}) — {acc["password"] if created else ""}')

        # Réassigner les produits existants aux artisans démo
        from apps.products.models import Product
        amadou  = created_users.get('amadou_bello')
        fatima  = created_users.get('fatima_wangari')
        ibrahim = created_users.get('ibrahim_sali')
        if amadou:
            n = Product.objects.filter(category__slug__in=['sacs', 'portefeuilles', 'chapeaux']).update(producer=amadou)
            if n: self.stdout.write(f'   → {n} produits assignés à amadou_bello')
        if fatima:
            n = Product.objects.filter(category__slug__in=['bijoux', 'vannerie', 'art', 'mode']).update(producer=fatima)
            if n: self.stdout.write(f'   → {n} produits assignés à fatima_wangari')
        if ibrahim:
            n = Product.objects.filter(category__slug='chaussures').update(producer=ibrahim)
            if n: self.stdout.write(f'   → {n} produits assignés à ibrahim_sali')

        total_products = Product.objects.count()
        self.stdout.write(self.style.SUCCESS(f'''
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Seed terminé — {total_products} produits disponibles

📋  Comptes de démonstration :
   Admin    : admin@sahelmarket.cm  / Admin2025!
   Agent    : agent@sahelmarket.cm  / Agent2025!
   Artisan  : amadou@sahelmarket.cm / Artisan2025!
   Client   : client@sahelmarket.cm / Client2025!

💡  Pour importer les photos : python3 manage.py seed_catalog
🌐  URL admin Django : http://localhost:8000/admin/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
'''))
