import { create } from 'zustand';
import { FlashCards } from '@/types/FlashCards';
import { RequestOptions } from '@/types/Auth';
import { useAuthStore } from './AuthStore';

const headers = {
    'Content-Type': 'application/json',
};
export const useCardStore = create<FlashCards>((set) => ({
    isLoading: false,
    error: null,
    randomCard: null,
    getRandomCard: async (method='GET', id?: number, level?: string)=> {
        set({isLoading: true, error: null});
        const { user } = useAuthStore.getState();

        const token = localStorage.getItem('token');

        const requestOptions: RequestOptions = {
            method,
            headers: {
                ...headers,
                // 'Authorization': `Bearer ${token}`,
            },
        }

        if (user) {
            requestOptions.headers = {
                ...headers,
                'Authorization': `Bearer ${token}`,
            }
        }

        if (method == "PUT") {
            requestOptions.body = JSON.stringify({id, level})
        }

        try {
            console.log('TEST', process.env.EXPO_PUBLIC_BASE_URL)
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/random_card/`, requestOptions)
            const data = await res.json();

            if (res.ok) {
                set({randomCard: data});
            }
            else {
                // console.log(data)
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
