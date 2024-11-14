import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthState } from '@/types/Auth';


export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    signup: async (first_name, last_name, email, password) => {
        set({isLoading: true, error: null});

        const res = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({first_name, last_name, email, password}),
            credentials: 'include'
        });
        if (res.ok){
            const data = await res.json();
            set({user: data});
        }
        set({isLoading: false});
    },
    logout: async () => {
        const res = await fetch('http://localhost:8000/api/logout/', {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok){
            set({user: null});
        }
    },
    getUser: async () => {
        set({isLoading: true, error: null});
        const res = await fetch('http://localhost:8000/api/user/', {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok){
            const data = await res.json();
            set({user: data});
        }
        set({isLoading: false});
    }
}))