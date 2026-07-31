import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { tokens } from "../tokens";

// Pull-to-refresh indicator: a small spinner that follows the pull and spins while refreshing.
export const PullSpinner: React.FC<{ pull: number; refreshing: boolean }> = ({ pull, refreshing }) => {
  const show = pull > 0 || refreshing;
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        transform: `translateY(${Math.max(0, pull) - 32}px)`,
        opacity: show ? 1 : 0,
        transition: refreshing ? "none" : "opacity 0.15s ease, transform 0.1s ease",
      }}
    >
      <Box
        sx={{
          mt: 1,
          p: 0.75,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
        }}
      >
        <CircularProgress
          size={22}
          thickness={4}
          sx={{ color: tokens.color.brandOrange }}
          variant={refreshing ? "indeterminate" : "determinate"}
          value={Math.min(100, (pull / 64) * 100)}
        />
      </Box>
    </Box>
  );
};
