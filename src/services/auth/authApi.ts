import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { ForgotPasswordRequest, UserLoginRequest } from '../../models/requestModels/user';
import { ForgotPasswordResponse } from '../../models/responseModels/preferences';
import { UserProfileResponse } from '../../models/responseModels/user';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        signup: builder.mutation<any, FormData>({
            query: (signupData) => ({
                url: '/signupnewuser',
                method: 'POST',
                data: signupData,
            }),
        }),
        login: builder.mutation<any, UserLoginRequest>({
            query: (loginData) => ({
                url: '/signinuser',
                method: 'POST',
                data: loginData,
                headers: {
                    // TODO: Need to remove this once backend fix this issue.
                    Devicetype: 'browser',
                    Devicetoken: '37892ryfuerdgsjhzuytd3847eufgveuyrjsduiosckj',
                },
            }),
        }),
        forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
            query: (loginData) => ({
                url: '/forgotpassword',
                method: 'POST',
                data: loginData,
            }),
        }),
        updateUserProfile: builder.mutation<any, FormData>({
            query: (profileData) => ({
                url: '/updateuserprofile',
                method: 'POST',
                data: profileData,
            }),
        }),
        logout: builder.mutation<any, number>({
            query: (userId) => ({
                url: '/logout',
                method: 'POST',
                data: { user_id: userId },
            }),
        }),
        getUserProfile: builder.mutation<UserProfileResponse, { user_id: number; page_no: number }>({
            query: (params) => ({
                url: '/getuserprofile',
                method: 'POST',
                data: params,
            }),
        }),
    }),
});

export const {
    useSignupMutation,
    useLoginMutation,
    useForgotPasswordMutation,
    useUpdateUserProfileMutation,
    useLogoutMutation,
    useGetUserProfileMutation
} = authApi;
