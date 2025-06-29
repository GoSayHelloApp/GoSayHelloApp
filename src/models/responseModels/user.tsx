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

export interface UserSignUpResponse extends UserBaseResponseModel {}

export interface UserPreferenceProfile {
  id: number;
  preference_type_id: number;
  preference_name: string;
  preference_type: string;
}

export interface SchoolInformation {
  id: number;
  institute_place: string;
  institute_name: string;
  start_date: string;
  end_date: string;
}

export interface AddressInformation {
  success: boolean;
  country_id: number;
  country_name: string;
  state_id: number;
  state: string;
  city_id: number;
  city: string;
  address: string;
  address_audience: number;
  address_lat: number;
  address_long: number;
  description: string;
  business_type_id: number;
  institute_id: number;
  school_name: string;
  website_link: string;
  is_public: number;
}

export interface PersonalInformation {
  success: boolean;
  home_town_country_id: number;
  home_town_country: string;
  home_town_state_id: number;
  home_town_state: string;
  home_town_city_id: number;
  home_town_city: string;
  home_town: string;
  is_show_home_town: number;
  education_level: string;
  is_show_education_level: number;
  AddressInformation: AddressInformation;
  SchoolInformation: SchoolInformation[];
  // WalletInformation?: any; // Add if needed
}

export interface UserImage {
  id: number;
  image: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_post: number;
  is_cover: number;
  is_video: number;
  is_profile: number;
  number_of_likes: number;
  posted_from_latitude?: number | string;
  posted_from_longitude?: number | string;
  is_like: number;
  old_id?: number;
  old_created_at?: string;
  old_updated_at?: string;
}

export interface UserProfileResponse {
  success: boolean;
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
  total_pages: number;
  current_page_no: string;
  UserPreferences: UserPreferenceProfile[];
  PersonalInformation: PersonalInformation;
  ListOfImages: UserImage[];
  is_block: number;
}
