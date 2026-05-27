from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='rating',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='rating_photos/'),
        ),
    ]
