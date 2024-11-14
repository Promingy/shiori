import { create } from 'zustand';
import { FlashCards } from '@/types/FlashCards';
import { RequestOptions } from '@/types/Auth';

const headers = {
    'Content-Type': 'application/json',
};
export const useCardStore = create<FlashCards>((set) => ({
    isLoading: false,
    error: null,
    randomCard: null,
    getRandomCard: async (method='GET', card_id?: number, level?: string)=> {
        set({isLoading: true, error: null});    

        const requestOptions: RequestOptions = {
            method,
            headers,
        }

        if (method == "PUT") {
            requestOptions.body = JSON.stringify({card_id, level})
        }
        
        try {
            const res = await fetch('http://localhost:8000/api/random_card/', requestOptions)
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