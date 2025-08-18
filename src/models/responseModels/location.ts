export interface StateResponse {
  success: boolean;
  country_id: string;
  stateNames: State[];
}

export interface State {
  id: number;
  state_name: string;
  country_id: number;
}

export interface CityResponse {
  success: boolean;
  state_name: string;
  state_id: string;
  cities: City[];
}

export interface City {
  id: number;
  country_id: number;
  city: string;
}

export interface EducationalInstitutesResponse {
  success: boolean;
  EducationalInstitutes: EducationalInstitute[];
}

export interface EducationalInstitute {
  id: number;
  institute_name: string;
}
