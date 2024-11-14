// Types
type SignupType = (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    csrfToken: string,
) => Promise<void>;

type LoginType = (
    email: string,
    password: string
) => Promise<void>;


// Interfaces
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
    // login: LoginType;
}