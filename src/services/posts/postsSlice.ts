import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    posts: null;
}

const initialState: AuthState = {
    posts: null,
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setUserPosts: (state, action: PayloadAction<any>) => {
        },
    },
});

export const { setUserPosts } = postsSlice.actions;
export default postsSlice.reducer;
