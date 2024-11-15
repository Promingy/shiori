// Types
type GetRandomCard = (method?: "GET"| "PUT", id?: number, level?: string) => Promise<void>

// Interfaces
interface Note {
    note_id: number;
    model_id: number;
    modified: number;
    word: string;
    word_in_kana: string;
    definition: string;
    sentence_jp: string;
    sentence_en: string;
    word_img: string;
    word_audio: string;
    sentence_audio: string;
}

interface Card{
    id: number;
    card_id: number;
    note: number;
    deck: number;
}

export interface RandomCard {
    card: Card;
    notes: Note[];
    new_cards_left?: number;
    review_cards_left?: number;
    message?: string;
}

export interface FlashCards {
    isLoading: boolean;
    error: string | null;
    randomCard: RandomCard | null;
    getRandomCard: GetRandomCard;
}