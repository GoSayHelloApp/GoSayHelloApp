import { baseResponse } from "./baseResponseModel";
import { Preference, UserPreference } from "./preferences";

export interface UserBaseResponseModel extends baseResponse {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    phone: string;
    date_of_birth: string;
    profile_image: string;
    cover_image: string;
    is_email_verified: boolean;
    is_business_profile: boolean;
    is_mute: number;
    lock_location: number;
    is_institute_register: boolean;
    is_user_reported: number;
    institute_id: number;
    personal_website: string;
    personal_website_2: string;
    personal_website_3: string;
    personal_website_4: string;
    no_of_post: number;
    no_of_connection: number;
    login_count: number;
    distance: number;
    access_token: string;
    confirmation_status: number;
    is_connection_requested: boolean;
    UserPreferences: UserPreference[];
}
export interface UserLoginResponse extends UserBaseResponseModel {
    referral_code: string;
    UserPreferences: UserPreference[];

}

export interface UserSignUpResponse extends UserBaseResponseModel {
}