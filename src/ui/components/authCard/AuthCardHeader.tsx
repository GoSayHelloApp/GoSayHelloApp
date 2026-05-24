import React from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";

/**
 * Centered brand header inside the auth card — GoSayHELLO serif wordmark
 * over the orange hand-logo circle. Matches the iOS app's auth header.
 */
export default function AuthCardHeader() {
  const accent = tokens.color.brandOrange;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          fontFamily: tokens.font.serif,
          fontWeight: 600,
          fontSize: { xs: 30, md: 34 },
          letterSpacing: "-0.01em",
          lineHeight: 1,
          color: accent,
        }}
      >
        GoSay
        <Box component="span" sx={{ fontWeight: 700 }}>
          HELLO
        </Box>
      </Box>
      <Box
        component="img"
        src="/images/gosayhello-hand.png"
        alt="GoSayHELLO"
        sx={{
          mt: 1.25,
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "block",
        }}
      />
    </Box>
  );
}
