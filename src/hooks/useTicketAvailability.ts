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

interface State {
  hasTickets: boolean | null;
  isLoading: boolean;
}

const cache = new Map<number, boolean>();
const inflight = new Map<number, Promise<boolean>>();

async function loadHasTickets(eventId: number): Promise<boolean> {
  try {
    const res = await fetchTicketAvailability(eventId);
    if (!res.success) return false;
    const tickets = res.tickets ?? [];
    const valid = tickets.filter((t) => !isTicketExpired(t.sales_end_date));
    return valid.length > 0;
  } catch {
    // Network / 401 / 404 — fail closed (hide the button).
    return false;
  }
}

export function useTicketAvailability(
  eventId: number | undefined,
  isPastEvent: boolean
): State {
  const cached =
    typeof eventId === "number" && cache.has(eventId)
      ? (cache.get(eventId) as boolean)
      : null;

  const [state, setState] = useState<State>(() => {
    if (!eventId || isPastEvent) {
      return { hasTickets: false, isLoading: false };
    }
    if (cached !== null) return { hasTickets: cached, isLoading: false };
    return { hasTickets: null, isLoading: true };
  });

  useEffect(() => {
    if (!eventId) {
      setState({ hasTickets: false, isLoading: false });
      return;
    }
    if (isPastEvent) {
      setState({ hasTickets: false, isLoading: false });
      return;
    }
    if (cache.has(eventId)) {
      setState({
        hasTickets: cache.get(eventId) as boolean,
        isLoading: false,
      });
      return;
    }

    let cancelled = false;
    setState({ hasTickets: null, isLoading: true });

    const existing = inflight.get(eventId);
    const p = existing ?? loadHasTickets(eventId);
    if (!existing) inflight.set(eventId, p);

    p.then((result) => {
      cache.set(eventId, result);
      inflight.delete(eventId);
      if (!cancelled) setState({ hasTickets: result, isLoading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [eventId, isPastEvent]);

  return state;
}
