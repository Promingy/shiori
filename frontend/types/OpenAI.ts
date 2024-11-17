// Types
export type initializeWebsSocket = (content: string) => void

// Interfaces
export interface OpenAiStore {
    hasSent: boolean;
    ws: any;
    authenticated: boolean;
    initializeWebSocket: initializeWebsSocket;
    testRequest: () => void;
    cleanup: () => void;
}
