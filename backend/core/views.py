from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.decorators import permission_classes
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from fsrs import FSRS, Rating, Card as f_card
from datetime import datetime, timezone, date, timedelta
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from user_auth.models import Profile
from .models import *
import random

f = FSRS()

# Create your views here.
class RandomCardView(RetrieveUpdateAPIView):
    # permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        user = request.user

        if user.is_anonymous:
            return Response(self.get_random_card_for_anonymous(), status=status.HTTP_200_OK)

        try:
            random_card, data = self.get_random_card_for_authenticated(user)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user

        if user.is_anonymous:
            return Response(self.get_random_card_for_anonymous(), status=status.HTTP_200_OK)

        try:
            updated_card_data = self.update_card_review(request, user, request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(updated_card_data, status=status.HTTP_200_OK)

    def get_random_card_for_anonymous(self):
        """
        Fetch a random card for anonymous users.
        """

        cards = Card.objects.all()

        if not cards.exists():
            return ValueError("No new cards available.")
            # return {"message": "No cards available."}

        random_card = random.choice(cards)
        notes = Note.objects.filter(id=random_card.note.id)

        return self.serialize_card_and_notes(random_card, notes)

    def get_random_card_for_authenticated(self, user):
        """
        Fetch a random card for authenticated users.
        """

        profile = get_object_or_404(Profile, user=user)
        due_review_cards = ReviewCard.objects.filter(user=user, due__lte=datetime.now(timezone.utc))

        # Decide if a review card should be selected
        pick_review_card = random.choice([True, False])
        new_cards_left = profile.daily_new_cards - profile.new_cards_today

        if due_review_cards.exists() and (pick_review_card or new_cards_left <= 0):
            return self.pick_random_card(due_review_cards, profile, len(due_review_cards))

        # Handle new cards
        if new_cards_left <= 0:
            raise ValueError("No more cards to learn today.")

        profile.new_cards_today += 1
        profile.save()

        reviewed_card_ids = ReviewCard.objects.filter(user=user).values_list("id", flat=True)
        new_cards = Card.objects.exclude(id__in=reviewed_card_ids)

        if not new_cards.exists():
            raise ValueError("No new cards found.")

        return self.pick_random_card(new_cards, profile, len(due_review_cards))

    def pick_random_card(self, cards, profile=None, review_cards_left=0):
        """
        Pick a random card and prepare its data.
        """

        random_card = random.choice(cards)
        notes = Note.objects.filter(id=random_card.note.id)

        data = self.serialize_card_and_notes(random_card, notes)

        if profile:
            data.update({
                "new_cards_left": profile.daily_new_cards - profile.new_cards_today,
                "review_cards_left": review_cards_left,
            })
        return random_card, data

    def update_card_review(self, request, user, data):
        """
        Update card review and return the updated card data.
        """

        try:
            card_reviewed = ReviewCard.objects.get(id=data['id'])
            # card = f_card.from_dict(card_reviewed)
            card = f_card(card_reviewed)
        except ReviewCard.DoesNotExist:
            card_reviewed = Card.objects.get(id=data['id'])
            card = f_card(card_reviewed)



        rating = Rating[data["level"]]
        card, review_log = f.review_card(card, rating)

        # Adjust due time
        if card.due.date() == datetime.now(timezone.utc).date():
            card.due -= timedelta(minutes=30)

        # Update or create ReviewCard
        ReviewCard.objects.update_or_create(
            id=card_reviewed.id,
            defaults={
                "user": user,
                "card_id": card_reviewed.card_id,
                "note": card_reviewed.note,
                "deck": card_reviewed.deck,
                "due": card.due,
                "stability": card.stability,
                "difficulty": card.difficulty,
                "elapsed_days": card.elapsed_days,
                "scheduled_days": card.scheduled_days,
                "reps": card.reps,
                "lapses": card.lapses,
                "state": card.state,
                "last_review": card.last_review,
            },
        )

        return self.get(request).data

    def serialize_card_and_notes(self, card, notes):
        """
        Helper method to serialize card and notes data.
        """

        serialized_card = CardSerializer(card)
        serialized_notes = NotesSerializer(notes, many=True)

        return {
            "card": serialized_card.data,
            "notes": serialized_notes.data,
        }