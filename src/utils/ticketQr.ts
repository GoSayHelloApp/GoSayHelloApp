/** Same payload as mobile: base64 UTF-8 of `QR-<purchasedTicketId>-<eventId>`. */
export function buildTicketQrPayload(purchasedTicketId: number, eventId: number): string {
  const raw = `QR-${purchasedTicketId}-${eventId}`;
  return btoa(raw);
}
