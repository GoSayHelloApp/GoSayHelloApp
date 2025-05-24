import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, Avatar, Button, AvatarGroup, Modal, useTheme, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPublicEventDetailsQuery } from "../../services/events/eventApi";
import Loader from "../../ui/components/core/screenLoader";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import Img from "../../assets/img.jpg";
import { convertUTCDateToLocal, convertUTCTimeToLocal, formatDate, formatTime } from "../../utils/dateTimeFormatter";
import OpenApp from '../../components/events/OpenApp';
import { useGetEventDetailsMutation, useGetEventInterestedUserMutation, useSaveInterestedEventMutation, useUnsaveInterestedEventMutation } from '../../services/events/eventApi';
import { useAppSelector } from "../../redux/store";



const EventDetails = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const [saveInterestedEvent, { isLoading: isSaving, error: saveEventError, isError: isSaveEventError }] = useSaveInterestedEventMutation();

    const [unsaveInterestedEvent, { isLoading: isUnsaving, error: UnSavingEventError, isError: isUnsaveEventError }] = useUnsaveInterestedEventMutation();
    const [getEventDetails, { data, isLoading: eventsDataLoading, error: getEventsError, isError }] = useGetEventDetailsMutation();
    const [isEventSaved, setIsEventSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { eventId } = useParams<{ eventId: string }>();
    const {
        data: eventDetails,
        error,
        isLoading,
    } = useGetPublicEventDetailsQuery({ event_id: Number(eventId) });


    const [openGuestModal, setOpenGuestModal] = useState(false);
    const [openRSVPModal, setOpenRSVPModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const [selectedGuest, setSelectedGuest] = useState<{ user_image: string } | null>(null);

    const handleOpenGuestModal = (guest: { user_image: string }) => {
        setSelectedGuest(guest);
        setOpenGuestModal(true);
    };


    const handleAddToCalendarClick = () => {
        isEventSaved == false ? addToCalendar() : removeFromCalendar();
    };

    const handleDirectionsClick = () => {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${eventDetails?.d_lat},${eventDetails?.d_long}`;
        window.open(googleMapsUrl, "_blank");
    };



    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
    const handleMobileRedirection = () => {
        if (isMobile()) {
            window.location.href = `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=https://gosayhello.page.link/eventdata?event_id=${eventDetails?.event_id}&efr=1`
        }
        else {
            window.location.href = "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833"
        }
    }

    const addToCalendar = async () => {
        try {
            const response = await saveInterestedEvent({ event_id: eventDetails?.event_id ?? 0, user_id: user?.id ?? 0 }).unwrap();
            if (!response.success) {
                setErrorMessage(response.error);
                return;
            } else {
                setIsEventSaved(true);
                setErrorMessage(null);
            }

            setIsEventSaved(response.success);
            const startDate = new Date(`${eventDetails?.start_date}T${eventDetails?.start_time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '');
            const endDate = new Date(`${eventDetails?.end_date}T${eventDetails?.end_time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '');
            const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(eventDetails?.venue_name ?? "")}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails?.description ?? "")}&location=${encodeURIComponent(eventDetails?.address_1 ?? "")}`;

            window.open(calendarUrl, '_blank');
        } catch (error: any) {
            console.log(error)
            setErrorMessage(error?.message);
        }
    }

    const removeFromCalendar = async () => {

        try {
            const response = await unsaveInterestedEvent({ event_id: eventDetails?.event_id ?? 0, user_id: user?.id ?? 0 }).unwrap();
            if (!response.success) {
                setErrorMessage(response.error);
                return;
            } else {
                setIsEventSaved(false);
                setErrorMessage(null);
            }
        } catch (error: any) {
            console.log(error)
            setErrorMessage(error?.message);
        }
    }

    useEffect(() => {
        data == null && eventId && getEventDetails({ event_id: Number(eventId) });
    }, [])

    useEffect(() => {
        setIsEventSaved(data?.is_already_saved ?? false);
    }, [data]);


    if (isLoading) {
        return <Box sx={{ height: "100vh", background: "#212124", }} >
            <Loader />;
        </Box>
    }

    if (error) {
        return <Typography>Error loading event details</Typography>;
    }
    return (
        <Box
            sx={{
                margin: 0,
                padding: 0,
                borderRadius: "24px 24px 0 0",
                overflow: {
                    xs: "hidden",
                    md: "hidden",
                    lg: "auto"
                },
                height: {
                    lg: "90vh",
                }
            }}>
            <Box
                sx={{
                    minHeight: "60%",
                    color: "black",
                    padding: { xs: 0, md: 3 },
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    alignSelf: "center",

                    "@media (max-width: 450px)": {
                        // height: "100vh",
                    },
                }}
            >
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
                        zIndex: 1
                    }}
                >
                    <Icon icon="material-symbols:arrow-back" style={{ fontSize: "24px", color: theme.palette.text.primary }} />
                </IconButton>
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${eventDetails?.event_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                            filter: "blur(2px)",
                            opacity: 0.2,
                        },
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(63, 61, 61, 0.7)", // Adjust the alpha for more/less darkness
                        },
                    }}
                ></Box>
                {/* Event Details Section */}
                <Box
                    display="flex"
                    flexDirection={{ xs: "column-reverse", md: "row-reverse" }}
                    justifyContent="left"
                    alignItems="center"
                    sx={{
                        gap: 5,
                        px: 2,
                        py: 4,
                        height: "auto",
                        "@media (max-width: 450px)": {
                            gap: "10px",
                            px: 0,
                            py: 0,
                            height: "100%",
                            mx: "0"
                        },
                    }}
                >
                    {/* Event Details */}
                    <Box
                        sx={{
                            display: "flex", justifyContent: "start", alignItems: "start", flexDirection: "column", textAlign: "left",
                            "@media (max-width: 450px)": {
                                px: 2,
                                pb: 2,
                            },
                        }}
                        flex={1}
                        textAlign={{ xs: "center", md: "left" }}

                    >
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 1, justifyContent: "left",
                            "@media (max-width: 450px)": {
                                px: 0,
                                py: 0.5
                            },
                        }}>
                            <Avatar src={eventDetails?.user_profile_image} sx={{ width: 40, height: 40, mx: 0 }} />
                            <Typography variant="subtitle2" color="white">
                                By {eventDetails?.user_name}
                            </Typography>
                        </Box>
                        <Typography variant="h2" fontWeight="bold" color="white">
                            {eventDetails?.venue_name}
                        </Typography>
                        <Typography variant="h5" color="white">
                            {eventDetails?.event_type_name}
                        </Typography>

                        {eventDetails?.start_date && eventDetails?.end_date && (
                            eventDetails.address_1?.at(eventDetails.address_1.length - 1) === "." ?
                                <Box sx={{ color: "white", paddingTop: 10 }}>
                                    <Typography variant="body1">
                                        {convertUTCDateToLocal(eventDetails.start_date, eventDetails.start_time)} - {convertUTCDateToLocal(eventDetails.end_date, eventDetails.end_time)}
                                    </Typography>
                                    <Typography variant="body2" >
                                        {convertUTCTimeToLocal(eventDetails.start_date, eventDetails.start_time)} to {convertUTCTimeToLocal(eventDetails.end_date, eventDetails.end_time)}
                                    </Typography>
                                </Box> :
                                <Box sx={{ color: "white", paddingTop: 2 }}>
                                    <Typography variant="body1" sx={{ color: "white" }}>
                                        {formatDate(eventDetails.start_date)} - {formatDate(eventDetails.end_date)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "white" }}>
                                        {formatTime(eventDetails.start_time ?? "")} to {formatTime(eventDetails.end_time ?? "")}
                                    </Typography>
                                </Box>
                        )}

                        <Typography variant="body2" color="white" onClick={handleDirectionsClick} style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            paddingTop: 10
                        }}>
                            📍 {eventDetails?.address_1}
                        </Typography>

                        {/* Attendees */}
                        <Box mt={2} display="flex" alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
                            <AvatarGroup max={4} total={eventDetails?.no_of_users_saved_event}>
                                {eventDetails?.interestedUsersList.map((src, index) => (
                                    <Avatar key={index} src={src.user_image} sx={{ width: 40, height: 40, mx: 0.5 }} />
                                ))}
                            </AvatarGroup>
                        </Box>
                    </Box>

                    {/* Event Image */}
                    <Box flex={1} display="flex" justifyContent="center">
                        <Card
                            sx={{
                                maxWidth: "400px",
                                borderRadius: 3,
                                minWidth: "300px",
                                "@media (max-width: 450px)": {
                                    borderRadius: 0,
                                    my: 0,
                                    py: 0,
                                    maxWidth: "100%"
                                },
                            }}
                        >
                            <CardMedia component="img" sx={{
                                "@media (max-width: 450px)": {
                                    gap: "10px",
                                    px: 0,
                                    py: 0,
                                    height: "100%",
                                    width: "100%"
                                },
                            }} image={eventDetails?.event_image} alt="Event Poster" />
                        </Card>
                    </Box>
                </Box>
            </Box>
            {/* bottom part */}
            <Box
                sx={{
                    background: "rgba(219, 215, 215, 0.7)",
                    color: "white",
                    textAlign: "center",
                    padding: 4,
                    minHeight: "40%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                }}
            >
                {/* Event Description */}

                <Box
                    sx={{
                        "@media (max-width: 432px)": {
                            textWrap: "wrap",
                            marginX: "0",

                        },
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "start",
                        marginX: "5%",
                        textAlign: "left",
                        color: "black"
                    }}
                >
                    <Typography variant="body2" mb={3}
                        sx={{
                            whiteSpace: 'pre-line', textWrap: "wrap",
                            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                        {eventDetails?.description}
                        {eventDetails?.event_url !== null && eventDetails?.event_url !== "https://" && <Typography sx={{ marginTop: "3px", }}>
                            <a style={{ color: "black", marginTop: 1, textWrap: "wrap", }} href={eventDetails?.event_url}>{eventDetails?.event_url}</a>
                        </Typography>}
                    </Typography>


                </Box>

                <Box
                    sx={{
                        "@media (max-width: 450px)": {
                            marginX: "0%",
                            textWrap: "wrap",
                            flexDirection: "column",
                        },
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "start",
                        marginX: "2%",
                        textAlign: "center",
                        gap: 2,
                    }}
                >

                    {/* Guest List Section */}
                    <Box
                        sx={{
                            width: "50%",
                            minWidth: "50%",
                            "@media (max-width: 600px)": {
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                textWrap: "wrap",
                                overflow: "auto"

                            },
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            textWrap: "wrap",
                            overflow: "auto"
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main}>
                            GUEST LIST
                        </Typography>
                        <Box
                            sx={{
                                my: 2,
                            }}>
                            {eventDetails?.no_of_users_saved_event && eventDetails?.no_of_users_saved_event > 0 ?
                                <Box display="flex" justifyContent="left" sx={{
                                    justifyContent: "center",
                                    alignItems: "start",
                                    display: "flex",
                                    flexShrink: 0,
                                    flexWrap: "wrap",
                                }} gap={1} mt={2} padding={1}>
                                    {eventDetails?.interestedUsersList.slice(0, 20).map((guest, index) => (
                                        <Avatar
                                            key={index}
                                            src={guest.user_image}
                                            sx={{ width: 60, height: 60, mr: 0.2 }}
                                            onClick={() => handleOpenGuestModal(guest)}
                                            style={{ cursor: "pointer" }}
                                        />
                                    ))}
                                </Box> : ""}

                            {eventDetails?.no_of_users_saved_event && eventDetails?.no_of_users_saved_event > 20 ? <Typography variant="subtitle2"
                                onClick={() => {
                                    setModalText("Open the App to view complete guest list.");
                                    setOpenRSVPModal(true)
                                }}
                                sx={{
                                    color: "white",
                                    fontWeight: "350",
                                    textDecoration: "underline",
                                    cursor: "pointer"

                                }} >
                                See More
                            </Typography> : ""}

                            {eventDetails?.no_of_users_saved_event == 0 &&
                                <Typography variant="subtitle2" color="white" sx={{
                                    fontWeight: "350",
                                    cursor: "pointer"
                                }}>
                                    No Guests Yet
                                </Typography>}
                        </Box>
                    </Box>

                    {/* Activity Section */}
                    <Box
                        sx={{
                            width: "50%",
                            minWidth: "50%",
                            "@media (max-width: 600px)": {
                                width: "100%",
                            },
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "center",
                        }}
                        onClick={() => {
                            setModalText("Open the app to view event activity.");
                            setOpenRSVPModal(true)
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main} >
                            ACTIVITY
                        </Typography>
                        <Box
                            sx={{
                                position: "relative",
                                mt: 2,
                                borderRadius: 2,
                                display: "flex",
                                maxWidth: "300px",
                                minHeight: "200px",
                                justifyContent: "center",
                                overflow: "none",
                                padding: "1.5px",

                            }}
                        >
                            <Box
                                sx={{

                                    backgroundImage: `url(${Img})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    width: "300px",
                                    height: "200px",
                                    display: "grid",
                                    placeContent: "center",
                                    borderRadius: 2,
                                }}
                            >
                                {/* Text content inside */}
                                <Typography variant="body2" sx={{ position: "relative", zIndex: 2 }}>
                                    🔒 Restricted Access
                                </Typography>
                                <Typography variant="caption" color="grey.300" sx={{ position: "relative", zIndex: 2 }}>
                                    Open the app to view event activity.
                                </Typography>

                            </Box>
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(70, 68, 68, 0.8)",
                                    backdropFilter: "blur(1px)",
                                    borderRadius: 2,
                                    zIndex: 1,
                                }}
                            ></Box>
                        </Box>

                    </Box>


                </Box>

                <Box
                    sx={{
                        "@media (max-width: 450px)": {
                            marginX: "0%",
                        },
                        marginX: "1%",
                    }}
                >
                    <Box
                        sx={{
                            borderRadius: "24px",
                            borderLeft: "50px",

                            overflow: "hidden"
                        }}
                    >
                        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API ?? ""}>
                            <Map
                                style={{
                                    height: "200px",
                                    width: "100%",
                                    borderRadius: "24px",
                                }}
                                defaultCenter={{ lat: Number(eventDetails?.d_lat), lng: Number(eventDetails?.d_long) }}
                                defaultZoom={15}
                                gestureHandling={"greedy"}
                                disableDefaultUI={true}
                            // styles={MapStyles}
                            />
                            <Marker
                                position={{
                                    lat: Number(eventDetails?.d_lat),
                                    lng: Number(eventDetails?.d_long)
                                }}
                                onClick={handleDirectionsClick}
                                opacity={1}
                            />
                        </APIProvider>
                    </Box>

                </Box>

                {/* RSVP Button */}
                <Box>
                    <Button
                        sx={{ borderRadius: "10px" }}
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => {
                            handleAddToCalendarClick();
                        }}

                        endIcon={isSaving || isUnsaving && <Icon icon="material-symbols:autorenew" style={{
                            animation: "spin 1s linear infinite",
                            fontSize: "24px",
                        }} />
                        }

                    >
                        {isEventSaved == false ? "RSVP Now" : "Cancel"}
                    </Button>

                    {errorMessage && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {errorMessage}
                        </Typography>
                    )}

                </Box>

                <OpenApp eventDetails={eventDetails} openApp={openRSVPModal} setOpenApp={setOpenRSVPModal} text={modalText} />


                <Modal
                    open={openGuestModal}
                    onClose={() => setOpenGuestModal(false)}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Box
                        sx={{
                            p: 4,
                            bgcolor: "black",
                            borderRadius: 2,
                            width: 400,
                            textAlign: "center",
                        }}
                    >
                        <Avatar src={selectedGuest?.user_image} sx={{ width: 80, height: 80, margin: "0 auto 10px" }} />
                        <Typography variant="body1" gutterBottom color="white">
                            Open the App to connect with this guest
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleMobileRedirection}
                        >
                            Open App
                        </Button>
                    </Box>
                </Modal>
            </Box>
        </Box >
    );
};

export default EventDetails;