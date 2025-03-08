import { UserLoginResponse, UserSignUpResponse } from "../models/responseModels/user";

// TODO: Needs to be changed with a secure token management process.
export const getStartUp = (): UserLoginResponse | UserSignUpResponse | undefined => {
    const user = sessionStorage.getItem("user");
    if (user) {
        try {
            return JSON.parse(user) as UserLoginResponse;
        } catch (error) {
            console.error("Failed to parse user data:", error);
            return undefined;
        }
    }
    return undefined;
};
export const setStartUp = (user: UserLoginResponse | UserSignUpResponse) => {
    const existingUser = sessionStorage.getItem("user");
    if (existingUser) {
        sessionStorage.removeItem("user");
    }
    sessionStorage.setItem("user", JSON.stringify(user));
}