import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Modal, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetPublicEventDetailsQuery } from "../../services/events/eventApi";
import Loader from "../../ui/components/core/screenLoader";
import OpenApp from "../../components/events/OpenApp";
import EventFooter from "../../components/events/eventFooter";
import { tokens } from "./invitation/tokens";
import { useColorExtraction, withAlpha } from "./invitation/useColorExtraction";
import {
  AboutSection,
  AttendeeStrip,
  DateStamp,
  EventHeadline,
  GuestGrid,
  HostLine,
  LocationLine,
  Monogram,
  PosterCard,
  Reveal,
  RsvpButton,
  SectionLabel,
  UnlockMore,
} from "./invitation/Primitives";
import { Wayfinding } from "./invitation/Wayfinding";

const PublicEventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    data: eventDetails,
    error,
    isLoading,
  } = useGetPublicEventDetailsQuery({ event_id: Number(eventId) });

  const [openGuestModal, setOpenGuestModal] = useState(false);
  const [openRSVPModal, setOpenRSVPModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<{
    user_image: string;
  } | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  const accent = useColorExtraction(eventDetails?.event_image);

  useEffect(() => {
    if (!eventDetails) return;
    document.title = `${eventDetails.venue_name || "Event"} — invited by ${
      eventDetails.user_name || "your host"
    }`;
  }, [eventDetails]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isPast = useMemo(() => {
    if (!eventDetails?.end_date) return false;
    const end = new Date(eventDetails.end_date);
    return !isNaN(end.getTime()) && end.getTime() < Date.now();
  }, [eventDetails?.end_date]);

  const handleDirectionsClick = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${eventDetails?.d_lat},${eventDetails?.d_long}`;
    window.open(url, "_blank");
  };

  const openWithMessage = (msg: string) => {
    setModalText(msg);
    setOpenRSVPModal(true);
  };

  const handleOpenGuestModal = (guest: { user_image: string }) => {
    setSelectedGuest(guest);
    setOpenGuestModal(true);
  };

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  const handleMobileRedirection = () => {
    if (isMobile()) {
      window.location.href = `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=https://gosayhello.page.link/eventdata?event_id=${eventDetails?.event_id}&efr=1`;
    } else {
      window.location.href =
        "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833";
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: tokens.color.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader />
      </Box>
    );
  }

  if (error || !eventDetails) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: tokens.color.paper,
          color: tokens.color.inkPrimary,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          fontFamily: tokens.font.sans,
          px: 3,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: { xs: 32, sm: 44 },
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          We couldn't find this invitation.
        </Typography>
        <Typography sx={{ color: tokens.color.inkSecondary, maxWidth: 360 }}>
          The link may have expired, or the event was removed by its host.
        </Typography>
        <RsvpButton
          label="Open the app"
          accent={tokens.color.fallbackAccent}
          onClick={handleMobileRedirection}
        />
      </Box>
    );
  }

  const attendeeCount = eventDetails.no_of_users_saved_event || 0;
  const attendees = eventDetails.interestedUsersList || [];
  const headerCategory = eventDetails.event_type_name;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: tokens.color.paper,
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        filter: isPast ? "saturate(0.6)" : "none",
        overflowX: "hidden",
      }}
    >
      {/* Ambient accent wash */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 520,
          background: `radial-gradient(60% 80% at 70% 10%, ${withAlpha(
            accent,
            0.18
          )} 0%, ${withAlpha(accent, 0)} 70%), linear-gradient(180deg, ${withAlpha(
            accent,
            0.06
          )} 0%, ${tokens.color.paper} 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Page container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: tokens.page.maxWidth,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        {/* Top bar */}
        <Reveal duration={500}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: { xs: 4, md: 6 },
            }}
          >
            <Monogram name={eventDetails.user_name} />
            {isPast && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  border: `1px solid ${tokens.color.line}`,
                  borderRadius: `${tokens.radius.sm}px`,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: tokens.color.inkSecondary,
                }}
              >
                This event has ended
              </Box>
            )}
          </Box>
        </Reveal>

        {/* Hero grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "center",
            mb: { xs: 8, md: 12 },
          }}
        >
          {/* Left: invitation copy */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 3, md: 4 },
              order: { xs: 2, md: 1 },
            }}
          >
            <Reveal delay={120} duration={500}>
              <HostLine
                name={eventDetails.user_name}
                avatar={eventDetails.user_profile_image}
              />
            </Reveal>
            <Reveal delay={200} duration={700}>
              <EventHeadline
                title={eventDetails.venue_name}
                category={headerCategory}
                accent={accent}
              />
            </Reveal>
            <Reveal delay={480} duration={500}>
              <DateStamp
                startDate={eventDetails.start_date}
                startTime={eventDetails.start_time}
                endTime={eventDetails.end_time}
                accent={accent}
              />
            </Reveal>
            <Reveal delay={600} duration={500}>
              <LocationLine
                address={eventDetails.address_1}
                onDirections={handleDirectionsClick}
                accent={accent}
              />
            </Reveal>
            <Reveal delay={680} duration={500}>
              <AttendeeStrip
                count={attendeeCount}
                avatars={attendees}
                accent={accent}
              />
            </Reveal>
            <Reveal delay={760} duration={500}>
              <Box sx={{ pt: 1 }}>
                <RsvpButton
                  label={isPast ? "Explore more events" : "RSVP"}
                  accent={accent}
                  onClick={() =>
                    isPast
                      ? handleMobileRedirection()
                      : openWithMessage("Open the App to RSVP")
                  }
                />
              </Box>
            </Reveal>
          </Box>

          {/* Right: poster */}
          <Reveal delay={280} y={28} duration={800}>
            <Box sx={{ order: { xs: 1, md: 2 } }}>
              <PosterCard
                src={eventDetails.event_image}
                title={eventDetails.venue_name}
                accent={accent}
              />
            </Box>
          </Reveal>
        </Box>

        {/* About */}
        {eventDetails.description && (
          <Box sx={{ mb: { xs: 8, md: 12 } }}>
            <Reveal>
              <AboutSection
                description={eventDetails.description}
                eventUrl={eventDetails.event_url}
                accent={accent}
              />
            </Reveal>
          </Box>
        )}

        {/* Guest list */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Reveal>
            <Box sx={{ maxWidth: 880, mx: "auto" }}>
              <SectionLabel accent={accent}>Guest list</SectionLabel>
              <GuestGrid
                count={attendeeCount}
                avatars={attendees}
                accent={accent}
                onShowMore={() =>
                  openWithMessage("Open the App to view complete guest list.")
                }
              />
              {attendeeCount > 15 && (
                <Box
                  sx={{
                    mt: 3,
                    textAlign: "center",
                    fontFamily: tokens.font.sans,
                    fontSize: 13,
                    color: tokens.color.inkSecondary,
                  }}
                >
                  {attendeeCount - 15} more in the app
                </Box>
              )}
            </Box>
          </Reveal>
        </Box>

        {/* Wayfinding */}
        {eventDetails.d_lat && eventDetails.d_long && (
          <Box sx={{ mb: { xs: 8, md: 12 } }}>
            <Reveal>
              <Box sx={{ maxWidth: 880, mx: "auto" }}>
                <SectionLabel accent={accent}>Find your way</SectionLabel>
                <Wayfinding
                  lat={eventDetails.d_lat}
                  lng={eventDetails.d_long}
                  onDirections={handleDirectionsClick}
                  accent={accent}
                />
              </Box>
            </Reveal>
          </Box>
        )}

        {/* Continue in app */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Reveal>
            <Box sx={{ maxWidth: 880, mx: "auto" }}>
              <SectionLabel accent={accent}>Continue in the app</SectionLabel>
              <UnlockMore accent={accent} onOpen={openWithMessage} />
            </Box>
          </Reveal>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${tokens.color.line}`,
            pt: 4,
            mt: 4,
            "& > *": { background: "transparent !important" },
          }}
        >
          <EventFooter />
        </Box>
      </Box>

      {/* Sticky mobile CTA */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
          background: withAlpha("#F7F4ED", 0.85),
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${tokens.color.line}`,
          zIndex: 10,
          transform: showStickyCta ? "translateY(0)" : "translateY(120%)",
          transition: `transform 300ms ${tokens.motion.swift}`,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ flex: 1 }}>
              <RsvpButton
                label={isPast ? "Explore more events" : "RSVP"}
                accent={accent}
                onClick={() =>
                  isPast
                    ? handleMobileRedirection()
                    : openWithMessage("Open the App to RSVP")
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <OpenApp
        eventId={eventDetails.event_id}
        openApp={openRSVPModal}
        setOpenApp={setOpenRSVPModal}
        text={modalText}
      />

      <Modal
        open={openGuestModal}
        onClose={() => setOpenGuestModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            p: 4,
            bgcolor: tokens.color.raised,
            borderRadius: `${tokens.radius.lg}px`,
            width: 360,
            textAlign: "center",
            boxShadow: tokens.shadow.lift,
          }}
        >
          <Avatar
            src={selectedGuest?.user_image}
            sx={{ width: 80, height: 80, margin: "0 auto 16px" }}
          />
          <Typography
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 15,
              color: tokens.color.inkPrimary,
              mb: 3,
            }}
          >
            Open the app to connect with this guest.
          </Typography>
          <Button
            variant="contained"
            onClick={handleMobileRedirection}
            sx={{
              background: accent,
              boxShadow: "none",
              textTransform: "none",
              borderRadius: `${tokens.radius.lg}px`,
              px: 3,
              py: 1.25,
              fontWeight: 600,
              "&:hover": { background: accent, filter: "brightness(1.06)" },
            }}
          >
            Open the app
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default PublicEventDetails;
