import axios from "axios";
import type { PurchasedTicketGroup } from "../../models/responseModels/purchasedTickets";

const PYTHON_API_BASE = "https://pythonapi.gosayhelloapp.com";

export interface CreateIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  customerId?: string;
  ephemeralKeySecret?: string;
  message?: string;
}

export interface BuyTicketResponse {
  success: boolean;
  message?: string;
  totalPrice?: number;
  purchased_ticket_ids?: number[];
  tickets?: PurchasedTicketGroup[];
}

/**
 * Paid tickets only — creates a Stripe PaymentIntent.
 * POST /public/create-payment-intent  (production)
 */
export async function createPublicPaymentIntent(params: {
  ticketId: number;
  quantity: number;
  buyerEmail: string;
}): Promise<CreateIntentResponse> {
  const { data } = await axios.post<CreateIntentResponse>(
    `${PYTHON_API_BASE}/public/create-payment-intent`,
    params,
    { timeout: 20000, headers: { "Content-Type": "application/json" } }
  );
  return data;
}

/**
 * Issues the ticket(s). Body differs by type:
 *  - paid: { ticketId, quantity, intentId }  (email read from the intent)
 *  - free: { ticketId, quantity, buyerEmail }
 * POST /public/tickets/buy  (production)
 */
export async function buyPublicTicket(
  params:
    | { ticketId: number; quantity: number; intentId: string }
    | { ticketId: number; quantity: number; buyerEmail: string }
): Promise<BuyTicketResponse> {
  const { data } = await axios.post<BuyTicketResponse>(
    `${PYTHON_API_BASE}/public/tickets/buy`,
    params,
    { timeout: 20000, headers: { "Content-Type": "application/json" } }
  );
  return data;
}
