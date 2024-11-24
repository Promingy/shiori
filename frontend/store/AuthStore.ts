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
    hasRefreshed: false,
    signup: async (first_name: string, last_name: string, email: string, password: string) => {
        set({isLoading: true, error: null});

        const requestOptions: RequestOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify({first_name, last_name, email, password}),
        }


        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/signup/`, requestOptions);

            if (res.ok){
                const data = await res.json();

                localStorage.setItem('token', data.access)
                localStorage.setItem('refresh', data.refresh)

                set({user: data.user});
            }
        }

        catch (error) {
            console.error("Error Signing Up:", error);
        }

        finally {
            set({isLoading: false});
        }

    },
    login: async (email: string, password: string) => {
        set({isLoading: true, error: null});

        const requestOptions: RequestOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify({email, password}),
        }

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/login/`, requestOptions);

            if (res.ok){
                const data = await res.json();

                localStorage.setItem('token', data.access)
                localStorage.setItem('refresh', data.refresh)

                set({user: data.user});
            }
        }

        catch (error) {
            console.error("Error Logging In:", error);
        }

        finally {
            set({isLoading: false});
        }
    },
    logout: async () => {
        const requestOptions: RequestOptions = {
            method: 'POST',
            headers,
            credentials: 'include',
        }

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/logout/`, requestOptions);

            if (res.ok) {
                set({user: null});

                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
            }
        }

        catch (error) {
            console.error("Error Logging Out:", error);
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
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/user/`, requestOptions);

            if (res.ok) {
                const data = await res.json();
                set({user: data});
            }

            else if (res.status === 401) {
                // only refresh token once
                const hasRefreshed = get().hasRefreshed || false;

                if (!hasRefreshed) {
                    set({hasRefreshed: true})
                    await get().tokenRefresh();
                    await get().getUser();
                }

                else {
                    get().logout();
                    console.error("Unauthorized; Logging out after failed retry.");
                }
            }

            else {
                console.error(`Error Fetching User: ${res.status}`);
            }
        }

        catch (error) {
            get().logout();
            console.error("Error Fetching User, Logging Out:", error);
        }

        finally {
            set({isLoading: false});
        }
    },
    tokenRefresh: async () => {
        set({isLoading: true, error: null});

        const refresh = localStorage.getItem('refresh');
        if (!refresh) return;

        const requestOptions: RequestOptions = {
            method: 'POST',
            headers: {
                ...headers,
            },
            body: JSON.stringify({refresh}),
        }

        try {
            const rest = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/token/refresh/`, requestOptions);

            if (rest.ok) {
                const data = await rest.json();

                localStorage.setItem('token', data.access)

                set({user: data.user});
            }

            else {
                get().logout;
            }
        }

        catch (error) {
            console.error("Error Refreshing Token:'", error);
        }

        finally {
            set({isLoading: false});
        }

    }
}))
