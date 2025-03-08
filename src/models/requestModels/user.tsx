export interface UserLoginRequest {
    email: string,
    password: string
}

export interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    image: File | null;
}

export interface ForgotPasswordRequest {
    email: string
}
