from rest_framework import serializers
from .models import *

class DecksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ['id', 'name', 'description']

class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'guid', 'model_id', 'modified', 'fields', 'tags']


class CardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'note', 'deck', 'type', 'order', 'queue', 'due']


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'user']
    
    def create(self, validated_data):
        user = self.context['user']
        return Profile.objects.create(user=user)