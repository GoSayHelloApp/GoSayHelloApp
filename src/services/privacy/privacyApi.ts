import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { SearchUsersResponse, BlockedUsersResponse, UpdateBlockStatusResponse } from '../../models/responseModels/privacy';
import { SearchUsersRequest, UpdateBlockStatusRequest } from '../../models/requestModels/privacy';

export const privacyApi = createApi({
    reducerPath: 'privacyApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        searchUsersForBlock: builder.mutation<SearchUsersResponse, SearchUsersRequest>({
            query: (searchData) => ({
                url: '/privacy/searchusersforblock',
                method: 'POST',
                params: searchData,
            }),
        }),
        getBlockedUsers: builder.mutation<BlockedUsersResponse, number>({
            query: (userId) => ({
                url: '/privacy/getblockeduserslist',
                method: 'POST',
                params: { user_id: userId },
            }),
        }),
        updateBlockStatus: builder.mutation<UpdateBlockStatusResponse, UpdateBlockStatusRequest>({
            query: (blockData) => ({
                url: '/privacy/updateuserblockstatus',
                method: 'POST',
                params: blockData,
            }),
        }),
        getReportReasons: builder.mutation<any, { report_type_id: number; user_id: number }>({
            query: (params) => ({
                url: '/report/getreasons',
                method: 'POST',
                params,
            }),
        }),
        reportUser: builder.mutation<any, { user_id: number; report_type_id: number; report_reason_id: number; reported_user_id: number }>({
            query: (data) => ({
                url: '/report/specificthing',
                method: 'POST',
                params: data,
            }),
        }),
    }),
});

export const {
    useSearchUsersForBlockMutation,
    useGetBlockedUsersMutation,
    useUpdateBlockStatusMutation,
    useGetReportReasonsMutation,
    useReportUserMutation,
} = privacyApi;
