import os
import django
from django.core.manage.base import BaseCommand
from core.models import Profile
from datetime import datetime, timezone

class Command(BaseCommand):
    help = 'Resets users new_cards_today to 0'

    def handle(self, *args, **kwargs):
        profiles = Profile.objects.all()
        now=datetime.now(timezone.utc)

        if (date.today > profile.last_card_reset) or (now.hour == 0 and now.minute == 0):
            for profile in profiles:
                profile.new_cards_today = 0
                profile.save()
                
        self.stdout.write(self.style.SUCCESS('Successfully reset new_cards_today for all users'))