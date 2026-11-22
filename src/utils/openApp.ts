/**
 * Open the GoSayHELLO app from the web, or send people to the store when it isn't installed.
 *
 * Phones: the Firebase Dynamic Link the web has always used (see dynamicLink).
 * Desktop: App Store page.
 */
export const IOS_APP_STORE_URL = "https://apps.apple.com/app/id1585044833";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gosayhello";

function ua(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod/i.test(ua())) return true;
  return navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1; // iPadOS
}

export function isAndroid(): boolean {
  return /Android/i.test(ua());
}

/** Instagram / Facebook / TikTok / LinkedIn / Snapchat … in-app browsers (no Wallet, limited app links). */
export function isInAppBrowser(): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|BytedanceWebview|TikTok|LinkedInApp|Snapchat|Twitter|Line\//i.test(
    ua()
  );
}

export function appStoreUrl(): string {
  return isAndroid() ? PLAY_STORE_URL : IOS_APP_STORE_URL;
}

/** iOS: open an https URL in Safari from an in-app browser (x-safari-https://…). */
export function safariUrl(url: string): string {
  return url.replace(/^https:\/\//i, "x-safari-https://").replace(/^http:\/\//i, "x-safari-http://");
}

/**
 * Same link the web used before (Firebase Dynamic Link on gosayhello.page.link): Google opens
 * the app when installed, otherwise the App Store / Play Store.
 * Note: Google officially shut Dynamic Links down (25 Aug 2025); these long links still work
 * for now but may stop at any time.
 */
function dynamicLink(eventId?: number | string | null): string {
  const id = Number(eventId);
  const link = id ? `https://gosayhello.page.link/eventdata?event_id=${id}` : "https://gosayhello.page.link";
  return `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=${link}${
    id ? "&efr=1" : ""
  }`;
}

/** Open the app (on the event when given) — phones via the Dynamic Link, desktop to the App Store. */
export function openGoSayHelloApp(eventId?: number | string | null): void {
  if (typeof window === "undefined") return;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua())) {
    window.location.href = dynamicLink(eventId);
  } else {
    window.location.href = "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833";
  }
}
