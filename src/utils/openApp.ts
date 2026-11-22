/**
 * Open the GoSayHELLO app from the web, or send people to the store when it isn't installed.
 *
 * The old links went through Firebase Dynamic Links (gosayhello.page.link), which Google shut
 * down — they now show "Dynamic Link Not Found", so nothing opened the app any more.
 *
 * iPhone / iPad: try the app's own scheme (gosayhelloapp://event/<id>). If the page is still on
 *   screen ~2.5 s later, the app isn't installed → App Store.
 * Android: Play Store page (it shows "Open" when the app is installed).
 * Desktop: App Store page in a new tab.
 */
export const IOS_APP_STORE_URL = "https://apps.apple.com/app/id1585044833";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gosayhello";
const APP_SCHEME = "gosayhelloapp://";

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
 * gosayhelloapp://event/<id> — no "=" on purpose: the app versions already in the App Store treat
 * any scheme link containing "=" as a referral code and open Sign-up. Those versions simply open
 * the app on this link; newer versions open the event.
 */
function eventDeepLink(eventId?: number | string | null): string {
  const id = Number(eventId);
  return id ? `${APP_SCHEME}event/${id}` : `${APP_SCHEME}open`;
}

/** Open the app (on the event when given); falls back to the store when it isn't installed. */
export function openGoSayHelloApp(eventId?: number | string | null): void {
  if (typeof window === "undefined") return;

  if (isAndroid()) {
    window.location.href = PLAY_STORE_URL;
    return;
  }
  if (!isIOS()) {
    window.open(IOS_APP_STORE_URL, "_blank", "noopener,noreferrer");
    return;
  }

  // iOS: the app opening hides/blurs this page — that cancels the store fallback.
  let left = false;
  const markLeft = () => {
    left = true;
  };
  const onVisibility = () => {
    if (document.hidden) left = true;
  };
  window.addEventListener("pagehide", markLeft);
  window.addEventListener("blur", markLeft);
  document.addEventListener("visibilitychange", onVisibility);

  window.setTimeout(() => {
    window.removeEventListener("pagehide", markLeft);
    window.removeEventListener("blur", markLeft);
    document.removeEventListener("visibilitychange", onVisibility);
    if (!left && !document.hidden) window.location.href = IOS_APP_STORE_URL;
  }, 2500);

  window.location.href = eventDeepLink(eventId);
}
