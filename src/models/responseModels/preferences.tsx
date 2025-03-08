import { baseResponse } from "./baseResponseModel";

export interface PreferenceType {
    id: number;
    name: string;
    is_show: 0 | 1;
}

export interface Preference {
    id: number;
    name: string;
    types: PreferenceType[];
}

export interface UserPreference {
    id: number,
    preference_type_id: number,
    preference_name: string,
    preference_type: string
}

export interface PreferencesResponse extends baseResponse {
    Preferences: Preference[];
}

export interface UserPreferencesResponse extends baseResponse {
    Preferences: UserPreference[];
    message: string
}

export interface ForgotPasswordResponse extends baseResponse {
    error: string;
    error_code: number,
    error_messages: string[]
    success: boolean,
    message: string
}