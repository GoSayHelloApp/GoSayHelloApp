import React from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";

interface Props {
  value: number;
  onChange: (value: number) => void;
  options: string[];
}

/**
 * iOS-style text tabs — active tab is orange + bold with an orange underline,
 * a full-width hairline runs beneath. Preserves the 0/1 index API.
 */
export default function AuthTabs({ value, onChange, options }: Props) {
  const accent = tokens.color.brandOrange;
  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ display: "flex", gap: 4 }}>
        {options.map((label, i) => {
          const active = i === value;
          return (
            <Box
              key={label}
              component="button"
              type="button"
              onClick={() => onChange(i)}
              sx={{
                appearance: "none",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                p: 0,
                pb: 1.25,
                position: "relative",
                fontFamily: tokens.font.poppins,
                fontSize: 17,
                fontWeight: active ? 600 : 500,
                color: active ? accent : tokens.color.iosTabInactive,
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                transition: `color 200ms ${tokens.motion.swift}`,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: "-1.5px",
                  height: "2.5px",
                  borderRadius: "2px",
                  background: accent,
                  transform: active ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                  transition: `transform 260ms ${tokens.motion.settle}`,
                  pointerEvents: "none",
                },
                "&:hover": {
                  color: active ? accent : tokens.color.inkSecondary,
                },
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
      {/* full-width hairline beneath the tabs */}
      <Box
        sx={{
          height: "1.5px",
          background: tokens.color.line,
        }}
      />
    </Box>
  );
}
