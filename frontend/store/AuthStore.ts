import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthState } from '@/types/Auth';

const headers = {'Content-Type': 'application/json',}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    signup: async (first_name, last_name, email, password) => {
        set({isLoading: true, error: null});

        const res = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers,
            body: JSON.stringify({first_name, last_name, email, password})
        });
        if (res.ok){
            const data = await res.json();
            set({user: data});
        }
        set({isLoading: false});
    },
    randomCard: null,
    getRandomCard: async () => {
        set({isLoading: true, error: null});

        try {
            // const res = await fetch('http://localhost:8000/api/random_card/', {
            //     method: 'GET',
            //     headers,
            //     body: JSON.stringify({})
            // });
            const res = await fetch('http://localhost:8000/api/random_card/', {
                method: 'GET',
                headers,
            });
            if (res.ok){
                const data = await res.json();
                set({randomCard: data});
            }
    
        } catch{
            
        }
        finally {
            set({isLoading: false});
        }

    }
}))