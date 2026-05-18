import { format, parseISO } from "date-fns";

export function convertUTCDateToLocal(date: any, time: any) {
    const dateTimeString = `${date}T${time}:00Z`;
    const utcDate = new Date(dateTimeString);

    if (isNaN(utcDate.getTime())) {
        return "";
    }

    return utcDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" });
}

export function convertUTCTimeToLocal(date: any, time: any) {
    const dateTimeString = `${date}T${time}:00Z`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Timezone", timeZone);
    const utcDate = new Date(dateTimeString);

    if (isNaN(utcDate.getTime())) {
        return "";
    }

    return utcDate.toLocaleTimeString("en-US", { timeZone: timeZone, hour: "2-digit", minute: "2-digit", hour12: true });
}

export const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
    }).replace(/\//g, "-");
};

export const formatTime = (timeString: string) => {
    if (!timeString) return "";
    let [hours, minutes] = timeString.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * Mirrors iOS `convertUTCToLocal(date:time:)` — takes a UTC date string
 * `YYYY-MM-DD` and time `HH:mm`, converts to the viewer's device timezone.
 */
export function convertUTCToViewerLocal(
    date: string,
    time: string
): { date: string; time: string } {
    const utc = new Date(`${date}T${time}:00Z`);
    if (isNaN(utc.getTime())) return { date: "", time: "" };
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(utc);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    let hh = get("hour");
    if (hh === "24") hh = "00";
    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        time: `${hh}:${get("minute")}`,
    };
}

/**
 * Mirrors iOS event-viewing logic: when `address_1.last == "."` the server
 * stored times as UTC and the iOS app mutates the model in place with values
 * converted to the viewer's device timezone before display. Returns a new
 * object with the same fields updated, or the original if no conversion needed.
 */
export function applyIosTimeConversion<
    T extends {
        address_1?: string;
        start_date?: string;
        start_time?: string;
        end_date?: string;
        end_time?: string;
    }
>(event: T): T {
    if (!event || !event.address_1 || !event.address_1.trim().endsWith(".")) {
        return event;
    }
    const next: T = { ...event };
    if (event.start_date && event.start_time) {
        const s = convertUTCToViewerLocal(event.start_date, event.start_time);
        if (s.date) {
            next.start_date = s.date;
            next.start_time = s.time;
        }
    }
    if (event.end_date && event.end_time) {
        const e = convertUTCToViewerLocal(event.end_date, event.end_time);
        if (e.date) {
            next.end_date = e.date;
            next.end_time = e.time;
        }
    }
    return next;
}

/**
 * Parses `YYYY-MM-DD` as a calendar date in the local interpreter (noon UTC anchor
 * to avoid DST off-by-one). The intent is that the caller has already normalised
 * the string to the desired timezone, so this just extracts day/month/dow.
 */
function parseCalendarDate(s?: string): Date | null {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!y || !mo || !d) return null;
    return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
}

const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
];

/**
 * Mirrors the iOS event-detail pre-conversion step: when address ends with ".",
 * the server stored times as UTC and we convert to event-location timezone.
 * Otherwise the server already stored event-local time. The result is a single
 * object with already-converted start/end date+time strings plus formatted
 * display strings — same source of truth for cards and the detail page.
 */
export interface EventDateTimeView {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    dow: string;
    dayNum: string;
    month: string;
    dateRange: string;
    timeRange: string;
}

export function getEventDateTimeView({
    startDate,
    startTime,
    endDate,
    endTime,
}: {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
}): EventDateTimeView | null {
    if (!startDate) return null;

    const sD = startDate;
    const sT = startTime || "";
    const eD = endDate || startDate;
    const eT = endTime || "";

    const startObj = parseCalendarDate(sD);
    const endObj = parseCalendarDate(eD);

    const dow = startObj ? DOW_NAMES[startObj.getUTCDay()] : "";
    const dayNum = startObj ? String(startObj.getUTCDate()) : "";
    const month = startObj ? MONTH_NAMES[startObj.getUTCMonth()] : "";

    const shortDate = (d: Date | null) =>
        d
            ? d.toLocaleDateString("en-US", {
                  timeZone: "UTC",
                  month: "short",
                  day: "numeric",
              })
            : "";
    const startShort = shortDate(startObj);
    const endShort = shortDate(endObj);
    const dateRange =
        startShort && endShort && startShort !== endShort
            ? `${startShort} - ${endShort}`
            : startShort;

    const timeRange =
        sT && eT ? `${formatTime(sT)} to ${formatTime(eT)}` : "";

    return {
        startDate: sD,
        startTime: sT,
        endDate: eD,
        endTime: eT,
        dow,
        dayNum,
        month,
        dateRange,
        timeRange,
    };
}

/**
 * Legacy shape kept for callers that only need the {date, time} pair.
 */
export const formatEventCardDateTime = (args: {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
}) => {
    const view = getEventDateTimeView(args);
    if (!view) return { date: "", time: "" };
    return { date: view.dateRange, time: view.timeRange };
};

/**
 * Legacy shape kept for the date-stamp's left block.
 */
export const getEventStartParts = (args: {
    startDate?: string;
    startTime?: string;
}) => {
    const view = getEventDateTimeView({
        startDate: args.startDate,
        startTime: args.startTime,
        endDate: args.startDate,
        endTime: args.startTime,
    });
    if (!view) return null;
    return { dow: view.dow, dayNum: view.dayNum, month: view.month };
};

export const formatEventDateTimeForEventCards = (
    dotEnabled: boolean,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
) => {
    const startD = convertUTCDateToLocal(startDate, startTime);
    const endD = convertUTCDateToLocal(endDate, endTime);

    const startT = convertUTCTimeToLocal(startDate, startTime);
    const endT = convertUTCTimeToLocal(endDate, endTime);

    let formattedDate = `${format(startD, "MMM. d")} - ${format(endD, "MMM. d")}`;
    let formattedTime = `${startT} to ${endT}`;

    if (!dotEnabled) {
        formattedTime = `${formatTime(startTime)} to ${formatTime(endTime)}`;
    }

    return { date: formattedDate, time: formattedTime };
};
