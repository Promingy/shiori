from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Deck(models.Model):
    name        = models.CharField(max_length=100)
    deck_id     = models.IntegerField()
    description = models.TextField(blank=True, null=True)

    
class Note(models.Model):
    note_id         = models.IntegerField()
    deck            = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="note")
    guid            = models.CharField(max_length=100, null=False, blank=False)
    model_id        = models.IntegerField(null=False, blank=False)
    modified        = models.IntegerField(null=False, blank=False)
    # Fields
    word            = models.CharField(max_length=100)
    word_in_kana    = models.CharField(max_length=100)
    definition      = models.TextField(blank=True, null=True)
    sentence_jp     = models.TextField(blank=True, null=True)
    sentence_en     = models.TextField(blank=True, null=True)
    word_img        = models.TextField(blank=True, null=True)
    word_audio      = models.TextField(blank=True, null=True)
    sentence_audio  = models.TextField(blank=True, null=True)

class Card(models.Model):
    card_id         = models.IntegerField()
    note            = models.ForeignKey(Note, on_delete=models.CASCADE, related_name="card")
    deck            = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="card")

class ReviewCard(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviewCard")
    card_id         = models.IntegerField()
    note            = models.ForeignKey(Note, on_delete=models.CASCADE, related_name="reviewCard")
    deck            = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="reviewCard")
    due             = models.DateTimeField(blank=True, null=True, db_index=True)  # Indexed for faster due date queries
    stability       = models.FloatField(default=0.0, null=True, blank=True)  # Nullable for imported cards
    difficulty      = models.FloatField(default=0.0, null=True, blank=True)  # Nullable for imported cards
    elapsed_days    = models.IntegerField(default=0, null=True, blank=True)
    scheduled_days  = models.IntegerField(default=0, null=True, blank=True)
    reps            = models.IntegerField(default=0, null=True, blank=True)
    lapses          = models.IntegerField(default=0, null=True, blank=True)
    state           = models.IntegerField(default=0, null=True, blank=True, db_index=True)  # Nullable and indexed for FSRS state
    last_review     = models.DateTimeField(blank=True, null=True)