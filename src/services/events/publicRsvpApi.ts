import axios from "axios";

const PYTHON_API_BASE = "https://pythonapi.gosayhelloapp.com";

export interface RsvpSendCodeResponse {
  success: boolean;
  message?: string;
  resend_after?: number;
}

export interface RsvpConfirmResponse {
  success: boolean;
  message?: string;
  already_rsvped?: boolean;
  event_id?: number;
  email?: string;
  apple_wallet_url?: string | null;
  /** true when the code/link expired or was used — the guest must request a new code */
  expired?: boolean;
}

const opts = { timeout: 20000, headers: { "Content-Type": "application/json" } };

/** Errors from the API come back as { success:false, message } (also on 429) — never throw for those. */
async function post<T>(path: string, body: unknown): Promise<T> {
  try {
    const { data } = await axios.post<T>(`${PYTHON_API_BASE}${path}`, body, opts);
    return data;
  } catch (err) {
    const data = (err as { response?: { data?: T } })?.response?.data;
    if (data) return data;
    return { success: false, message: "Network error. Please try again." } as unknown as T;
  }
}

/** Step 1 — email a 6-digit code (+ confirm link) to the guest. Nothing is saved yet. */
export function sendRsvpCode(params: { event_id: number; email: string; name?: string }) {
  return post<RsvpSendCodeResponse>("/public/rsvp/send-code", params);
}

/** Step 2 — code from the email → RSVP saved. */
export function verifyRsvpCode(params: { event_id: number; email: string; code: string }) {
  return post<RsvpConfirmResponse>("/public/rsvp/verify", params);
}

/** Step 2 (alt) — the "Confirm my RSVP" button in the email lands on ?rsvp_confirm=<token>. */
export function confirmRsvpLink(token: string) {
  return post<RsvpConfirmResponse>("/public/rsvp/confirm-link", { token });
}
