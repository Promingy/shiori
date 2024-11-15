from rest_framework import serializers
from .models import *

class DecksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ['id', 'name', 'description']

class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
                    'note_id', 
                    'model_id', 
                    'modified', 
                    'word', 
                    'word_in_kana', 
                    'definition', 
                    'sentence_jp', 
                    'sentence_en', 
                    'word_img', 
                    'word_audio', 
                    'sentence_audio', 
                ]


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id','card_id', 'note', 'deck']

class ReviewCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id','card_id', 'note', 'deck', 'due', 'stability', 'difficulty', 'elapsed_days', 'scheduled_days', 'reps', 'lapses', 'state', 'last_review']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'user', 'daily_new_cards', 'new_cards_today']
    
    def create(self, validated_data):
        user = self.context['user']
        return Profile.objects.create(user=user)