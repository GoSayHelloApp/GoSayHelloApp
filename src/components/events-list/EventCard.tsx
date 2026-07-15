import { useState } from "react";
import { Avatar, AvatarGroup, Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../pages/events/invitation/tokens";
import {
  useColorExtraction,
  withAlpha,
} from "../../pages/events/invitation/useColorExtraction";
import type { NearbyEvent } from "../../models/responseModels/nearbyEvents";
import { formatEventCardDateTime } from "../../utils/dateTimeFormatter";
import OpenApp from "../events/OpenApp";

function parseDate(d?: string) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

export interface EventCardProps {
  event: NearbyEvent;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const accent = useColorExtraction(event.image);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showMixer, setShowMixer] = useState(false);

  const isPast =
    parseDate(event.end_date)?.getTime() ?? Number.POSITIVE_INFINITY;
  const isPastEvent = isPast < Date.now();

  const { date: dateRange, time: timeRange } = formatEventCardDateTime({
    startDate: event.start_date,
    startTime: event.start_time,
    endDate: event.end_date,
    endTime: event.end_time,
  });

  const isFree = event.is_paid_event === 0;

  const handleOpenDetails = () => {
    navigate(`/event-details/${event.id}`, { state: { fromList: true } });
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
    window.open(url, "_blank");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://events.gosayhello.app/events/${event.id}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: event.name,
          text: `Check out ${event.name} on GoSayHELLO`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // clipboard blocked
      }
    }
  };

  const attendees = event.event_interested_users || [];
  const attendeeCount = event.no_of_users_saved_event || 0;
  const distanceMi = event.distance > 0 ? event.distance.toFixed(1) : null;

  return (
    <>
    <Box
      onClick={handleOpenDetails}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleOpenDetails();
      }}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: tokens.color.raised,
        borderRadius: `${tokens.radius.lg}px`,
        border: `1px solid ${tokens.color.line}`,
        overflow: "hidden",
        cursor: "pointer",
        outline: "none",
        boxShadow: tokens.shadow.soft,
        filter: isPastEvent ? "saturate(0.6)" : "none",
        transition: `transform 250ms ${tokens.motion.swift}, box-shadow 250ms ${tokens.motion.swift}, border-color 250ms ${tokens.motion.swift}`,
        "& .poster-img": {
          transition: `transform 500ms ${tokens.motion.settle}`,
        },
        "&:hover, &:focus-visible": {
          transform: "translateY(-4px)",
          borderColor: withAlpha(accent, 0.35),
          boxShadow: `0 12px 32px ${withAlpha(accent, 0.18)}`,
        },
        "&:hover .poster-img, &:focus-visible .poster-img": {
          transform: "scale(1.04)",
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          overflow: "hidden",
          background: withAlpha(accent, 0.06),
        }}
      >
        {event.image && (
          <Box
            component="img"
            className="poster-img"
            src={event.image}
            alt={event.name}
            onLoad={() => setImgLoaded(true)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 300ms ease",
            }}
          />
        )}
        {/* Bottom darken */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* FREE/PAID chip */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            background: isPastEvent
              ? "rgba(0,0,0,0.6)"
              : isFree
                ? "#1FA958"
                : "#0F0E13",
            color: "#FFFFFF",
            fontFamily: tokens.font.sans,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            backdropFilter: "blur(6px)",
          }}
        >
          {isPastEvent ? "Past" : isFree ? "Free" : "Paid"}
        </Box>
        {/* Share */}
        <Box
          onClick={handleShare}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              handleShare(e as unknown as React.MouseEvent);
            }
          }}
          aria-label="Share event"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: tokens.color.inkPrimary,
            cursor: "pointer",
            transition: `transform 200ms ${tokens.motion.swift}, background 200ms ${tokens.motion.swift}`,
            "&:hover": {
              background: "#FFFFFF",
              transform: "scale(1.06)",
            },
          }}
        >
          <Icon icon="ph:share-fat-fill" width={14} />
        </Box>
        {/* Mixer button — image bottom-right. Tapping opens the same
            OpenApp modal used on the event detail screen. */}
        {!isPastEvent && event.is_bingo_enabled && (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              setShowMixer(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setShowMixer(true);
              }
            }}
            aria-label="Open Mixer"
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              background: accent,
              color: "#FFFFFF",
              fontFamily: tokens.font.sans,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              backdropFilter: "blur(6px)",
              boxShadow: `0 1px 0 rgba(255,255,255,0.25) inset, 0 6px 16px ${withAlpha(accent, 0.35)}`,
              cursor: "pointer",
              transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}`,
              "&:hover": {
                transform: "scale(1.06)",
                filter: "brightness(1.05)",
                boxShadow: `0 1px 0 rgba(255,255,255,0.25) inset, 0 10px 24px ${withAlpha(accent, 0.45)}`,
              },
            }}
          >
            Mixer
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          flex: 1,
        }}
      >
        {/* Type chip */}
        {event.event_type && (
          <Box
            sx={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: `${tokens.radius.sm}px`,
              background: withAlpha(accent, 0.12),
              color: accent,
              fontFamily: tokens.font.sans,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <Box
              sx={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: accent,
              }}
            />
            {event.event_type}
          </Box>
        )}

        {/* Title */}
        <Box
          title={event.name}
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: { xs: 20, md: 22 },
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: tokens.color.inkPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.name}
        </Box>

        {/* Date + time (iOS style) */}
        {(dateRange || timeRange) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              mt: 0.25,
            }}
          >
            {dateRange && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontFamily: tokens.font.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: tokens.color.inkPrimary,
                  letterSpacing: "-0.005em",
                }}
              >
                <Box sx={{ display: "inline-flex", color: accent, flexShrink: 0 }}>
                  <Icon icon="ph:calendar-blank-fill" width={14} />
                </Box>
                {dateRange}
              </Box>
            )}
            {timeRange && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontFamily: tokens.font.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  color: tokens.color.inkSecondary,
                  letterSpacing: "-0.005em",
                }}
              >
                <Box sx={{ display: "inline-flex", color: accent, flexShrink: 0 }}>
                  <Icon icon="ph:clock-fill" width={14} />
                </Box>
                {timeRange}
              </Box>
            )}
          </Box>
        )}

        {/* Address */}
        {event.address_1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              fontFamily: tokens.font.sans,
              fontSize: 13,
              color: tokens.color.inkSecondary,
              lineHeight: 1.4,
            }}
          >
            <Box sx={{ display: "inline-flex", flexShrink: 0, mt: "2px" }}>
              <Icon icon="ph:map-pin-fill" width={14} color={accent} />
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.address_1}
              {distanceMi && (
                <Box
                  component="span"
                  sx={{ color: accent, fontWeight: 700, ml: 0.75 }}
                >
                  · {distanceMi} mi
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Attendees */}
        {attendeeCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <AvatarGroup
              max={4}
              spacing="small"
              sx={{
                "& .MuiAvatar-root": {
                  width: 26,
                  height: 26,
                  fontSize: 10,
                  borderColor: tokens.color.raised,
                  borderWidth: 2,
                },
              }}
            >
              {attendees.slice(0, 4).map((a) => (
                <Avatar key={a.id} src={a.user_image} />
              ))}
            </AvatarGroup>
            <Box
              sx={{
                fontFamily: tokens.font.sans,
                fontSize: 12,
                color: tokens.color.inkSecondary,
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: accent }}>
                {attendeeCount}
              </Box>{" "}
              {attendeeCount === 1 ? "going" : "going"}
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            display: "flex",
            gap: 1,
            alignItems: "stretch",
            borderTop: `1px solid ${tokens.color.line}`,
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails();
            }}
            role="button"
            tabIndex={0}
            sx={{
              flex: 1,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 0.5, md: 0.75 },
              px: { xs: 1.5, md: 2 },
              py: 1.25,
              borderRadius: `${tokens.radius.xl}px`,
              background: accent,
              color: "#FFFFFF",
              fontFamily: tokens.font.sans,
              fontSize: { xs: 12, md: 13 },
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
              boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
              transition: `transform 200ms ${tokens.motion.swift}, filter 200ms, box-shadow 200ms`,
              "& .chev": {
                transition: `transform 220ms ${tokens.motion.swift}`,
              },
              "&:hover": {
                filter: "brightness(1.05)",
                transform: "translateY(-1px)",
                boxShadow: `0 8px 20px ${withAlpha(accent, 0.35)}`,
              },
              "&:hover .chev": { transform: "translateX(3px)" },
            }}
          >
            <Icon icon="ph:eye-bold" width={14} />
            View
            <Box className="chev" component="span" sx={{ display: "inline-flex" }}>
              <Icon icon="ph:arrow-right-bold" width={14} />
            </Box>
          </Box>

          <Box
            onClick={handleDirections}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                handleDirections(e as unknown as React.MouseEvent);
              }
            }}
            aria-label="Get directions"
            title="Get directions"
            sx={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 0.5, md: 0.75 },
              px: { xs: 1.5, md: 2 },
              py: 1.25,
              borderRadius: `${tokens.radius.xl}px`,
              background: tokens.color.paper,
              border: `1px solid ${tokens.color.line}`,
              color: tokens.color.inkPrimary,
              fontFamily: tokens.font.sans,
              fontSize: { xs: 12, md: 13 },
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              transition: `transform 200ms ${tokens.motion.swift}, border-color 200ms, background 200ms, color 200ms`,
              "&:hover, &:focus-visible": {
                transform: "translateY(-1px)",
                background: accent,
                borderColor: accent,
                color: "#FFFFFF",
              },
            }}
          >
            <Icon icon="ph:navigation-arrow-fill" width={14} />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Directions
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    <OpenApp
      eventId={event.id}
      openApp={showMixer}
      setOpenApp={setShowMixer}
      text="Open the app to play Mixer"
    />
    </>
  );
}
