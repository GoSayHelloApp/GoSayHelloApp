import {
  Box,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Select,
  MenuItem,
  Typography,
  Stack,
  Switch,
  useTheme,
  Avatar,
  AvatarGroup,
  useMediaQuery,
} from "@mui/material";
import EventCard from "../../ui/components/eventCard/eventCard";
import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import useNearbyData from "../../hooks/useNearByData";
import { useAppSelector } from "../../redux/store";
import { useGetNearbyUsersOrBusinessesMutation } from "../../services/nearby/nearbyApi";
import { format, parseISO } from "date-fns";
import { debounce } from "lodash";
import {
  EventInterestedUser,
  EventsNearByResponse,
} from "../../models/responseModels/events";
import { eventTypesSelector } from "../../services/appconfiguration/configSelectors";
import Loader from "../../ui/components/core/screenLoader";
import NoDataCard from "../../components/NoDataCard";
import {
  convertUTCDateToLocal,
  convertUTCTimeToLocal,
  formatDate,
  formatEventDateTimeForEventCards,
  formatTime,
} from "../../utils/dateTimeFormatter";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// const formatEventDateTime = (
//   dotEnabled: boolean,
//   startDate: string,
//   startTime: string,
//   endDate: string,
//   endTime: string
// ) => {
//   const startD = convertUTCDateToLocal(startDate, startTime);
//   const endD = convertUTCDateToLocal(endDate, endTime);

//   const startT = convertUTCTimeToLocal(startDate, startTime);
//   const endT = convertUTCTimeToLocal(endDate, endTime);

//   let formattedDate = `${format(startD, "MMM. d")} - ${format(endD, "MMM. d")}`;
//   let formattedTime = `${startT} to ${endT}`;

//   if (!dotEnabled) {
//     formattedTime = `${formatTime(startTime)} to ${formatTime(endTime)}`;
//   }

//   return { date: formattedDate, time: formattedTime };
// };

