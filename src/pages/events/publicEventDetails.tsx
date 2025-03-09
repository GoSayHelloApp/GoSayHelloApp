import React, { useState } from "react";
import { Box, Typography, Card, CardMedia, Avatar, Button, AvatarGroup, Modal } from "@mui/material";
import Grid from "@mui/material/Grid";

const eventDetails = {
  success: true,
  event_id: 2925,
  user_id: 17814,
  venue_name: "Mogul Talk LIVE in Atlanta",
  user_name: "Samarah Poe",
  user_profile_image:
    "https://gosayhellodevelopment.s3.amazonaws.com/userimages/de2454f0212075043adeab8e0629b65d/conversions/1737925923.8639069-listing.jpg",
  no_of_connection: 0,
  address_1: "3005 Peachtree Rd, Atlanta, GA 30305, United States",
  address_2: "MODEx Studios",
  city: "AKiak",
  state: "Alaska",
  zipcode: "44000",
  d_lat: 33.836854,
  d_long: -84.3811022,
  distance: 0,
  start_date: "2025-03-01",
  end_date: "2025-03-01",
  start_time: "18:30",
  end_time: "21:30",
  country_id: 6,
  country_name: "United States",
  event_type_id: 12,
  event_type_name: "Masterclass",
  description: "Description of event",
  event_image: "https://gosayhellodevelopment.s3.amazonaws.com/Events/EVENTID-2925_1001738625962.8941689.jpg",
  event_url: "https://www.eventbrite.com/e/mogul-talk-live-in-atlanta-march-1st-2025-tickets-1144913329589",
  is_public: true,
  is_event_reported: 0,
  is_paid_event: 1,
  no_of_users_saved_event: 2,
  interestedUsersList: [
    {
      user_id: 7415,
      user_name: "Stefanie Hill",
      is_business_profile: 0,
      user_image:
        "https://gosayhellodevelopment.s3.amazonaws.com/userimages/9d4559156a6d7ad91637ca6f7a0835f0/conversions/1737899578.945467-thumbnail.jpg",
    },
    {
      user_id: 51,
      user_name: "Monte Applewhite",
      is_business_profile: 0,
      user_image:
        "https://gosayhellodevelopment.s3.amazonaws.com/userimages/6223723c76dd0ceae173af036d0e0dca/conversions/1710127039.241335-thumbnail.jpg",
    },
  ],
};

const EventPage = () => {
  const [openGuestModal, setOpenGuestModal] = useState(false);
  const [openRSVPModal, setOpenRSVPModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<{ user_image: string } | null>(null);

  const handleOpenGuestModal = (guest: { user_image: string }) => {
    setSelectedGuest(guest);
    setOpenGuestModal(true);
  };

  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
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
              backgroundImage: `url(${eventDetails.event_image})`,
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
            <Typography variant="subtitle1" color="white">
              {eventDetails.venue_name}
            </Typography>
            <Typography variant="h1" fontWeight="bold" color="white">
              {eventDetails.event_type_name}
            </Typography>
            <Typography variant="body1" mt={1} color="white">
              {eventDetails.start_date}
            </Typography>
            <Typography variant="body2" color="white">
              📍 {eventDetails.address_1}
            </Typography>

            {/* Attendees */}
            <Box mt={2} display="flex" alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
              <AvatarGroup max={4}>
                {eventDetails.interestedUsersList.map((src, index) => (
                  <Avatar key={index} src={src.user_image} sx={{ width: 40, height: 40, mx: 0.5 }} />
                ))}
              </AvatarGroup>

              {eventDetails.interestedUsersList.length > 4 && (
                <Typography variant="body2" color="grey.900" ml={1}>
                  {eventDetails.interestedUsersList.length - 4}+ Going
                </Typography>
              )}
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
              <CardMedia component="img" image={eventDetails.event_image} alt="Event Poster" />
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
          minHeight: "40%",
        }}
      >
        {/* Event Description */}
        <Typography variant="body1" color="grey.300" mb={3}>
          {eventDetails.description}
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
                {eventDetails.interestedUsersList.map((guest, index) => (
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
              Download the App to contact with this RSVP
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
