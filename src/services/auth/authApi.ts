import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';
import { UserLoginResponse, UserSignUpResponse } from '../../models/responseModels/user';
import { ForgotPasswordRequest, UserLoginRequest } from '../../models/requestModels/user';
import { ForgotPasswordResponse } from '../../models/responseModels/preferences';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        signup: builder.mutation<UserSignUpResponse, FormData>({
            query: (signupData) => ({
                url: '/signupnewuser',
                method: 'POST',
                data: signupData,
            }),
        }),
        login: builder.mutation<UserLoginResponse, UserLoginRequest>({
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
    }),
});

export const { useSignupMutation, useLoginMutation, useForgotPasswordMutation } = authApi;
