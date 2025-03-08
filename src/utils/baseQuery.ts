import axios from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { RootState } from '../redux/store';
import { getStartUp } from './tokenStorage';

const axiosBaseQuery =
    ({ baseUrl }: { baseUrl: string }): BaseQueryFn =>
        async ({ url, method, data, params, headers }, { getState }, extraOptions) => {
            try {
                // const state = getState() as RootState;
                const token = getStartUp()?.access_token;

                const config: AxiosRequestConfig = {
                    url: baseUrl + url,
                    method,
                    timeout: 60000,
                    data,
                    params,
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        ...(headers || {}),
                    },
                };

                const result = await axios(config);
                if (result.data?.success === false) {
                    return {
                        error: {
                            status: result.data?.error_code || 500,
                            message: result.data?.error || "An unknown error occurred",
                        },
                    };
                }

                return { data: result.data };
            } catch (axiosError) {
                const err = axiosError as AxiosError;
                return {
                    error: {
                        status: err.response?.status || 500,
                        message: err.response?.data || err.message,
                    },
                };
            }
        };

export const baseQuery = axiosBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_BASE_URL!,
});
