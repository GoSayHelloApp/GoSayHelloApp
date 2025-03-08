import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { PreferencesResponse, UserPreferencesResponse } from '../../models/responseModels/preferences';
import { userPreferencesRequest } from '../../models/requestModels/preferences';

export const preferencesApi = createApi({
    reducerPath: 'preferenceApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        getPreferences: builder.query<PreferencesResponse, void>({
            query: () => ({
                url: '/getpreferences',
                method: 'POST',
            }),
        }),
        addPreferences: builder.mutation<UserPreferencesResponse, userPreferencesRequest>({
            query: (userPreferences) => ({
                url: '/adduserpreferencesdata',
                method: 'POST',
                data: userPreferences,
            }),
        }),
    }),
});

export const { useGetPreferencesQuery, useAddPreferencesMutation } = preferencesApi;
