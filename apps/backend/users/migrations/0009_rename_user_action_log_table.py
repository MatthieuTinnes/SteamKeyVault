from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_user_action_log'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='useractionlog',
            table='user_action_log',
        ),
    ]
