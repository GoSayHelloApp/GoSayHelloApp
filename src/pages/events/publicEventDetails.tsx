import React from "react";
import { Box, Typography, Card, CardMedia, Avatar, Button, AvatarGroup } from '@mui/material';
import Grid from "@mui/material/Grid";

const eventDetails = {
    "success": true,
    "event_id": 2925,
    "user_id": 17814,
    "venue_name": "Mogul Talk LIVE in Atlanta",
    "user_name": "Samarah Poe",
    "user_profile_image": "https://gosayhellodevelopment.s3.amazonaws.com/userimages/de2454f0212075043adeab8e0629b65d/conversions/1737925923.8639069-listing.jpg",
    "no_of_connection": 0,
    "address_1": "3005 Peachtree Rd, Atlanta, GA 30305, United States",
    "address_2": "MODEx Studios",
    "city": "AKiak",
    "state": "Alaska",
    "zipcode": "44000",
    "d_lat": 33.836854,
    "d_long": -84.3811022,
    "distance": 0,
    "start_date": "2025-03-01",
    "end_date": "2025-03-01",
    "start_time": "18:30",
    "end_time": "21:30",
    "country_id": 6,
    "country_name": "United States",
    "event_type_id": 12,
    "event_type_name": "Masterclass",
    "description": "Description of event",
    "event_image": "https://gosayhellodevelopment.s3.amazonaws.com/Events/EVENTID-2925_1001738625962.8941689.jpg",
    "event_url": "https://www.eventbrite.com/e/mogul-talk-live-in-atlanta-march-1st-2025-tickets-1144913329589",
    "is_public": true,
    "is_event_reported": 0,
    "is_paid_event": 1,
    "no_of_users_saved_event": 2,
    "interestedUsersList": [
        {
            "user_id": 7415,
            "user_name": "Stefanie Hill",
            "is_business_profile": 0,
            "user_image": "https://gosayhellodevelopment.s3.amazonaws.com/userimages/9d4559156a6d7ad91637ca6f7a0835f0/conversions/1737899578.945467-thumbnail.jpg"
        },
        {
            "user_id": 51,
            "user_name": "Monte Applewhite",
            "is_business_profile": 0,
            "user_image": "https://gosayhellodevelopment.s3.amazonaws.com/userimages/6223723c76dd0ceae173af036d0e0dca/conversions/1710127039.241335-thumbnail.jpg"
        }
    ]
}


const EventPage = () => {
    return (
        <Box
        >
            <Box
                sx={{
                    minHeight: "40vh",
                    color: "black",
                    padding: 3,
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    alignSelf: "center",
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
                            backgroundImage: `url(${eventDetails.event_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                            filter: "blur(2px)",
                            opacity: 0.6,
                        },
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(55, 40, 21, 0.5)", // Adjust the alpha for more/less darkness
                        },
                    }}
                ></Box>
                {/* Event Details Section */}
                <Box
                    display="flex"
                    flexDirection={{ xs: "column", md: "row" }}
                    justifyContent="left"
                    marginX={{ xs: 0, md: 30 }}
                    alignItems="center"
                    gap={12}
                    px={2}
                    py={4}
                >
                    {/* Event Details */}
                    <Box flex={1} textAlign={{ xs: "center", md: "left" }}>
                        <Typography variant="subtitle1" color="black">
                            {eventDetails.venue_name}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold">
                            {eventDetails.event_type_name}
                        </Typography>
                        <Typography variant="body1" mt={1}>
                            {eventDetails.start_date}
                        </Typography>
                        <Typography variant="body2" color="grey.900">
                            📍 {eventDetails.address_1}
                        </Typography>

                        {/* Attendees */}
                        <Box mt={2} display="flex" alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
                            <AvatarGroup max={4}>
                                {eventDetails.interestedUsersList.map((src, index) => (
                                    <Avatar key={index} src={src.user_image} sx={{ width: 40, height: 40, mx: 0.5 }} />
                                ))}
                            </AvatarGroup>

                            {eventDetails.interestedUsersList.length > 4 && <Typography variant="body2" color="grey.900" ml={1}>
                                {eventDetails.interestedUsersList.length - 4}+ Going
                            </Typography>}
                        </Box>
                    </Box>

                    {/* Event Image */}
                    <Box flex={1} display="flex" justifyContent="center">
                        <Card sx={{ maxWidth: 400, borderRadius: 3 }}>
                            <CardMedia component="img" image={eventDetails.event_image} alt="Event Poster" />
                        </Card>
                    </Box>
                </Box>
            </Box>
            {/* bottom part */}
            <Box
                sx={{
                    background: "linear-gradient(to bottom, rgba(17, 15, 14, 0.9),rgba(22, 13, 2, 0.5) )",
                    color: "white",
                    textAlign: "center",
                    padding: 4,
                }}
            >
                {/* Event Description */}
                <Typography variant="body1" color="grey.300" mb={3}>
                    {eventDetails.description}
                </Typography>

                {/* Guest List Section */}
                <Box mb={5}>
                    <Typography variant="h6" fontWeight="bold" color="goldenrod">
                        GUESTLIST
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={1} mt={2}>
                        <AvatarGroup max={5}>
                            {eventDetails.interestedUsersList.map((src, index) => (
                                <Avatar key={index} src={src.user_image} sx={{ width: 60, height: 60, border: "2px solid gold" }} />
                            ))}
                        </AvatarGroup>
                    </Box>
                </Box>

                {/* Activity Section */}
                <Box mb={5}>
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

                {/* RSVP Button */}
                <Box>
                    <Button variant="contained" color="primary" size="large">
                        RSVP Now
                    </Button>
                </Box>
            </Box>
        </Box>

    );
};

export default EventPage;
