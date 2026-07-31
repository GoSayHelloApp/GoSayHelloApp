import React from "react";
import { Box, Dialog, CircularProgress } from "@mui/material";
import { Icon } from "@iconify/react";
import type { Gallery } from "../../../../models/responseModels/galleries";
import { useGetPublicGalleryQuery } from "../../../../services/events/galleryApi";
import { tokens } from "../tokens";
import { withAlpha } from "../useColorExtraction";
import VideoReel from "./VideoReel";
import GalleryPostCard from "./GalleryPostCard";

interface GalleryViewerProps {
  gallery: Gallery;
  accent: string;
  onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ gallery, accent, onClose }) => {
  const { data, isLoading, isError } = useGetPublicGalleryQuery({ gallery_id: gallery.id });
  const isVideo = gallery.gallery_type === "video";
  const posts = data?.posts ?? [];

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{ sx: { background: tokens.color.paper, color: tokens.color.inkPrimary } }}
    >
      {/* Ambient accent wash — same as the event detail page */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 520,
          zIndex: 0,
          pointerEvents: "none",
          background: `radial-gradient(60% 80% at 70% 10%, ${withAlpha(accent, 0.18)} 0%, ${withAlpha(
            accent,
            0
          )} 70%), linear-gradient(180deg, ${withAlpha(accent, 0.06)} 0%, ${withAlpha(accent, 0)} 100%)`,
        }}
      />

      {/* Top bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          py: 2,
          background: "transparent",
        }}
      >
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontWeight: 500,
            fontSize: { xs: 24, md: 30 },
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: tokens.color.inkPrimary,
          }}
        >
          {gallery.title}
        </Box>
        <Box onClick={onClose} sx={{ cursor: "pointer", p: 0.5, display: "flex", flexShrink: 0 }}>
          <Icon icon="mdi:close" width={28} height={28} color={tokens.color.inkPrimary} />
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, height: "100%", pt: isVideo ? 0 : 9 }}>
        {isLoading ? (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: accent }} />
          </Box>
        ) : isError || posts.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.color.inkMuted,
              fontFamily: tokens.font.sans,
            }}
          >
            {isVideo ? "No videos yet." : "No photos yet."}
          </Box>
        ) : isVideo ? (
          <VideoReel posts={posts} accent={accent} />
        ) : (
          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              px: { xs: 2, sm: 3 },
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {posts.map((p) => (
              <GalleryPostCard key={p.id} post={p} accent={accent} />
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default GalleryViewer;
