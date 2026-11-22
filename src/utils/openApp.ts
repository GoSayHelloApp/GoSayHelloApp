/**
 * Open the GoSayHELLO app from the web, or send people to the store when it isn't installed.
 *
 * The old links went through Firebase Dynamic Links (gosayhello.page.link), which Google shut
 * down — they now show "Dynamic Link Not Found", so nothing opened the app any more.
 *
 * Phones: Universal Link (see appLinkUrl) — opens the app directly, else the store.
 * Desktop: App Store page in a new tab.
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
 * https://pythonapi.gosayhelloapp.com/app/event/<id> is a Universal Link (that host's
 * apple-app-site-association lists /app/*): with the iOS app installed, iOS opens the app on the
 * event — no "Open in GoSayHELLO?" prompt. Without the app the page loads and the server sends
 * people to the App Store (iPhone) or Play Store (Android).
 * The link must be on a different host than this page, or Safari keeps it in the browser.
 */
const APP_LINK_BASE = (process.env.REACT_APP_PYTHON_API_BASE_URL || "https://pythonapi.gosayhelloapp.com/").replace(
  /\/?$/,
  ""
);

export function appLinkUrl(eventId?: number | string | null): string {
  const id = Number(eventId);
  return id ? `${APP_LINK_BASE}/app/event/${id}` : `${APP_LINK_BASE}/app/open`;
}

/** Open the app (on the event when given); the store when it isn't installed. */
export function openGoSayHelloApp(eventId?: number | string | null): void {
  if (typeof window === "undefined") return;
  if (!isIOS() && !isAndroid()) {
    window.open(IOS_APP_STORE_URL, "_blank", "noopener,noreferrer");   // desktop
    return;
  }
  window.location.href = appLinkUrl(eventId);
}

/**
 * For <a href={appLinkUrl(id)} onClick={onAppLinkClick}>: iOS only hands a Universal Link to the
 * app when a real link is tapped (a JavaScript redirect stays in Safari), so the buttons are links.
 * Phones follow the link; desktop gets the App Store in a new tab.
 */
export function onAppLinkClick(e: { preventDefault: () => void }): void {
  if (isIOS() || isAndroid()) return;
  e.preventDefault();
  window.open(IOS_APP_STORE_URL, "_blank", "noopener,noreferrer");
}
