from django.core.management.base import BaseCommand
from core.models import Deck, Note, Card
from core.helper_functions.apkg_reader import APKGReader

class Command(BaseCommand):
    help = 'Import an APKG file into the database'


    def handle(self, *args, **kwargs):
        apkg_path = "../../helper_functions/core23.apkg"

        # Read the APKG file using APKGReader
        with APKGReader(apkg_path) as reader:
            # Process Decks
            for deck_id, deck_data in reader.get_all_decks().items():
                deck = Deck.objects.create(
                    deck_id=deck_data['id'],
                    name=deck_data['name'],
                )
            
                for note_id, note_data in reader.get_all_notes().items():
                    note = Note.objects.create(
                        note_id=note_data['id'],
                        guid=note_data['guid'],
                        model_id=note_data['model_id'],
                        modified=note_data['modified'],
                        fields=note_data['fields'],
                        tags=note_data['tags'],
                        deck=deck
                    )

                    for card_id, card_data in reader.get_cards_for_note(note_id):
                        Card.objects.create(
                            note=note,
                            deck=deck,
                            order=card_data['order'],
                            type=card_data['type'],
                            queue=card_data['queue'],
                            due=card_data['due']
                        )
                        
        self.stdout.write(self.style.SUCCESS('Successfully imported APKG file'))


