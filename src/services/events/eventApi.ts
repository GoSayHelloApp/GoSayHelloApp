import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../utils/baseQuery";
import { EventDetailsResponse, EventInterestedUsersResponse } from "../../models/responseModels/events";
import { PublicEventDetailsResponse, PublicEventDetailsRequest } from "../../models/responseModels/events";

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getEventDetails: builder.mutation<EventDetailsResponse, { event_id: number }>({
      query: (payload) => ({
        url: "/geteventdetail",
        method: "POST",
        data: payload,
      }),
    }),
    getEventInterestedUser: builder.mutation<EventInterestedUsersResponse, { event_id: number; user_id: number }>({
      query: (payload) => ({
        url: "/eventinterestedusers",
        method: "POST",
        data: payload,
      }),
    }),
    saveInterestedEvent: builder.mutation<{ success: boolean; error: string }, { event_id: number; user_id: number }>({
      query: (payload) => ({
        url: "/saveinterestedevent",
        method: "POST",
        data: payload,
      }),
    }),
    unsaveInterestedEvent: builder.mutation<{ success: boolean; error: string }, { event_id: number; user_id: number }>(
      {
        query: (payload) => ({
          url: "/unsaveinterestedevent",
          method: "POST",
          data: payload,
        }),
      }
    ),
    getPublicEventDetails: builder.query<PublicEventDetailsResponse, PublicEventDetailsRequest>({
      query: (payload) => ({
        url: "/event/details",
        method: "GET",
        params: {
          event_id: payload.event_id,
        },
      }),
    }),
    getUserInterestedEvents: builder.mutation<
      {
        success: boolean;
        user_info: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          profile_image: string;
        };
        events_list: Array<{
          id: number;
          event_id: number;
          venue_name: string;
          event_image: string;
          event_owner_name: string;
          event_owner_image: string;
          description: string;
          event_owner_connections: number;
        }>;
      },
      { user_id: number }
    >({
      query: (payload) => ({
        url: "/getuserinterestedevents",
        method: "POST",
        data: payload,
      }),
    }),
    getInvitationList: builder.mutation<
      {
        success: boolean;
        current_page_no: string;
        newInvitations: {
          total_pages: number;
          invitationList: Array<{
            event_id: number;
            invitation_id: number;
            venue_name: string;
            start_date: string;
            start_time: string;
            end_date: string;
            end_time: string;
            is_public: number;
            event_image: string;
            no_of_users_saved_event: number;
            address_1: string;
            event_owner_name: string;
            event_owner_image: string;
            description: string;
            invitation_status: number;
            event_status: number;
            event_lat: number;
            event_long: number;
            updated_at: string;
            event_type: string;
            distance: number;
            event_interested_users: Array<{
              id: number;
              user_id: number;
              user_name: string;
              user_image: string;
              is_business_profile: number;
            }>;
          }>;
        };
      },
      { invitation_status: number; page_no: number; user_id: number }
    >({
      query: (payload) => ({
        url: "/event/getinvitationlistv1",
        method: "POST",
        params: payload,
      }),
    }),
    getEventsList: builder.mutation<
      {
        success: boolean;
        tab_number: string;
        current_page_no: string;
        MyEvents?: {
          total_pages: number;
          EventsList: Array<{
            event_id: number;
            venue_name: string;
            start_date: string;
            start_time: string;
            end_date: string;
            end_time: string;
            is_public: number;
            event_image: string;
            no_of_users_saved_event: number;
            address_1: string;
            event_lat: number;
            event_long: number;
            event_type: string;
            is_already_saved: string;
            event_owner_id: number;
            event_owner_name: string;
            event_owner_image: string;
            description: string;
          }>;
        };
        SavedEvents?: {
          total_pages: number;
          EventsList: Array<{
            event_id: number;
            venue_name: string;
            start_date: string;
            start_time: string;
            end_date: string;
            end_time: string;
            is_public: number;
            event_image: string;
            no_of_users_saved_event: number;
            address_1: string;
            event_lat: number;
            event_long: number;
            event_type: string;
            is_already_saved: string;
            event_owner_id: number;
            event_owner_name: string;
            event_owner_image: string;
            description: string;
          }>;
        };
        PastEvent?: {
          total_pages: number;
          EventsList: Array<{
            event_id: number;
            venue_name: string;
            start_date: string;
            start_time: string;
            end_date: string;
            end_time: string;
            is_public: number;
            event_image: string;
            no_of_users_saved_event: number;
            address_1: string;
            event_lat: number;
            event_long: number;
            event_type: string;
            event_owner_name: string;
            event_owner_image: string;
            description: string;
          }>;
        };
      },
      { page_no: number; tab_number: number; user_id: number }
    >({
      query: (payload) => ({
        url: "/geteventslist",
        method: "POST",
        params: payload,
      }),
    }),
    deleteEvent: builder.mutation<{ success: boolean; message: string }, { event_id: number; user_id: number }>({
      query: (payload) => ({
        url: "/deleteevent",
        method: "POST",
        params: payload,
      }),
    }),
    addNewEvent: builder.mutation<{ success: boolean; message: string }, FormData>({
      query: (payload) => ({
        url: "/addnewevent",
        method: "POST",
        data: payload,
      }),
    }),
  }),
});

export const {
  useGetEventDetailsMutation,
  useGetEventInterestedUserMutation,
  useSaveInterestedEventMutation,
  useUnsaveInterestedEventMutation,
  useGetPublicEventDetailsQuery,
  useGetUserInterestedEventsMutation,
  useGetInvitationListMutation,
  useGetEventsListMutation,
  useDeleteEventMutation,
  useAddNewEventMutation,
} = eventApi;
