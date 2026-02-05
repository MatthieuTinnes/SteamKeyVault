from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0005_user_is_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='wrapped_mk_password',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='wrapped_mk_recovery',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='mk_salt',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='rk_salt',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='kdf_iterations',
            field=models.IntegerField(default=310000),
        ),
        migrations.AddField(
            model_name='user',
            name='kdf_hash',
            field=models.CharField(default='SHA-256', max_length=32),
        ),
    ]
