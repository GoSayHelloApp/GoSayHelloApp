import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../utils/baseQuery";
import { getPeopleRequest } from "../../models/requestModels/people";

export interface LocationUser {
  user_id: number;
  user_name: string;
  user_image: string;
  distance: number;
}

export interface SchoolUsersResponse {
  success: boolean;
  SameInstituteUsers: LocationUser[];
}

export interface HometownUsersResponse {
  success: boolean;
  SameHometownUsers: LocationUser[];
}

export const nearbyApi = createApi({
  reducerPath: "nearbyApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getNearbyUsersOrBusinesses: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/getnearbyscreendatav2",
        method: "POST",
        data: payload,
      }),
    }),
    searchSchoolUsers: builder.mutation<
      SchoolUsersResponse,
      { institute_name: string; user_id: number }
    >({
      query: (data) => ({
        url: "/searchspecificschoolusers",
        method: "POST",
        params: data,
      }),
    }),
    searchHometownUsers: builder.mutation<
      HometownUsersResponse,
      { home_town: string; user_id: number }
    >({
      query: (data) => ({
        url: "/searchspecifichometownusers",
        method: "POST",
        params: data,
      }),
    }),
  }),
});

export const {
  useGetNearbyUsersOrBusinessesMutation,
  useSearchSchoolUsersMutation,
  useSearchHometownUsersMutation,
} = nearbyApi;
