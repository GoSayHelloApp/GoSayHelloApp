export interface PublicTicketEvent {
  event_id: number;
  event_name: string;
  event_type_name?: string;
  event_type?: string;
  event_image?: string;
  address_1?: string;
  latitude?: number;
  longitude?: number;
}

export interface PublicTicket {
  ticket_id: number;
  event_id: number;
  ticket_name: string;
  price: number;
  quantity: number;
  sold: number;
  sales_start_date: string;
  sales_end_date: string;
  ticket_type_id?: number;
  ticket_type?: string;
  description?: string;
  is_deleted?: number;
  creation_date?: string;
}

export interface PublicEventTicketsResponse {
  success: boolean;
  event: PublicTicketEvent;
  tickets: PublicTicket[];
  message?: string;
}
