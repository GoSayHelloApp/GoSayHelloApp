# Purchased Tickets Screen — Web Developer Handoff

**Module:** `PurchasedTicketsVC` (User View)

---

## Overview

This screen lists all tickets the user has purchased or exchanged. It has a 3-tab segmented control:

- **Tab 0 — My Tickets** (tickets I bought and still own)
- **Tab 1 — Sent Transfers** (tickets I transferred to someone else)
- **Tab 2 — Received** (tickets someone transferred to me)

From each ticket the user can: view its QR, view the event, or (on Tab 0 only) transfer it to another user.

---

## Step 1 — Load the Screen

- Default tab = **Tab 0** (My Tickets)
- Call the ticket list API (see Step 2)
- Pull-to-refresh and an `UpdateMyTicketListNotification` event also re-trigger the fetch.

---

## Step 2 — Fetch the List (API changes per tab)

### Tab 0: My Tickets

- **Method:** `GET`
- **URL:** `{pythonBaseUrl}purchased-tickets`
- **Headers:** `Authorization: <bearer token>`

### Tab 1: Sent Transfers

- **Method:** `GET`
- **URL:** `{pythonBaseUrl}ticket-transfers?type=1`
- **Headers:** `Authorization: <bearer token>`

### Tab 2: Received Transfers

- **Method:** `GET`
- **URL:** `{pythonBaseUrl}ticket-transfers?type=2`
- **Headers:** `Authorization: <bearer token>`

**Response shape (all three):**

```json
{
  "success": true,
  "tickets": [ { "...ResponsePurchasedTicketModel..." } ]
}
```

---

## Step 3 — Render Each Ticket Card

**Card contents**

- Event image (left thumbnail, 100×100 rounded)
- Venue name (orange) + event type
- Date range — e.g. `Jun 10 - Jun 11`
- Time range — e.g. `07:30 PM to 11:00 PM`
- Price (`total_paid` summed across purchases)
- Ticket name + ticket type
- Address
- Count label (context-aware, see below)
- Action buttons (context-aware, see below)

**Date/time handling**

If the event's `address_1` ends with a `"."` → dates/times are stored as UTC and MUST be converted to the user's local timezone before display. Otherwise they're already local.

Output format: date → `MMM. dd`, time → 12-hour with AM/PM.

**Count label (by tab)**

| Tab | Label |
|---|---|
| Tab 0 | `You have N ticket(s)` |
| Tab 1 | `Sent N ticket(s)` + `To: <name> (<email>)` |
| Tab 2 | `Received N ticket(s)` + `From: <name> (<email>)` |

---

## Step 4 — User Actions Per Card

| Button | Action |
|---|---|
| **View Ticket** | Open Ticket Detail screen. On Tab 0 → Transfer button visible. On Tab 1/2 → Transfer button hidden. |
| **View Event** | Open Event Profile screen. Uses `ticket.event_id`. |
| **Transfer Ticket** | Only visible on Tab 0. Opens the Transfer popup (Step 5). Max transferable = `ticket.purchased_quantity`. |

---

## Step 5 — Transfer a Ticket (Tab 0 only)

User fills in:

- Recipient email
- Quantity (`1 … ticket.purchased_quantity`)

**Request**

- **Method:** `POST`
- **URL:** `{pythonBaseUrl}tickets/transfer`
- **Headers:** `Authorization: <bearer token>`
- **Body (JSON):**

```json
{
  "ticketId":       <id>,
  "recipientEmail": "user@example.com",
  "quantity":       <n>
}
```

**Response**

```json
{
  "success": true,
  "message": "..."
}
```

**On success**

- Subtract transferred quantity from the card's count.
- If count drops to 0 → remove the card.
- Re-fetch the list (Step 2) to stay in sync.
- Show toast: `<message from API>`.

---

## API Summary

| # | Purpose | Method | Endpoint |
|---|---|---|---|
| 1 | My purchased tickets | GET | `purchased-tickets` |
| 2 | Sent transfers | GET | `ticket-transfers?type=1` |
| 3 | Received transfers | GET | `ticket-transfers?type=2` |
| 4 | Transfer a ticket | POST | `tickets/transfer` |

All endpoints require the `Authorization` header.

---

## Important Notes for Web Parity

> ⚠️ **Transfer button visibility**
> Only shown on Tab 0 ("My Tickets"). Hide on Tabs 1 & 2.

> ⚠️ **Timezone rule**
> If `address_1` ends with `"."`, treat `start/end date+time` as UTC and convert to the viewer's local timezone. Otherwise use as-is.

> ⚠️ **Total price calculation**
> `priceLabel` shows the SUM of `purchases[*].total_paid`, not a single ticket price. (A single record may represent multiple purchases.)

> ⚠️ **Quantity decrement after transfer**
> After a successful transfer, client-side updates the cached quantity AND re-fetches the list from the server to stay consistent.

> ⚠️ **Tab switch resets**
> Changing tabs clears the list before fetching the new one, to avoid stale rows showing briefly.
