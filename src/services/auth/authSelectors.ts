import { RootState } from "../../redux/store";

export const userSelector = (state: RootState) => state.auth.user;
export const userPreferencesSelector = (state: RootState) => state.auth.user?.UserPreferences;