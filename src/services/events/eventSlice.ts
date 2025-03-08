import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventState {
    events: any;
}

const initialState: EventState = {
    events: [],
};

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
    },
});

export const { } = eventsSlice.actions;
export default eventsSlice.reducer;
