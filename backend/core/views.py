from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, CreateAPIView, RetrieveAPIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User, AnonymousUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, get_object_or_404
from fsrs import FSRS, Rating, Card as f_card
from datetime import datetime, timezone, date, timedelta
from rest_framework.response import Response
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework import status
from django.views import View
from .serializers import *
from .models import *
import random

f = FSRS()

# Create your views here.

class GetUser(RetrieveAPIView):
    serializer_class = UserSerializer
    # permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user


        # if not user.is_authenticated:
        #     return Response({"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        
        authenticate(username=request.data["email"], password=request.data["password"])

        profile_serializer = ProfileSerializer(data={"user": user}, context={"user": user})

        if profile_serializer.is_valid():
            profile = profile_serializer.save()

            # Generate Token
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user' : profile_serializer.data['user']
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Login(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(username=email, password=password)

        # profile = Profile.objects.get(user=user)

        # if profile is not None and date.today() > profile.last_card_reset:
        #     profile.new_cards_today = 0
        #     profile.last_card_reset = date.today()
        #     profile.save()

        if user is not None:
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user' : UserSerializer(user).data
            }

            
            return Response(token_data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class Logout(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

class RandomCard(RetrieveUpdateAPIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user

        if isinstance(user, AnonymousUser) :
            return Response(self.get_random_card_limited(), status=status.HTTP_200_OK) 


        profile = get_object_or_404(Profile, user=user)

        # Get due review cards for the user
        #__lte is less than or equal
        due_review_cards = ReviewCard.objects.filter(user=user, due__lte=datetime.now(timezone.utc)) 

        # Decide randomly whether to pick a review card or a new card
        pick_review_card = random.choice([True, False])

        if (pick_review_card or profile.new_cards_today >= profile.daily_new_cards) and due_review_cards.exists():
            # Pick a random due review card
            random_card = random.choice(due_review_cards)
        else:
            if profile.new_cards_today >= profile.daily_new_cards:
                return Response({"message": "No more cards to learn today"}, status=status.HTTP_200_OK)

            profile.new_cards_today += 1
            profile.save()

            # Get all new cards
            reviewed_card_ids = ReviewCard.objects.filter(user=user).values_list('id', flat=True)
            new_cards = Card.objects.exclude(id__in=reviewed_card_ids)

            if not new_cards:
                return Response({"error": "No Cards found"}, status=status.HTTP_404_NOT_FOUND)

            # Pick a random new card
            random_card = random.choice(new_cards)

        # Get the notes corresponding to the card
        notes = Note.objects.filter(id=random_card.id)

        data = self.serialize_card_and_notes(random_card, notes, profile)
        data.update({
            "new_cards_left": profile.daily_new_cards - profile.new_cards_today,
            "review_cards_left": len(due_review_cards)
        })

        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user

        if isinstance(user, AnonymousUser):
            return Response(self.get_random_card_limited(), status=status.HTTP_200_OK)

        new_card = self.get(request).data
        
        try:
            card_reviewed = ReviewCard.objects.get(id=request.data['id'])
            card = f_card.from_dict(card_reviewed)
        except Exception as e:
            card_reviewed = Card.objects.get(id=request.data['id'])
            card = f_card(card_reviewed)

        card_level = request.data['level']
        rating = Rating[card_level]
        card, review_log = f.review_card(card, rating)

        # this sets the card to be available for review immediately instead of 
        # having to come back to the app after a few minutes/hours
        if card.due.date() == datetime.now(timezone.utc).date():
            card.due = card.due - timedelta(minutes=30)

        # # Create Review Card from the card
        review_card = ReviewCard.objects.update_or_create(
            id=card_reviewed.id,
            defaults={
                "user" : user,
                "card_id" : card_reviewed.card_id,
                "note" : card_reviewed.note,
                "deck" : card_reviewed.deck,
                "due" : card.due,
                "stability" : card.stability,
                "difficulty" : card.difficulty,
                "elapsed_days" : card.elapsed_days,
                "scheduled_days" : card.scheduled_days,
                "reps" : card.reps,
                "lapses" : card.lapses,
                "state" : card.state,
                "last_review" : card.last_review
            }
        )

        return Response(new_card, status=status.HTTP_200_OK)

    def get_random_card_limited(self):
        """
        Fetch a random card for anonymous users.
        """
        cards = Card.objects.all()

        if not cards.exists():
            return {"message": "No cards available."}

        random_card = random.choice(cards)
        notes = Note.objects.filter(id=random_card.note.id)

        return self.serialize_card_and_notes(random_card, notes)
    
    def serialize_card_and_notes(self, card, notes, profile=None):
        """
        Helper method to serialize card and notes data.
        """

        serialized_card = CardSerializer(card)
        serialized_notes = NotesSerializer(notes, many=True)

        data = {
            "card": serialized_card.data,
            "notes": serialized_notes.data
        }

        # if profile:
        #     # data.update({
        #     #     "daily_new_cards": profile.daily_new_cards,
        #     #     "new_card_today": profile.new_cards_today
        #     # })
        
        return data