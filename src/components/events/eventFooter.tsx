import React from "react";
import { Box, Link } from "@mui/material";
import { Icon } from "@iconify/react";

const ORANGE = "#EB7D32";
const INK = "#161318";
const INK_2 = "#1F1A20";
const SERIF = '"Fraunces", "Times New Roman", Georgia, serif';
const SANS = '"Inter", "Montserrat", system-ui, -apple-system, sans-serif';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <Box
      sx={{
        position: "relative",
        color: "rgba(255,255,255,0.92)",
        background: `linear-gradient(160deg, ${INK} 0%, ${INK_2} 50%, ${INK} 100%)`,
        borderRadius: { xs: 6, md: 16 },
        overflow: "hidden",
        px: { xs: 3, sm: 5, md: 8 },
        pt: { xs: 5, md: 8 },
        pb: { xs: 4, md: 6 },
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(20,16,18,0.18)",
      }}
    >
      {/* Soft noise + orange ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          mixBlendMode: "soft-light",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "4px 4px",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -100,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}33 0%, ${ORANGE}00 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -120,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}20 0%, ${ORANGE}00 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top row: brand + tagline */}
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          gap: { xs: 4, md: 6 },
          alignItems: "start",
        }}
      >
        {/* Brand */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: { xs: 3, md: 4 },
            }}
          >
            <Box
              component="img"
              src="/images/gosayhello-hand.png"
              alt="GoSayHELLO"
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "block",
                boxShadow: `0 0 0 4px ${ORANGE}22`,
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: 26, md: 32 },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: "#FFFFFF",
              }}
            >
              GoSay
              <Box component="span" sx={{ color: ORANGE }}>
                HELLO
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: ORANGE,
              mb: 1.5,
            }}
          >
            Networking Nearby
          </Box>
          <Box
            sx={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: { xs: 24, md: 34 },
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: 580,
              color: "rgba(255,255,255,0.95)",
            }}
          >
            GoSayHELLO to{" "}
            <Box component="span" sx={{ color: ORANGE }}>
              the right people
            </Box>
            , in the same place,
            <br />
            at the same time.
          </Box>

          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              fontFamily: SANS,
              fontSize: 14,
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 480,
            }}
          >
            Discover nearby people, businesses, and events with similar
            interests — within a minute's walk.
          </Box>
        </Box>

        {/* Get the app */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", md: "flex-end" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Take it with you
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row", md: "column" },
              gap: 1.25,
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", md: "flex-end" },
            }}
          >
            <StoreButton
              href="https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833"
              iconName="ph:apple-logo-fill"
              caption="Download on the"
              store="App Store"
            />
            <StoreButton
              href="https://play.google.com/store/apps/details?id=com.gosayhello"
              iconName="ph:google-play-logo-fill"
              caption="Get it on"
              store="Google Play"
            />
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          position: "relative",
          mt: { xs: 5, md: 7 },
          mb: { xs: 3, md: 4 },
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Social row */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: { xs: 3, md: 3.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Follow
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              ml: 0.5,
            }}
          >
            <SocialIcon
              href="https://instagram.com/gosayhelloapp"
              icon="ph:instagram-logo-fill"
              label="Instagram"
            />
            <SocialIcon
              href="https://facebook.com/GoSayHELLOapp"
              icon="ph:facebook-logo-fill"
              label="Facebook"
            />
            <SocialIcon
              href="https://twitter.com/gosayhelloapp"
              icon="ph:x-logo-fill"
              label="Twitter"
            />
            <SocialIcon
              href="https://linkedin.com/company/gosayhello-app-inc"
              icon="ph:linkedin-logo-fill"
              label="LinkedIn"
            />
            <SocialIcon
              href="https://t.me/gosayhelloapp"
              icon="ph:telegram-logo-fill"
              label="Telegram"
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <FooterLink href="https://www.gosayhelloapp.com/faq">FAQs</FooterLink>
          <FooterLink href="https://www.gosayhelloapp.com/terms-conditions">
            Terms of Service
          </FooterLink>
          <FooterLink href="https://www.gosayhelloapp.com/privacy-policy">
            Privacy Policy
          </FooterLink>
        </Box>
      </Box>

      {/* Bottom row */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          fontFamily: SANS,
          fontSize: 12.5,
          color: "rgba(255,255,255,0.5)",
          pt: 2,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            letterSpacing: "0.02em",
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: ORANGE,
              boxShadow: `0 0 0 3px ${ORANGE}33`,
            }}
          />
          © {year} GoSayHELLO. Made for meeting new people.
        </Box>
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Connect with the right people, in the same place, at the same time.
        </Box>
      </Box>
    </Box>
  );
};

function StoreButton({
  href,
  iconName,
  caption,
  store,
}: {
  href: string;
  iconName: string;
  caption: string;
  store: string;
}) {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        px: 2,
        py: 1.25,
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        textDecoration: "none",
        color: "#FFFFFF",
        transition:
          "transform 200ms cubic-bezier(0.4,0,0.2,1), background 200ms, border-color 200ms",
        minWidth: { xs: "auto", md: 168 },
        width: { xs: "100%", sm: "auto" },
        justifyContent: { xs: "flex-start", sm: "flex-start" },
        "&:hover, &:focus-visible": {
          transform: "translateY(-1px)",
          background: "rgba(255,255,255,0.1)",
          borderColor: "rgba(255,255,255,0.28)",
        },
      }}
    >
      <Icon icon={iconName} width={26} color="#FFFFFF" />
      <Box sx={{ lineHeight: 1.15 }}>
        <Box
          sx={{
            fontFamily: SANS,
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {caption}
        </Box>
        <Box
          sx={{
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            mt: 0.25,
          }}
        >
          {store}
        </Box>
      </Box>
    </Box>
  );
}

function SocialIcon({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      sx={{
        width: 36,
        height: 36,
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.75)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        textDecoration: "none",
        transition:
          "transform 200ms cubic-bezier(0.4,0,0.2,1), color 200ms, background 200ms, border-color 200ms",
        "&:hover, &:focus-visible": {
          transform: "translateY(-2px)",
          color: "#FFFFFF",
          background: ORANGE,
          borderColor: ORANGE,
          boxShadow: `0 6px 16px ${ORANGE}40`,
        },
      }}
    >
      <Icon icon={icon} width={16} />
    </Box>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      sx={{
        position: "relative",
        color: "rgba(255,255,255,0.7)",
        textDecoration: "none",
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "0.01em",
        transition: "color 200ms ease",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-3px",
          height: "2px",
          background: ORANGE,
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 220ms cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
        },
        "&:hover": {
          color: "#FFFFFF",
        },
        "&:hover::after": {
          transform: "scaleX(1)",
        },
      }}
    >
      {children}
    </Link>
  );
}

export default Footer;
