export interface TicketType {
  ticket_types_id: number;
  ticket_types_name: string;
}

export interface GetTicketTypesResponse {
  success?: boolean;
  ticketTypes?: TicketType[];
  ticket_types?: Array<{ ticket_types_id?: number; ticket_types_name?: string; id?: number; name?: string }>;
}

/** Request body for POST /tickets and PUT /tickets/{ticketId}. */
export interface TicketCreate {
  userId: number;
  eventId: number;
  ticketName: string;
  price: number;
  quantity: number;
  salesStartDate: string;
  salesEndDate: string;
  ticketTypeId: number;
  description: string;
}

export type CreateTicketRequest = TicketCreate;

export interface CreateTicketResponse {
  success?: boolean;
  message?: string;
  ticketId?: number;
  id?: number;
}

export interface TicketListItem {
  ticketId: number;
  ticketName: string;
  price: number;
  quantity: number;
  quantitySold?: number;
  salesStartDate: string;
  salesEndDate: string;
  ticketTypeId: number;
  ticketTypeName?: string;
  description: string;
  userPurchasedCount?: number;
}

export interface TicketListItemRaw {
  ticket_id?: number;
  ticketId?: number;
  ticket_name?: string;
  ticketName?: string;
  price?: number;
  quantity?: number;
  quantity_sold?: number;
  quantitySold?: number;
  sold?: number;
  sales_start_date?: string;
  salesStartDate?: string;
  sales_end_date?: string;
  salesEndDate?: string;
  ticket_type_id?: number;
  ticketTypeId?: number;
  ticket_type_name?: string;
  ticket_type?: string;
  ticketTypeName?: string;
  description?: string;
  user_purchased_count?: number;
  userPurchasedCount?: number;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function normalizeTicketItem(raw: TicketListItemRaw): TicketListItem {
  return {
    ticketId: raw.ticket_id ?? raw.ticketId ?? 0,
    ticketName: raw.ticket_name ?? raw.ticketName ?? "",
    price: raw.price ?? 0,
    quantity: raw.quantity ?? 0,
    quantitySold: raw.quantity_sold ?? raw.quantitySold ?? raw.sold,
    salesStartDate: raw.sales_start_date ?? raw.salesStartDate ?? "",
    salesEndDate: raw.sales_end_date ?? raw.salesEndDate ?? "",
    ticketTypeId: raw.ticket_type_id ?? raw.ticketTypeId ?? 0,
    ticketTypeName: raw.ticket_type_name ?? raw.ticketTypeName ?? raw.ticket_type,
    description: raw.description ?? "",
    userPurchasedCount: raw.user_purchased_count ?? raw.userPurchasedCount,
  };
}

export function normalizeTicketsList(data: unknown): TicketListItem[] {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeTicketItem(item as TicketListItemRaw));
  }
  if (data && typeof data === "object" && "tickets" in data && Array.isArray((data as { tickets: unknown }).tickets)) {
    return ((data as { tickets: TicketListItemRaw[] }).tickets).map(normalizeTicketItem);
  }
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    return ((data as { data: TicketListItemRaw[] }).data).map(normalizeTicketItem);
  }
  return [];
}

export interface WalletInfo {
  walletTokens: number;
  isWalletActive: boolean;
}

export interface GetTicketsByEventResult {
  tickets: TicketListItem[];
  walletInfo?: WalletInfo;
}

export function normalizeGetTicketsByEventResponse(raw: unknown): GetTicketsByEventResult {
  if (!raw || typeof raw !== "object") {
    return { tickets: [] };
  }
  const obj = raw as Record<string, unknown>;
  const tickets = normalizeTicketsList(obj);
  let walletInfo: WalletInfo | undefined;
  const w = obj.wallet_info ?? obj.walletInfo;
  if (w && typeof w === "object") {
    const wr = w as Record<string, unknown>;
    walletInfo = {
      walletTokens: num(wr.wallet_tokens ?? wr.walletTokens),
      isWalletActive: num(wr.is_wallet_active ?? wr.isWalletActive) === 1,
    };
  }
  return { tickets, walletInfo };
}

export interface GetTicketsByEventResponse {
  success?: boolean;
  tickets?: TicketListItem[];
  message?: string;
  wallet_info?: { wallet_tokens?: number; is_wallet_active?: number };
}

/** POST /create-payment-intent1 */
export interface PaymentIntentRequest {
  ticketId: number;
  quantity: number;
  amount: number;
  currency?: string;
  tokenRedemption?: number;
}

/** POST /tickets/buy1 */
export interface TicketPurchaseRequest {
  ticketId: number;
  quantity: number;
  userId: number;
  intentId?: string;
  totalPaidPayment?: number;
  tokenRedemption?: number;
  eventId?: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret?: string;
  paymentIntentId?: string;
  client_secret?: string;
  customerId?: string;
  ephemeralKeySecret?: string;
}

