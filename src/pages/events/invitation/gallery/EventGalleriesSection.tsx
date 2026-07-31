import React from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useGetPublicEventGalleriesQuery } from "../../../../services/events/galleryApi";
import type { Gallery } from "../../../../models/responseModels/galleries";
import { tokens } from "../tokens";
import { Reveal, SectionLabel } from "../Primitives";

// The public event page's "Event gallery" section. Renders only public galleries (the
// backend already filters for anonymous callers; we re-filter for safety), auto-hides when
// there are none, and opens a full viewer (photo lightbox or video reel) on tap.

interface EventGalleriesSectionProps {
  eventId: number;
  accent: string;
  numeral?: string;
}

const GalleryTile: React.FC<{ gallery: Gallery; accent: string; onOpen: () => void }> = ({
  gallery,
  onOpen,
}) => {
  const isVideo = gallery.gallery_type === "video";
  const noun = isVideo ? "video" : "photo";
  const count = gallery.photo_count ?? 0;
  const metaText = count === 0 ? `No ${noun}s yet` : `${count} ${noun}${count === 1 ? "" : "s"}`;
  const hasImage = !!gallery.cover_image;

  // Two-zone card, matching iOS: cover photo on top, a clean white info shelf below.
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff",
        border: "0.5px solid #E6E5E8",
        boxShadow: "0 4px 12px rgba(20,19,26,0.09)",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 22px rgba(20,19,26,0.14)" },
        "&:active": { transform: "scale(0.98)" },
      }}
    >
      {/* Photo zone */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "5 / 4", background: "#F0EFF1" }}>
        {hasImage ? (
          <Box
            component="img"
            src={gallery.cover_image as string}
            alt={gallery.title}
            loading="lazy"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              color: "#A8A6AD",
            }}
          >
            <Icon icon={isVideo ? "mdi:play-box-multiple-outline" : "mdi:image-multiple-outline"} width={34} height={34} />
            <Box sx={{ fontFamily: tokens.font.sans, fontSize: 11, fontWeight: 600, color: "#9A96A3" }}>
              {`No ${noun}s yet`}
            </Box>
          </Box>
        )}

        {/* Centered play badge over the poster (video galleries) */}
        {isVideo && hasImage && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
            }}
          >
            <Icon icon="mdi:play-circle" width={44} height={44} color="rgba(255,255,255,0.96)" />
          </Box>
        )}
      </Box>

      {/* White info shelf */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1.5, background: "#fff" }}>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontWeight: 800,
            fontSize: 15,
            color: "#1C1B22",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {gallery.title}
        </Box>
        <Box sx={{ fontFamily: tokens.font.sans, fontWeight: 500, fontSize: 12, color: "#807D88", mt: 0.4 }}>
          {metaText}
        </Box>
      </Box>
    </Box>
  );
};

const EventGalleriesSection: React.FC<EventGalleriesSectionProps> = ({ eventId, accent, numeral }) => {
  const { data } = useGetPublicEventGalleriesQuery({ event_id: eventId });
  const navigate = useNavigate();
  const openGallery = (g: Gallery) =>
    navigate(`/event-details/${eventId}/gallery/${g.id}`, { state: { accent } });

  // Show every public gallery — even when it has no photos/videos yet (empty card).
  const galleries = (data?.galleries ?? []).filter((g) => g.visibility === "public");

  if (galleries.length === 0) return null;

  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 4, md: 6 } }}>
      <Reveal>
        <Box sx={{ maxWidth: 880 }}>
          <SectionLabel
            numeral={numeral}
            title={galleries.length === 1 ? "Event Gallery" : "Event Galleries"}
            accent={accent}
          />
          <Box
            sx={{
              mt: { xs: 1, md: 1.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(auto-fill, minmax(150px, 1fr))",
                sm: "repeat(auto-fill, minmax(180px, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {galleries.map((g) => (
              <GalleryTile key={g.id} gallery={g} accent={accent} onOpen={() => openGallery(g)} />
            ))}
          </Box>
        </Box>
      </Reveal>
    </Box>
  );
};

export default EventGalleriesSection;
