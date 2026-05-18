import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNearbyEvents } from "../services/events/nearbyEventsApi";
import type {
  NearbyEvent,
  NearbyEventsRequest,
} from "../models/responseModels/nearbyEvents";
import { applyIosTimeConversion } from "../utils/dateTimeFormatter";

interface State {
  events: NearbyEvent[];
  totalEvents: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error?: unknown;
}

const EMPTY_STATE: State = {
  events: [],
  totalEvents: 0,
  totalPages: 0,
  currentPage: 0,
  isLoading: true,
  isLoadingMore: false,
};

// Module-level cache survives component remounts (back/forward nav)
interface CacheEntry {
  events: NearbyEvent[];
  totalEvents: number;
  totalPages: number;
  currentPage: number;
}
const resultsCache = new Map<string, CacheEntry>();

function readCache(key: string): State | null {
  const hit = resultsCache.get(key);
  if (!hit) return null;
  return {
    events: hit.events,
    totalEvents: hit.totalEvents,
    totalPages: hit.totalPages,
    currentPage: hit.currentPage,
    isLoading: false,
    isLoadingMore: false,
  };
}

export function useNearbyEvents(
  params: Omit<NearbyEventsRequest, "page_no">,
  enabled = true
) {
  const key = JSON.stringify(params);
  const [state, setState] = useState<State>(
    () => readCache(key) ?? EMPTY_STATE
  );
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    if (lastKey.current === key) return;
    lastKey.current = key;

    let cancelled = false;
    const cached = readCache(key);
    // If we have cached results, keep them on screen while we refresh
    setState((s) =>
      cached
        ? { ...cached, isLoading: false }
        : { ...EMPTY_STATE, isLoading: true, events: s.events }
    );

    fetchNearbyEvents({ ...params, page_no: 1 })
      .then((res) => {
        if (cancelled) return;
        const events = (res.EventsNearBy || []).map(applyIosTimeConversion);
        const entry: CacheEntry = {
          events,
          totalEvents: res.total_events || 0,
          totalPages: res.nearby_events_total_pages || 0,
          currentPage: res.current_page_no || 1,
        };
        resultsCache.set(key, entry);
        setState({
          ...entry,
          isLoading: false,
          isLoadingMore: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        // On error, keep any cached results visible instead of wiping them
        setState((s) => ({
          ...s,
          isLoading: false,
          isLoadingMore: false,
          error: err,
        }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || state.currentPage >= state.totalPages) return;
    setState((s) => ({ ...s, isLoadingMore: true }));
    try {
      const next = state.currentPage + 1;
      const res = await fetchNearbyEvents({ ...params, page_no: next });
      setState((s) => ({
        ...s,
        events: [
          ...s.events,
          ...(res.EventsNearBy || []).map(applyIosTimeConversion),
        ],
        currentPage: res.current_page_no || next,
        totalPages: res.nearby_events_total_pages || s.totalPages,
        totalEvents: res.total_events || s.totalEvents,
        isLoadingMore: false,
      }));
    } catch (err) {
      setState((s) => ({ ...s, isLoadingMore: false, error: err }));
    }
  }, [params, state.currentPage, state.totalPages, state.isLoadingMore]);

  return { ...state, loadMore };
}
