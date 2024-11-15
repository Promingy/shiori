import { create } from 'zustand';
import { FlashCards } from '@/types/FlashCards';
import { RequestOptions } from '@/types/Auth';
import { API } from '@env';

const headers = {
    'Content-Type': 'application/json',
};
export const useCardStore = create<FlashCards>((set) => ({
    isLoading: false,
    error: null,
    randomCard: null,
    getRandomCard: async (method='GET', id?: number, level?: string)=> {
        set({isLoading: true, error: null});

        const token = localStorage.getItem('token');

        const requestOptions: RequestOptions = {
            method,
            headers: {
                ...headers,
                'Authorization': `Bearer ${token}`,
            },
        }

        if (method == "PUT") {
            requestOptions.body = JSON.stringify({id, level})
        }
        
        try {
            const res = await fetch(`${API}/random_card/`, requestOptions)
            
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