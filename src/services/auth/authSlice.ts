import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserLoginRequest } from '../../models/requestModels/user';
import { UserLoginResponse, UserSignUpResponse } from '../../models/responseModels/user';
import { UserPreference } from '../../models/responseModels/preferences';
import { setStartUp, updateUserPushNotificationStatus, updateUserPreferences } from '../../utils/tokenStorage';

interface AuthState {
    user: null | UserLoginResponse | UserSignUpResponse;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserLoginResponse | UserSignUpResponse>) => {
            state.user = action.payload;
            setStartUp(action.payload);
        },
        setUserPreferences: (state, action: PayloadAction<UserPreference[]>) => {
            if (state.user) {
                state.user.UserPreferences = action.payload;
                updateUserPreferences(action.payload);
            }
        },
        updateUserMuteStatus: (state, action: PayloadAction<number>) => {
            if (state.user) {
                state.user.is_mute = action.payload;
                updateUserPushNotificationStatus(action.payload);
            }
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { setUser, logout, setUserPreferences, updateUserMuteStatus } = authSlice.actions;
export default authSlice.reducer;