/** One purchase batch on a purchased-ticket card */
export interface PurchasedTicketPurchase {
  purchasedTicketId: number;
  quantity: number;
  totalPaid: number;
  purchaseDate: string;
  isUsed: boolean;
}

/** Normalized purchased / transfer list card */
export interface PurchasedTicket {
  ticketId: number;
  eventId: number;
  eventImage: string;
  venueName: string;
  eventTypeName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  address1: string;
  organizerName: string;
  ticketName: string;
  ticketTypeName: string;
  purchasedQuantity: number;
  totalPaidLabel: number;
  purchases: PurchasedTicketPurchase[];
  buyerFirstName: string;
  buyerLastName: string;
  counterpartyName?: string;
  counterpartyEmail?: string;
  fallbackPurchasedTicketId?: number;
}

function normalizePurchase(raw: Record<string, unknown>): PurchasedTicketPurchase {
  return {
    purchasedTicketId: num(raw.purchased_ticket_id ?? raw.purchasedTicketId),
    quantity: num(raw.quantity, 1),
    totalPaid: num(raw.total_paid ?? raw.totalPaid),
    purchaseDate: str(raw.purchase_date ?? raw.purchaseDate),
    isUsed: Boolean(raw.is_used ?? raw.isUsed),
  };
}

function sumPurchases(purchases: PurchasedTicketPurchase[]): number {
  return purchases.reduce((s, p) => s + p.totalPaid, 0);
}

export function normalizePurchasedTicketRow(raw: Record<string, unknown>): PurchasedTicket {
  const purchasesRaw = raw.purchases;
  const purchases: PurchasedTicketPurchase[] = Array.isArray(purchasesRaw)
    ? purchasesRaw.map((p) => normalizePurchase(p as Record<string, unknown>))
    : [];

  const purchasedQuantity = num(raw.purchased_quantity ?? raw.purchasedQuantity, purchases.length ? 0 : 1);
  const totalFromPurchases = sumPurchases(purchases);
  const totalPaidLabel =
    totalFromPurchases > 0 ? totalFromPurchases : num(raw.total_paid ?? raw.totalPaid ?? raw.price);

  const fallbackPurchasedTicketId = num(raw.purchased_ticket_id ?? raw.purchasedTicketId, 0) || undefined;

  return {
    ticketId: num(raw.ticket_id ?? raw.ticketId),
    eventId: num(raw.event_id ?? raw.eventId),
    eventImage: str(raw.event_image ?? raw.eventImage),
    venueName: str(raw.venue_name ?? raw.venueName),
    eventTypeName: str(raw.event_type_name ?? raw.eventTypeName),
    startDate: str(raw.start_date ?? raw.startDate),
    startTime: str(raw.start_time ?? raw.startTime),
    endDate: str(raw.end_date ?? raw.endDate),
    endTime: str(raw.end_time ?? raw.endTime),
    address1: str(raw.address_1 ?? raw.address1),
    organizerName: str(raw.organizer_name ?? raw.organizerName),
    ticketName: str(raw.ticket_name ?? raw.ticketName),
    ticketTypeName: str(raw.ticket_type_name ?? raw.ticketTypeName),
    purchasedQuantity:
      purchasedQuantity ||
      purchases.reduce((s, p) => s + p.quantity, 0) ||
      (fallbackPurchasedTicketId ? 1 : 0),
    totalPaidLabel,
    purchases,
    buyerFirstName: str(raw.buyer_first_name ?? raw.buyerFirstName ?? raw.first_name ?? raw.firstName),
    buyerLastName: str(raw.buyer_last_name ?? raw.buyerLastName ?? raw.last_name ?? raw.lastName),
    counterpartyName:
      str(raw.counterparty_name ?? raw.counterpartyName ?? raw.transfer_to_name ?? raw.transfer_from_name) || undefined,
    counterpartyEmail:
      str(raw.counterparty_email ?? raw.counterpartyEmail ?? raw.transfer_to_email ?? raw.transfer_from_email) ||
      undefined,
    fallbackPurchasedTicketId,
  };
}

export function normalizePurchasedTicketsList(raw: unknown): PurchasedTicket[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((row) => normalizePurchasedTicketRow(row as Record<string, unknown>));
  }
  const obj = raw as Record<string, unknown>;
  const list = obj.tickets ?? obj.data ?? obj.results;
  if (!Array.isArray(list)) return [];
  return list.map((row) => normalizePurchasedTicketRow(row as Record<string, unknown>));
}

export function normalizePurchasedTicketDetail(raw: unknown): PurchasedTicket | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const ticket = obj.ticket ?? obj.data ?? obj;
  if (ticket && typeof ticket === "object") {
    return normalizePurchasedTicketRow(ticket as Record<string, unknown>);
  }
  return null;
}
