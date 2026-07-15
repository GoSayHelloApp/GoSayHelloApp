import { useEffect, useState } from "react";
import { fetchTicketAvailability } from "../services/events/ticketAvailabilityApi";

/**
 * Mirrors iOS `isExpired(endDateString:)` — current time compared to the
 * ticket's `sales_end_date`. Server stores UTC ISO strings without a `Z`, so
 * we add one to ensure JS parses as UTC instead of local time.
 */
function isTicketExpired(salesEndDate?: string): boolean {
  if (!salesEndDate) return false;
  const iso = /[zZ]$/.test(salesEndDate) ? salesEndDate : `${salesEndDate}Z`;
  const end = new Date(iso);
  if (isNaN(end.getTime())) return false;
  return Date.now() > end.getTime();
}

interface Availability {
  hasTickets: boolean;
  isBingoEnabled: boolean;
}

interface State {
  hasTickets: boolean | null;
  isBingoEnabled: boolean;
  isLoading: boolean;
}

const cache = new Map<number, Availability>();
const inflight = new Map<number, Promise<Availability>>();

async function loadAvailability(eventId: number): Promise<Availability> {
  try {
    const res = await fetchTicketAvailability(eventId);
    if (!res.success) return { hasTickets: false, isBingoEnabled: false };
    const tickets = res.tickets ?? [];
    const valid = tickets.filter((t) => !isTicketExpired(t.sales_end_date));
    return {
      hasTickets: valid.length > 0,
      isBingoEnabled: Boolean(res.is_bingo_enabled),
    };
  } catch {
    // Network / 401 / 404 — fail closed (hide the buttons).
    return { hasTickets: false, isBingoEnabled: false };
  }
}

export function useTicketAvailability(
  eventId: number | undefined,
  isPastEvent: boolean
): State {
  const cached =
    typeof eventId === "number" && cache.has(eventId)
      ? (cache.get(eventId) as Availability)
      : null;

  const [state, setState] = useState<State>(() => {
    if (!eventId || isPastEvent) {
      return { hasTickets: false, isBingoEnabled: false, isLoading: false };
    }
    if (cached !== null) {
      return { ...cached, isLoading: false };
    }
    return { hasTickets: null, isBingoEnabled: false, isLoading: true };
  });

  useEffect(() => {
    if (!eventId) {
      setState({ hasTickets: false, isBingoEnabled: false, isLoading: false });
      return;
    }
    if (isPastEvent) {
      setState({ hasTickets: false, isBingoEnabled: false, isLoading: false });
      return;
    }
    if (cache.has(eventId)) {
      setState({
        ...(cache.get(eventId) as Availability),
        isLoading: false,
      });
      return;
    }

    let cancelled = false;
    setState({ hasTickets: null, isBingoEnabled: false, isLoading: true });

    const existing = inflight.get(eventId);
    const p = existing ?? loadAvailability(eventId);
    if (!existing) inflight.set(eventId, p);

    p.then((result) => {
      cache.set(eventId, result);
      inflight.delete(eventId);
      if (!cancelled) setState({ ...result, isLoading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [eventId, isPastEvent]);

  return state;
}
