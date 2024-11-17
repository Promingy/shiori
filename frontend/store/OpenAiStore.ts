import { create } from 'zustand';
import { BASE_URL, AI_API_KEY } from '@env';
import { OpenAiStore } from '@/types/OpenAI';
import { RequestOptions } from '@/types/Auth';
import WebSocket from 'isomorphic-ws'

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_API_KEY}`
};

const useAIStore = create<OpenAiStore>((set, get): OpenAiStore => ({
    hasSent: false,
    testRequest: async (content: string) => {
        const hasSent = get().hasSent;

        // const token = localStorage.getItem('token');

        // const requestOptions: RequestOptions = {
        //     method: "GET",
        //     headers: {
        //         ...headers,
        //         "Authorization": `Bearer ${token}`
        //     },
        //     // body: JSON.stringify({content})
        // };

        const ws = new WebSocket('ws://localhost:8000/ws/japanese')



        if (!hasSent) {
            set({hasSent: true})

            try {
                // const res = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
                // const res = await fetch(`${BASE_URL}/chat/test/`, requestOptions)

                // if (res.ok) {
                //     const data = res.json();


                // };
            }

            catch {

            }

            finally {

            }
        }
    }
}))

export default useAIStore