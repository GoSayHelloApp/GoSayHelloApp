import { RootState } from "../../redux/store";

export const eventTypesSelector = (state: RootState) => state.appConfig.eventTypes;