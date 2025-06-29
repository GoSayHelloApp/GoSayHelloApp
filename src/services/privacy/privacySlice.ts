import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchedUser } from '../../models/responseModels/privacy';

interface PrivacyState {
    blockedUsers: SearchedUser[];
}

const initialState: PrivacyState = {
    blockedUsers: [],
};

const privacySlice = createSlice({
    name: 'privacy',
    initialState,
    reducers: {
        addBlockedUser: (state, action: PayloadAction<SearchedUser>) => {
            state.blockedUsers.push(action.payload);
        },
        removeBlockedUser: (state, action: PayloadAction<number>) => {
            state.blockedUsers = state.blockedUsers.filter(user => user.user_id !== action.payload);
        },
        setBlockedUsers: (state, action: PayloadAction<SearchedUser[]>) => {
            state.blockedUsers = action.payload;
        },
    },
});

export const { addBlockedUser, removeBlockedUser, setBlockedUsers } = privacySlice.actions;
export default privacySlice.reducer;
