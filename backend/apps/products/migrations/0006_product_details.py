from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_productvariant'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='weight',
            field=models.PositiveIntegerField(blank=True, null=True, help_text='Poids en grammes'),
        ),
        migrations.AddField(
            model_name='product',
            name='dimensions',
            field=models.CharField(blank=True, max_length=100, help_text='Ex : 30 × 20 × 10 cm'),
        ),
        migrations.AddField(
            model_name='product',
            name='material',
            field=models.CharField(blank=True, max_length=200, help_text='Ex : Coton 100%, teinture naturelle'),
        ),
        migrations.AddField(
            model_name='product',
            name='fabrication_days',
            field=models.PositiveIntegerField(blank=True, null=True, help_text='Délai de fabrication en jours'),
        ),
    ]
