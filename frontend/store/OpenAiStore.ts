import { create } from 'zustand';
import { OpenAiStore } from '@/types/OpenAI';
import { RequestOptions } from '@/types/Auth';
import WebSocket from 'isomorphic-ws'

const AUTHENTICATED = 'authentication_successful';
const UNAUTHENTICATED = 'authentication_failed';
const TRANSCRIPT_DONE = 'response.audio_transcript.done';
const AUDIO_DELTA = 'response.audio.delta';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_AI_API_KEY}`
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
        const ws = new WebSocket(`${process.env.EXPO_PUBLIC_WS_URL}/japanese/`);
                
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

                // switch (data.type) {
                //     case AUTHENTICATED:{
                //         console.log('Successfully authenticated WebSocket');
                //         set({ authenticated: true });
                //     }
                //     case UNAUTHENTICATED: {
                //         console.error('WebSocket authentication failed');
                //         get().cleanup();
                //     }
                //     case TRANSCRIPT_DONE:{
                //         set({transcript: data.transcript})
                //     }
                //     case AUDIO_DELTA:{
                //         set({receivedAudio: [...get().receivedAudio, data.delta]})
                //     }
                //     default:{

                //     }
                // }

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
    sendMessage: async (content: string) => {
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
    },

    sendAudio: async (base64Audio: string) => {
        const ws = get().ws;
        const authenticated = get().authenticated
        set({transcript: null, receivedAudio: []})

        if (!ws || !authenticated) {
            console.error('WebSocket not connected or authenticated');
            return;
        }

        ws.send(JSON.stringify({
            type: 'input_audio',
            content: base64Audio
        }))
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