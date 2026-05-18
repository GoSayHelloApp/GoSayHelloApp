import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import MapStyles from "../../../configs/mapStylesConfig.json";
import { tokens } from "./tokens";
import { withAlpha } from "./useColorExtraction";
import { prefersReducedMotion } from "./useReveal";

export function Wayfinding({
  lat,
  lng,
  onDirections,
  accent,
}: {
  lat?: number;
  lng?: number;
  onDirections: () => void;
  accent: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setMount(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setMount(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  if (!lat || !lng) return null;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        borderRadius: `${tokens.radius.lg}px`,
        overflow: "hidden",
        border: `1px solid ${tokens.color.line}`,
        boxShadow: tokens.shadow.soft,
        background: tokens.color.raised,
        minHeight: 280,
      }}
    >
      {mount && (
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API ?? ""}>
          <Map
            style={{ height: 280, width: "100%" }}
            defaultCenter={{ lat: Number(lat), lng: Number(lng) }}
            defaultZoom={15}
            gestureHandling="cooperative"
            disableDefaultUI
            styles={MapStyles as any}
          />
        </APIProvider>
      )}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <MapPin accent={accent} onClick={onDirections} />
      </Box>
      <Box
        onClick={onDirections}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onDirections();
        }}
        sx={{
          position: "absolute",
          right: 16,
          bottom: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 2,
          py: 1.25,
          background: tokens.color.raised,
          border: `1px solid ${tokens.color.line}`,
          borderRadius: `${tokens.radius.lg}px`,
          boxShadow: tokens.shadow.lift,
          cursor: "pointer",
          fontFamily: tokens.font.sans,
          fontSize: 13,
          fontWeight: 600,
          color: tokens.color.inkPrimary,
          outline: "none",
          zIndex: 3,
          transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
          "&:hover, &:focus-visible": {
            transform: "translateY(-1px)",
            boxShadow: `0 4px 8px rgba(20,19,26,0.08), 0 16px 40px rgba(20,19,26,0.14)`,
          },
        }}
      >
        <Icon icon="ph:navigation-arrow-fill" width={14} color={accent} />
        Get directions
      </Box>
    </Box>
  );
}

function MapPin({
  accent,
  onClick,
}: {
  accent: string;
  onClick: () => void;
}) {
  const reduced = prefersReducedMotion();
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        pointerEvents: "auto",
      }}
    >
      {!reduced && (
        <>
          <Box
            sx={{
              position: "absolute",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: withAlpha(accent, 0.35),
              animation: "invitation-pulse 1.6s ease-out 0s 3 forwards",
              "@keyframes invitation-pulse": {
                "0%": { transform: "scale(1)", opacity: 0.7 },
                "100%": { transform: "scale(2.6)", opacity: 0 },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: withAlpha(accent, 0.2),
              animation: "invitation-pulse 1.6s ease-out 0.5s 3 forwards",
            }}
          />
        </>
      )}
      <Box
        sx={{
          position: "relative",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: accent,
          border: "2px solid #FFFFFF",
          boxShadow: `0 2px 6px rgba(0,0,0,0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#FFFFFF",
          }}
        />
      </Box>
    </Box>
  );
}
