from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_user_preferred_language'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useractionlog',
            name='action_type',
            field=models.CharField(
                choices=[
                    ('login', 'Login'),
                    ('register', 'Register'),
                    ('password_change', 'Change password'),
                    ('password_reset', 'Reset password'),
                    ('email_change', 'Change email'),
                ],
                max_length=32,
            ),
        ),
    ]
