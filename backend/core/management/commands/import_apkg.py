from django.core.management.base import BaseCommand
from core.models import Deck, Note, Card
from core.helper_functions.apkg_reader import APKGReader
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Import an APKG file into the database'


    def handle(self, *args, **kwargs):
        apkg_path = os.path.join(settings.BASE_DIR, 'core', 'helper_functions', 'core23.apkg')
        # Read the APKG file using APKGReader
        with APKGReader(apkg_path) as reader:
            # Process Decks
            for deck_id, deck_data in reader.get_all_decks().items():
                deck = Deck.objects.create(
                    deck_id=deck_data['id'],
                    name=deck_data['name'],
                )
            
                for note_id, note_data in reader.get_all_notes().items():
                    #get fields and normalize data before adding it to the database
                    word = note_data['fields'][0]
                    word_in_kana = note_data['fields'][1]
                    definition = note_data['fields'][2]
                    sentence_jp = note_data['fields'][3]
                    sentence_en = note_data['fields'][4]
                    image = note_data['fields'][5]
                    word_audio = note_data['fields'][6]
                    sentence_audio = note_data['fields'][7]

                    if image: 
                        image = image.split('"')[1]

                    if word_audio:
                        word_audio = word_audio[7:-1]
                    
                    if sentence_audio:
                        sentence_audio = sentence_audio[7:-1]
                        
                    note = Note.objects.create(
                        note_id=note_data['id'],
                        guid=note_data['guid'],
                        model_id=note_data['model_id'],
                        modified=note_data['modified'],
                        word=word,
                        word_in_kana=word_in_kana,
                        definition=definition,
                        sentence_jp=sentence_jp,
                        sentence_en=sentence_en,
                        word_img=image,
                        word_audio=word_audio,
                        sentence_audio=sentence_audio,
                        tags=note_data['tags'],
                        deck=deck
                    )

                    cards_for_note = reader.get_cards_for_note(note_id)

                    for card_data in cards_for_note:
                        Card.objects.create(
                            note=note,
                            deck=deck,
                            card_id=card_data['id'],
                            order=card_data['order'],
                            type=card_data['type'],
                            queue=card_data['queue'],
                            due=card_data['due']
                        )
                        
        self.stdout.write(self.style.SUCCESS('Successfully imported APKG file'))