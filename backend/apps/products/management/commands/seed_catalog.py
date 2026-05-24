"""
python manage.py seed_catalog          → ajoute sans supprimer
python manage.py seed_catalog --reset  → repart de zéro
"""
import os, shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User
from apps.products.models import Category, Product, ProductImage

SOURCE_DIR = Path('/home/joel/Documents/image')

CATALOG = {
    'chapeau-market': {
        'category': 'Chapeaux traditionnels',
        'slug': 'chapeaux',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {
                'name': 'Chapeau en paille de Maroua',
                'price': 8500, 'stock': 15,
                'desc': "Chapeau tressé à la main par les artisans de Maroua à partir de paille de mil séchée. Léger, respirant, idéal pour le soleil du Sahel. Chaque pièce est unique.",
            },
            {
                'name': 'Chapeau de berger peul',
                'price': 6500, 'stock': 20,
                'desc': "Couvre-chef emblématique des bergers Peuls du Nord Cameroun. Fabriqué en paille fine avec motifs brodés à la main. Symbole culturel porté lors des fêtes.",
            },
            {
                'name': 'Chapeau de cérémonie Haoussa',
                'price': 12000, 'stock': 8,
                'desc': "Chapeau de fête Haoussa orné de broderies colorées et de fils dorés. Porté lors des mariages et célébrations traditionnelles du Nord Cameroun.",
            },
            {
                'name': 'Chapeau conique artisanal',
                'price': 5500, 'stock': 25,
                'desc': "Chapeau conique tressé en feuilles de palmier. Utilisé par les agriculteurs et pêcheurs du bassin du Lac Tchad depuis des générations.",
            },
        ],
    },

    'chaussures-markets': {
        'category': 'Chaussures & Sandales',
        'slug': 'chaussures',
        'location': 'Garoua, Nord',
        'products': [
            {
                'name': 'Babouches en cuir de Garoua',
                'price': 15000, 'stock': 30,
                'desc': "Babouches tannées et cousues à la main à Garoua. Cuir naturel de vache, semelle renforcée. Teinture naturelle aux plantes locales.",
            },
            {
                'name': 'Sandales artisanales Fulani',
                'price': 12500, 'stock': 25,
                'desc': "Sandales plates à lanières tressées, fabriquées par les cordonniers Fulani. Cuir souple travaillé selon les techniques ancestrales.",
            },
            {
                'name': 'Mocassins brodés du Nord',
                'price': 18000, 'stock': 15,
                'desc': "Mocassins en cuir ornés de broderies géométriques traditionnelles. Fabrication entièrement artisanale, idéaux pour les cérémonies.",
            },
            {
                'name': 'Chaussures en cuir tanné',
                'price': 22000, 'stock': 12,
                'desc': "Chaussures de ville artisanales en cuir tanné localement. Coutures à la main, semelle en cuir épais. Robustes et élégantes.",
            },
            {
                'name': 'Tongs cuir brut artisanales',
                'price': 8500, 'stock': 40,
                'desc': "Tongs légères tressées en cuir brut de qualité. Idéales pour les marchés et la vie quotidienne. Confort naturel, production locale.",
            },
            {
                'name': 'Sandales dorées de cérémonie',
                'price': 25000, 'stock': 10,
                'desc': "Sandales de fête ornées de clous dorés et de motifs estampés. Portées lors des mariages au Nord Cameroun. Pièce de collection.",
            },
        ],
    },

    'horloges-market': {
        'category': 'Décoration & Horloges',
        'slug': 'decorations',
        'location': 'Bafoussam, Ouest',
        'products': [
            {
                'name': 'Horloge murale en bois sculpté',
                'price': 35000, 'stock': 8,
                'desc': "Horloge artisanale en bois de caïlcédrat sculpté à la main. Motifs africains gravés, mécanisme quartz silencieux.",
            },
            {
                'name': 'Horloge en calebasse peinte',
                'price': 25000, 'stock': 12,
                'desc': "Calebasse séchée et peinte aux pigments naturels transformée en horloge murale. Art traditionnel Bamiléké revisité, chaque calebasse est unique.",
            },
            {
                'name': 'Pendule en terre cuite décorée',
                'price': 28000, 'stock': 6,
                'desc': "Pendule fabriquée en terre cuite cuite au four à bois. Décorée de motifs géométriques traditionnels en relief.",
            },
        ],
    },

    'pannier-markets': {
        'category': 'Paniers & Vannerie',
        'slug': 'vannerie',
        'location': 'Ngaoundéré, Adamaoua',
        'products': [
            {
                'name': 'Panier en raphia naturel',
                'price': 8000, 'stock': 35,
                'desc': "Panier multiusage tressé en raphia séché récolté dans les forêts de l'Adamaoua. Solide, écologique et 100% biodégradable.",
            },
            {
                'name': 'Grand couffin traditionnel',
                'price': 15000, 'stock': 20,
                'desc': "Grand panier à couvercle tressé serré. Utilisé pour transporter et conserver les grains et provisions. Technique transmise depuis des siècles.",
            },
            {
                'name': 'Corbeille décorative colorée',
                'price': 12000, 'stock': 18,
                'desc': "Corbeille plate aux motifs colorés tissés avec des teintures végétales. Sert de plateau décoratif ou vide-poche. Parfaite comme cadeau artisanal.",
            },
            {
                'name': 'Panier à linge en jonc',
                'price': 18000, 'stock': 15,
                'desc': "Grand panier à linge fabriqué en jonc des plaines de l'Adamaoua. Résistant, aéré et naturellement antibactérien.",
            },
        ],
    },

    'porte-feuille-market': {
        'category': 'Portefeuilles & Maroquinerie',
        'slug': 'portefeuilles',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {
                'name': 'Portefeuille homme en cuir naturel',
                'price': 12000, 'stock': 40,
                'desc': "Portefeuille bifold en cuir de vache tanné à Maroua. Compartiments cartes, poche billets. Cuir qui se patine avec le temps.",
            },
            {
                'name': 'Portefeuille femme en cuir tressé',
                'price': 9500, 'stock': 35,
                'desc': "Portefeuille femme en cuir souple avec motifs tressés à la main. Doublure intérieure en tissu wax. Fermeture zip solide.",
            },
            {
                'name': 'Porte-monnaie cuir artisanal',
                'price': 6500, 'stock': 50,
                'desc': "Petit porte-monnaie en cuir avec fermeture zip. Pratique et élégant au quotidien. Idéal comme cadeau.",
            },
            {
                'name': 'Carnet de notes en cuir',
                'price': 9500, 'stock': 25,
                'desc': "Carnet couverture cuir souple avec motifs estampés. Pages blanches rechargeable, fermeture lanière. Cadeau affaires artisanal.",
            },
            {
                'name': 'Ceinture cuir pleine fleur',
                'price': 8000, 'stock': 30,
                'desc': "Ceinture en cuir pleine fleur tannée végétalement. Boucle en métal forgé localement, largeur 3 cm. Tailles 70 à 120 cm.",
            },
            {
                'name': 'Porte-documents en cuir épais',
                'price': 18000, 'stock': 15,
                'desc': "Pochette documents en cuir épais, format A4. Idéale pour transporter contrats et dossiers. Fermoir magnétique discret.",
            },
            {
                'name': 'Étui téléphone cuir gravé',
                'price': 7500, 'stock': 35,
                'desc': "Étui universel en cuir naturel avec motifs gravés à chaud. Compatible la plupart des smartphones. Personnalisable sur demande.",
            },
            {
                'name': 'Porte-clés cuir tressé',
                'price': 3500, 'stock': 60,
                'desc': "Porte-clés en lanières de cuir tressées à la main. Anneau en métal chromé solide. Petit cadeau artisanal typique du Nord Cameroun.",
            },
        ],
    },

    'robes-market': {
        'category': 'Mode & Pagnes',
        'slug': 'mode',
        'location': 'Douala, Littoral',
        'products': [
            {
                'name': 'Robe longue en pagne wax',
                'price': 25000, 'stock': 20,
                'desc': "Robe longue taillée et cousue à la main dans un pagne wax imprimé. Col V élégant, poches latérales. Couturière professionnelle de Douala.",
            },
            {
                'name': 'Boubou femme brodé fil doré',
                'price': 35000, 'stock': 12,
                'desc': "Boubou traditionnel en mousseline brodé au fil doré. Coupe ample et élégante. Tailles S à 3XL sur commande.",
            },
            {
                'name': 'Robe de soirée en bazin riche',
                'price': 45000, 'stock': 8,
                'desc': "Robe de cérémonie en bazin riche de qualité supérieure. Broderies au fil de soie, finitions impeccables. Pièce prestige pour mariages.",
            },
            {
                'name': 'Ensemble pagne kente deux pièces',
                'price': 30000, 'stock': 15,
                'desc': "Ensemble top + jupe en tissu kente tissé main. Motifs géométriques traditionnels, couleurs vives et durables. Sur mesure disponible.",
            },
        ],
    },

    'sac-market': {
        'category': 'Sacs & Bagages',
        'slug': 'sacs',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {
                'name': 'Sac à main cuir naturel de Maroua',
                'price': 35000, 'stock': 20,
                'desc': "Sac à main en cuir naturel tanné à Maroua. Fermoir magnétique, doublure coton, bandoulière ajustable.",
            },
            {
                'name': 'Grand sac cabas en cuir souple',
                'price': 28000, 'stock': 18,
                'desc': "Grand sac cabas en cuir souple, spacieux et léger. Idéal pour le marché ou la plage. Poignées renforcées, base solide.",
            },
            {
                'name': 'Sac à bandoulière cuir naturel',
                'price': 22000, 'stock': 22,
                'desc': "Sac bandoulière compact en cuir pleine fleur. Compartiment principal + poche avant zippée. Courroie réglable.",
            },
            {
                'name': 'Sac à dos artisanal en cuir',
                'price': 45000, 'stock': 10,
                'desc': "Sac à dos en cuir épais cousu main. Bretelles rembourrées, dos respirant, compartiments multiples. Conçu pour durer 10 ans.",
            },
            {
                'name': 'Sac de voyage grand format',
                'price': 55000, 'stock': 8,
                'desc': "Grand sac de voyage en cuir artisanal, style holdall. Capacité 40L, poignées + bandoulière. Fermoir zip de qualité.",
            },
            {
                'name': 'Sac ceinture cuir artisanal',
                'price': 12000, 'stock': 35,
                'desc': "Sac ceinture en cuir naturel. Pratique pour les sorties, marchés et voyages. Ceinture réglable, deux compartiments.",
            },
            {
                'name': 'Sac tote cuir et pagne wax',
                'price': 20000, 'stock': 28,
                'desc': "Sac tote mixte cuir + pagne wax. Grandes anses en cuir, corps en tissu africain. Capacité généreuse, fond renforcé.",
            },
            {
                'name': 'Sac shopping cuir tressé',
                'price': 18000, 'stock': 25,
                'desc': "Sac shopping en cuir tressé à la main. Format généreux, poignées solides. Mélange tradition et modernité.",
            },
        ],
    },

    'toiles-markets': {
        'category': 'Art & Toiles',
        'slug': 'art',
        'location': 'Yaoundé, Centre',
        'products': [
            {
                'name': 'Toile — Paysage du Sahel',
                'price': 45000, 'stock': 5,
                'desc': "Peinture acrylique sur toile tendue, coucher de soleil sur les savanes du Sahel. Format 60×80 cm, signée, avec certificat.",
            },
            {
                'name': 'Portrait artisan — technique mixte',
                'price': 60000, 'stock': 3,
                'desc': "Portrait expressif d'un artisan au travail, technique mixte acrylique + pastel. Format 50×70 cm. Pièce unique signée.",
            },
            {
                'name': 'Tableau batik sur tissu local',
                'price': 35000, 'stock': 8,
                'desc': "Tableau réalisé par technique du batik sur tissu coton local. Motifs abstraits africains, couleurs naturelles. Format 40×60 cm.",
            },
            {
                'name': 'Sculpture murale terre cuite',
                'price': 50000, 'stock': 4,
                'desc': "Relief mural sculpté en terre cuite cuite au four à bois. Motifs masques et symboles Bamiléké. 30×40 cm.",
            },
        ],
    },

    'le-restes': {
        'category': 'Bijoux & Accessoires',
        'slug': 'bijoux',
        'location': 'Maroua, Extrême-Nord',
        'products': [
            {
                'name': 'Collier perles artisanal',
                'price': 7500, 'stock': 30,
                'desc': "Collier en perles de verre colorées enfilées à la main. Motifs traditionnels du Nord Cameroun. Longueur ajustable.",
            },
            {
                'name': 'Bracelet cuir tressé',
                'price': 4500, 'stock': 45,
                'desc': "Bracelet en lanières de cuir naturel tressées. Fermeture réglable. Idéal en lot, disponible en plusieurs coloris.",
            },
            {
                'name': 'Bague en métal forgé',
                'price': 5500, 'stock': 25,
                'desc': "Bague artisanale en métal forgé localement. Motifs géométriques gravés à la main. Tailles standards disponibles.",
            },
            {
                'name': 'Parure collier et boucles',
                'price': 12000, 'stock': 18,
                'desc': "Parure complète collier + boucles d'oreilles en perles et métal. Fabriquée par les bijoutières de Maroua.",
            },
            {
                'name': 'Ceinture de hanches festive',
                'price': 6500, 'stock': 22,
                'desc': "Ceinture de hanches colorée portée lors des cérémonies. Perles, cauris et fils de couleur. Pièce festive traditionnelle.",
            },
            {
                'name': 'Accessoire cheveux artisanal',
                'price': 3500, 'stock': 40,
                'desc': "Accessoire cheveux fabriqué à la main avec perles et tresses de raphia. Original et unique, emblème du savoir-faire local.",
            },
        ],
    },
}


