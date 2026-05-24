import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";

/**
 * Inline single-line cycling tagline for the auth card — matches the iOS
 * "Discover events near you" line (gray text, orange keyword).
 */
const PHRASES: Array<{ prefix: string; keyword: string; suffix: string }> = [
  { prefix: "Meet ", keyword: "people", suffix: " around you" },
  { prefix: "Discover ", keyword: "events", suffix: " near you" },
  { prefix: "Connect with ", keyword: "businesses", suffix: " in your city" },
];

const INTERVAL_MS = 3500;
const FADE_MS = 260;

export default function CyclingTagline() {
  const [index, setIndex] = useState(1); // start on "Discover events" like iOS
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;
    }
    const tick = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => window.clearInterval(tick);
  }, []);

  const current = PHRASES[index];

  return (
    <Box
      sx={{
        fontFamily: tokens.font.poppins,
        fontSize: 16,
        fontWeight: 500,
        color: tokens.color.inkMuted,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 4}px)`,
        transition: `opacity ${FADE_MS}ms ${tokens.motion.settle}, transform ${FADE_MS}ms ${tokens.motion.settle}`,
        mt: 2,
        mb: 2.5,
      }}
    >
      {current.prefix}
      <Box
        component="span"
        sx={{ color: tokens.color.brandOrange, fontWeight: 700 }}
      >
        {current.keyword}
      </Box>
      {current.suffix}
    </Box>
  );
}
