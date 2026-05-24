from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_producerprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='loyalty_points',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
