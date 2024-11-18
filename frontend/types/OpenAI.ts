// Types
export type initializeWebsSocket = () => void

// Interfaces
export interface OpenAiStore {
    ws: any;
    authenticated: boolean;
    transcript: string[]
    initializeWebSocket: initializeWebsSocket;
    testRequest: (content: string) => Promise<void>;
    cleanup: () => void;
}
