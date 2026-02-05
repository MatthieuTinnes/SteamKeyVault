from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    wrapped_mk_password = models.CharField(max_length=512, null=True, blank=True)
    wrapped_mk_recovery = models.CharField(max_length=512, null=True, blank=True)
    mk_salt = models.CharField(max_length=255, null=True, blank=True)
    rk_salt = models.CharField(max_length=255, null=True, blank=True)
    kdf_iterations = models.IntegerField(default=310000)
    kdf_hash = models.CharField(max_length=32, default='SHA-256')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
