# Tickets Screen — Web Developer Handoff

**Module:** `ListOfTicketsVC` (User View)

---

## Overview

The screen displays all tickets available for a given event and lets the user purchase them (free or paid via Stripe). HELLO token redemption and quantity selection are supported.

---

## Step 1 — Load the Screen

- Resolve the event's timezone (from event lat/long).
- Show a header: `Timezone: UTC-05:00 - America/New_York`.
- Fetch the ticket list (see Step 2).

---

## Step 2 — Fetch the Ticket List

**Request**

- **Method:** `GET`
- **URL:** `{pythonBaseUrl}tickets/event1/{eventId}?requestedUserId={userId}&isUserView=true`
- **Headers:**
  - `Authorization: <bearer token>`
  - `Accept: application/json`

**Response (relevant fields)**

```json
{
  "tickets": [ ... ],
  "wallet_info": {
    "wallet_tokens":    0,
    "is_wallet_active": 1
  }
}
```

**Client-side processing**

- Convert `sales_start_date` / `sales_end_date` from UTC → event timezone.
- Format as: `Jun 10, 2026 07:30 PM`.
- Remove expired tickets from the list.
- Render as a list (pull-to-refresh re-runs this step).

---

## Step 3 — Render Each Ticket Card

Each card displays one of these states:

| State | Condition |
|---|---|
| Coming Soon | `now < sales_start_date` |
| Buy Now | active & available (`quantity - sold > 0`) |
| Sold Out | `sold >= quantity` |
| Expired | `now > sales_end_date` |
| Purchased ✅ | user already bought → show **View Ticket** button |

---

## Step 4 — User Actions on an Active Ticket

**a) Quantity**

Stepper `[ − | n | + ]` (minimum 1).

**b) HELLO Token Redemption** — only if `is_wallet_active == 1` AND `price > 0`

- Toggle → shows slider
- Slider → user picks tokens to redeem (capped at wallet balance)
- Conversion rate: **1000 HELLO = $1.00**

**c) Live Pricing Breakdown**

```
Total          = price × quantity
Processing Fee = max(total × 0.15, 2.50)
HELLO Discount = tokenRedemption / 1000
Payable        = max(0, total + fee − discount)
```

---

## Step 5 — Purchase Flow

### A. Free Ticket (`price == 0`)

Skip Stripe. Go straight to Step 5C (Confirm Purchase).

### B. Paid Ticket (`price > 0`)

#### 5B.1 — Create Payment Intent

- **Method:** `POST`
- **URL:** `{pythonBaseUrl}create-payment-intent`
- **Headers:** `Authorization: <bearer token>`
- **Body (JSON):**

```json
{
  "amount":          <payable in cents (int)>,
  "currency":        "usd",
  "ticketId":        <id>,
  "quantity":        <n>,
  "tokenRedemption": <tokens>
}
```

- **Response:**

```json
{
  "clientSecret":       "pi_xxx_secret_xxx",
  "paymentIntentId":    "pi_xxx",
  "customerId":         "cus_xxx",
  "ephemeralKeySecret": "ek_xxx"
}
```

#### 5B.2 — Present Stripe Checkout

Use Stripe.js / Payment Element on web, initialized with:

- `clientSecret` → from step 5B.1
- `customer` → `customerId` + `ephemeralKeySecret` (for saved cards)
- `returnUrl` → for redirect methods (Klarna, Cash App)

- On Stripe `completed` result → proceed to 5C.
- On `canceled` or `failed` → do **NOT** call 5C; surface error to user.

### 5C — Confirm Purchase on Backend

- **Method:** `POST`
- **URL:** `{pythonBaseUrl}tickets/buy`
- **Headers:** `Authorization: <bearer token>`
- **Body (JSON):**

```json
{
  "ticketId":         <id>,
  "quantity":         <n>,
  "userId":           <id>,
  "intentId":         "<paymentIntentId>",
  "totalPaidPayment": <payable as float/dollars>,
  "tokenRedemption":  <tokens>
}
```

> `intentId` is an empty string for free tickets.

**On success:**

- Refetch the ticket list (Step 2)
- Show toast: `Ticket purchased`

---

## Step 6 — View a Purchased Ticket

When the user taps **View Ticket**:

- **Method:** `GET`
- **URL:** `{pythonBaseUrl}purchased-ticket-by-ticket-id/{ticketId}`
- **Headers:** `Authorization: <bearer token>`

Use the response to render the ticket detail page (QR / info).

---

## API Summary

| # | Purpose | Method | Endpoint |
|---|---|---|---|
| 1 | List tickets + wallet info | GET | `tickets/event1/{eventId}?requestedUserId=&isUserView=` |
| 2 | Create Stripe PaymentIntent | POST | `create-payment-intent` |
| 3 | Confirm ticket purchase | POST | `tickets/buy` |
| 4 | Get purchased ticket detail | GET | `purchased-ticket-by-ticket-id/{ticketId}` |
| 5 | Delete ticket (organizer) | DELETE | `tickets/{ticketId}` |

All endpoints require the `Authorization` header.

---

## Important Notes for Web Parity

> ⚠️ **Amount format inconsistency**
> - `create-payment-intent` → amount is **CENTS (integer)**
> - `tickets/buy` → `totalPaidPayment` is **DOLLARS (float)**

> ⚠️ **Processing fee logic**
> Must match exactly: `max(total × 0.15, 2.50)`

> ⚠️ **Token discount**
> Client calculates AND sends to server → server validates.

> ⚠️ **Timezone**
> Backend stores UTC. Client converts to event-local timezone.

> ⚠️ **Filtering**
> Expired tickets are hidden on the client; the server returns all.
