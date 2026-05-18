import axios from "axios";
import type { TicketAvailabilityResponse } from "../../models/responseModels/ticketAvailability";

const PYTHON_API_BASE = "https://pythonapi.gosayhelloapp.com";

export async function fetchTicketAvailability(
  eventId: number
): Promise<TicketAvailabilityResponse> {
  const { data } = await axios.get<TicketAvailabilityResponse>(
    `${PYTHON_API_BASE}/ticket-availability-by-event-id/${eventId}`,
    {
      timeout: 12000,
      headers: { Accept: "application/json" },
    }
  );
  return data;
}
