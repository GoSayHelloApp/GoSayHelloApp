import React, { type ReactNode } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";

interface Props {
  headline: ReactNode;
  body?: ReactNode;
  children: ReactNode;
}

/**
 * Page shell for the auth screen.
 * - Warm paper canvas with ambient orange wash + monogram watermark
 * - Thin top bar (brand + "All events" back link)
 * - Editorial column on desktop / compressed header on mobile
 * - Floating paper card on the right (children)
 */
export default function AuthLayout({ headline, body, children }: Props) {
  const navigate = useNavigate();
  const accent = tokens.color.brandOrange;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: tokens.color.paper,
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        overflowX: "hidden",
      }}
    >
      {/* Ambient orange wash (top-right) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 640,
          background: `radial-gradient(60% 80% at 80% 15%, ${withAlpha(
            accent,
            0.14
          )} 0%, ${withAlpha(accent, 0)} 70%), linear-gradient(180deg, ${withAlpha(
            accent,
            0.04
          )} 0%, ${tokens.color.paper} 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Subtle paper noise texture */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(20,19,26,0.6) 1px, transparent 0)",
          backgroundSize: "4px 4px",
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
            maxWidth: 1200,
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
              <Box component="span" sx={{ color: accent }}>
                HELLO
              </Box>
            </Box>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => navigate("/events-list")}
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
              transition: `color 200ms ${tokens.motion.swift}`,
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
            <Box component="span" className="back">
              <Icon icon="ph:arrow-left-bold" width={12} />
            </Box>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              All events
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Events
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          py: { xs: 4, sm: 6, md: 8 },
          minHeight: { md: "calc(100vh - 80px)" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          alignItems: "start",
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Editorial column — desktop only; mobile shows just the iOS card */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            maxWidth: 540,
            mx: { xs: 0, md: 0 },
            // match the card's inner top padding so the editorial kicker aligns
            // with the brand header inside the card
            pt: { xs: 0, sm: 3.5, md: 4.5 },
          }}
        >
          <Box
            sx={{
              fontFamily: tokens.font.poppins,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: accent,
              mb: 1.5,
            }}
          >
            Networking Nearby
          </Box>
          <Box
            component="h1"
            sx={{
              fontFamily: tokens.font.poppins,
              fontWeight: 700,
              fontSize: { xs: 34, sm: 46, md: 60 },
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: tokens.color.inkPrimary,
              m: 0,
            }}
          >
            {headline}
          </Box>
          {body ? (
            <Box
              sx={{
                mt: { xs: 2, md: 3 },
                fontFamily: tokens.font.poppins,
                fontSize: { xs: 16, md: 18 },
                fontWeight: 400,
                lineHeight: 1.55,
                color: tokens.color.inkSecondary,
                maxWidth: 460,
              }}
            >
              {body}
            </Box>
          ) : null}

          {/* Pillars — fills the editorial column on desktop so it
              breathes alongside the taller signup card */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              gap: 2.5,
              mt: 6,
              maxWidth: 460,
            }}
          >
            {[
              {
                icon: "ph:map-pin-fill",
                title: "Walking distance",
                copy: "Rooms within a minute's walk — not across town.",
              },
              {
                icon: "ph:users-fill",
                title: "Real humans",
                copy: "Photos, names, hellos. Profiles, not avatars.",
              },
              {
                icon: "ph:ticket-fill",
                title: "Events & tickets",
                copy: "RSVP, buy tickets, meet the host on the night.",
              },
            ].map((pillar) => (
              <Box
                key={pillar.title}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  columnGap: 2,
                  alignItems: "start",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: withAlpha(accent, 0.1),
                    color: accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon icon={pillar.icon} width={20} />
                </Box>
                <Box>
                  <Box
                    sx={{
                      fontFamily: tokens.font.poppins,
                      fontSize: 15,
                      fontWeight: 600,
                      color: tokens.color.inkPrimary,
                      mb: 0.25,
                    }}
                  >
                    {pillar.title}
                  </Box>
                  <Box
                    sx={{
                      fontFamily: tokens.font.poppins,
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: tokens.color.inkSecondary,
                    }}
                  >
                    {pillar.copy}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Faint brand monogram watermark — desktop only, very light */}
          <Box
            aria-hidden
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              left: { md: -50, lg: -64 },
              top: { md: -50, lg: -64 },
              fontFamily: tokens.font.poppins,
              fontWeight: 700,
              fontSize: { md: 260, lg: 320 },
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: withAlpha(accent, 0.05),
              userSelect: "none",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            H
          </Box>
        </Box>

        {/* Floating card */}
        <Box
          sx={{
            position: "relative",
            justifySelf: { xs: "center", md: "end" },
            width: "100%",
            maxWidth: 440,
            background: tokens.color.raised,
            border: `1px solid ${tokens.color.line}`,
            borderRadius: `${tokens.radius.xl}px`,
            boxShadow: `0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 6px rgba(20,19,26,0.04), 0 12px 28px rgba(20,19,26,0.08), 0 32px 64px rgba(20,19,26,0.12), 0 0 0 1px ${withAlpha(accent, 0.04)}`,
            p: { xs: 2.5, sm: 3.5, md: 4 },
            opacity: 0,
            transform: "translateY(16px)",
            animation: `authCardIn 700ms ${tokens.motion.settle} 100ms forwards`,
            "@keyframes authCardIn": {
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
