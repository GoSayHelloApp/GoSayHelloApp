import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { getPeopleRequest } from '../../models/requestModels/people';

export const nearbyApi = createApi({
    reducerPath: 'nearbyApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        getNearbyUsersOrBusinesses: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/getnearbyscreendatav2',
                method: 'POST',
                data: payload,
            }),
        }),
    }),
});

export const { useGetNearbyUsersOrBusinessesMutation } = nearbyApi;
