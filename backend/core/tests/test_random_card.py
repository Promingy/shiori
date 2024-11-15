from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from core.models import Profile, Card, ReviewCard, Note, Deck
from rest_framework_simplejwt.tokens import RefreshToken
from core.views import RandomCard
from django.urls import reverse
from datetime import datetime, timezone as tz
from unittest.mock import patch
import random

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

        self.review_card1 = ReviewCard.objects.create(
                                                    user=self.user,
                                                    card_id=self.card1.id,
                                                    note=self.note1,
                                                    deck=self.deck,
                                                    due=datetime.now(tz.utc),
                                                    stability=0,
                                                    difficulty=0,
                                                    elapsed_days=0,
                                                    scheduled_days=0,
                                                    reps=0,
                                                    lapses=0,
                                                    state=0,
                                                    last_review=datetime.now(tz.utc),
                                                )
        self.review_card2 = ReviewCard.objects.create(
                                                    user=self.user,
                                                    card_id=self.card2.id,
                                                    note=self.note2,
                                                    deck=self.deck,
                                                    due=datetime.now(tz.utc),
                                                    stability=0,
                                                    difficulty=0,
                                                    elapsed_days=0,
                                                    scheduled_days=0,
                                                    reps=0,
                                                    lapses=0,
                                                    state=0,
                                                    last_review=datetime.now(tz.utc),
                                                )
        
        
        # Set up the client
        self.client = APIClient()
        self.client.login(username='testuser', password='testpassword')

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    def test_get_random_review_card(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        
        # Mock random.choice to avoid real randomness in test
        with self.settings(RANDOM_CHOICE=lambda x: x[0]):
            response = self.client.get(reverse('random_card'))
            
            # Ensure the response is OK
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Ensure the response contains both "card" and "notes"
            self.assertIn('card', response.data)
            self.assertIn('notes', response.data)
            
            # Assert that the response contains either of the two review cards, not just the first one
            card_id = response.data['card']['id']
            self.assertIn(card_id, [self.review_card1.id, self.review_card2.id])



    from unittest.mock import patch

    def test_get_random_new_card(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        # Mock random.choice to always pick a new card (second element in the list)
        with patch('random.choice', side_effect=[self.review_card1, self.card2]):
            response = self.client.get(reverse('random_card'))

            # Ensure the response is OK
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Ensure the response contains both "card" and "notes"
            self.assertIn('card', response.data)
            self.assertIn('notes', response.data)
            
            # Check if the returned card is indeed the new card (card2)
            self.assertEqual(response.data['card']['id'], self.card2.id)
            
            # Verify that the profile's new_cards_today has been incremented
            self.profile.refresh_from_db()
            self.assertEqual(self.profile.new_cards_today, 1)


    def test_no_more_new_cards_today(self):
        self.profile.new_cards_today = self.profile.daily_new_cards
        self.profile.save()
        response = self.client.get('/random-card/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "No more cards to learn today")

    # def test_no_cards_found(self):
    #     Card.objects.all().delete()
    #     ReviewCard.objects.all().delete()
    #     response = self.client.get('/random-card/')
    #     self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    #     self.assertEqual(response.data['error'], "No Cards found")

    # def test_put_review_card(self):
    #     data = {
    #         'id': self.review_card1.id,
    #         'level': 'EASY'
    #     }
    #     response = self.client.put('/random-card/', data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.review_card1.refresh_from_db()
    #     self.assertEqual(self.review_card1.state, 'REVIEWED')

    # def test_put_new_card(self):
    #     data = {
    #         'id': self.card1.id,
    #         'level': 'EASY'
    #     }
    #     response = self.client.put('/random-card/', data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     review_card = ReviewCard.objects.get(card_id=self.card1.id)
    #     self.assertEqual(review_card.state, 'REVIEWED')
