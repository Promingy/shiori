import sqlite3
import zipfile
import os
import tempfile
import json
from typing import Dict, List, Optional, Tuple, Any

class APKGReader:
    def __init__(self, apkg_path: str):
        """
        Initialize the APKG reader with the path to the .apkg file
        
        Args:
            apkg_path (str): Path to the .apkg file
        """
        self.apkg_path = apkg_path
        self.temp_dir = None
        self.conn = None
        self._decks_cache = None
        self._notes_cache = {}
        self._cards_cache = {}

    def __enter__(self):
        """Set up the temporary directory and extract the database"""
        self.temp_dir = tempfile.mkdtemp()
        
        # Extract the .apkg file (which is a zip file)
        with zipfile.ZipFile(self.apkg_path, 'r') as zip_ref:
            zip_ref.extractall(self.temp_dir)
        
        # Connect to the main collection database
        collection_path = os.path.join(self.temp_dir, 'collection.anki2')
        self.conn = sqlite3.connect(collection_path)
        
        # Initialize caches
        self._init_caches()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up resources"""
        if self.conn:
            self.conn.close()
        if self.temp_dir and os.path.exists(self.temp_dir):
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)

    def _init_caches(self):
        """Initialize the internal caches for faster lookups"""
        # Cache all notes
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, guid, mid, mod, flds, tags FROM notes")
        for note in cursor.fetchall():
            self._notes_cache[note[0]] = {
                'id': note[0],
                'guid': note[1],
                'model_id': note[2],
                'modified': note[3],
                'fields': note[4].split('\x1f'),
                'tags': note[5].split(' ') if note[5] else []
            }

        # Cache all cards
        cursor.execute("SELECT id, nid, did, ord, type, queue, due FROM cards")
        for card in cursor.fetchall():
            self._cards_cache[card[0]] = {
                'id': card[0],
                'note_id': card[1],
                'deck_id': card[2],
                'order': card[3],
                'type': card[4],
                'queue': card[5],
                'due': card[6]
            }

        # Cache all decks
        cursor.execute("SELECT decks FROM col")
        decks_json = cursor.fetchone()[0]
        self._decks_cache = json.loads(decks_json)

    def get_deck(self, deck_id: int) -> Optional[Dict]:
        """Get a specific deck by ID"""
        return self._decks_cache.get(str(deck_id))

    def get_card(self, card_id: int) -> Optional[Dict]:
        """Get a specific card by ID"""
        return self._cards_cache.get(card_id)

    def get_note(self, note_id: int) -> Optional[Dict]:
        """Get a specific note by ID"""
        return self._notes_cache.get(note_id)

    def get_cards_for_note(self, note_id: int) -> List[Dict]:
        """Get all cards associated with a specific note"""
        return [card for card in self._cards_cache.values() if card['note_id'] == note_id]

    def get_cards_in_deck(self, deck_id: int) -> List[Dict]:
        """Get all cards in a specific deck"""
        return [card for card in self._cards_cache.values() if card['deck_id'] == deck_id]

    def get_note_for_card(self, card_id: int) -> Optional[Dict]:
        """Get the note associated with a specific card"""
        card = self.get_card(card_id)
        if card:
            return self.get_note(card['note_id'])
        return None

    def get_deck_for_card(self, card_id: int) -> Optional[Dict]:
        """Get the deck associated with a specific card"""
        card = self.get_card(card_id)
        if card:
            return self.get_deck(card['deck_id'])
        return None

    def search_notes(self, field_content: str) -> List[Dict]:
        """Search for notes containing specific content in their fields"""
        return [
            note for note in self._notes_cache.values()
            if any(field_content.lower() in field.lower() for field in note['fields'])
        ]

    def get_all_decks(self) -> Dict[str, Dict]:
        """Get all decks in the collection"""
        return self._decks_cache

    def get_all_cards(self) -> Dict[int, Dict]:
        """Get all cards in the collection"""
        return self._cards_cache

    def get_all_notes(self) -> Dict[int, Dict]:
        """Get all notes in the collection"""
        return self._notes_cache

    def get_media_files(self) -> Dict:
        """Get list of media files in the collection"""
        media_path = os.path.join(self.temp_dir, 'media')
        if os.path.exists(media_path):
            with open(media_path, 'r') as f:
                return json.load(f)
        return {}

with APKGReader('./core23.apkg') as reader:
    # Look up a specific card
    card = reader.get_card(1629930952678)
    
    if card:
        # Get the note this card belongs to
        note = reader.get_note_for_card(card['id'])
        
        # Get the deck this card is in
        deck = reader.get_deck_for_card(card['id'])
        
        # Get all cards from the same note
        related_cards = reader.get_cards_for_note(card['note_id'])
        
        # Get all cards in the same deck
        deck_cards = reader.get_cards_in_deck(card['deck_id'])
        
        # Search for notes containing specific content
        search_results = reader.search_notes("specific text")

        # Print the results
        # print(card)
        print(note)
        # print(deck)
        # print(related_cards)
        # print(deck_cards)

    # Get all decks
    decks = reader.get_all_decks()
    # print('decks', decks)

    # Get all cards
    cards = reader.get_all_cards()
    # print('cards', cards)
    
    # Get all notes
    notes = reader.get_all_notes()
    # print('notes', notes)