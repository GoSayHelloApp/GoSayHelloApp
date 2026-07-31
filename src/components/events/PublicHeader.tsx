import React from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../pages/events/invitation/tokens";
import { withAlpha } from "../../pages/events/invitation/useColorExtraction";

// Shared public header for the event / gallery pages: GoSayHELLO logo, an optional Back
// action, and the accent "Open app" pill.
interface PublicHeaderProps {
  accent: string;
  onBack?: () => void;
  backLabel?: string;
  onOpenApp: () => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ accent, onBack, backLabel = "Back", onOpenApp }) => {
  return (
    <Box sx={{ position: "relative", zIndex: 2, borderBottom: `1px solid ${tokens.color.line}` }}>
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
        {/* Logo */}
        <Box
          component="a"
          href="/events-list"
          sx={{ display: "inline-flex", alignItems: "center", gap: 1, textDecoration: "none" }}
        >
          <Box
            component="img"
            src="/images/gosayhello-hand.png"
            alt=""
            sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 }, borderRadius: "50%", display: "block" }}
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

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
          {onBack && (
            <Box
              component="button"
              type="button"
              onClick={onBack}
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
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                transition: `color 200ms ${tokens.motion.swift}`,
                "& .back": { display: "inline-flex", transition: `transform 220ms ${tokens.motion.swift}` },
                "&:hover, &:focus-visible": { color: accent },
                "&:hover .back, &:focus-visible .back": { transform: "translateX(-3px)" },
              }}
            >
              <Box component="span" className="back">
                <Icon icon="ph:arrow-left-bold" width={12} />
              </Box>
              {backLabel}
            </Box>
          )}

          <Box
            component="button"
            type="button"
            onClick={onOpenApp}
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
              "& .chev": { transition: `transform 200ms ${tokens.motion.swift}` },
              "&:hover": {
                transform: "translateY(-1px)",
                filter: "brightness(1.05)",
                boxShadow: `0 8px 20px ${withAlpha(accent, 0.35)}`,
              },
              "&:hover .chev": { transform: "translateX(3px)" },
            }}
          >
            Open app
            <Box component="span" className="chev" sx={{ display: "inline-flex" }}>
              <Icon icon="ph:arrow-right-bold" width={12} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PublicHeader;
