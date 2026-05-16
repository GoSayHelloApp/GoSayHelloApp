import { isAddressUtcMode, parseTicketApiUtc, parseTicketSalesDateTime } from "./ticketDates";

function padTime(time: string): string {
  if (!time) return "00:00:00";
  const parts = time.split(":").map((p) => p.trim());
  const h = (parts[0] ?? "0").padStart(2, "0");
  const m = (parts[1] ?? "0").padStart(2, "0");
  const s = (parts[2] ?? "0").padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function parseWallClock(dateStr: string, timeStr: string): Date {
  const d = (dateStr || "").trim();
  const t = padTime(timeStr);
  return new Date(`${d}T${t}`);
}

/**
 * Sales window strings from `GET tickets/...` (naive local or zoned ISO). Shown as formatted local labels — no UTC shift for naive values.
 * @param _legacyTz unused; kept for call-site compatibility.
 */
export function formatSalesWindowLabel(
  salesStart: string,
  salesEnd: string,
  _legacyTz?: string
): { start: string; end: string } {
  const start = parseTicketSalesDateTime(salesStart);
  const end = parseTicketSalesDateTime(salesEnd);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return {
    start: Number.isNaN(start.getTime()) ? "" : new Intl.DateTimeFormat("en-US", opts).format(start),
    end: Number.isNaN(end.getTime()) ? "" : new Intl.DateTimeFormat("en-US", opts).format(end),
  };
}

/**
 * Event run dates for purchased-ticket cards. When `address_1` ends with `.`, API sends **UTC** combined date+time;
 * otherwise values are treated as local wall clock. Output is always the viewer's **local** locale strings.
 */
export function formatPurchasedEventDateTime(
  address1: string,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): { date: string; time: string } {
  const utcMode = isAddressUtcMode(address1);
  const start = utcMode ? parseTicketApiUtc(`${startDate} ${startTime}`) : parseWallClock(startDate, startTime);
  const end = utcMode ? parseTicketApiUtc(`${endDate} ${endTime}`) : parseWallClock(endDate, endTime);
  const dateFmt = (d: Date) =>
    Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).replace(",", ".");
  const timeFmt = (d: Date) =>
    Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return {
    date: `${dateFmt(start)} - ${dateFmt(end)}`.trim(),
    time: `${timeFmt(start)} to ${timeFmt(end)}`.trim(),
  };
}
