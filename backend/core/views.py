from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
# from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, CreateAPIView
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.views import View
from django.http import JsonResponse
from django.middleware.csrf import get_token
from .models import *
from .serializers import *
import random
from fsrs import Card as fCard, Rating, FSRS

f = FSRS()

# Create your views here.
class CsrfTokenView(View):
    def get(self, request, *args, **kwargs):
        """
        Returns the CSRF Token to the frontend as JSON
        """
        csrf_token = get_token(request)
        print('csrf_token', csrf_token)
        return JsonResponse({"csrfToken": csrf_token})

class Signup(CreateAPIView):
    serializer_class = ProfileSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a user, profile, 
        """

        try:
            user = User.objects.create_user(
                first_name=request.data["first_name"],
                last_name=request.data["last_name"],
                email = request.data["email"],
                username=request.data["email"],                
                password=request.data["password"],
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        profile_serializer = ProfileSerializer(data={"user": user}, context={"user": user})

        user = authenticate(username=user.username, password=request.data["password"])

        login(request, user)

        if profile_serializer.is_valid():
            profile = profile_serializer.save()
            
            return Response(profile_serializer.data['user'], status=status.HTTP_201_CREATED)
        
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RandomCard(RetrieveUpdateAPIView):
    def get(self, request):
        user = request.user
        profile = get_object_or_404(Profile, user=user)

        if profile.new_cards_today >= profile.daily_new_cards:
            return Response({"message": "No more cards to learn today"}, status=status.HTTP_200_OK)

        # Get all cards
        cards = Card.objects.all()

        if not cards:
            return Response({"error": "No Cards found"}, status=status.HTTP_404_NOT_FOUND)
        
        # pick a random card
        # random_card = cards.order_by('?').first()
        random_card = random.choice(cards)

        #  Get the notes corresponding to the card
        notes = Note.objects.filter(note_id=random_card.note.note_id)

        # Serialize the data
        card_serializer = CardsSerializer(random_card)
        notes_serializer = NotesSerializer(notes, many=True)

        data = {
            "card": card_serializer.data,
            "notes": notes_serializer.data
        }

        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user



        # Test response
        return Response({"message": "Success"}, status=status.HTTP_200_OK)
        pass