from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_inline_game_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='usergame',
            name='platform',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
