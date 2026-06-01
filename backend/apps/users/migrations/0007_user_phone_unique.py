from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_pushsubscription'),
    ]

    operations = [
        # Nullifier les doublons de téléphone avant d'appliquer l'unicité
        # (garde le compte avec le plus petit id pour chaque numéro)
        migrations.RunSQL(
            sql="""
                ALTER TABLE users_user ALTER COLUMN phone DROP NOT NULL;
                UPDATE users_user
                SET phone = NULL
                WHERE id NOT IN (
                    SELECT MIN(id)
                    FROM users_user
                    WHERE phone IS NOT NULL AND phone <> ''
                    GROUP BY phone
                )
                AND phone IS NOT NULL AND phone <> '';
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
    ]