class Command(BaseCommand):
    help = 'Peuple la BDD avec les photos de produits artisanaux'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='Supprime tout avant de relancer')

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Suppression des données existantes...')
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()

        producer, created = User.objects.get_or_create(
            username='artisan_demo',
            defaults={
                'email': 'artisan@sahelmarket.cm',
                'role': 'producer',
                'first_name': 'Amadou',
                'last_name': 'Bello',
                'phone': '+237699000001',
                'address': 'Maroua, Extrême-Nord, Cameroun',
                'is_verified': True,
            }
        )
        if created:
            producer.set_password('SahelMarket2025!')
            producer.save()
            self.stdout.write(self.style.SUCCESS('Producteur démo créé : artisan_demo'))

        media_products = Path(settings.MEDIA_ROOT) / 'products'
        media_cats     = Path(settings.MEDIA_ROOT) / 'categories'
        media_products.mkdir(parents=True, exist_ok=True)
        media_cats.mkdir(parents=True, exist_ok=True)

        total_products = 0
        total_images   = 0

        for folder_name, data in CATALOG.items():
            source_folder = SOURCE_DIR / folder_name
            if not source_folder.exists():
                self.stdout.write(self.style.WARNING(f'  Introuvable : {source_folder}'))
                continue

            images = sorted([
                f for f in source_folder.iterdir()
                if f.is_file() and f.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}
            ])
            if not images:
                continue

            # Catégorie
            cat_img_src  = images[0]
            cat_img_name = f"{data['slug']}_cover{cat_img_src.suffix}"
            shutil.copy2(cat_img_src, media_cats / cat_img_name)

            category, _ = Category.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'name':  data['category'],
                    'image': f"categories/{cat_img_name}",
                },
            )
            self.stdout.write(f"\n📁 {category.name} ({len(images)} photos)")

            # Répartition équitable
            prods_def = data['products']
            n = len(prods_def)
            base, extra = divmod(len(images), n)
            batches, idx = [], 0
            for i in range(n):
                cnt = base + (1 if i < extra else 0)
                batches.append(images[idx:idx + cnt])
                idx += cnt

            for prod_def, batch in zip(prods_def, batches):
                if not batch:
                    continue
                if Product.objects.filter(name=prod_def['name'], producer=producer).exists():
                    self.stdout.write(f"  ↩  Déjà existant : {prod_def['name']}")
                    continue

                product = Product.objects.create(
                    producer=producer,
                    category=category,
                    name=prod_def['name'],
                    description=prod_def['desc'],
                    price=prod_def['price'],
                    stock=prod_def['stock'],
                    location=data['location'],
                    is_available=True,
                )

                import random
                product.views_count = random.randint(60, 380)
                product.save(update_fields=['views_count'])

                for i, img_src in enumerate(batch):
                    dest = f"{data['slug']}_{product.pk}_{i+1}{img_src.suffix}"
                    shutil.copy2(img_src, media_products / dest)
                    ProductImage.objects.create(
                        product=product,
                        image=f"products/{dest}",
                        is_main=(i == 0),
                    )
                    total_images += 1

                total_products += 1
                self.stdout.write(
                    f"  ✓  {product.name} "
                    f"({len(batch)} photo{'s' if len(batch) > 1 else ''}) "
                    f"— {prod_def['price']:,} FCFA"
                )

        self.stdout.write(self.style.SUCCESS(
            f'\n✅  {total_products} produits créés, {total_images} images importées.'
        ))
