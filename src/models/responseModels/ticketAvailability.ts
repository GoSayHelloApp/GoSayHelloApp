export interface TicketAvailability {
  ticket_id: number;
  ticket_name?: string;
  price?: number;
  quantity?: number;
  sold?: number;
  sales_start_date: string;
  sales_end_date: string;
  ticket_type_id?: number;
  ticket_type?: string;
  description?: string;
}

export interface TicketAvailabilityResponse {
  success: boolean;
  tickets?: TicketAvailability[];
  isScanning_authorized?: boolean;
  message?: string;
}
