import axios from "axios";
import type { PublicEventTicketsResponse } from "../../models/responseModels/publicEventTickets";

const PYTHON_API_BASE = "https://pythonapi.gosayhelloapp.com";

/**
 * Public (no-auth) endpoint that returns an event's purchasable ticket types.
 * GET /public/event/{eventId}/tickets
 */
export async function fetchPublicEventTickets(
  eventId: number | string
): Promise<PublicEventTicketsResponse> {
  const { data } = await axios.get<PublicEventTicketsResponse>(
    `${PYTHON_API_BASE}/public/event/${eventId}/tickets`,
    {
      timeout: 12000,
      headers: { Accept: "application/json" },
    }
  );
  return data;
}
