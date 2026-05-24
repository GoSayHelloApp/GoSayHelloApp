import tzlookup from "tz-lookup";

/**
 * Event-timezone helpers, mirroring the iOS ListOfTickets screen:
 *  - sale dates from the API are UTC ISO strings WITHOUT a trailing `Z`
 *  - they are DISPLAYED in the EVENT's timezone (resolved from lat/long via
 *    `tz-lookup`, which bundles cleanly in the browser — unlike `geo-tz`)
 *  - coming-soon / on-sale / sold-out / expired state is compared against the
 *    real instant (UTC), which is timezone-agnostic for the comparison itself
 */

export type TicketSaleState =
  | "coming_soon"
  | "on_sale"
  | "sold_out"
  | "expired";

/** Resolve the event's IANA timezone from coordinates; falls back to the viewer's tz. */
export function resolveEventIanaTimeZone(
  lat?: number | null,
  lng?: number | null
): string {
  try {
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      return tzlookup(lat, lng);
    }
  } catch {
    /* fall through to viewer tz */
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/** "UTC+05:00" offset string for a given IANA zone. */
export function utcOffsetLabel(iana: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const raw =
      parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
    return raw.replace(/^GMT/, "UTC").replace(/^UTC$/, "UTC+00:00");
  } catch {
    return "UTC";
  }
}

/** "Timezone: UTC+05:00 - Asia/Karachi" header string (matches iOS table header). */
export function formatTimezoneHeader(iana: string): string {
  return `Timezone: ${utcOffsetLabel(iana)} - ${iana}`;
}

/** Server stores UTC ISO without a trailing `Z`; ensure JS parses it as UTC. */
function toUtcDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const normalized = /[zZ]$/.test(iso) ? iso : `${iso}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Sales window formatted in the event timezone:
 *  - dateLine: "Wed, 05-20-2026 – Wed, 05-27-2026"
 *  - timeLine: "09:32 PM to 09:33 PM"
 */
export function formatSalesWindow(
  startIso?: string | null,
  endIso?: string | null,
  iana = "UTC"
): { dateLine: string; timeLine: string } {
  const start = toUtcDate(startIso);
  const end = toUtcDate(endIso);
  if (!start || !end) return { dateLine: "", timeLine: "" };

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const fmtDate = (d: Date) => {
    const p = dateFmt.formatToParts(d);
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    return `${get("weekday")}, ${get("month")}-${get("day")}-${get("year")}`;
  };

  return {
    dateLine: `${fmtDate(start)} – ${fmtDate(end)}`,
    timeLine: `${timeFmt.format(start)} to ${timeFmt.format(end)}`,
  };
}

/**
 * Mirrors iOS `updateUserActionState` precedence:
 * coming_soon → expired → sold_out → on_sale.
 */
export function getTicketSaleState(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
  sold: number,
  quantity: number,
  now: number = Date.now()
): TicketSaleState {
  const start = toUtcDate(startIso);
  const end = toUtcDate(endIso);

  if (start && now < start.getTime()) return "coming_soon";
  if (end && now > end.getTime()) return "expired";
  if (sold >= quantity) return "sold_out";
  return "on_sale";
}

export function isTicketExpired(endIso?: string | null): boolean {
  const end = toUtcDate(endIso);
  if (!end) return false;
  return Date.now() > end.getTime();
}

/**
 * Format a UTC date (`yyyy-MM-dd`) + time (`HH:mm`) pair in the event timezone.
 * Returns { date: "May. 21", time: "3:00 AM" }.
 */
export function formatUtcDateTimeInZone(
  dateStr?: string | null,
  timeStr?: string | null,
  iana = "UTC"
): { date: string; time: string } {
  if (!dateStr) return { date: "", time: "" };
  const dm = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!dm) return { date: dateStr, time: timeStr || "" };
  const tm = /^(\d{1,2}):(\d{2})/.exec(timeStr || "00:00");
  const hh = tm ? tm[1].padStart(2, "0") : "00";
  const mm = tm ? tm[2] : "00";
  const d = new Date(`${dm[1]}-${dm[2]}-${dm[3]}T${hh}:${mm}:00Z`);
  if (Number.isNaN(d.getTime())) return { date: dateStr, time: timeStr || "" };

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    month: "short",
    day: "numeric",
  }).formatToParts(d);
  const mon = dateParts.find((p) => p.type === "month")?.value ?? "";
  const day = dateParts.find((p) => p.type === "day")?.value ?? "";
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return { date: `${mon}. ${day}`, time };
}
