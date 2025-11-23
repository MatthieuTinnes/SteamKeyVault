import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone
from users.models import User


class EmailVerificationToken(models.Model):
    """Token for email verification (registration or email change)"""
    TOKEN_TYPE_REGISTRATION = 'registration'
    TOKEN_TYPE_EMAIL_CHANGE = 'email_change'
    
    TOKEN_TYPES = [
        (TOKEN_TYPE_REGISTRATION, 'Registration'),
        (TOKEN_TYPE_EMAIL_CHANGE, 'Email Change'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPES)
    new_email = models.EmailField(null=True, blank=True)  # For email change verification
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verification_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.token_type} token for {self.user.email}"
    
    @classmethod
    def generate_token(cls, user, token_type, new_email=None, expiry_hours=24):
        """Generate a new verification token"""
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        return cls.objects.create(
            user=user,
            token=token,
            token_type=token_type,
            new_email=new_email,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.used and timezone.now() < self.expires_at
    
    def mark_used(self):
        """Mark token as used"""
        self.used = True
        self.save(update_fields=['used'])
