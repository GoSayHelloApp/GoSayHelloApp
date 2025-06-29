import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/baseQuery';

export interface CreatePostRequest {
    user_id: number;
    image: File;
    caption?: string;
}

export interface CreatePostResponse {
    success: boolean;
    message: string;
    post_id?: number;
}

export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        deletePost: builder.mutation<any, { post_id: number; user_id: number }>({
            query: (data) => ({
                url: '/deletepost',
                method: 'POST',
                params: data,
            }),
        }),
        reactOnPost: builder.mutation<any, { is_like: number; posted_image_id: number; user_id: number }>({
            query: (data) => ({
                url: '/reactiononpost',
                method: 'POST',
                params: data,
            }),
        }),
        createPost: builder.mutation<CreatePostResponse, CreatePostRequest>({
            query: (data) => {
                const formData = new FormData();
                formData.append('image', data.image);
                if (data.caption) {
                    formData.append('caption', data.caption);
                }
                formData.append('user_id', data.user_id.toString());

                return {
                    url: '/uploadnewimage',
                    method: 'POST',
                    data: formData,
                    headers: {
                        // Don't set Content-Type, let the browser set it with boundary for multipart
                    },
                };
            },
        }),
    }),
});

export const {
    useDeletePostMutation,
    useReactOnPostMutation,
    useCreatePostMutation,
} = postsApi;
