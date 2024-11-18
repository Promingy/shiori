import { create } from 'zustand';
import { BASE_URL, AI_API_KEY } from '@env';
import { OpenAiStore } from '@/types/OpenAI';
import { RequestOptions } from '@/types/Auth';
import WebSocket from 'isomorphic-ws'

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_API_KEY}`
};

const useAIStore = create<OpenAiStore>((set, get) => ({
    ws: null,
    authenticated: false,
    transcript: null,
    receivedAudio: [],
    initializeWebSocket: () => {
        console.log("Initializing websocket...");
        // Make sure any existing connection is closed
        const currentWs = get().ws;
        if (currentWs) {
            currentWs.close();
        }

        // Create new WebSocket connection
        const ws = new WebSocket('ws://localhost:8000/ws/japanese/');
        const newTranscript = get().transcript
        
        ws.onopen = () => {
            console.log('WebSocket connection established - attempting authentication');
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                ws.close();
                return;
            }

            ws.send(JSON.stringify({
                type: 'authenticate',
                token: token
            }));
        };

        ws.onmessage = (e: any) => {
            try {
                const data = JSON.parse(e.data);
                console.log('Received:', data);

                if (data.type === 'authentication_successful') {
                    console.log('Successfully authenticated WebSocket');
                    set({ authenticated: true });
                } 
                else if (data.type === 'authentication_failed') {
                    console.error('WebSocket authentication failed');
                    get().cleanup();
                }
                else if (data.type === 'response.audio_transcript.done'){
                    set({transcript: data.transcript})
                }
                else if (data.type === 'response.audio.delta'){
                    set({receivedAudio: [...get().receivedAudio, data.delta]})
                }
            } catch (error) {
                console.error(`Error parsing message:`, error);
            }
        };
        
        ws.onclose = (e: any) => {
            console.log('WebSocket disconnected:', e.code, e.reason);
            set({ authenticated: false, ws: null });
        };
        
        ws.onerror = (e: any) => {
            console.error('WebSocket error:', e);
            get().cleanup();
        };
        
        set({ ws });
    },    
    testRequest: async (content: string) => {
        const ws = get().ws;
        const authenticated = get().authenticated
        set({transcript: null, receivedAudio: []})

        if (!ws || !authenticated) {
            console.error('WebSocket not connected or authenticated');
            return;
        }

        ws.send(JSON.stringify({
            type: 'message',
            content: content
        }))
        
        // ws.send(JSON.stringify({
        //     type: 'conversation.item.create',
        //     item: {
        //         type: 'message',
        //         role: 'user',
        //         content: [{
        //             type: "input_text",
        //             text: content
        //         }]
        //     }
        // }));
        
        // // Send response.create to generate a response
        // ws.send(JSON.stringify({
        //     type: 'response.create'
        // }));
    },
    
    cleanup: () => {
        const ws = get().ws;
        if (ws) {
            console.log('Cleaning up Websocket connection...')
            ws.close();
            set({ ws: null, authenticated: false });
        }
    }
}));

export default useAIStore