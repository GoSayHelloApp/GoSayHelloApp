import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/auth/authApi';
import authReducer from '../services/auth/authSlice';
import appConfigReducer from '../services/appconfiguration/configSlice';
import preferencesReducer from '../services/preferences/preferenceSlice';
import peopleReducer from '../services/nearby/nearbySlice';
import eventsReducer from '../services/events/eventSlice';
import { preferencesApi } from '../services/preferences/preferenceApi';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { nearbyApi } from '../services/nearby/nearbyApi';
import { appConfigApi } from '../services/appconfiguration/configApi';
import { eventApi } from '../services/events/eventApi';

export const store = configureStore({
    reducer: {
        // reducers
        auth: authReducer,
        preferences: preferencesReducer,
        people: peopleReducer,
        events: eventsReducer,
        appConfig: appConfigReducer,

        // apis
        [authApi.reducerPath]: authApi.reducer,
        [preferencesApi.reducerPath]: preferencesApi.reducer,
        [nearbyApi.reducerPath]: nearbyApi.reducer,
        [appConfigApi.reducerPath]: appConfigApi.reducer,
        [eventApi.reducerPath]: eventApi.reducer,
    },
    // middlewares
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            preferencesApi.middleware,
            nearbyApi.middleware,
            appConfigApi.middleware,
            eventApi.middleware,
        ),
});


export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;