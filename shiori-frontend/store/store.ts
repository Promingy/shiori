import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthState {
    user: {} | null;
    isLoading: boolean;
    error: string | null;
    signup: (
        first_name: string,
        last_name: string,
        email: string,
        password: string
    ) => Promise<void>;
    randomCard: any | null;
    getRandomCard: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    signup: async (first_name, last_name, email, password) => {
        set({isLoading: true, error: null});

        const res = await fetch('http://localhost:8000/api/signup/', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
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
            const res = await fetch('http://localhost:8000/api/random_card/');
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

// export const useAuthStore = create<AuthState>(() => ({
//     signup: async (firstName, lastName, email, password) => {
//     try {
//         const response = await fetch('http://localhost:8000/api/signup/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             first_name: firstName,
//             last_name: lastName,
//             email,
//             password,
//         }),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             alert(`Signup Success: Welcome, ${data.first_name}!`);
//         } else {
//             const errorData = await response.json();
//             alert(`Signup Failed: ${errorData.message || 'An error occurred'}`);
//         }
//     } catch (error) {
//         alert('Network Error: Please try again later');
//     }
//     },
// }));