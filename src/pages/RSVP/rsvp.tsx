import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import RSVPCard from "../../ui/components/RSVP/RSVPCard";
import { useGetInvitationListMutation } from "../../services/events/eventApi";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import Loader from "../../ui/components/core/screenLoader";
import {
  convertUTCDateToLocal,
  convertUTCTimeToLocal,
  formatTime,
} from "../../utils/dateTimeFormatter";
import { format, parseISO } from "date-fns";

const formatEventDateTime = (
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

const RSVP = () => {
  const theme = useTheme();
  const [getInvitationList, { isLoading }] = useGetInvitationListMutation();
  const [events, setEvents] = useState<any[]>([]);
  const user = useSelector((state: any) => state.auth.user);
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const fetchInvitations = async () => {
    try {
      if (user?.id) {
        const response = await getInvitationList({
          invitation_status: value === 0 ? 1 : 3,
          page_no: 1,
          user_id: user.id,
        }).unwrap();
        if (response.success) {
          setEvents(response?.newInvitations?.invitationList ?? []);
        } else {
          setEvents([]);
        }
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id, getInvitationList, value]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: "100%", mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            backgroundColor: theme.palette.grey[400],
            borderRadius: "33px",
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTabs-flexContainer": {
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            },
          }}
        >
          <Tab
            sx={{
              flex: 1,
              height: "40px",
              width: "50%",
              borderRadius: "33px",
            }}
            label="All RSVPs"
            {...a11yProps(0)}
          />
          <Tab
            sx={{
              flex: 1,
              height: "40px",
              width: "50%",
              borderRadius: "33px",
            }}
            label="Rejected"
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.length === 0
          ? events.length === 0 &&
            !isLoading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Icon
                    icon="tabler:search-off"
                    fontSize={48}
                    color={theme.palette.grey[500]}
                  />
                  <p>No results found</p>
                </Box>
              </Box>
            )
          : events.map((event) => (
              <RSVPCard
                eventDetails={event}
                key={event.event_id}
                picture={event.event_image}
                type={event.event_type}
                id={event.event_id.toString()}
                name={event.venue_name}
                date={
                  formatEventDateTime(
                    event.address_1?.at(event.address_1.length - 1) === "."
                      ? true
                      : false,
                    event.start_date,
                    event.start_time,
                    event.end_date,
                    event.end_time
                  ).date
                }
                time={
                  formatEventDateTime(
                    event.address_1?.at(event.address_1.length - 1) === "."
                      ? true
                      : false,
                    event.start_date,
                    event.start_time,
                    event.end_date,
                    event.end_time
                  ).time
                }
                distance={Math.ceil(event.distance * 20)}
                isPaid={event.is_public === 0}
                group={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AvatarGroup
                      max={3}
                      sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}
                    >
                      {event.event_interested_users.map((user: any) => (
                        <Avatar
                          key={user.id}
                          src={user.user_image}
                          alt={user.user_name}
                        />
                      ))}
                    </AvatarGroup>
                  </Box>
                }
                isAlreadySaved="1"
                latitude={event.event_lat}
                longitude={event.event_long}
                onRSVPAction={fetchInvitations}
              />
            ))}
      </Box>
      {isLoading && <Loader />}
    </Container>
  );
};

export default RSVP;
