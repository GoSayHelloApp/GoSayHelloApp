import { createApi } from "@reduxjs/toolkit/query/react";
import { pythonBaseQuery } from "../../utils/baseQuery";
import type {
  PublicEventGalleriesResponse,
  PublicGalleryResponse,
} from "../../models/responseModels/galleries";

// Public, read-only gallery endpoints. The FastAPI routes use optional auth, so with no
// token (the anonymous public event page) they return only public galleries / posts.
export const galleryApi = createApi({
  reducerPath: "galleryApi",
  baseQuery: pythonBaseQuery,
  endpoints: (builder) => ({
    getPublicEventGalleries: builder.query<PublicEventGalleriesResponse, { event_id: number }>({
      query: ({ event_id }) => ({
        url: `events/${event_id}/galleries`,
        method: "GET",
      }),
    }),
    getPublicGallery: builder.query<PublicGalleryResponse, { gallery_id: number; page_no?: number }>({
      query: ({ gallery_id, page_no = 1 }) => ({
        url: `galleries/${gallery_id}`,
        method: "GET",
        params: { tab: "live", page_no },
      }),
    }),
  }),
});

export const { useGetPublicEventGalleriesQuery, useGetPublicGalleryQuery } = galleryApi;
