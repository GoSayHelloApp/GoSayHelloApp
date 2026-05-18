const STORAGE_KEY = "gosayhello_ticket_purchase_return";

export interface TicketPurchaseReturn {
  eventId: number;
}

export function setTicketPurchaseReturn(data: TicketPurchaseReturn): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTicketPurchaseReturn(): TicketPurchaseReturn | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TicketPurchaseReturn;
    if (!parsed?.eventId || !Number.isFinite(Number(parsed.eventId))) return null;
    return { eventId: Number(parsed.eventId) };
  } catch {
    return null;
  }
}

export function clearTicketPurchaseReturn(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function parseEventIdFromPublicEventPath(path: string): number | null {
  const match = path.match(/\/event-details\/(\d+)/i);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

export function buildEventTicketsPath(eventId: number, openBuyModal = true): string {
  return `/events/${eventId}/details${openBuyModal ? "?buyTickets=1" : ""}`;
}

export function hasMinimumPreferences(userPreferences: unknown[] | undefined): boolean {
  return (userPreferences?.length ?? 0) >= 3;
}

/** Where to send the user immediately after login or signup. */
export function resolvePostAuthNavigation(userPreferences: unknown[] | undefined): string {
  const ticket = getTicketPurchaseReturn();
  const redirect = sessionStorage.getItem("redirectAfterLogin");
  const hasPrefs = hasMinimumPreferences(userPreferences);

  let eventId = ticket?.eventId ?? null;
  if (eventId == null && redirect) {
    eventId = parseEventIdFromPublicEventPath(redirect);
    if (eventId != null) {
      setTicketPurchaseReturn({ eventId });
    }
  }

  if (eventId != null) {
    sessionStorage.removeItem("redirectAfterLogin");
    if (hasPrefs) {
      clearTicketPurchaseReturn();
      return buildEventTicketsPath(eventId);
    }
    return "/preferences";
  }

  if (redirect) {
    sessionStorage.removeItem("redirectAfterLogin");
    return redirect;
  }

  return hasPrefs ? "/nearby" : "/preferences";
}

export function shouldSkipOnboardingAfterAuth(): boolean {
  return Boolean(getTicketPurchaseReturn() || sessionStorage.getItem("redirectAfterLogin")?.includes("event-details"));
}
