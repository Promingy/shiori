from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from core.models import Card, ReviewCard, Note, Deck
from user_auth.models import Profile
from rest_framework_simplejwt.tokens import RefreshToken
from core.views import RandomCardView
from django.urls import reverse
from datetime import datetime, timedelta, timezone as tz
from unittest.mock import patch
import random

# States
    # 0: New
    # 1: Learning
    # 2: Review
    # 3: Relearning

# Rating
    # 1: Again
    # 2: Hard
    # 3: Good
    # 4: Easy

class RandomCardTestCase(TestCase):
    def setUp(self):
        # Create a user and profile
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.profile = Profile.objects.create(user=self.user, daily_new_cards=5, new_cards_today=0)
        
        # Create some cards and review cards
        self.deck = Deck.objects.create(id=1, deck_id=1, name="Test Deck")
        # Create notes
        self.note1 = Note.objects.create(
                note_id=1,
                model_id=1,
                modified=1,
                deck=self.deck,
                word="word1",
                word_in_kana="kana1",
                definition="definition1",
                sentence_jp="sentence_jp1",
                sentence_en="sentence_en1",
                word_img="word_img1",
                word_audio="word_audio1",
                sentence_audio="sentence_audio1",
            )
        self.note2 = Note.objects.create(
                note_id=2,
                model_id=2,
                modified=2,
                deck=self.deck,
                word="word2",
                word_in_kana="kana2",
                definition="definition2",
                sentence_jp="sentence_jp2",
                sentence_en="sentence_en2",
                word_img="word_img2",
                word_audio="word_audio2",
                sentence_audio="sentence_audio2",
            )


        self.card1 = Card.objects.create(note=self.note1, card_id=1, deck=self.deck)
        self.card2 = Card.objects.create(note=self.note2, card_id=2, deck=self.deck)
        self.card3 = Card.objects.create(id=3, note=self.note2, card_id=3, deck=self.deck)
        self.card4 = Card.objects.create(id=4, note=self.note2, card_id=4, deck=self.deck)
        self.card5 = Card.objects.create(id=5, note=self.note2, card_id=5, deck=self.deck)


        self.now = datetime.now(tz.utc)
        # Past due date card
        self.past_due_card = ReviewCard.objects.create(
            user=self.user,
            card_id=self.card1.id,
            note=self.note1,
            deck=self.deck,
            due=self.now - timedelta(days=1),
            stability=0,
            difficulty=0,
            elapsed_days=0,
            scheduled_days=0,
            reps=0,
            lapses=0,
            state=0,
            last_review=self.now - timedelta(days=15),
        )
        
        # Current due date card
        self.current_due_card = ReviewCard.objects.create(
            user=self.user,
            card_id=self.card2.id,
            note=self.note2,
            deck=self.deck,
            due=self.now,
            stability=0,
            difficulty=0,
            elapsed_days=0,
            scheduled_days=0,
            reps=0,
            lapses=0,
            state=0,
            last_review=self.now - timedelta(days=1),
        )
        
        # Future due date card
        self.future_due_card = ReviewCard.objects.create(
            user=self.user,
            card_id=self.card2.id,
            note=self.note2,
            deck=self.deck,
            due=self.now + timedelta(days=1),
            stability=0,
            difficulty=0,
            elapsed_days=0,
            scheduled_days=0,
            reps=0,
            lapses=0,
            state=0,
            last_review=self.now,
        )
        
        
        # Set up the client
        self.client = APIClient()

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)


    @patch('random.choice')
    def test_get_random_review_card(self, mock_random_choice):
        # Simulate pick_review_card being True or False randomly
        mock_random_choice.side_effect = lambda x: x[0]  # Mock to always pick the first item
        
        response = self.client.get(reverse('random_card'))
        # Ensure the response is OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Ensure the response contains both "card" and "notes"
        self.assertIn('card', response.data)
        self.assertIn('notes', response.data)
        
        # Assert that the response contains either of the two due review cards, not just the first one
        card_id = response.data['card']['id']
        self.assertIn(card_id, [self.past_due_card.id, self.current_due_card.id])





    @patch('random.choice')
    def test_get_random_new_card(self, mock_random_choice):

            mock_random_choice.side_effect = lambda x: x[1]  # Mock to always pick the second item


        # Mock random.choice to always pick a new card (second element in the list)
        # with patch('random.choice', side_effect=[self.past_due_card, self.card2]):
            response = self.client.get(reverse('random_card'))

            # Ensure the response is OK
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Ensure the response contains both "card" and "notes"
            self.assertIn('card', response.data)
            self.assertIn('notes', response.data)
            
            # Check if the returned card is indeed the new card (card2)
            self.assertEqual(response.data['card']['id'], self.card5.id)
            
            # Verify that the profile's new_cards_today has been incremented
            self.profile.refresh_from_db()
            self.assertEqual(self.profile.new_cards_today, 1)


    def test_no_more_new_cards_today(self):
        self.profile.new_cards_today = self.profile.daily_new_cards
        self.profile.save()
        #update due cards to not be due
        self.past_due_card.due = datetime.now(tz.utc) + timedelta(days=30)
        self.current_due_card.due = datetime.now(tz.utc) + timedelta(days=30)

        self.past_due_card.save()
        self.current_due_card.save()
        
        response = self.client.get(reverse('random_card'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "No more cards to learn today.")

    def test_no_cards_found(self):
        Card.objects.all().delete()
        ReviewCard.objects.all().delete()
        response = self.client.get(reverse('random_card'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "No new cards found.")

    def test_put_review_card(self):
        data = {
            'id': self.past_due_card.id,
            'level': 'Easy'
        }
        response = self.client.put(reverse('random_card'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.past_due_card.refresh_from_db()
        self.assertEqual(self.past_due_card.state, 2)

    def test_put_new_card(self):
        data = {
            'id': self.card1.id,
            'level': 'Easy'
        }
        response = self.client.put(reverse('random_card'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review_card = ReviewCard.objects.get(card_id=self.card1.id)
        self.assertEqual(review_card.state, 2)

    def test_query_review_cards_due_now(self):
        # Query for review cards due now / past due (using explicit UTC time)
        due_review_cards = ReviewCard.objects.filter(user=self.user, due__lte=self.now)

        # Assert that cards that are due / past due now are returned
        self.assertEqual(due_review_cards.count(), 2)
        self.assertIn(self.current_due_card, due_review_cards)
        self.assertIn(self.past_due_card, due_review_cards)
        self.assertNotIn(self.future_due_card, due_review_cards)