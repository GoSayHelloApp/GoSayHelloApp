import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppConfigResponse, ApplicationInformation, BusinessType, Country, EventType, PrivacyPolicy, StateName, SubscriptionPackage } from '../../models/responseModels/appConfig';


interface AppConfigState {
    eventTypes: EventType[] | null;
    countries: Country[] | null;
    stateNames: StateName[] | null;
    businessTypes: BusinessType[] | null;
    applicationInformation: ApplicationInformation[] | null;
    privacyPolicy: PrivacyPolicy[] | null;
    subscriptionPackages: SubscriptionPackage[] | null;
}

const initialState: AppConfigState = {
    eventTypes: null,
    countries: null,
    stateNames: null,
    businessTypes: null,
    applicationInformation: null,
    privacyPolicy: null,
    subscriptionPackages: null,
};

const appConfigSlice = createSlice({
    name: 'appconfig',
    initialState,
    reducers: {
        setEventTypes: (state, action: PayloadAction<EventType[]>) => {
            state.eventTypes = action.payload;
        },
        setCountries: (state, action: PayloadAction<Country[]>) => {
            state.countries = action.payload;
        },
        setStateNames: (state, action: PayloadAction<StateName[]>) => {
            state.stateNames = action.payload;
        },
        setBusinessTypes: (state, action: PayloadAction<BusinessType[]>) => {
            state.businessTypes = action.payload;
        },
        setApplicationInformation: (state, action: PayloadAction<ApplicationInformation[]>) => {
            state.applicationInformation = action.payload;
        },
        setPrivacyPolicy: (state, action: PayloadAction<PrivacyPolicy[]>) => {
            state.privacyPolicy = action.payload;
        },
        setSubscriptionPackages: (state, action: PayloadAction<SubscriptionPackage[]>) => {
            state.subscriptionPackages = action.payload;
        },
        setAppConfig: (state, action: PayloadAction<AppConfigResponse>) => {
            state.eventTypes = action.payload.event_types;
            state.countries = action.payload.countries;
            state.stateNames = action.payload.stateNames;
            state.businessTypes = action.payload.business_types;
            state.applicationInformation = action.payload.applicationInformation;
            state.privacyPolicy = action.payload.privacyPolicy;
            state.subscriptionPackages = action.payload.subscription_packages;
        },
    },
});

export const { setEventTypes, setCountries, setStateNames, setBusinessTypes, setApplicationInformation, setPrivacyPolicy, setSubscriptionPackages, setAppConfig } = appConfigSlice.actions;
export default appConfigSlice.reducer;