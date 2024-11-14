// Types
type SignupType = (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
) => Promise<void>;

type LoginType = (
    email: string,
    password: string
) => Promise<void>;

type GetUserType = () => Promise<void>;


type LogoutType = () => Promise<void>;
type TokenRefreshType = () => Promise<void>;

// Interfaces

export interface RequestOptions {
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers: Record<string, string>;
    body?: string;
}

interface user {
    first_name: string;
    last_name: string;
    email: string;
}

export interface AuthState {
    user: user | null;
    isLoading: boolean;
    error: string | null;
    signup: SignupType;
    getUser: GetUserType;
    logout: LogoutType;
    tokenRefresh: TokenRefreshType;
    // login: LoginType;
}