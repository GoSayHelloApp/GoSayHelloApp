import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preference, PreferenceType } from '../../models/responseModels/preferences';

interface PreferenceState {
    preferences: null | Preference[];
    allPreferenceTypes: null | PreferenceType[];
}

const initialState: PreferenceState = {
    preferences: null,
    allPreferenceTypes: null,
};

const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        setAllPreferences: (state, action: PayloadAction<Preference[]>) => {
            state.preferences = action.payload;
        },
        setAllPreferenceTypes: (state, action: PayloadAction<PreferenceType[]>) => {
            state.allPreferenceTypes = action.payload;
        },
        // setUserPreferences: (state, action: PayloadAction<Preference[]>) => {
        //     state.preferences = action.payload;
        // },
    },
});

export const { setAllPreferences, setAllPreferenceTypes } = preferencesSlice.actions;
export default preferencesSlice.reducer;
