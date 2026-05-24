declare module "tz-lookup" {
  /** Returns the IANA timezone identifier for the given latitude/longitude. */
  export default function tzlookup(lat: number, lon: number): string;
}
