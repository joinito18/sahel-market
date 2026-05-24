from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order',
            old_name='cinetpay_transaction_id',
            new_name='payment_reference',
        ),
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('orange_money', 'Orange Money'),
                    ('mtn_momo',     'MTN Mobile Money'),
                    ('cash',         'Espèces à la livraison'),
                ],
                default='orange_money',
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_phone',
            field=models.CharField(max_length=20, blank=True, default=''),
            preserve_default=False,
        ),
    ]
