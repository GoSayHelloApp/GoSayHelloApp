import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  useSaveInterestedEventMutation,
  useUnsaveInterestedEventMutation,
} from "../../../services/events/eventApi";
import { useAppSelector } from "../../../redux/store";
import {
  convertUTCDateToLocal,
  convertUTCTimeToLocal,
} from "../../../utils/dateTimeFormatter";

interface RSVPButtonProps {
  eventDetails: {
    id: number;
    name: string;
    description: string;
    address_1: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
  };
  isEventSaved?: boolean;
  onRSVPStatusChange?: (isSaved: boolean) => void;
  onRSVPAction?: () => void;
}

const RSVPButton: React.FC<RSVPButtonProps> = ({
  eventDetails,
  isEventSaved: initialIsEventSaved = false,
  onRSVPStatusChange,
  onRSVPAction,
}) => {
  console.log(eventDetails);
  const [isEventSaved, setIsEventSaved] = useState(initialIsEventSaved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user);

  const [saveInterestedEvent, { isLoading: isSaving }] =
    useSaveInterestedEventMutation();

  const [unsaveInterestedEvent, { isLoading: isUnsaving }] =
    useUnsaveInterestedEventMutation();

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "ios";
    } else if (/android/.test(userAgent)) {
      return "android";
    } else {
      return "desktop";
    }
  };

  const formatDateForCalendar = (date: string, time: string) => {
    const dateParts = date.split(", ")[1].split("/");
    const month = dateParts[0];
    const day = dateParts[1];
    const year = dateParts[2];

    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":");

    if (period === "PM" && hours !== "12") {
      hours = (parseInt(hours) + 12).toString();
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const handleAddToCalendarClick = (e: any) => {
    e.stopPropagation();
    isEventSaved ? removeFromCalendar() : addToCalendar();
  };

  const addToCalendar = async () => {
    try {
      const response = await saveInterestedEvent({
        event_id: eventDetails?.id ?? 0,
        user_id: user?.id ?? 0,
      }).unwrap();

      if (!response.success) {
        setErrorMessage(response.error);
        return;
      }

      setIsEventSaved(true);
      setErrorMessage(null);
      onRSVPStatusChange?.(true);
      onRSVPAction?.();

      const device = detectDevice();
      const startDate = convertUTCDateToLocal(
        eventDetails?.start_date,
        eventDetails?.start_time
      );
      const endDate = convertUTCDateToLocal(
        eventDetails?.end_date,
        eventDetails?.end_time
      );
      const startTime = convertUTCTimeToLocal(
        eventDetails?.start_date,
        eventDetails?.start_time
      );
      const endTime = convertUTCTimeToLocal(
        eventDetails?.end_date,
        eventDetails?.end_time
      );

      const startDateTime = formatDateForCalendar(startDate, startTime);
      const endDateTime = formatDateForCalendar(endDate, endTime);

      let calendarUrl = "";

      switch (device) {
        case "ios":
          // iCal format for iOS
          const icalData = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `DTSTART:${startDateTime}`,
            `DTEND:${endDateTime}`,
            `SUMMARY:${eventDetails?.name}`,
            `DESCRIPTION:${eventDetails?.description}`,
            `LOCATION:${eventDetails?.address_1}`,
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\n");

          const icalBlob = new Blob([icalData], {
            type: "text/calendar;charset=utf-8",
          });
          calendarUrl = URL.createObjectURL(icalBlob);
          break;

        case "android":
          // Android calendar format
          calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            eventDetails?.name ?? ""
          )}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(
            eventDetails?.description ?? ""
          )}&location=${encodeURIComponent(eventDetails?.address_1 ?? "")}`;
          break;

        default:
          // Google Calendar for desktop
          calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
            eventDetails?.name ?? ""
          )}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(
            eventDetails?.description ?? ""
          )}&location=${encodeURIComponent(eventDetails?.address_1 ?? "")}`;
      }

      if (device === "ios") {
        const link = document.createElement("a");
        link.href = calendarUrl;
        link.setAttribute("download", "event.ics");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(calendarUrl, "_blank");
      }
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error?.message);
    }
  };

  const removeFromCalendar = async () => {
    try {
      const response = await unsaveInterestedEvent({
        event_id: eventDetails?.id ?? 0,
        user_id: user?.id ?? 0,
      }).unwrap();

      if (!response.success) {
        setErrorMessage(response.error);
        return;
      }

      setIsEventSaved(false);
      setErrorMessage(null);
      onRSVPStatusChange?.(false);
      onRSVPAction?.();
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error?.message);
    }
  };

  return (
    <>
      <Button
        variant={isEventSaved ? "soft" : "contained"}
        color={isEventSaved ? "inherit" : "info"}
        size="large"
        sx={{ flex: "1 1 auto" }}
        onClick={handleAddToCalendarClick}
        endIcon={
          (isSaving || isUnsaving) && (
            <Icon
              icon="material-symbols:autorenew"
              style={{
                animation: "spin 1s linear infinite",
                fontSize: "24px",
              }}
            />
          )
        }
      >
        {isEventSaved ? "Cancel" : "RSVP Now"}
      </Button>

      {errorMessage && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </>
  );
};

export default RSVPButton;
