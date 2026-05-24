import React from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";

interface Props {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

/**
 * iOS-style primary CTA — orange filled, rounded, full width, white bold.
 * Matches the "Create Account" / "Sign In" buttons in the app.
 */
export default function AuthButton({
  label,
  onClick,
  type = "button",
  disabled,
}: Props) {
  const accent = tokens.color.brandOrange;
  return (
    <Box
      component="button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      sx={{
        appearance: "none",
        width: "100%",
        height: 56,
        border: "none",
        borderRadius: "14px",
        cursor: disabled ? "default" : "pointer",
        background: `linear-gradient(180deg, ${accent} 0%, ${accent} 55%, ${withAlpha(
          "#000000",
          0.06
        )} 100%), ${accent}`,
        backgroundBlendMode: "overlay",
        color: "#FFFFFF",
        fontFamily: tokens.font.poppins,
        fontWeight: 600,
        fontSize: 17,
        letterSpacing: "0.01em",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        opacity: disabled ? 0.6 : 1,
        boxShadow: `0 8px 22px ${withAlpha(accent, 0.32)}`,
        transition: `transform 120ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}, opacity 200ms ${tokens.motion.swift}`,
        "&:hover": disabled
          ? {}
          : {
              filter: "brightness(1.04)",
              boxShadow: `0 12px 28px ${withAlpha(accent, 0.4)}`,
            },
        "&:active": disabled
          ? {}
          : {
              transform: "scale(0.98)",
              boxShadow: `0 4px 12px ${withAlpha(accent, 0.3)}`,
            },
        "&:focus-visible": {
          boxShadow: `0 0 0 4px ${withAlpha(accent, 0.4)}, 0 8px 22px ${withAlpha(
            accent,
            0.32
          )}`,
        },
      }}
    >
      {label}
    </Box>
  );
}
