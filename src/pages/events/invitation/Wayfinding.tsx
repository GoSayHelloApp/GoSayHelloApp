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
  address,
  distance,
}: {
  lat?: number;
  lng?: number;
  onDirections: () => void;
  accent: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  distance?: number;
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

  const showDistance =
    typeof distance === "number" && distance > 0 && distance < 9999;
  const distanceLabel = showDistance
    ? distance < 1
      ? `${Math.round(distance * 10) / 10} mi`
      : `${Math.round(distance * 10) / 10} mi away`
    : null;

  const openMode = (mode: "driving" | "transit" | "walking" | "bicycling") => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
    window.open(url, "_blank");
  };

  const fmtCoord = (n: number) => {
    const abs = Math.abs(n).toFixed(4);
    return abs;
  };
  const latStr = `${fmtCoord(lat)}° ${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${fmtCoord(lng)}° ${lng >= 0 ? "E" : "W"}`;

  const travelModes: {
    mode: "driving" | "transit" | "walking" | "bicycling";
    icon: string;
    label: string;
  }[] = [
    { mode: "driving", icon: "ph:car-fill", label: "Drive" },
    { mode: "transit", icon: "ph:train-fill", label: "Transit" },
    { mode: "walking", icon: "ph:person-simple-walk-fill", label: "Walk" },
    { mode: "bicycling", icon: "ph:bicycle", label: "Bike" },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
        gap: { xs: 2, md: 3 },
        alignItems: "stretch",
      }}
    >
      {/* Destination card */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: `${tokens.radius.lg}px`,
          background: tokens.color.raised,
          border: `1px solid ${tokens.color.line}`,
          boxShadow: tokens.shadow.soft,
          p: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: 280, md: 0 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${withAlpha(
              accent,
              0.16
            )} 0%, ${withAlpha(accent, 0)} 70%)`,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: withAlpha(accent, 0.14),
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="ph:compass-fill" width={20} />
          </Box>
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            The Destination
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            fontFamily: tokens.font.serif,
            fontSize: { xs: 22, md: 26 },
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
            color: tokens.color.inkPrimary,
            mb: "auto",
          }}
        >
          {address || "Location to be announced"}
        </Box>

        {distanceLabel && (
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 0.75,
              mt: 2.5,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              background: withAlpha(accent, 0.1),
              color: accent,
              fontFamily: tokens.font.sans,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            <Icon icon="ph:paper-plane-tilt-fill" width={13} />
            {distanceLabel}
          </Box>
        )}

        {/* Travel modes */}
        <Box
          sx={{
            position: "relative",
            mt: 3,
            pt: 2.5,
            borderTop: `1px dashed ${tokens.color.line}`,
          }}
        >
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: tokens.color.inkSecondary,
              mb: 1.25,
            }}
          >
            Getting here
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: 1,
            }}
          >
            {travelModes.map((t) => (
              <Box
                key={t.mode}
                onClick={() => openMode(t.mode)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openMode(t.mode);
                }}
                title={`${t.label} directions`}
                sx={{
                  cursor: "pointer",
                  outline: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  py: 1.25,
                  borderRadius: `${tokens.radius.md}px`,
                  background: tokens.color.paper,
                  border: `1px solid ${tokens.color.line}`,
                  color: tokens.color.inkPrimary,
                  transition: `transform 180ms ${tokens.motion.swift}, background 180ms ${tokens.motion.swift}, color 180ms ${tokens.motion.swift}, border-color 180ms ${tokens.motion.swift}`,
                  "&:hover, &:focus-visible": {
                    transform: "translateY(-2px)",
                    background: accent,
                    borderColor: accent,
                    color: "#FFFFFF",
                  },
                }}
              >
                <Icon icon={t.icon} width={18} />
                <Box
                  sx={{
                    fontFamily: tokens.font.sans,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          onClick={onDirections}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onDirections();
          }}
          sx={{
            position: "relative",
            mt: 2.5,
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 1,
            px: 2.5,
            py: 1.5,
            borderRadius: `${tokens.radius.xl}px`,
            background: accent,
            color: "#FFFFFF",
            fontFamily: tokens.font.sans,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer",
            outline: "none",
            boxShadow: `0 1px 0 ${withAlpha(
              "#FFFFFF",
              0.25
            )} inset, 0 6px 16px ${withAlpha(accent, 0.3)}`,
            transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}`,
            "& .arrow": {
              transition: `transform 220ms ${tokens.motion.swift}`,
            },
            "&:hover, &:focus-visible": {
              transform: "translateY(-1px)",
              filter: "brightness(1.05)",
              boxShadow: `0 1px 0 ${withAlpha(
                "#FFFFFF",
                0.3
              )} inset, 0 10px 24px ${withAlpha(accent, 0.4)}`,
            },
            "&:hover .arrow, &:focus-visible .arrow": {
              transform: "translateX(3px)",
            },
          }}
        >
          <Icon icon="ph:navigation-arrow-fill" width={14} />
          Get directions
          <Box component="span" className="arrow" sx={{ display: "inline-flex" }}>
            <Icon icon="ph:arrow-right-bold" width={14} />
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${tokens.color.line}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            fontFamily: '"SF Mono", "JetBrains Mono", "Menlo", monospace',
            fontSize: 10.5,
            letterSpacing: "0.06em",
            color: tokens.color.inkMuted,
          }}
        >
          <span>{latStr}</span>
          <span>{lngStr}</span>
        </Box>
      </Box>

      {/* Map */}
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          borderRadius: `${tokens.radius.lg}px`,
          overflow: "hidden",
          border: `1px solid ${tokens.color.line}`,
          boxShadow: tokens.shadow.lift,
          background: tokens.color.raised,
          height: { xs: 320, md: "auto" },
          minHeight: { xs: 320, md: 420 },
        }}
      >
        {mount && (
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API ?? ""}>
            <Map
              style={{ height: "100%", width: "100%" }}
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
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(180deg, ${withAlpha(
              "#0B0B10",
              0.1
            )} 0%, ${withAlpha("#0B0B10", 0)} 25%, ${withAlpha(
              "#0B0B10",
              0
            )} 75%, ${withAlpha("#0B0B10", 0.18)} 100%)`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 16,
            bottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            background: withAlpha("#FFFFFF", 0.92),
            border: `1px solid ${withAlpha("#FFFFFF", 0.4)}`,
            backdropFilter: "blur(8px)",
            fontFamily: tokens.font.sans,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: tokens.color.inkPrimary,
            zIndex: 3,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 0 3px ${withAlpha(accent, 0.3)}`,
            }}
          />
          You're going here
        </Box>
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
