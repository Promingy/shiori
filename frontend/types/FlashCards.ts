// Types
type getRandomCard = (card_id?: number, level?: string) => Promise<void>

// Interfaces
interface note {
    id: number;
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

interface card{
    id: number;
    note: number;
    deck: number;
    type: number;
    order: number;
    queue: number;
    due: number;
}

interface randomCard {
    card: card;
    notes: note[];

}

export interface FlashCards {
    isLoading: boolean;
    error: string | null;
    randomCard: randomCard | null;
    getRandomCard: getRandomCard;
}