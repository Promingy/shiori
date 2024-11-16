import os
import django
from django.core.management.base import BaseCommand
from user_auth.models import Profile
from datetime import datetime, timezone
from django.utils.timezone import now

class Command(BaseCommand):
    help = 'Resets users new_cards_today to 0'

    def handle(self, *args, **kwargs):
        profiles = Profile.objects.all()
        curr_time=datetime.now(timezone.utc)

        curr_day = curr_time.day
        curr_month = curr_time.month
        curr_year = curr_time.year        

        #/ this is going to be set up with chron jobs
        #/ the checking date logic really isn't needed since we want to 
        #/ reset everyones card reviews daily anyway
        
        for profile in profiles:
            profile_time = profile.last_card_reset

            prof_day = profile_time.day
            prof_month = profile_time.month
            prof_year = profile_time.year

            if (
                curr_day > prof_day or
                curr_month > prof_month or
                curr_year > prof_year
            ):
                profile.new_cards_today = 1
                profile.last_card_reset = curr_time
                profile.save()
                
        self.stdout.write(self.style.SUCCESS('Successfully reset new_cards_today for all users'))