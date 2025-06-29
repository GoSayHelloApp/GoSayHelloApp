import { UserLoginResponse, UserSignUpResponse } from "../models/responseModels/user";
import { UserPreference } from "../models/responseModels/preferences";

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

export const updateUserPushNotificationStatus = (is_mute: number) => {
    const userString = sessionStorage.getItem("user");
    if (userString) {
        try {
            const user = JSON.parse(userString) as UserLoginResponse;
            user.is_mute = is_mute;
            sessionStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
            console.error("Failed to parse user data:", error);
            return undefined;
        }
    }
}

export const updateUserPreferences = (preferences: UserPreference[]) => {
    const userString = sessionStorage.getItem("user");
    if (userString) {
        try {
            const user = JSON.parse(userString) as UserLoginResponse;
            user.UserPreferences = preferences;
            sessionStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
            console.error("Failed to parse user data:", error);
            return undefined;
        }
    }
}