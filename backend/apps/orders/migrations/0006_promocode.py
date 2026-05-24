from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_notification'),
    ]

    operations = [
        migrations.CreateModel(
            name='PromoCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_index=True, max_length=30, unique=True)),
                ('discount_type', models.CharField(
                    choices=[
                        ('fixed', 'Montant fixe (FCFA)'),
                        ('percent', 'Pourcentage (%)'),
                        ('free_delivery', 'Livraison gratuite'),
                    ],
                    default='fixed',
                    max_length=20,
                )),
                ('discount_value', models.DecimalField(decimal_places=0, default=0, max_digits=10)),
                ('min_order_amount', models.DecimalField(decimal_places=0, default=0, max_digits=10)),
                ('description', models.CharField(blank=True, max_length=200)),
                ('is_active', models.BooleanField(default=True)),
                ('expiry_date', models.DateField(blank=True, null=True)),
                ('max_uses', models.PositiveIntegerField(blank=True, null=True)),
                ('used_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
