import { create } from 'zustand';
import { FlashCards } from '@/types/FlashCards';

const headers = {'Content-Type': 'application/json',}

export const useCardStore = create<FlashCards>((set) => ({
    isLoading: false,
    error: null,
    randomCard: null,
    getRandomCard: async (card_id?: number, level?: string)=> {
        set({isLoading: true, error: null});

        try {
            const res = await fetch('http://localhost:8000/api/random_card/', {
                method: 'GET',
                headers,
            })
            if (res.ok) {
                const data = await res.json();
                set({randomCard: data});
            }
        } 

        catch (error: unknown) {
            if (error instanceof Error) {
                set({error: error.message});
            } else {
                set({error: 'An unknown error occurred.'});
            }
        } 

        finally {
            set({isLoading: false});
        }
    }
}))