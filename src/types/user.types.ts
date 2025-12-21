export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    // role: Array<String>()
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

