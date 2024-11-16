// Types
export type TestRequest = (content: string) => Promise<void>

// Interfaces
export interface OpenAiStore {
    hasSent: boolean;
    testRequest: TestRequest;
}
