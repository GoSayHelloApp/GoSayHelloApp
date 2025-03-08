import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { setAppConfig } from './configSlice';

export const appConfigApi = createApi({
    reducerPath: 'appConfigApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        loadAppConfig: builder.mutation<any, any>({
            query: () => ({
                url: '/getappconfiguration',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAppConfig(data));
                } catch (error) {
                    console.error('Error loading app config:', error);
                }
            },
        }),
    }),
});

export const { useLoadAppConfigMutation } = appConfigApi;
