import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Snackbar, Slide } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetPublicGalleryQuery } from "../../services/events/galleryApi";
import { tokens } from "./invitation/tokens";
import { withAlpha } from "./invitation/useColorExtraction";
import PublicHeader from "../../components/events/PublicHeader";
import OpenApp from "../../components/events/OpenApp";
import VideoReel from "./invitation/gallery/VideoReel";
import GalleryPostCard from "./invitation/gallery/GalleryPostCard";
import { usePullToRefresh } from "./invitation/gallery/usePullToRefresh";
import { PullSpinner } from "./invitation/gallery/PullSpinner";

// Public gallery detail page (its own URL): /event-details/:eventId/gallery/:galleryId
// Same header as the event page (logo + back + Open app). Photo/cover galleries render as a
// card feed; video galleries as a one-card-per-screen reel.
const GalleryDetailPage = () => {
  const { eventId, galleryId } = useParams<{ eventId: string; galleryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const accent =
    (location.state as { accent?: string } | null)?.accent || tokens.color.fallbackAccent;

  const [openApp, setOpenApp] = useState(false);
  const [openAppText, setOpenAppText] = useState("Open the GoSayHELLO app to continue.");
  const [toast, setToast] = useState<string | null>(null);

  const promptOpenApp = (text: string) => {
    setOpenAppText(text);
    setOpenApp(true);
  };
  const { data, isLoading, isError, refetch } = useGetPublicGalleryQuery({ gallery_id: Number(galleryId) });
  const gallery = data?.gallery;
  const isVideo = gallery?.gallery_type === "video";
  const posts = data?.posts ?? [];
  const title = gallery?.title || "Gallery";

  const feedRef = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(feedRef, () => refetch());

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [galleryId]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(`/event-details/${eventId}`);
  };

  const goToEvent = () => navigate(`/event-details/${eventId}`);

  // Share the same link iOS shares: the /share-gallery/{token} unfurl page (rich preview,
  // opens the app / App Store). Uses the native share sheet, else copies the link.
  const shareGallery = async () => {
    const token = gallery?.share_token;
    if (!token) {
      setToast("Share link isn't ready yet");
      return;
    }
    const base = (process.env.REACT_APP_PYTHON_API_BASE_URL || "https://pythonapi.gosayhelloapp.com/").replace(
      /\/?$/,
      "/"
    );
    const url = `${base}share-gallery/${encodeURIComponent(token)}`;
    const shareTitle = `${gallery?.event_name || "Event"} — ${gallery?.title || "Gallery"}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Link copied ✓");
      }
    } catch {
      /* user dismissed the share sheet — ignore */
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: tokens.color.paper,
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
      }}
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

      {/* Shared public header */}
      <Box sx={{ flexShrink: 0, position: "relative", zIndex: 2 }}>
        <PublicHeader
          accent={accent}
          onBack={goBack}
          backLabel="Back"
          onOpenApp={() => promptOpenApp("Open the GoSayHELLO app to continue.")}
        />
      </Box>

      {/* Gallery title */}
      <Box
        sx={{
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
          maxWidth: tokens.page.maxWidth,
          width: "100%",
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 1.5, md: 2 },
        }}
      >
        {gallery?.event_name && (
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: { xs: 11, md: 12 },
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: accent,
              mb: 0.75,
            }}
          >
            {gallery.event_name}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "nowrap",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              fontFamily: tokens.font.serif,
              fontWeight: 500,
              fontSize: { xs: 26, md: 34 },
              letterSpacing: "-0.01em",
              lineHeight: 1.05,
              color: tokens.color.inkPrimary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Box>

          {/* Event detail + Share (right side) */}
          <Box sx={{ display: "flex", gap: 1.25, flexShrink: 0 }}>
          <Box
            component="button"
            type="button"
            onClick={goToEvent}
            sx={{
              appearance: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.75,
              py: 0.875,
              borderRadius: 999,
              border: `1px solid ${withAlpha(accent, 0.35)}`,
              background: withAlpha(accent, 0.06),
              color: accent,
              fontFamily: tokens.font.sans,
              fontSize: 13,
              fontWeight: 700,
              WebkitTapHighlightColor: "transparent",
              transition: "background 0.15s ease, transform 0.1s ease",
              "&:hover": { background: withAlpha(accent, 0.12) },
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            <Icon icon="mdi:calendar-blank-outline" width={16} height={16} />
            Event detail
          </Box>

          <Box
            component="button"
            type="button"
            onClick={shareGallery}
            sx={{
              appearance: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.75,
              py: 0.875,
              borderRadius: 999,
              border: "none",
              background: accent,
              color: "#fff",
              fontFamily: tokens.font.sans,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
              WebkitTapHighlightColor: "transparent",
              transition: "transform 0.1s ease, box-shadow 0.15s ease, filter 0.15s ease",
              "&:hover": { filter: "brightness(1.05)", boxShadow: `0 6px 16px ${withAlpha(accent, 0.35)}` },
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            <Icon icon="mdi:share-variant" width={16} height={16} />
            Share
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0 }}>
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
          <VideoReel
            posts={posts}
            accent={accent}
            onToast={setToast}
            onSave={() => promptOpenApp("Open the GoSayHELLO app to save videos to your gallery.")}
            onRefresh={() => refetch()}
          />
        ) : (
          <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
            <PullSpinner pull={pull} refreshing={refreshing} />
            <Box
              ref={feedRef}
              sx={{
                height: "100%",
                overflowY: "auto",
                px: { xs: 2, sm: 3 },
                pt: 2,
                pb: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {posts.map((p) => (
                <GalleryPostCard
                  key={p.id}
                  post={p}
                  accent={accent}
                  onToast={setToast}
                  onSave={() => promptOpenApp("Open the GoSayHELLO app to save photos to your gallery.")}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={2400}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        sx={{ bottom: { xs: 24, sm: 32 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            pl: 1.25,
            pr: 2,
            py: 1.25,
            borderRadius: "999px",
            background: "rgba(28,27,34,0.96)",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
            backdropFilter: "blur(6px)",
            fontFamily: tokens.font.sans,
            fontSize: 14,
            fontWeight: 600,
            maxWidth: "88vw",
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: toast?.startsWith("Couldn't")
                ? "rgba(235,90,60,0.18)"
                : "rgba(62,213,152,0.18)",
            }}
          >
            <Icon
              icon={toast?.startsWith("Couldn't") ? "mdi:alert-circle" : "mdi:check-bold"}
              width={16}
              height={16}
              color={toast?.startsWith("Couldn't") ? "#FF6B4A" : "#3ED598"}
            />
          </Box>
          <Box component="span" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {toast?.replace(" ✓", "")}
          </Box>
        </Box>
      </Snackbar>

      {/* Add-media FAB → prompt to open the app. Aligned right with the header's content
          (same max-width + padding), so it lines up under the "Open app" button. */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: { xs: 24, md: 32 },
          zIndex: 6,
          maxWidth: tokens.page.maxWidth,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: "none",
        }}
      >
        <Box
          onClick={() =>
            promptOpenApp(
              `Open the GoSayHELLO app to add ${isVideo ? "videos" : "photos"} to this gallery.`
            )
          }
          aria-label={isVideo ? "Add videos" : "Add photos"}
          sx={{
            pointerEvents: "auto",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 8px 22px ${withAlpha(accent, 0.42)}`,
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: `0 12px 28px ${withAlpha(accent, 0.5)}` },
            "&:active": { transform: "scale(0.94)" },
          }}
        >
          <Icon icon="mdi:plus" width={30} height={30} color="#fff" />
        </Box>
      </Box>

      <OpenApp eventId={eventId} openApp={openApp} setOpenApp={setOpenApp} text={openAppText} />
    </Box>
  );
};

export default GalleryDetailPage;
