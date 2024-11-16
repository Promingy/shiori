import { create } from 'zustand';
import { BASE_URL, OPENAI_API_KEY } from '@env';
import { OpenAiStore } from '@/types/OpenAI';
import { RequestOptions } from '@/types/Auth';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
};

const useAIStore = create<OpenAiStore>((set, get): OpenAiStore => ({
    hasSent: false,
    testRequest: async (content: string) => {
        const hasSent = get().hasSent;

        const requestOptions: RequestOptions = {
            method: "POST",
            headers,
            // body: JSON.stringify({content})
        };

        console.log('test', content)

        if (!hasSent) {
            set({hasSent: true})

            try {
                // const res = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
                const res = await fetch(`${BASE_URL}/api/chat/test/`, requestOptions)

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