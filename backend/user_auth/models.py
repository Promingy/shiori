from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, timezone

# Create your models here.
class Profile(models.Model):
    user            = models.OneToOneField(User, on_delete=models.CASCADE)
    is_activated    = models.BooleanField(default=False)
    daily_new_cards = models.IntegerField(default=30)
    new_cards_today = models.IntegerField(default=1)
    last_card_reset = models.DateTimeField(default=datetime.now(timezone.utc))