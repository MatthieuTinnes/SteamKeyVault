from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0009_rename_user_action_log_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferred_language',
            field=models.CharField(choices=[('en', 'English'), ('fr', 'French')], default='en', max_length=8),
        ),
    ]
