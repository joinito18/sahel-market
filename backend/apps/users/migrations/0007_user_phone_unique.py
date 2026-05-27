from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_pushsubscription'),
    ]

    operations = [
        # Passer phone en null=True pour les utilisateurs existants sans numéro
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
    ]
