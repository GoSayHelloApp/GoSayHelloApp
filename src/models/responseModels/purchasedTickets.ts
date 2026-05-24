export interface Purchase {
  purchased_ticket_id: number;
  ticket_id?: number;
  purchased_price?: number;
  quantity?: number;
  purchase_date?: string;
  total_paid?: number;
  is_used?: boolean;
}

/** A ticket group as returned by /public/tickets/buy (one per ticket type bought). */
export interface PurchasedTicketGroup {
  purchased_ticket_id?: number;
  user_id?: number;
  ticket_id?: number;
  purchased_quantity?: number;
  purchase_date?: string;
  purchased_price?: number;
  total_paid?: number;
  is_used?: number;

  ticket_name?: string;
  original_ticket_price?: number;
  ticket_description?: string;
  ticket_type?: string;

  event_id?: number;
  organizer_id?: number;
  organizer_name?: string;
  venue_name?: string;
  address_1?: string;
  address_2?: string | null;
  city?: string;
  state?: string;
  zipcode?: string;
  country_name?: string;
  d_lat?: number;
  d_long?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_image?: string;
  event_type_name?: string;
  event_type?: string;

  purchases?: Purchase[];
}

/** A single, flattened, downloadable ticket (one QR per ticket). */
export interface FlatTicket {
  purchasedTicketId: number;
  eventId?: number;
  ticketName?: string;
  ticketType?: string;
  price?: number;
  eventName?: string;
  eventType?: string;
  organizerName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  eventImage?: string;
  purchaseDate?: string;
  quantity: number;
  isUsed: boolean;
}

/** Flatten the buy response's `tickets[]` (groups × purchases) into individual tickets. */
export function flattenPurchasedTickets(
  groups: PurchasedTicketGroup[] | undefined
): FlatTicket[] {
  if (!groups) return [];
  const out: FlatTicket[] = [];
  for (const g of groups) {
    const base = {
      eventId: g.event_id,
      ticketName: g.ticket_name,
      ticketType: g.ticket_type,
      price: g.purchased_price ?? g.original_ticket_price,
      eventName: g.venue_name,
      eventType: g.event_type_name || g.event_type,
      organizerName: g.organizer_name,
      address: g.address_1,
      latitude: g.d_lat,
      longitude: g.d_long,
      startDate: g.start_date,
      endDate: g.end_date,
      startTime: g.start_time,
      endTime: g.end_time,
      eventImage: g.event_image,
    };
    const purchases =
      g.purchases && g.purchases.length > 0
        ? g.purchases
        : g.purchased_ticket_id != null
          ? [
              {
                purchased_ticket_id: g.purchased_ticket_id,
                purchase_date: g.purchase_date,
                is_used: g.is_used === 1,
              } as Purchase,
            ]
          : [];
    for (const p of purchases) {
      out.push({
        ...base,
        purchasedTicketId: p.purchased_ticket_id,
        purchaseDate: p.purchase_date || g.purchase_date,
        quantity: p.quantity ?? 1,
        isUsed: Boolean(p.is_used),
      });
    }
  }
  return out;
}
