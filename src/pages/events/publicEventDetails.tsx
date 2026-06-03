import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetPublicEventDetailsQuery } from "../../services/events/eventApi";
import Loader from "../../ui/components/core/screenLoader";
import OpenApp from "../../components/events/OpenApp";
import EventFooter from "../../components/events/eventFooter";
import { tokens } from "./invitation/tokens";
import { useColorExtraction, withAlpha } from "./invitation/useColorExtraction";
import { applyIosTimeConversion } from "../../utils/dateTimeFormatter";
import { useTicketAvailability } from "../../hooks/useTicketAvailability";
import {
  AboutSection,
  AttendeeStrip,
  DateStamp,
  EventHeadline,
  EventUrlLink,
  GuestGrid,
  LocationLine,
  OrganizerCredit,
  PosterCard,
  Reveal,
  RsvpButton,
  SectionLabel,
  UnlockMore,
} from "./invitation/Primitives";
import { Wayfinding } from "./invitation/Wayfinding";

const PublicEventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromList =
    !!(location.state && (location.state as { fromList?: boolean }).fromList);

  const goToEventsList = () => {
    if (cameFromList) navigate(-1);
    else navigate("/events-list");
  };
  const {
    data: rawEventDetails,
    error,
    isLoading,
  } = useGetPublicEventDetailsQuery({ event_id: Number(eventId) });

  const eventDetails = useMemo(
    () => (rawEventDetails ? applyIosTimeConversion(rawEventDetails) : rawEventDetails),
    [rawEventDetails]
  );

  const [openRSVPModal, setOpenRSVPModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [showStickyCta, setShowStickyCta] = useState(false);

  const accent = useColorExtraction(eventDetails?.event_image);

  // Always start at the top of the page when entering / switching events
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [eventId]);

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

  const { hasTickets } = useTicketAvailability(eventDetails?.event_id, isPast);

  const handleDirectionsClick = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${eventDetails?.d_lat},${eventDetails?.d_long}`;
    window.open(url, "_blank");
  };

  const openWithMessage = (msg: string) => {
    setModalText(msg);
    setOpenRSVPModal(true);
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
          We couldn't find this event.
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

      {/* Top bar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          borderBottom: `1px solid ${tokens.color.line}`,
        }}
      >
        <Box
          sx={{
            maxWidth: tokens.page.maxWidth,
            mx: "auto",
            px: { xs: 2.5, sm: 5, md: 8 },
            py: { xs: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            component="a"
            href="/events-list"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/images/gosayhello-hand.png"
              alt=""
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 28, md: 32 },
                borderRadius: "50%",
                display: "block",
              }}
            />
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontSize: { xs: 18, md: 22 },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: tokens.color.inkPrimary,
              }}
            >
              GoSay
              <Box component="span" sx={{ color: tokens.color.brandOrange }}>
                HELLO
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={goToEventsList}
              sx={{
                appearance: "none",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 1,
                color: tokens.color.inkPrimary,
                fontFamily: tokens.font.sans,
                fontSize: { xs: 12, md: 13 },
                fontWeight: 600,
                letterSpacing: "0.01em",
                position: "relative",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                transition: `color 200ms ${tokens.motion.swift}, transform 200ms ${tokens.motion.swift}`,
                "& .back": {
                  display: "inline-flex",
                  transition: `transform 220ms ${tokens.motion.swift}`,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: "10px",
                  right: "10px",
                  bottom: "4px",
                  height: "2px",
                  background: accent,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: `transform 200ms ${tokens.motion.swift}`,
                  pointerEvents: "none",
                },
                "&:hover, &:focus-visible": {
                  color: accent,
                },
                "&:hover .back, &:focus-visible .back": {
                  transform: "translateX(-3px)",
                },
                "&:hover::after, &:focus-visible::after": {
                  transform: "scaleX(1)",
                },
              }}
            >
              {cameFromList && (
                <Box component="span" className="back">
                  <Icon icon="ph:arrow-left-bold" width={12} />
                </Box>
              )}
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                All events
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Events
              </Box>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => openWithMessage("Open the GoSayHELLO app to continue.")}
              sx={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: { xs: 1.75, md: 2.25 },
                py: { xs: 0.875, md: 1.125 },
                borderRadius: 999,
                background: accent,
                color: "#FFFFFF",
                fontFamily: tokens.font.sans,
                fontSize: { xs: 11, md: 12.5 },
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
                transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}`,
                "& .chev": {
                  transition: `transform 200ms ${tokens.motion.swift}`,
                },
                "&:hover": {
                  transform: "translateY(-1px)",
                  filter: "brightness(1.05)",
                  boxShadow: `0 8px 20px ${withAlpha(accent, 0.35)}`,
                },
                "&:focus-visible": {
                  boxShadow: `0 0 0 3px ${withAlpha("#FFFFFF", 0.6)}, 0 0 0 6px ${withAlpha(
                    accent,
                    0.45
                  )}, 0 4px 12px ${withAlpha(accent, 0.25)}`,
                },
                "&:hover .chev": { transform: "translateX(2px)" },
              }}
            >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Open app
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              Get app
            </Box>
            <Box component="span" className="chev" sx={{ display: "inline-flex" }}>
              <Icon icon="ph:arrow-right-bold" width={12} />
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Page container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: tokens.page.maxWidth,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          pt: { xs: 4, sm: 6, md: 8 },
          pb: { xs: 14, sm: 6, md: 8 },
        }}
      >
        {/* Hero */}
        <Box
          sx={{
            position: "relative",
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "stretch",
            }}
          >
            {/* Left: poster + organizer + actions */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 3.5 },
                order: { xs: 1, md: 1 },
                height: "100%",
              }}
            >
              <Box
                sx={{
                  flex: { xs: "0 0 auto", md: 1 },
                  display: "flex",
                  minHeight: { xs: 420, md: 0 },
                  opacity: 0,
                  transform: "translateY(28px)",
                  animation: `invitation-poster-in 800ms ${tokens.motion.settle} 280ms forwards`,
                  "@keyframes invitation-poster-in": {
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <PosterCard
                  src={eventDetails.event_image}
                  title={eventDetails.venue_name}
                  accent={accent}
                  fillHeight
                />
              </Box>
              <Reveal delay={420} duration={500}>
                <OrganizerCredit
                  name={eventDetails.user_name}
                  avatar={eventDetails.user_profile_image}
                  accent={accent}
                />
              </Reveal>
              <Reveal delay={680} duration={500}>
                <Box
                  sx={{
                    pt: 0.5,
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 1.25,
                    alignItems: "center",
                  }}
                >
                  {!isPast && hasTickets === true && (
                    <RsvpButton
                      label="Buy Tickets"
                      icon="ph:ticket-fill"
                      size="md"
                      variant="dark"
                      accent={accent}
                      onClick={() =>
                        navigate(`/event-details/${eventId}/tickets`)
                      }
                    />
                  )}
                  <RsvpButton
                    label={isPast ? "Explore more events" : "RSVP"}
                    size="md"
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

            {/* Right: editorial copy */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 3.5 },
                order: { xs: 2, md: 2 },
                position: "relative",
                zIndex: 2,
              }}
            >
              <Reveal delay={200} duration={700}>
                <EventHeadline
                  title={eventDetails.venue_name}
                  category={headerCategory}
                  accent={accent}
                />
              </Reveal>
              <Reveal delay={360} duration={500}>
                <DateStamp
                  startDate={eventDetails.start_date}
                  startTime={eventDetails.start_time}
                  endDate={eventDetails.end_date}
                  endTime={eventDetails.end_time}
                  accent={accent}
                />
              </Reveal>
              <Reveal delay={520} duration={500}>
                <LocationLine
                  address={eventDetails.address_1}
                  onDirections={handleDirectionsClick}
                  accent={accent}
                />
              </Reveal>
              <Reveal delay={620} duration={500}>
                <AttendeeStrip
                  count={attendeeCount}
                  avatars={attendees}
                  accent={accent}
                />
              </Reveal>
              {eventDetails.event_url &&
                eventDetails.event_url !== "https://" &&
                eventDetails.event_url.trim() !== "" && (
                  <Reveal delay={700} duration={500}>
                    <EventUrlLink
                      url={eventDetails.event_url}
                      accent={accent}
                    />
                  </Reveal>
                )}
            </Box>
          </Box>
        </Box>

        {/* About */}
        {eventDetails.description && (
          <Box sx={{ mb: { xs: 8, md: 14 } }}>
            <Reveal>
              <Box sx={{ maxWidth: 880 }}>
                <SectionLabel
                  numeral="Ⅰ"
                  title="About this evening"
                  accent={accent}
                />
                <AboutSection
                  description={eventDetails.description}
                  accent={accent}
                />
              </Box>
            </Reveal>
          </Box>
        )}

        {/* Guest list */}
        <Box sx={{ mb: { xs: 8, md: 14 } }}>
          <Reveal>
            <Box sx={{ maxWidth: 880 }}>
              <SectionLabel
                numeral="Ⅱ"
                title="Who's coming"
                accent={accent}
              />
              <GuestGrid
                count={attendeeCount}
                avatars={attendees}
                accent={accent}
                onShowMore={() =>
                  openWithMessage("Open the App to view complete guest list.")
                }
              />
            </Box>
          </Reveal>
        </Box>

        {/* Wayfinding */}
        {eventDetails.d_lat && eventDetails.d_long && (
          <Box sx={{ mb: { xs: 8, md: 14 } }}>
            <Reveal>
              <Box sx={{ maxWidth: 880 }}>
                <SectionLabel
                  numeral="Ⅲ"
                  title="Find your way"
                  accent={accent}
                />
                <Wayfinding
                  lat={eventDetails.d_lat}
                  lng={eventDetails.d_long}
                  address={eventDetails.address_1}
                  city={eventDetails.city}
                  state={eventDetails.state}
                  zipcode={eventDetails.zipcode}
                  distance={eventDetails.distance}
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
            <Box sx={{ maxWidth: 880 }}>
              <SectionLabel
                numeral="Ⅳ"
                title="Continue in the app"
                accent={accent}
              />
              <UnlockMore accent={accent} onOpen={openWithMessage} />
            </Box>
          </Reveal>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4 }}>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {!isPast && hasTickets === true && (
              <RsvpButton
                label="Buy"
                icon="ph:ticket-fill"
                size="md"
                variant="dark"
                accent={accent}
                onClick={() => navigate(`/event-details/${eventId}/tickets`)}
              />
            )}
            <Box sx={{ flexShrink: 0 }}>
              <RsvpButton
                label={isPast ? "Explore more events" : "RSVP"}
                size="md"
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
    </Box>
  );
};

export default PublicEventDetails;
