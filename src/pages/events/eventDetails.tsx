import { Avatar, AvatarGroup, Box, Button, Divider, IconButton, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from "@iconify/react";
import { useGetEventDetailsMutation, useGetEventInterestedUserMutation, useSaveInterestedEventMutation, useUnsaveInterestedEventMutation } from '../../services/events/eventApi';
import Loader from '../../ui/components/core/screenLoader';
import { useAppSelector } from '../../redux/store';
import { EventDetailsStyles } from './styles';
import getTimeZone from '../../utils/getTimezoneByLocation';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';


const EventDetails = () => {
    const eventDetailsStyles = EventDetailsStyles();
    const { eventId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const user = useAppSelector((state) => state.auth.user);
    const [getEventDetails, { data, isLoading, error, isError }] = useGetEventDetailsMutation();
    const [getEventInterestedUser, { data: interesterUsersList }] = useGetEventInterestedUserMutation();
    const [saveInterestedEvent, { isLoading: isSaving }] = useSaveInterestedEventMutation();
    const [unsaveInterestedEvent, { isLoading: isUnsaving }] = useUnsaveInterestedEventMutation();
    const [isEventSaved, setIsEventSaved] = useState(false);

    const eventDetails = {
        ...data,
        event_interested_users: interesterUsersList?.UsersList ?? []
    }

    const handleDirectionsClick = () => {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${eventDetails.d_lat},${eventDetails.d_long}`;
        window.open(googleMapsUrl, '_blank');
    };

    const handleAddToCalendarClick = () => {
        // eventDetails.is_already_saved == false ? addToCalendar() : removeFromCalendar();
        isEventSaved == false ? addToCalendar() : removeFromCalendar();
    };

    const addToCalendar = async () => {
        const response = await saveInterestedEvent({ event_id: eventDetails.event_id ?? 0, user_id: user?.id ?? 0 }).unwrap();
        setIsEventSaved(response.success);
        const startDate = new Date(`${eventDetails.start_date}T${eventDetails.start_time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const endDate = new Date(`${eventDetails.end_date}T${eventDetails.end_time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(eventDetails.venue_name ?? "")}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails?.description ?? "")}&location=${encodeURIComponent(eventDetails.address_1 ?? "")}`;

        window.open(calendarUrl, '_blank');
    }

    const removeFromCalendar = async () => {
        const response = await unsaveInterestedEvent({ event_id: eventDetails.event_id ?? 0, user_id: user?.id ?? 0 }).unwrap();
        setIsEventSaved(!response.success);
    }

    const isEventActive = (startDate: string, startTime: string, endDate: string, endTime: string): boolean => {
        const startDateTime = new Date(`${startDate}T${startTime}:00Z`).getTime();
        const endDateTime = new Date(`${endDate}T${endTime}:00Z`).getTime();
        const currentDateTime = new Date().getTime();

        return currentDateTime >= startDateTime && currentDateTime <= endDateTime;
    };

    const calculateDistanceMinutes = (distance: number): number => {
        return distance * 20;
    };

    const checkInStatus = () => {
        const isActive = isEventActive(eventDetails.start_date ?? "", eventDetails.start_time ?? "", eventDetails.end_date ?? "", eventDetails.end_time ?? "");
        let walkingDistance = calculateDistanceMinutes(eventDetails.distance ?? Infinity);
        if (walkingDistance <= 5 && isActive) {
            return true;
        }
        return false;
    }

    const formatTime = (timeString: string) => {
        if (!timeString) return "";
        let [hours, minutes] = timeString.split(":").map(Number);
        let period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }).replace(/\//g, "-");
    };

    function convertUTCDateToLocal(date: any) {
        const dateTimeString = `${date}T00:00:00Z`;
        const utcDate = new Date(dateTimeString);

        if (isNaN(utcDate.getTime())) {
            return "";
        }

        return utcDate.toLocaleDateString("en-CA", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" });
    }

    function convertUTCTimeToLocal(time: any) {
        const dateTimeString = `1970-01-01T${time}:00Z`;
        const utcDate = new Date(dateTimeString);

        if (isNaN(utcDate.getTime())) {
            return "";
        }

        return utcDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }




    useEffect(() => {
        eventId && user && getEventInterestedUser({ event_id: Number(eventId), user_id: user.id ?? 0 });
    }, [user]);

    useEffect(() => {
        data == null && eventId && getEventDetails({ event_id: Number(eventId) });
    }, [])

    useEffect(() => {
        setIsEventSaved(eventDetails.is_already_saved ?? false);
    }, [data]);


    if (isLoading) {
        return <Loader width="100px" height="100px" />;
    }

    if (isError) {
        return <Typography variant="h6" color="error">Error loading event details</Typography>;
    }

    console.log(convertUTCDateToLocal(eventDetails.start_date), convertUTCTimeToLocal(eventDetails.start_time));

    return (
        <Box sx={{ ...eventDetailsStyles.mainStyles }}>
            <Box sx={{ ...eventDetailsStyles.scrollBoxStyles }}>
                <Box sx={{ ...eventDetailsStyles.imageBoxStyles(eventDetails.event_image ?? "",), cursor: "pointer" }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor: theme.palette.background.paper,
                            '&:hover': {
                                backgroundColor: theme.palette.background.default,
                            },
                            borderRadius: '50%',
                        }}
                    >
                        <Icon icon="material-symbols:arrow-back" style={{ fontSize: "24px", color: theme.palette.text.primary }} />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{
                display: "grid", color: theme.palette.text.primary, paddingY: "20px", paddingLeft: "10px",
                height: 'calc(90svh - 200px)', overflow: "auto"
            }}>
                <Typography variant="h6" gutterBottom>
                    {eventDetails.venue_name}
                </Typography>
                <Box sx={{}}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {eventDetails.description}
                    </Typography>
                    {eventDetails.event_url !== null && eventDetails.event_url !== "https://" && <Typography sx={{ marginTop: "3px" }}>
                        <a href={eventDetails.event_url}>{eventDetails.event_url}</a>
                    </Typography>}
                </Box>
                <Divider sx={{ marginY: "3px" }} />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, color: theme.palette.text.primary, padding: "20px" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={eventDetails.user_name} alt={eventDetails.user_profile_image} sx={{ width: 48, height: 48 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{eventDetails.user_name}</Typography>
                            <Typography variant="body2" color="textSecondary">Created by</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: 'center', gap: 1 }}>
                        <Icon icon="material-symbols:edit-location" style={{ fontSize: "34px" }} />
                        <Box>
                            <Typography variant="body1">{eventDetails.address_1}</Typography>
                            <Typography variant="body2" color="textSecondary">Location</Typography>
                        </Box>
                    </Box>


                    <Divider sx={{ gridColumn: 'span 2', marginY: "3px" }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon="material-symbols:calendar-month" style={{ fontSize: "24px" }} />
                        {eventDetails.start_date && eventDetails.end_date && (
                            eventDetails.address_1?.at(eventDetails.address_1.length - 1) === "." ?
                                <Box>
                                    <Typography variant="body1">
                                        {convertUTCDateToLocal(eventDetails.start_date)} - {convertUTCDateToLocal(eventDetails.end_date)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {convertUTCTimeToLocal(eventDetails.start_time)} to {convertUTCTimeToLocal(eventDetails.end_time)}
                                    </Typography>
                                </Box> :
                                <Box>
                                    <Typography variant="body1">
                                        {formatDate(eventDetails.start_date)} - {formatDate(eventDetails.end_date)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {formatTime(eventDetails.start_time ?? "")} to {formatTime(eventDetails.end_time ?? "")}
                                    </Typography>
                                </Box>
                        )}
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                            {eventDetails.event_type_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Event type</Typography>
                    </Box>
                    <Divider sx={{ gridColumn: 'span 2', marginY: "3px" }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6" sx={{ alignSelf: "center", mr: 3 }}>
                            Saved by
                        </Typography>
                        <AvatarGroup max={4} sx={{ mr: 3 }}>
                            {eventDetails.event_interested_users.map((user: any) => (
                                <Avatar key={user.id} alt={user.user_name} src={user.user_image} />
                            ))}
                        </AvatarGroup>
                    </Box>
                    {/* <Box>
                        <Button variant="contained" color="primary" size="medium" sx={{ flex: "1 1 auto" }}>
                            Group Chat
                        </Button>
                    </Box> */}
                    {user?.id == eventDetails.user_id && <Box>
                        <Button variant="contained" color="info" size="medium" sx={{ flex: "1 1 auto" }}>
                            Checked-In Users
                        </Button>
                    </Box>}

                    {eventDetails.is_already_saved && <Box>
                        <Button variant="contained" color="info" size="medium" sx={{ flex: "1 1 auto" }}
                            disabled={checkInStatus()}
                        >
                            Check In
                        </Button>
                    </Box>}

                </Box>
                {eventDetails.d_lat && eventDetails.d_long &&
                    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API ?? ""}>
                        <Map
                            style={{ ...eventDetailsStyles.mapContainerStyles }}
                            defaultCenter={{ lat: eventDetails.d_lat, lng: eventDetails.d_long }}
                            defaultZoom={15}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                        />
                        <Marker position={{ lat: eventDetails.d_lat, lng: eventDetails.d_long }} />
                    </APIProvider>
                }
                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-evenly", paddingY: "20px", }}>
                    <Button variant="contained" color="success" size="large" sx={{ flex: "1 1", marginX: "20px" }}
                        onClick={handleDirectionsClick}
                    >
                        Directions
                    </Button>
                    {/* <Button
                        onClick={handleAddToCalendarClick}
                        variant="contained" size="large"
                        sx={{ flex: "1 1", marginX: "20px", backgroundColor: eventDetails.is_already_saved == false ? "primary" : "GrayText" }}
                        endIcon={isSaving || isUnsaving && <Icon icon="material-symbols:autorenew" style={{
                            animation: "spin 1s linear infinite",
                            fontSize: "24px",
                        }} />
                        }
                    >
                        {eventDetails.is_already_saved == false ? "RSVP" : "Cancel"}
                    </Button> */}

                    <Button
                        onClick={handleAddToCalendarClick}
                        variant="contained" size="large"
                        sx={{ flex: "1 1", marginX: "20px", backgroundColor: isEventSaved == false ? "primary" : "GrayText" }}
                        endIcon={isSaving || isUnsaving && <Icon icon="material-symbols:autorenew" style={{
                            animation: "spin 1s linear infinite",
                            fontSize: "24px",
                        }} />
                        }
                    >
                        {isEventSaved == false ? "RSVP" : "Cancel"}
                    </Button>
                </Box>
            </Box>
        </Box >
    );
};

export default EventDetails;