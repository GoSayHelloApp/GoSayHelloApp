import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preference } from '../../models/responseModels/preferences';

interface PeopleState {
    people: any;
}

const initialState: PeopleState = {
    people: [],
};

const peopleSlice = createSlice({
    name: 'people',
    initialState,
    reducers: {
    },
});

export const { } = peopleSlice.actions;
export default peopleSlice.reducer;
