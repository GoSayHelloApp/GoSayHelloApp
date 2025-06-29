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
