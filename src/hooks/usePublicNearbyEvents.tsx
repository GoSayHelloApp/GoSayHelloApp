import { useCallback, useEffect, useState } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { useGetNearbyEventsV2Mutation } from "../services/events/publicEventsApi";
import type { Event, NearbyEventsV2Request } from "../models/responseModels/events";

type PublicNearbyFilters = Omit<NearbyEventsV2Request, "latitude" | "longitude" | "page_no">;

export function usePublicNearbyEvents(
  filters: PublicNearbyFilters,
  location: { latitude: number; longitude: number }
) {
  const [pageNo, setPageNo] = useState(1);
  const [dataList, setDataList] = useState<Event[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [getNearbyEvents, { isLoading }] = useGetNearbyEventsV2Mutation();

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    setPageNo(1);
    setDataList([]);
    setHasMorePages(true);
    setTotalEvents(null);
  }, [filtersKey, location.latitude, location.longitude]);

  const fetchData = useCallback(async () => {
    try {
      const response = await getNearbyEvents({
        ...filters,
        latitude: location.latitude,
        longitude: location.longitude,
        page_no: pageNo,
      }).unwrap();

      setDataList((prev) => [...prev, ...(response.EventsNearBy ?? [])]);
      if (response.total_events != null) {
        setTotalEvents(response.total_events);
      }
      const totalPages = response.nearby_events_total_pages ?? 1;
      if (pageNo >= totalPages) {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error("Error fetching nearby events:", error);
    }
  }, [filters, filtersKey, pageNo, getNearbyEvents, location.latitude, location.longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lastElementRef = useInfiniteScroll(() => {
    if (hasMorePages && !isLoading) {
      setPageNo((prev) => prev + 1);
    }
  }, isLoading);

  const resetList = useCallback(() => {
    setPageNo(1);
    setDataList([]);
    setHasMorePages(true);
    setTotalEvents(null);
  }, []);

  return {
    dataList,
    isLoading,
    lastElementRef,
    resetList,
    setPageNo,
    setDataList,
    totalEvents,
  };
}
