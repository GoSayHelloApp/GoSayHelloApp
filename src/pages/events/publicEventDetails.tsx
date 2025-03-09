import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, Avatar, Button, AvatarGroup, Modal } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useParams } from "react-router-dom";
import { useGetPublicEventDetailsQuery } from "../../services/events/eventApi";
import Loader from "../../ui/components/core/screenLoader";

const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { data: eventDetails, error, isLoading, refetch } = useGetPublicEventDetailsQuery({ event_id: Number(eventId) });

    const [openGuestModal, setOpenGuestModal] = useState(false);
    const [openRSVPModal, setOpenRSVPModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<{ user_image: string } | null>(null);

    const handleOpenGuestModal = (guest: { user_image: string }) => {
        setSelectedGuest(guest);
        setOpenGuestModal(true);
    };

    const formatDateTime = (startDate: string, endDate: string, startTime: string, endTime: string) => {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };

        const startDateString = startDateTime.toLocaleDateString('en-US', options);
        const startTimeString = startDateTime.toLocaleTimeString('en-US', options);
        const endTimeString = endDateTime.toLocaleTimeString('en-US', options);

        return `${startDateString} at ${startTimeString} - ${endTimeString}`;
    };
    useEffect(() => {
        refetch();
    }, [eventId])

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <Typography>Error loading event details</Typography>;
    }

    return (
        <Box
            sx={{
                height: "",
            }}>
            <Box
                sx={{
                    minHeight: "40vh",
                    color: "black",
                    padding: { xs: 0, md: 3 },
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    alignSelf: "center",

                    "@media (max-width: 430px)": {
                        height: "100vh",
                    },
                }}
            >
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
                            backgroundColor: "rgba(7, 7, 7, 0.7)", // Adjust the alpha for more/less darkness
                        },
                    }}
                ></Box>
                {/* Event Details Section */}
                <Box
                    display="flex"
                    flexDirection={{ xs: "column-reverse", md: "row-reverse" }}
                    justifyContent="left"
                    marginX={{ xs: 0, md: 30 }}
                    alignItems="center"
                    sx={{
                        gap: 12,
                        px: 2,
                        py: 4,
                        height: "auto",
                        "@media (max-width: 430px)": {
                            gap: "10px",
                            px: 0,
                            py: 0,
                            height: "100%",
                        },
                    }}
                >
                    {/* Event Details */}
                    <Box
                        sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}
                        flex={1}
                        textAlign={{ xs: "center", md: "left" }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "left" }}>
                            <Avatar src={eventDetails?.user_profile_image} sx={{ width: 40, height: 40, mx: 0.5 }} />
                            <Typography variant="subtitle1" color="white">
                                By {eventDetails?.user_name}
                            </Typography>
                        </Box>
                        <Typography variant="h1" fontWeight="bold" color="white">
                            {eventDetails?.venue_name}
                        </Typography>
                        <Typography variant="subtitle1" color="white">
                            {eventDetails?.event_type_name}
                        </Typography>
                        <Typography variant="body1" mt={1} color="white">
                            {formatDateTime(eventDetails?.start_date ?? "", eventDetails?.end_date ?? "", eventDetails?.start_time ?? "", eventDetails?.end_time ?? "")}
                        </Typography>
                        <Typography variant="body2" color="white">
                            📍 {eventDetails?.address_1}
                        </Typography>

                        {/* Attendees */}
                        <Box mt={2} display="flex" alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
                            <AvatarGroup max={4}>
                                {eventDetails?.interestedUsersList.map((src, index) => (
                                    <Avatar key={index} src={src.user_image} sx={{ width: 40, height: 40, mx: 0.5 }} />
                                ))}
                            </AvatarGroup>

                            {/* {eventDetails?.interestedUsersList.length && eventDetails?.interestedUsersList.length > 4 && (
                                <Typography variant="body2" color="grey.100" ml={1}>
                                    {eventDetails?.interestedUsersList.length - 4}+ Going
                                </Typography>
                            )} */}
                        </Box>
                    </Box>

                    {/* Event Image */}
                    <Box flex={1} display="flex" justifyContent="center">
                        <Card
                            sx={{
                                maxWidth: "400px",
                                borderRadius: 3,
                                minWidth: "300px",
                                "@media (max-width: 430px)": {
                                    borderRadius: 0,
                                },
                            }}
                        >
                            <CardMedia component="img" image={eventDetails?.event_image} alt="Event Poster" />
                        </Card>
                    </Box>
                </Box>
            </Box>
            {/* bottom part */}
            <Box
                sx={{
                    background: "#212124",
                    color: "white",
                    textAlign: "center",
                    padding: 4,
                    height: "100%",
                }}
            >
                {/* Event Description */}
                <Typography variant="body2" color="grey.300" mb={3} sx={{ whiteSpace: 'pre-line' }}>
                    {eventDetails?.description}
                </Typography>
                <Box
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        display: "flex",
                        "@media (max-width: 600px)": {
                            flexDirection: "column",
                        },
                    }}
                >
                    {/* Guest List Section */}
                    <Box
                        mb={5}
                        sx={{
                            width: "50%",
                            "@media (max-width: 600px)": {
                                width: "100%",
                            },
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" color="goldenrod">
                            GUESTLIST
                        </Typography>
                        <Box display="flex" justifyContent="center" gap={1} mt={2}>
                            <AvatarGroup max={4}>
                                {eventDetails?.interestedUsersList.map((guest, index) => (
                                    <Avatar
                                        key={index}
                                        src={guest.user_image}
                                        sx={{ width: 40, height: 40, mx: 0.5 }}
                                        onClick={() => handleOpenGuestModal(guest)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ))}
                            </AvatarGroup>
                        </Box>
                    </Box>

                    {/* Activity Section */}
                    <Box
                        mb={5}
                        sx={{
                            width: "50%",
                            "@media (max-width: 600px)": {
                                width: "100%",
                            },
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" color="goldenrod">
                            ACTIVITY
                        </Typography>
                        <Box
                            sx={{
                                mt: 2,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                padding: 3,
                                borderRadius: 3,
                                display: "inline-block",
                            }}
                        >
                            <Typography variant="body2">🔒 Restricted Access</Typography>
                            <Typography variant="caption" color="grey.300">
                                Only ticket-holders can view event activity.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* RSVP Button */}
                <Box>
                    <Button variant="contained" color="primary" size="large" onClick={() => setOpenRSVPModal(true)}>
                        RSVP Now
                    </Button>
                </Box>
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
                            Download the App to contact with this guest
                        </Typography>
                        <Button variant="contained" color="primary" href="https://app-download-link.com" target="_blank">
                            Download App
                        </Button>
                    </Box>
                </Modal>

                {/* RSVP Modal */}
                <Modal
                    open={openRSVPModal}
                    onClose={() => setOpenRSVPModal(false)}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Box
                        sx={{
                            p: 4,
                            bgcolor: "black",
                            borderRadius: 2,
                            width: 400,
                            height: 200,
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center ",
                            gap: 2,
                        }}
                    >
                        <Typography variant="body1" color="white">
                            Download the App to RSVP
                        </Typography>
                        <Button variant="contained" color="primary" href="https://app-download-link.com" target="_blank">
                            Download App
                        </Button>
                    </Box>
                </Modal>
            </Box>
        </Box>
    );
};

export default EventPage;