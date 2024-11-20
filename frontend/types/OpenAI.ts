// Types
export type initializeWebsSocket = () => void

// Interfaces
export interface OpenAiStore {
    ws: any;
    authenticated: boolean;
    transcript: string | null;
    initializeWebSocket: initializeWebsSocket;
    receivedAudio: string[];
    sendAudio: (base64Audio: string) => Promise<void>;
    testRequest: (content: string) => Promise<void>;
    cleanup: () => void;
}
