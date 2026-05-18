import axios from "axios";
import type {
  NearbyEventsRequest,
  NearbyEventsResponse,
} from "../../models/responseModels/nearbyEvents";

const PYTHON_API_BASE = "https://pythonapi.gosayhelloapp.com";

export async function fetchNearbyEvents(
  req: NearbyEventsRequest
): Promise<NearbyEventsResponse> {
  const form = new FormData();
  form.append("latitude", String(req.latitude));
  form.append("longitude", String(req.longitude));
  form.append("event_type_id", String(req.event_type_id ?? 0));
  form.append("page_no", String(req.page_no ?? 1));
  form.append("is_paid_event", String(req.is_paid_event ?? 2));
  if (req.search) form.append("event_name", req.search);
  if (req.month) form.append("month", String(req.month));
  if (req.year) form.append("year", String(req.year));

  const { data } = await axios.post<NearbyEventsResponse>(
    `${PYTHON_API_BASE}/getnearbyeventsv2`,
    form,
    { timeout: 15000 }
  );
  return data;
}
