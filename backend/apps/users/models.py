import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

def generate_referral_code():
    return uuid.uuid4().hex[:8].upper()

class User(AbstractUser):
    ROLES = [
        ('guest', 'Invité'),
        ('client', 'Client'),
        ('producer', 'Producteur'),
        ('agent', 'Agent'),
        ('admin', 'Administrateur'),
    ]
    role = models.CharField(max_length=20, choices=ROLES, default='client')
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    whatsapp = models.CharField(max_length=20, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)
    referral_code = models.CharField(max_length=10, unique=True, default=generate_referral_code)
    referred_by = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='referrals'
    )

    @property
    def referral_count(self):
        return self.referrals.count()

    @property
    def referral_points_earned(self):
        return self.referrals.count() * 100

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.username} ({self.role})"
    


class Suggestion(models.Model):
    user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suggestions')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Suggestion de {self.user.username} — {self.subject}"
    
class Message(models.Model):
    sender    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content   = models.TextField()
    is_read   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} → {self.recipient.username}"


class PushSubscription(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.TextField(unique=True)
    p256dh   = models.TextField()
    auth     = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'endpoint']

    def __str__(self):
        return f"PushSub — {self.user.username}"


class ProducerProfile(models.Model):
    user        = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='producer_profile'
    )
    bio         = models.TextField(blank=True)
    workshop_video = models.FileField(
        upload_to='producer_videos/',
        blank=True, null=True,
        help_text='Vidéo de fabrication — 30 secondes max'
    )
    workshop_photo = models.ImageField(
        upload_to='producer_photos/',
        blank=True, null=True
    )
    years_experience = models.PositiveIntegerField(default=0)
    speciality  = models.CharField(max_length=200, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profil artisan — {self.user.username}"