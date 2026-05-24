import { useEffect, useState } from "react";
import { fetchPublicEventTickets } from "../services/events/publicEventTicketsApi";
import type {
  PublicTicket,
  PublicTicketEvent,
} from "../models/responseModels/publicEventTickets";
import { isTicketExpired } from "../utils/eventTimezone";

interface State {
  event: PublicTicketEvent | null;
  tickets: PublicTicket[];
  isLoading: boolean;
  error: string | null;
}

const INITIAL: State = {
  event: null,
  tickets: [],
  isLoading: true,
  error: null,
};

/**
 * Fetches an event's public ticket types. Mirrors the iOS user view:
 * deleted tickets are dropped, and expired tickets are filtered out.
 */
export function usePublicEventTickets(eventId: string | undefined): State {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    if (!eventId) {
      setState({
        event: null,
        tickets: [],
        isLoading: false,
        error: "Missing event id",
      });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true, error: null }));

    fetchPublicEventTickets(eventId)
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setState({
            event: res.event ?? null,
            tickets: [],
            isLoading: false,
            error: res.message || "Couldn't load tickets.",
          });
          return;
        }
        const tickets = (res.tickets ?? [])
          .filter((t) => t.is_deleted !== 1)
          .filter((t) => !isTicketExpired(t.sales_end_date));
        setState({
          event: res.event ?? null,
          tickets,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          event: null,
          tickets: [],
          isLoading: false,
          error: "Couldn't load tickets. Please try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return state;
}
