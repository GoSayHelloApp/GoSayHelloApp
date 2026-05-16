# Ticket Detail Screen — Web Developer Handoff

**Module:** `TicketDetailVC` (with `TicketDetailPageVC` for each page)

---

## Overview

The screen shows the full details of a purchased ticket with a **QR code for entry**. A single ticket record may contain multiple purchase batches (e.g. a user bought 2 separately on different days) — each batch is rendered as its own **swipeable page** with its own QR code.

The user can also:
- **Save** the ticket as an image to Photos
- **Share** the ticket via the system share sheet
- **Transfer** a single ticket to another user (when allowed)

---

## Step 1 — Entry Point

The screen is opened from:
- `ListOfTicketsVC` → **View Ticket** (after purchase)
- `PurchasedTicketsVC` → **View Ticket** on a card

Input: one `ResponsePurchasedTicketModel` (already fetched by the previous screen).

If the entry was from the **Sent** or **Received** tabs, the caller sets `hideTransferButton = true`.

---

## Step 2 — Build Swipeable Pages

For each entry in `ticket.purchases[]`, create one page:

- Clone the parent ticket data
- Override per-page fields:
  - `purchased_ticket_id = purchase.purchased_ticket_id`
  - `purchased_quantity  = purchase.quantity`
  - `purchased_price     = purchase.total_paid`
  - `purchase_date       = purchase.purchase_date`
  - `is_used             = purchase.is_used`
- Wrap in a horizontal page view with a dot-style page indicator.

If `purchases` is empty → show a single page using the ticket as-is.

---

## Step 3 — Render a Single Page

Each page card contains, top-to-bottom:

| Section | Content |
|---|---|
| **QR code** | 220×220 image generated client-side (see Step 4) |
| **"Already Used" badge** | Red pill — shown only if `is_used == true` |
| **Ticket name** (bold) | `ticket_name` |
| **Ticket type** | `Type: <ticket_type>` |
| **Price** | `formatPrice(purchased_price)` |
| **Event name** (bold) | `venue_name` |
| **Event type** | `Type: <event_type_name>` |
| **Organizer** | `Organizer: <organizer_name>` |
| **Date** | `Date: Jun 10 - Jun 11` |
| **Time** | `Time: 07:30 PM to 11:00 PM` |
| **Address** | `Address: <address_1>` |
| **Buyer** | `Buyer: <first_name> <last_name>` |
| **Quantity** | `Quantity: <purchased_quantity>` |
| Footer | `Powered by GoSayHELLO` |

**Date/time handling:** If `address_1` ends with `"."` → treat `start/end date+time` as UTC and convert to the viewer's local timezone. Otherwise use as-is.

Output format: date → `MMM. dd`, time → 12-hour with AM/PM.

---

## Step 4 — QR Code Generation (Client-Side)

No API call. The QR is generated locally so the scanner can validate against the server later.

**Payload format**

```
Input:  "QR-<purchased_ticket_id>-<event_id>"
        e.g. "QR-1234-567"

Then:   base64-encode the UTF-8 bytes of the string above
Then:   render as QR code (Error correction level "Q", scale 10×)
```

> Web must produce the **same base64 payload** for any server-side validation (web display only, scan logic still happens on the organizer's device).

---

## Step 5 — Button Actions

### Save button (orange)
- Screenshots the ticket card view and saves to the device Photos library.
- Requires Photos permission; if denied, shows a permission prompt.
- On web → equivalent is "Download PDF/PNG of ticket".

### Share button (black)
- Screenshots the ticket card view and opens the system share sheet.
- On web → use `navigator.share()` or fallback to download + copy link.

### Transfer Ticket button (blue) — *optional*
- Hidden if `hideTransferButton == true` (entered from Sent/Received tabs).
- Visible on Tab 0 / post-purchase flow.
- Transfers **this single page's ticket** (quantity fixed to 1).
- Opens a popup where the user enters a recipient email, then calls the API below.

---

## Step 6 — Single-Ticket Transfer API

**Request**

- **Method:** `POST`
- **URL:** `{pythonBaseUrl}tickets/transfer-single`
- **Headers:**
  - `Authorization: <bearer token>`
  - `Accept: application/json`
  - `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "purchasedTicketId": <int>,
  "recipientEmail":    "user@example.com"
}
```

> Note: this endpoint differs from the bulk `tickets/transfer` endpoint on the listing screen. It transfers **one** specific `purchased_ticket_id` (single seat), not a quantity of a ticket type.

**Response**

```json
{
  "success": true,
  "message": "..."
}
```

**On success**

- Remove the current page from the page view (`removeTicketAndReload`).
- If no pages remain → pop back to the previous screen after ~1 sec.
- Post a notification so the previous screen refreshes its list.
- Show toast: `<message from API>`.

---

## API Summary

| # | Purpose | Method | Endpoint |
|---|---|---|---|
| 1 | Transfer a single purchased ticket | POST | `tickets/transfer-single` |

> All other data on this screen is passed in-memory from the previous screen.
> Photos save + system share are client-only (no API).

---

## Important Notes for Web Parity

> ⚠️ **Multiple pages per ticket**
> A record may have multiple entries in `purchases[]`. Each one is its own page with its own QR code and its own `purchased_ticket_id`.

> ⚠️ **Already-Used state**
> Use `is_used` from the purchase object (not from the parent ticket) to decide whether to show the red "Already Used" badge.

> ⚠️ **QR payload format**
> Must be `base64("QR-<purchasedTicketId>-<eventId>")`. Anything else will fail scanner validation.

> ⚠️ **Timezone rule**
> If `address_1` ends with `"."`, convert dates/times from UTC to local. Otherwise display as-is.

> ⚠️ **Transfer button visibility**
> Hide the Transfer button when viewing a ticket that was already sent/received — use the same `hideTransferButton` flag passed in by the caller.

> ⚠️ **Single-transfer endpoint**
> Uses `tickets/transfer-single` with `purchasedTicketId` — NOT the bulk `tickets/transfer` used on the list screen.
