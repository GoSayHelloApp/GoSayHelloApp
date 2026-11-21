import { getStartUp } from "../../utils/tokenStorage";

/**
 * Event page traffic for the organizer's "Traffic" tab (Python: POST /events/{id}/track).
 *   view    — the public event page opened
 *   cta     — Get Tickets / RSVP tapped
 *   convert — a ticket purchase or guest RSVP finished
 * Visitors are counted once: signed-in users by account, everyone else by a random id kept in this browser.
 * The server ignores repeats within 30 minutes, the organizer's own visits and link-preview bots.
 * Fire-and-forget: tracking never blocks or breaks the page.
 */
const PYTHON_API_BASE = (process.env.REACT_APP_PYTHON_API_BASE_URL || "https://pythonapi.gosayhelloapp.com/").replace(
  /\/?$/,
  "/"
);

export type TrafficAction = "view" | "cta" | "convert";

const VISITOR_KEY = "gsh_visitor_id";
let memoryVisitorId: string | null = null;

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 32);
}

/** Random id for this browser (localStorage; in-memory when storage is blocked). */
export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = randomId();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    if (!memoryVisitorId) memoryVisitorId = randomId();
    return memoryVisitorId;
  }
}

/**
 * Where this visit came from:
 * 1. `?src=` on the link (the app tags each share: whatsapp, messages, instagram, link …)
 * 2. the in-app browser it opened in (Instagram, Facebook, TikTok, LinkedIn, Snapchat)
 * 3. the referring site (Google, Facebook, X …)
 * otherwise "direct".
 */
export function detectSource(search: string): string {
  try {
    const src = new URLSearchParams(search).get("src");
    if (src) return src.trim().toLowerCase().slice(0, 32);
  } catch {
    /* ignore */
  }
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS|Messenger/i.test(ua)) return "facebook";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/Twitter/i.test(ua)) return "x";

  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
  } catch {
    host = "";
  }
  if (!host) return "direct";
  if (/(^|\.)google\./.test(host)) return "google";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host) || host.startsWith("l.facebook.") || host.startsWith("lm.facebook.")) return "facebook";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(host)) return "x";
  if (/(^|\.)(linkedin\.com|lnkd\.in)$/.test(host)) return "linkedin";
  if (/(^|\.)tiktok\.com$/.test(host)) return "tiktok";
  if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return "whatsapp";
  if (/(^|\.)(t\.me|telegram\.org)$/.test(host)) return "telegram";
  if (/(^|\.)gosayhello(app)?\.(app|com)$/.test(host)) return "direct";   // our own pages / link redirector
  return "other";
}

/** True for automated browsers / link-preview fetchers (they shouldn't count as visitors). */
function isBot(): boolean {
  if (typeof navigator === "undefined") return true;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  return /bot|crawl|spider|preview|headless|facebookexternalhit|WhatsApp\//i.test(navigator.userAgent);
}

export function trackEventTraffic(eventId: number | string | undefined, action: TrafficAction, source?: string): void {
  const id = Number(eventId);
  if (!id || isBot()) return;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getStartUp()?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = JSON.stringify({
    action,
    platform: "web",
    visitor_id: getVisitorId(),
    source: source ?? "direct",
  });
  try {
    // keepalive: the request still goes out if the page navigates away right after (e.g. Get Tickets).
    fetch(`${PYTHON_API_BASE}events/${id}/track`, { method: "POST", headers, body, keepalive: true }).catch(() => {});
  } catch {
    /* ignore */
  }
}
