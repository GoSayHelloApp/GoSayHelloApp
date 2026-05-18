import { createApi } from "@reduxjs/toolkit/query/react";
import { pythonBaseQuery } from "../../utils/baseQuery";
import type { NearbyEventsV2Request, NearbyEventsV2Response } from "../../models/responseModels/events";

function appendNearbyEventsFormData(form: FormData, body: NearbyEventsV2Request): void {
  form.append("latitude", String(body.latitude));
  form.append("longitude", String(body.longitude));
  form.append("event_type_id", String(body.event_type_id ?? 0));
  form.append("page_no", String(body.page_no));
  form.append("is_paid_event", String(body.is_paid_event ?? 2));
  if (body.month != null) {
    form.append("month", String(body.month));
  }
  if (body.event_name?.trim()) {
    form.append("event_name", body.event_name.trim());
  }
}

export const publicEventsApi = createApi({
  reducerPath: "publicEventsApi",
  baseQuery: pythonBaseQuery,
  endpoints: (builder) => ({
    getNearbyEventsV2: builder.mutation<NearbyEventsV2Response, NearbyEventsV2Request>({
      query: (body) => {
        const form = new FormData();
        appendNearbyEventsFormData(form, body);
        return {
          url: "getnearbyeventsv2",
          method: "POST",
          data: form,
        };
      },
    }),
  }),
});

export const { useGetNearbyEventsV2Mutation } = publicEventsApi;
