export interface EventInterestedUser {
    id: number;
    user_id: number;
    user_name: string;
    user_image: string;
    is_business_profile: number;
}

export interface Event {
    id: number;
    name: string;
    event_type_id: number;
    event_type: string;
    image: string;
    year: number;
    month: number;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    is_public: number;
    no_of_users_saved_event: number;
    address_1: string;
    is_paid_event: number;
    event_owner_name: string;
    event_owner_image: string;
    description: string;
    latitude: number;
    longitude: number;
    is_already_saved: string;
    distance: number;
    event_interested_users: EventInterestedUser[];
}

export interface EventsNearByResponse {
    EventsNearBy: Event[];
}

/** POST getnearbyeventsv2 (Python API, multipart form) */
export interface NearbyEventsV2Response {
    success?: boolean;
    current_page_no?: number;
    nearby_events_total_pages?: number;
    total_events?: number;
    EventsNearBy: Event[];
}

export interface NearbyEventsV2Request {
    latitude: number;
    longitude: number;
    event_type_id?: number;
    page_no: number;
    /** 0 = free only, 2 = all (per mobile/API convention) */
    is_paid_event?: number;
    month?: number;
    event_name?: string;
}

export interface EventDetailsResponse {
    success: boolean;
    event_id: number;
    user_id: number;
    venue_name: string;
    user_name: string;
    user_profile_image: string;
    no_of_connection: number;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    zipcode: string;
    d_lat: number;
    d_long: number;
    distance: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    country_id: number;
    country_name: string;
    event_type_id: number;
    event_type_name: string;
    description: string;
    event_image: string;
    event_url: string;
    is_public: boolean;
    is_event_reported: number;
    is_paid_event: number;
    no_of_users_saved_event: number;
    is_already_saved: boolean;
    is_checked: boolean;
}

export interface EventUser {
    id: number;
    user_id: number;
    user_name: string;
    user_image: string;
    is_business_profile: number;
    distance: number;
    confirmation_status: number;
    is_connection_requested: boolean;
}

export interface EventInterestedUsersResponse {
    success: boolean;
    event_id: string;
    UsersList: EventUser[];
}

export interface InterestedUser {
    user_id: number;
    user_name: string;
    is_business_profile: number;
    user_image: string;
}

export interface PublicEventDetailsResponse {
    success: boolean;
    event_id: number;
    user_id: number;
    venue_name: string;
    user_name: string;
    user_profile_image: string;
    no_of_connection: number;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    zipcode: string;
    d_lat: number;
    d_long: number;
    distance: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    country_id: number;
    country_name: string;
    event_type_id: number;
    event_type_name: string;
    description: string;
    event_image: string;
    event_url: string;
    is_public: boolean;
    is_event_reported: number;
    is_paid_event: number;
    no_of_users_saved_event: number;
    interestedUsersList: InterestedUser[];
}

export interface PublicEventDetailsRequest {
    event_id: number;
}