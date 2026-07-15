import { Box, Fade, IconButton, Modal, Typography } from "@mui/material";
import React from "react";
import { Icon } from "@iconify/react";
import { tokens } from "../../pages/events/invitation/tokens";
import logo from "../../assets/gosayhello_logo.svg";

interface OpenAppProps {
  eventId?: number | string | null;
  openApp: boolean;
  setOpenApp: (v: boolean) => void;
  text: string;
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const OpenApp: React.FC<OpenAppProps> = ({
  eventId,
  openApp,
  setOpenApp,
  text,
}) => {
  const handleMobileRedirection = () => {
    if (isMobile()) {
      window.location.href = `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=https://gosayhello.page.link/eventdata?event_id=${eventId}&efr=1`;
    } else {
      window.location.href =
        "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833";
    }
  };

  return (
    <Modal
      open={openApp}
      onClose={() => setOpenApp(false)}
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(20, 19, 26, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Fade in={openApp} timeout={280}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            background: tokens.color.paper,
            borderRadius: `${tokens.radius.xl}px`,
            overflow: "hidden",
            outline: "none",
            boxShadow:
              "0 24px 48px rgba(20,19,26,0.35), 0 1px 0 rgba(255,255,255,0.9) inset",
            // Warm ambient glow behind the logo — signals the brand mood
            // without the modal itself needing to be dark.
            "&::before": {
              content: '""',
              position: "absolute",
              top: -140,
              left: "50%",
              transform: "translateX(-50%)",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(221,131,67,0.35) 0%, rgba(221,131,67,0) 70%)",
              pointerEvents: "none",
              zIndex: 0,
            },
          }}
        >
          <IconButton
            onClick={() => setOpenApp(false)}
            aria-label="Close"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 2,
              width: 34,
              height: 34,
              color: tokens.color.inkSecondary,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(6px)",
              border: `1px solid ${tokens.color.line}`,
              "&:hover": {
                background: "#FFFFFF",
                color: tokens.color.inkPrimary,
              },
            }}
          >
            <Icon icon="ph:x-bold" width={16} />
          </IconButton>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              px: { xs: 3.5, sm: 4.5 },
              pt: 5,
              pb: 4,
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 14px 32px rgba(221,131,67,0.35), 0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(20,19,26,0.05)",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="GoSayHELLO"
                sx={{ width: 52, height: 52 }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Typography
                sx={{
                  fontFamily: tokens.font.serif,
                  fontSize: { xs: 22, sm: 24 },
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: tokens.color.inkPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                {text}
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.font.sans,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: tokens.color.inkSecondary,
                }}
              >
                Continue in the GoSayHELLO app for the full experience.
              </Typography>
            </Box>

            <Box
              component="button"
              onClick={handleMobileRedirection}
              sx={{
                mt: 0.5,
                appearance: "none",
                cursor: "pointer",
                width: "100%",
                height: 52,
                borderRadius: 999,
                border: "none",
                color: "#FFFFFF",
                fontFamily: tokens.font.sans,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "#DD8343",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.3) inset, 0 -2px 0 rgba(0,0,0,0.12) inset, 0 14px 32px rgba(221,131,67,0.45)",
                transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.3) inset, 0 -2px 0 rgba(0,0,0,0.12) inset, 0 18px 40px rgba(221,131,67,0.55)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Icon icon="ph:arrow-square-out-bold" width={16} />
              Open the App
            </Box>

            <Typography
              sx={{
                fontFamily: tokens.font.sans,
                fontSize: 11,
                color: tokens.color.inkMuted,
                lineHeight: 1.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Available on the App Store & Google Play
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default OpenApp;
