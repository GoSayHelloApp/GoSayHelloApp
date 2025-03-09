import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { EventDetailsResponse, EventInterestedUsersResponse } from '../../models/responseModels/events';
import { PublicEventDetailsResponse, PublicEventDetailsRequest } from '../../models/responseModels/events';

export const eventApi = createApi({
    reducerPath: 'eventApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        getEventDetails: builder.mutation<EventDetailsResponse, { event_id: number }>({
            query: (payload) => ({
                url: '/geteventdetail',
                method: 'POST',
                data: payload,
            }),
        }),
        getEventInterestedUser: builder.mutation<EventInterestedUsersResponse, { event_id: number, user_id: number }>({
            query: (payload) => ({
                url: '/eventinterestedusers',
                method: 'POST',
                data: payload,
            }),
        }),
        saveInterestedEvent: builder.mutation<{ success: boolean }, { event_id: number, user_id: number }>({
            query: (payload) => ({
                url: '/saveinterestedevent',
                method: 'POST',
                data: payload,
            }),
        }),
        unsaveInterestedEvent: builder.mutation<{ success: boolean }, { event_id: number, user_id: number }>({
            query: (payload) => ({
                url: '/unsaveinterestedevent',
                method: 'POST',
                data: payload,
            }),
        }),
        getPublicEventDetails: builder.query<PublicEventDetailsResponse, PublicEventDetailsRequest>({
            query: (payload) => ({
                url: '/event/details',
                method: 'GET',
                params: {
                    event_id: payload.event_id
                },
            }),
        }),
    }),
});

export const {
    useGetEventDetailsMutation,
    useGetEventInterestedUserMutation,
    useSaveInterestedEventMutation,
    useUnsaveInterestedEventMutation,
    useGetPublicEventDetailsQuery
} = eventApi;