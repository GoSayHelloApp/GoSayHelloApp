export interface NearbyEventInterestedUser {
  id: number;
  user_id: number;
  user_name: string;
  user_image: string;
  is_business_profile: number;
}

export interface NearbyEvent {
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
  event_owner_id: number;
  event_owner_name: string;
  event_owner_image: string;
  description: string;
  latitude: number;
  longitude: number;
  distance: number;
  is_bingo_enabled?: boolean;
  event_interested_users: NearbyEventInterestedUser[];
}

export interface NearbyEventsResponse {
  success: boolean;
  current_page_no: number;
  nearby_events_total_pages: number;
  total_events: number;
  EventsNearBy: NearbyEvent[];
}

export interface NearbyEventsRequest {
  latitude: number;
  longitude: number;
  event_type_id?: number;
  page_no?: number;
  is_paid_event?: 0 | 1 | 2;
  search?: string;
  month?: number;
  year?: number;
}