function Events() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedEventType, setSelectedEventType] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [isFree, setIsFree] = useState(false);
  const [searchText, setSearchText] = useState("");
  const user = useAppSelector((state) => state.auth.user);
  const eventTypes = useAppSelector(eventTypesSelector);

  const params = useMemo(
    () => ({
      people_order_by: 0,
      user_id: user?.id,
      nearby_type: 3,
      event_type_id: selectedEventType,
      ...(selectedMonth !== "All" && {
        month: months.indexOf(selectedMonth) + 1,
      }),
      ...(isFree && { is_paid_event: 0 }),
      ...(searchText !== "" && { event_name: searchText }),
    }),
    [user?.id, selectedEventType, selectedMonth, isFree, searchText]
  );

  const {
    dataList: eventlist,
    isLoading,
    lastElementRef,
    setDataList,
    setPageNo,
  } = useNearbyData<EventsNearByResponse>(
    params,
    useGetNearbyUsersOrBusinessesMutation,
    "nearby_events_total_pages",
    "EventsNearBy"
  );

  const handleEventTypeChange = (event: any) => {
    setDataList([]);
    setPageNo(1);
    setSelectedEventType(event.target.value as number);
  };

  const handleMonthChange = (event: any) => {
    setDataList([]);
    setPageNo(1);
    setSelectedMonth(event.target.value as string);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataList([]);
    setPageNo(1);
    setIsFree(event.target.checked);
  };

  const handleSearchChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDataList([]);
      setPageNo(1);
      setSearchText(event.target.value);
    },
    500
  );

  const handleRSVPAction = () => {
    // setDataList([]);
    // setPageNo(1);
  };

  const buildEventsCardData = (events: any[]) => {
    return events.map((event) => {
      const { date, time } = formatEventDateTimeForEventCards(
        event.address_1?.at(event.address_1.length - 1) === "." ? true : false,
        event.start_date,
        event.start_time,
        event.end_date,
        event.end_time
      );
      return {
        id: event.id,
        picture: event.image,
        name: event.name,
        type: event.event_type,
        date: date,
        time: time,
        distance: Math.ceil(event.distance * 20),
        isPaid: event.is_paid_event,
        isAlreadySaved: event.is_already_saved,
        eventDetails: event,
        group: (
          <AvatarGroup
            max={3}
            sx={{
              "& .MuiAvatar-root": {
                width: { xs: 24, md: 40 },
                height: { xs: 24, md: 40 },
                fontSize: 15,
              },
            }}
          >
            {event.event_interested_users.map((user: EventInterestedUser) => {
              return (
                <Avatar
                  sx={{
                    width: { xs: 24, md: 40 },
                    height: { xs: 24, md: 40 },
                  }}
                  key={user.id}
                  alt="Remy Sharp"
                  src={user.user_image}
                />
              );
            })}
          </AvatarGroup>
        ),
        latitude: event.latitude,
        longitude: event.longitude,
      };
    });
  };

  const eventsCardData = buildEventsCardData(eventlist);
  return (
    <React.Fragment>
      <FormControl variant="outlined" hiddenLabel fullWidth size="medium">
        <OutlinedInput
          sx={{
            mx: { xs: 1, sm: 2, md: 3, lg: 3 },
            my: 1,
            borderRadius: 4,
            bgcolor: theme.palette.background.neutral,
            paddingRight: 0.5,
          }}
          onChange={handleSearchChange}
          placeholder="Search Events"
          startAdornment={
            <InputAdornment position="start">
              <Icon icon="tabler:search" fontSize={24} />
            </InputAdornment>
          }
        />
      </FormControl>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: { xs: 1, sm: 2, md: 3, lg: 3 },
          gap: {
            xs: 1,
            sm: 1,
            md: 3,
            lg: 3,
          },
        }}
        py={1}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          py={1}
          gap={3}
          sx={{ width: "60%" }}
        >
          <FormControl
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ width: "100%" }}
          >
            <Select
              value={selectedEventType}
              onChange={handleEventTypeChange}
              sx={{
                bgcolor: theme.palette.background.neutral,
                borderRadius: 4,
                borderColor: theme.palette.grey[500],
                "& .MuiSelect-select": {
                  fontWeight: "bold",
                  fontSize: { xs: 10, lg: 16 },
                },
              }}
            >
              {eventTypes &&
                [{ id: 0, type: "Event Type", is_show: 1 }, ...eventTypes].map(
                  (type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.type}
                    </MenuItem>
                  )
                )}
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ width: "100%" }}
          >
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              sx={{
                bgcolor: theme.palette.background.neutral,
                borderRadius: 4,
                borderColor: theme.palette.grey[500],
                "& .MuiSelect-select": {
                  fontWeight: "bold",
                  fontSize: { xs: 10, lg: 16 },
                },
              }}
            >
              <MenuItem value="All">MONTH</MenuItem>
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <FormControl variant="outlined" size="medium">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 2, py: 0.5 }}
          >
            <Typography
              fontWeight={"bold"}
              sx={{ fontSize: { xs: 10, lg: 16 } }}
            >
              Free Events
            </Typography>
            <Switch
              checked={isFree}
              onChange={handleSwitchChange}
              sx={{
                width: { xs: 48, md: 68 },
                height: { xs: 28, md: 38 },
                padding: 0,
                "& .MuiSwitch-switchBase": {
                  padding: {
                    xs: 0.1,
                    md: 0.2,
                  },
                  "&.Mui-checked": {
                    transform: {
                      xs: "translateX(18px)",
                      md: "translateX(25px)",
                    },
                    "& + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                },
                "& .MuiSwitch-thumb": {
                  width: { xs: 25, md: 35 },
                  height: { xs: 25, md: 35 },
                },
                "& .MuiSwitch-track": {
                  borderRadius: 14,
                  backgroundColor: theme.palette.grey[300],
                },
              }}
              color="primary"
            />
          </Stack>
        </FormControl>
      </Box>
      <Typography variant="h5" pl={4}>
        {eventsCardData.length} Events
      </Typography>
      <Stack width={"100%"} direction={"column"} gap={{ xs: 1, lg: 2.5 }}>
        {eventsCardData?.map((event, index) => (
          <Box
            ref={
              index === Math.floor(eventsCardData.length / 2)
                ? lastElementRef
                : null
            }
          >
            <EventCard
              key={event.id}
              id={event.id}
              picture={event.picture}
              type={event.type}
              name={event.name}
              date={event.date}
              time={event.time}
              distance={event.distance}
              group={event.group}
              isPaid={event.isPaid}
              isAlreadySaved={event.isAlreadySaved}
              latitude={event.latitude}
              longitude={event.longitude}
              eventDetails={event.eventDetails}
              onRSVPAction={handleRSVPAction}
            />
          </Box>
        ))}
        {eventsCardData.length === 0 && !isLoading && (
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
        )}
        {isLoading && <Loader />}
      </Stack>
    </React.Fragment>
  );
}

export default Events;
