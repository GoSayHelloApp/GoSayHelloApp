/**
 * CRA/webpack 5 cannot bundle `geo-tz` (Node `fs`/`path`). Until the API returns an
 * explicit event IANA zone, we use the viewer's device timezone for headers and
 * sales-window formatting (still consistent Intl formatting).
 */
export function resolveEventIanaTimeZone(_lat?: number | null, _lng?: number | null): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTimezoneHeader(iana: string): string {
  const d = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    timeZoneName: "longOffset",
  }).formatToParts(d);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  return `Timezone: ${offset} - ${iana}`;
}
