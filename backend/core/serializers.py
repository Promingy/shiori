from rest_framework import serializers
from .models import *

# class BookSerializer(serializers.ModelSerializer):
#     title            = serializers.CharField(max_length=100)
#     author           = serializers.CharField(max_length=100)
#     publication_date = serializers.DateField()

class DecksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decks
        fields = ['id', 'name', 'description']

class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = ['id', 'guid', 'model_id', 'modified', 'fields', 'tags']


class CardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cards
        fields = ['id', 'note', 'deck', 'type', 'order', 'queue', 'due']


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media

class ProfileSerializer(serializers.ModelSerializer):
    decks = DecksSerializer(many=True, read_only=True)
    notes = NotesSerializer(many=True, read_only=True)
    cards = CardsSerializer(many=True, read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'first_name', 'last_name', 'email']
        fields = '__all__'