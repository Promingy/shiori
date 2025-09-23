import { create } from 'zustand';
import { AuthState, RequestOptions } from '@/types/Auth';
import * as SecureStore from 'expo-secure-store';

const headers = {
    'Content-Type': 'application/json',
}


export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    hasRefreshed: false,
    setToken: async (token) => {
        try{
            await SecureStore.setItemAsync('token', token);
            set({ token });
        } catch (e) {
            console.error("Failed to save token: ", e)
        }
        
    },
    loadToken: async () => {
        try{
            const token = await SecureStore.getItemAsync('token');
            set({ token });
            return token;
        } catch (e) {
            console.error("Failed to load token: ", e);
            set({ token: null });
            return null;
        }
    },
    clearToken: async () => {
        try{
            await SecureStore.deleteItemAsync('token');
            set({ token: null });
        } catch (e) {
            console.error("Failed to delete token: ", e);
        }
    },
    setUser: (user) => set({ user }),
    signup: async (first_name: string, last_name: string, email: string, password: string) => {
        set({isLoading: true, error: null});

        const requestOptions: RequestOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify({first_name, last_name, email, password}),
        }


        try {
            console.log('also a test', process.env.EXPO_PUBLIC_BASE_URL)
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/signup/`, requestOptions);

            if (res.ok){
                const data = await res.json();
                console.log('Im a test')
                get().setToken(data.access);

                get().setUser(data.user);
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

                get().setToken(data.access);

                get().setUser(data.user);
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
                await get().clearToken();
            }
        }

        catch (error) {
            console.error("Error Logging Out:", error);
        }
    },
    getUser: async () => {
        set({isLoading: true, error: null});

        const token = await get().loadToken();

        const requestOptions: RequestOptions = {
            method: 'GET',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token}`
            },
        }

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/user/`, requestOptions);
            console.log('RESOLUTION', res)

            if (res.ok) {
                const data = await res.json();
                set({user: data});
                console.log('Fetched User Data:', data);
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

        const token = get().token;

        if (!token) return;

        const requestOptions: RequestOptions = {
            method: 'POST',
            headers: {
                ...headers,
            },
            body: JSON.stringify({refresh: token}),
        }

        try {
            const rest = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/auth/token/refresh/`, requestOptions);

            if (rest.ok) {
                const data = await rest.json();

                get().setToken(data.access);

                set({user: data.user});
            }

            else {
                get().logout();
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
