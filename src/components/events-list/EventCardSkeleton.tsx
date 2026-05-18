import { Box } from "@mui/material";
import { tokens } from "../../pages/events/invitation/tokens";

const shimmer = {
  background: `linear-gradient(90deg, ${tokens.color.line} 0%, rgba(20,19,26,0.04) 50%, ${tokens.color.line} 100%)`,
  backgroundSize: "200% 100%",
  animation: "invitation-skeleton 1.6s ease-in-out infinite",
  "@keyframes invitation-skeleton": {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
  },
};

export function EventCardSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        background: tokens.color.raised,
        borderRadius: `${tokens.radius.lg}px`,
        border: `1px solid ${tokens.color.line}`,
        overflow: "hidden",
      }}
    >
      <Box sx={{ aspectRatio: "16 / 10", ...shimmer }} />
      <Box sx={{ p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ width: 90, height: 16, borderRadius: 4, ...shimmer }} />
        <Box sx={{ width: "85%", height: 22, borderRadius: 4, ...shimmer }} />
        <Box sx={{ width: "60%", height: 22, borderRadius: 4, ...shimmer }} />
        <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
          <Box sx={{ width: 52, height: 60, borderRadius: 4, ...shimmer }} />
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ width: 60, height: 12, borderRadius: 4, ...shimmer }} />
            <Box sx={{ width: 100, height: 16, borderRadius: 4, ...shimmer }} />
          </Box>
        </Box>
        <Box sx={{ width: "70%", height: 14, borderRadius: 4, mt: 1, ...shimmer }} />
        <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 2, borderTop: `1px solid ${tokens.color.line}` }}>
          <Box sx={{ flex: 1, height: 40, borderRadius: 999, ...shimmer }} />
          <Box sx={{ width: 44, height: 44, borderRadius: 999, ...shimmer }} />
        </Box>
      </Box>
    </Box>
  );
}
