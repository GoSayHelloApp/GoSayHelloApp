import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import UserEventCard from "./UserEventCard";
import UserRSVPCard from "./UserRSVPCard";
import UserPastEventCard from "./UserPastEventCard";
import {
  useGetEventsListMutation,
  useDeleteEventMutation,
} from "../../services/events/eventApi";
import { useAppSelector } from "../../redux/store";
import { formatEventDateTimeForEventCards } from "../../utils/dateTimeFormatter";
import Loader from "../../ui/components/core/screenLoader";

const tabLabels = ["My Events", "RSVPs", "Past Events"];

const UserEventsTab: React.FC = () => {
  const theme = useTheme();
  const [subTab, setSubTab] = useState(0);
  const [eventsData, setEventsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const [getEventsList] = useGetEventsListMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const handleSubTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSubTab(newValue);
    // Update URL with eventTab query parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("eventTab", newValue.toString());
    navigate(`?${searchParams.toString()}`, { replace: true });
  };

  // Initialize tab from URL parameter on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventTabParam = searchParams.get("eventTab");

    if (eventTabParam !== null) {
      const tabValue = parseInt(eventTabParam);
      if (tabValue >= 0 && tabValue <= 2) {
        setSubTab(tabValue);
      } else {
        setSubTab(0);
      }
    } else {
      setSubTab(0);
    }
  }, []); // Only run once on mount

  // Fetch events when subTab or user changes
  useEffect(() => {
    fetchEvents(subTab);
  }, [subTab, user?.id]);

  const fetchEvents = async (tabNumber: number) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await getEventsList({
        page_no: 1,
        tab_number: tabNumber + 1, // API uses 1-based tab numbers
        user_id: user.id,
      }).unwrap();

      setEventsData(result);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!user?.id) return;
    try {
      const res = await deleteEvent({
        event_id: eventId,
        user_id: user.id,
      }).unwrap();
      if (res.success) {
        fetchEvents(subTab);
      } else {
        // Optionally show error message
        alert(res.message || "Failed to delete event.");
      }
    } catch (error) {
      alert("Failed to delete event.");
    }
  };

  const getEventsListData = () => {
    if (!eventsData) return [];

    switch (subTab) {
      case 0: // My Events
        return eventsData.MyEvents?.EventsList || [];
      case 1: // RSVPs (Saved Events)
        return eventsData.SavedEvents?.EventsList || [];
      case 2: // Past Events
        return eventsData.PastEvent?.EventsList || [];
      default:
        return [];
    }
  };

  const events = getEventsListData();

  const transformEventData = (event: any) => {
    const { date, time } = formatEventDateTimeForEventCards(
      event.address_1?.at(event.address_1.length - 1) === "." ? true : false,
      event.start_date,
      event.start_time,
      event.end_date,
      event.end_time
    );

    return {
      id: event.event_id,
      image: event.event_image,
      title: event.venue_name,
      type: event.event_type,
      date: date,
      time: time,
      location: event.address_1,
      description: event.description,
      event_owner_name: event.event_owner_name,
      event_owner_image: event.event_owner_image,
      is_public: event.is_public,
      no_of_users_saved_event: event.no_of_users_saved_event,
      is_already_saved: event.is_already_saved,
    };
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ maxWidth: 600, mx: "auto", pb: 2 }}>
        <Paper sx={{ borderRadius: 20, overflow: "hidden" }}>
          <Tabs
            value={subTab}
            onChange={handleSubTabChange}
            variant="standard"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              "& .MuiTab-root": {
                borderRadius: 10,
                bgcolor: "transparent",
                color: "text.primary",
                fontWeight: 500,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                },
                minHeight: 38,
              },
              bgcolor: theme.palette.grey[200],
              p: 0.5,
            }}
          >
            {tabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Paper>
      </Box>
      <Box sx={{ pb: 8 }}>
        {events.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              No {tabLabels[subTab].toLowerCase()} found.
            </Typography>
          </Box>
        ) : (
          events.map((event: any) => {
            const transformedEvent = transformEventData(event);
            switch (subTab) {
              case 0:
                return (
                  <UserEventCard
                    key={event.event_id}
                    event={transformedEvent}
                    onDelete={handleDeleteEvent}
                    showDeleteButton={true}
                  />
                );
              case 1:
                return (
                  <UserRSVPCard key={event.event_id} event={transformedEvent} />
                );
              case 2:
                return (
                  <UserPastEventCard
                    key={event.event_id}
                    event={transformedEvent}
                  />
                );
              default:
                return null;
            }
          })
        )}
      </Box>
    </>
  );
};

export default UserEventsTab;
