import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../utils/baseQuery";
import { setAppConfig } from "./configSlice";
import { StateResponse, CityResponse, EducationalInstitutesResponse } from "../../models/responseModels/location";

export const appConfigApi = createApi({
  reducerPath: "appConfigApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    loadAppConfig: builder.mutation<any, any>({
      query: () => ({
        url: "/getappconfiguration",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAppConfig(data));
        } catch (error) {
          console.error("Error loading app config:", error);
        }
      },
    }),
    getStatesByCountry: builder.mutation<StateResponse, { country_id: number }>({
      query: (params) => ({
        url: `/getstatebycountry?country_id=${params.country_id}`,
        method: "POST",
      }),
    }),
    getCitiesByState: builder.mutation<CityResponse, { state_id: number }>({
      query: (params) => ({
        url: `/getcitiesbystate?state_id=${params.state_id}`,
        method: "POST",
      }),
    }),
    saveUserPersonalInformation: builder.mutation<
      any,
      {
        city_id?: number;
        country_id?: number;
        state_id?: number;
        user_id: number;
        city?: string;
        country_name?: string;
        state?: string;
        first_school?: string;
        second_school?: string;
        third_school?: string;
        education_level?: string;
        first_company_name?: string;
        second_company_name?: string;
        third_company_name?: string;
        information_type: number;
        // Business info parameters
        address?: string;
        address_audience?: number;
        address_lat?: number;
        address_long?: number;
        business_type_id?: number;
        description?: string;
        education_id?: number;
        is_public?: number;
        update_address?: number;
        website_link?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        // Add user_id and common params
        queryParams.append("user_id", params.user_id.toString());
        queryParams.append("information_type", params.information_type.toString());
        queryParams.append("is_public", "0");

        // Add location params if they exist (for hometown)
        if (params.city_id) queryParams.append("city_id", params.city_id.toString());
        if (params.country_id) queryParams.append("country_id", params.country_id.toString());
        if (params.state_id) queryParams.append("state_id", params.state_id.toString());
        if (params.city) queryParams.append("city", params.city);
        if (params.country_name) queryParams.append("country_name", params.country_name);
        if (params.state) queryParams.append("state", params.state);

        // Add school params if they exist (for school)
        if (params.first_school) queryParams.append("first_school", params.first_school);
        if (params.second_school) queryParams.append("second_school", params.second_school);
        if (params.third_school) queryParams.append("third_school", params.third_school);

        // Add education level param if it exists
        if (params.education_level) queryParams.append("education_level", params.education_level);

        // Add company name params if they exist
        if (params.first_company_name) queryParams.append("first_company_name", params.first_company_name);
        if (params.second_company_name) queryParams.append("second_company_name", params.second_company_name);
        if (params.third_company_name) queryParams.append("third_company_name", params.third_company_name);

        // Add business info params if they exist
        if (params.address !== undefined) queryParams.append("address", params.address);
        if (params.address_audience !== undefined)
          queryParams.append("address_audience", params.address_audience.toString());
        if (params.address_lat !== undefined) queryParams.append("address_lat", params.address_lat.toString());
        if (params.address_long !== undefined) queryParams.append("address_long", params.address_long.toString());
        if (params.business_type_id !== undefined)
          queryParams.append("business_type_id", params.business_type_id.toString());
        if (params.description !== undefined) queryParams.append("description", params.description);
        if (params.education_id !== undefined) queryParams.append("education_id", params.education_id.toString());
        if (params.is_public !== undefined) queryParams.append("is_public", params.is_public.toString());
        if (params.update_address !== undefined) queryParams.append("update_address", params.update_address.toString());
        if (params.website_link !== undefined) queryParams.append("website_link", params.website_link);

        return {
          url: `/saveuserpersonalinforamtion?${queryParams.toString()}`,
          method: "POST",
        };
      },
    }),
    getEducationalInstitutes: builder.mutation<EducationalInstitutesResponse, { user_id: number }>({
      query: (params) => ({
        url: `/geteducationalinstitutes?user_id=${params.user_id}`,
        method: "POST",
      }),
    }),
    getAccountSettingInformation: builder.mutation<any, { user_id: number }>({
      query: (params) => ({
        url: `/getaccountsettinginforamtion?user_id=${params.user_id}`,
        method: "POST",
      }),
    }),
    deleteUserPersonalInformation: builder.mutation<
      any,
      {
        user_id: number;
        information_type: number;
        user_work_place_id?: number;
        user_school_info_id?: number;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("user_id", params.user_id.toString());
        queryParams.append("information_type", params.information_type.toString());
        if (params.user_work_place_id) {
          queryParams.append("user_work_place_id", params.user_work_place_id.toString());
        }
        if (params.user_school_info_id) {
          queryParams.append("user_school_info_id", params.user_school_info_id.toString());
        }
        return {
          url: `/deleteuserpersonalinforamtion?${queryParams.toString()}`,
          method: "POST",
        };
      },
    }),
    fetchHomeScreenData: builder.mutation<
      any,
      {
        user_id: number;
        page_no: number;
        is_nearby?: number;
        latitude?: number;
        longitude?: number;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("user_id", params.user_id.toString());
        queryParams.append("page_no", params.page_no.toString());

        if (params.is_nearby !== undefined) {
          queryParams.append("is_nearby", params.is_nearby.toString());
        }
        if (params.latitude !== undefined) {
          queryParams.append("latitude", params.latitude.toString());
        }
        if (params.longitude !== undefined) {
          queryParams.append("longitude", params.longitude.toString());
        }

        return {
          url: `/fetchhomescreendata?${queryParams.toString()}`,
          method: "POST",
        };
      },
    }),
  }),
});

export const {
  useLoadAppConfigMutation,
  useGetStatesByCountryMutation,
  useGetCitiesByStateMutation,
  useSaveUserPersonalInformationMutation,
  useGetEducationalInstitutesMutation,
  useGetAccountSettingInformationMutation,
  useDeleteUserPersonalInformationMutation,
  useFetchHomeScreenDataMutation,
} = appConfigApi;
