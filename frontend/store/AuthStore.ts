import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthState, RequestOptions } from '@/types/Auth';

const headers = {
    'Content-Type': 'application/json',
}


export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,
    signup: async (first_name, last_name, email, password) => {
        set({isLoading: true, error: null});

        const res = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers,
            body: JSON.stringify({first_name, last_name, email, password}),
        });
        if (res.ok){
            const data = await res.json();

            localStorage.setItem('token', data.access)
            localStorage.setItem('refresh', data.refresh)

            set({user: data.user});
        }
        set({isLoading: false});
    },
    logout: async () => {
        const res = await fetch('http://localhost:8000/api/logout/', {
            method: 'POST',
        });
        if (res.ok){
            set({user: null});
        }
    },
    getUser: async () => {
        set({isLoading: true, error: null});

        const token = localStorage.getItem('token');

        const requestOptions: RequestOptions = {
            method: 'GET',
            headers: {
                ...headers, 
                'Authorization': `Bearer ${token}`
            },
        }


        try {
            const res = await fetch('http://localhost:8000/api/user/', requestOptions);
    
            if (res.ok){
                const data = await res.json();
                set({user: data});
            } else if (res.status === 401){
                get().tokenRefresh();
            }
        } 

        catch (error) {
            get().logout;
        } 

        finally{
            set({isLoading: false});
        }
    },
    tokenRefresh: async () => {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) return;

        const requestOptions: RequestOptions = {
            method: 'GET',
            headers,
            body: JSON.stringify({refresh}),
        }

        const rest = await fetch('http://localhost:8000/api/token/refresh/', requestOptions);
        
        if (rest.ok){
            const data = await rest.json();

            localStorage.setItem('token', data.access)
            
            set({user: data.user});
        } else{
            get().logout;
        }
    }
}))