import { create } from 'zustand';
import { FlashCards } from '@/types/FlashCards';

const headers = new Headers({
    'Content-Type': 'application/json',
});
export const useCardStore = create<FlashCards>((set) => ({
    isLoading: false,
    error: null,
    randomCard: null,
    getRandomCard: async (method='GET', card_id?: number, level?: string, csrf?: string)=> {
        set({isLoading: true, error: null});    

        const params: any = {
            method,
            headers,
            credentials: 'include'
        }

        if (method == "PUT") {
            params.body = JSON.stringify({card_id, level})
        }

        
        try {
            console.log(csrf)
            // const res = await fetch('http://localhost:8000/api/random_card/')
            const res = await fetch('http://localhost:8000/api/random_card/', params)
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