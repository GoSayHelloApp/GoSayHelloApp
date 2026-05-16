/**
 * Parse API datetimes stored as **UTC** (naive `YYYY-MM-DD HH:mm:ss` / ISO treated as UTC by appending `Z`).
 * Use for purchased-event payloads where the backend means UTC.
 */
export function parseTicketApiUtc(dateTime: string): Date {
  if (!dateTime) return new Date(NaN);
  const t = dateTime.trim();
  if (t.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(t)) {
    return new Date(t);
  }
  const normalized = t.includes("T") ? t : t.replace(" ", "T");
  const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
  return new Date(withZ);
}

/**
 * Ticket **sales** window from `GET tickets/...`: naive `YYYY-MM-DDTHH:mm:ss` (or space) in **local wall time** —
 * do not reinterpret as UTC. If the string has `Z` or a numeric offset, parse as that instant.
 */
export function parseTicketSalesDateTime(dateTime: string): Date {
  if (!dateTime) return new Date(NaN);
  const t = dateTime.trim();
  if (t.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(t)) {
    return new Date(t);
  }
  const normalized = (t.includes("T") ? t : t.replace(" ", "T")).trim();
  const [datePart, timePart = "00:00:00"] = normalized.split("T");
  const [yStr, moStr, dStr] = datePart.split("-");
  const y = Number(yStr);
  const mo = Number(moStr);
  const d = Number(dStr);
  const timeSegs = timePart.split(":");
  const h = Number(timeSegs[0] ?? 0);
  const mi = Number(timeSegs[1] ?? 0);
  const secPart = Number.parseFloat(String(timeSegs[2] ?? "0"));
  const sec = Math.min(59, Math.floor(Number.isFinite(secPart) ? secPart : 0));
  const ms = Math.round((secPart - sec) * 1000) || 0;
  if (![y, mo, d, h, mi, sec].every((n) => Number.isFinite(n))) return new Date(NaN);
  return new Date(y, mo - 1, d, h, mi, sec, ms);
}

export function isAddressUtcMode(address1: string | undefined): boolean {
  return Boolean(address1 && address1.trim().endsWith("."));
}
