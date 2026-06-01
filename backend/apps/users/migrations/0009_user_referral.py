import uuid
from django.db import migrations, models
import django.db.models.deletion


def populate_referral_codes(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for user in User.objects.filter(referral_code=''):
        code = uuid.uuid4().hex[:8].upper()
        while User.objects.filter(referral_code=code).exists():
            code = uuid.uuid4().hex[:8].upper()
        user.referral_code = code
        user.save(update_fields=['referral_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_message_product'),
    ]

    operations = [
        # 1 — Ajouter la colonne sans unicité, avec '' comme défaut temporaire
        migrations.AddField(
            model_name='user',
            name='referral_code',
            field=models.CharField(max_length=10, default='', blank=True),
            preserve_default=False,
        ),
        # 2 — Remplir un code unique par utilisateur existant
        migrations.RunPython(populate_referral_codes, reverse_code=migrations.RunPython.noop),
        # 3 — Appliquer la contrainte unique
        migrations.AlterField(
            model_name='user',
            name='referral_code',
            field=models.CharField(max_length=10, unique=True),
        ),
        # 4 — Ajouter referred_by
        migrations.AddField(
            model_name='user',
            name='referred_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='referrals',
                to='users.user',
            ),
        ),
    ]
