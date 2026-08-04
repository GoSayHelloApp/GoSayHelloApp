import React, { useRef, useState } from "react";
import { Box, CircularProgress, Menu, MenuItem } from "@mui/material";
import { Icon } from "@iconify/react";
import type { GalleryPost } from "../../../../models/responseModels/galleries";
import { tokens } from "../tokens";
import { isMobileDevice } from "../../../../utils/isMobile";

// Faithful web replica of the iOS GalleryPostCell: white rounded card with a soft shadow,
// an uploader header (avatar + name + time), a rounded photo carousel (page dots + n/N badge
// for multi-photo posts), and a caption with a See more / See less toggle.

const ORANGE = tokens.color.brandOrange;

function formatTime(s?: string | null): string {
  if (!s) return "";
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z"); // stored UTC → local
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

interface GalleryPostCardProps {
  post: GalleryPost;
  accent: string;
  onToast?: (message: string) => void;
  onSave?: () => void; // mobile: open the "open the app" popup instead of downloading
  onSharePost?: () => void; // share this post
}

const GalleryPostCard: React.FC<GalleryPostCardProps> = ({ post, onToast, onSave, onSharePost }) => {
  const photos = (post.media ?? []).filter((m) => m.media_type !== "video");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [dlPct, setDlPct] = useState<number | null>(null); // current-file % (null = idle)
  const [saveAll, setSaveAll] = useState<{ done: number; total: number } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const caption = (post.caption ?? "").trim();
  const busy = dlPct !== null || saveAll !== null;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const p = Math.round(el.scrollLeft / el.clientWidth);
    if (p !== page) setPage(p);
  };

  // Fetch as blob (works cross-origin thanks to S3 CORS) and save it, resolving when done.
  const fetchAndSave = (url: string) =>
    new Promise<boolean>((resolve) => {
      const filename = (url.split("/").pop() || "photo.jpg").split("?")[0];
      // Cache-bust so the download is a fresh CORS request, independent of the plainly-cached
      // display image (which loads without CORS).
      const dlUrl = url + (url.includes("?") ? "&" : "?") + "cb=" + Date.now();
      const xhr = new XMLHttpRequest();
      xhr.open("GET", dlUrl, true);
      xhr.responseType = "blob";
      xhr.onprogress = (e) => {
        if (e.lengthComputable) setDlPct(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let ok = false;
        if (xhr.status >= 200 && xhr.status < 300) {
          const objUrl = URL.createObjectURL(xhr.response as Blob);
          const a = document.createElement("a");
          a.href = objUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objUrl);
          ok = true;
        }
        resolve(ok);
      };
      xhr.onerror = () => resolve(false);
      setDlPct(0);
      xhr.send();
    });

  const saveOne = async (url: string) => {
    if (busy || !url) return;
    const ok = await fetchAndSave(url);
    setDlPct(null);
    onToast?.(ok ? "Saved to your device ✓" : "Couldn't save the photo");
  };

  const saveEvery = async () => {
    if (busy) return;
    setSaveAll({ done: 0, total: photos.length });
    let saved = 0;
    for (let i = 0; i < photos.length; i++) {
      const ok = await fetchAndSave(photos[i].media_url);
      if (ok) saved += 1;
      setSaveAll({ done: i + 1, total: photos.length });
    }
    setSaveAll(null);
    setDlPct(null);
    onToast?.(`Saved ${saved} photo${saved === 1 ? "" : "s"} ✓`);
  };

  const onDownloadClick = (e: React.MouseEvent<HTMLElement>) => {
    if (busy) return;
    // Mobile can't save into the gallery from a browser → prompt to open the app instead.
    if (isMobileDevice()) {
      onSave?.();
      return;
    }
    if (photos.length <= 1) saveOne(photos[Math.min(page, photos.length - 1)].media_url);
    else setMenuAnchor(e.currentTarget);
  };

  if (photos.length === 0) return null;

  return (
    <Box
      sx={{
        flexShrink: 0, // don't let the feed's flex column squash the card
        width: "100%",
        maxWidth: 520,
        mx: "auto",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 6px 14px rgba(20,19,26,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header: avatar + name/time + download */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px", p: "12px" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid #EBEBEB",
            background: "#E6E5E8",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {post.uploader_image ? (
            <Box component="img" src={post.uploader_image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Icon icon="mdi:account-circle" width={38} height={38} color="#BFBEC4" />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontWeight: 700,
              fontSize: 14,
              color: "#1F1E24",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {post.uploader_name || "Guest"}
          </Box>
          <Box sx={{ fontFamily: tokens.font.sans, fontWeight: 400, fontSize: 11.5, color: "#8C8A93", mt: "1px" }}>
            {formatTime(post.reviewed_at || post.created_at)}
          </Box>
        </Box>

        {onSharePost && (
          <Box
            onClick={onSharePost}
            sx={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Share photo"
          >
            <Icon icon="mdi:share-variant" width={19} height={19} color={ORANGE} />
          </Box>
        )}

        <Box
          onClick={onDownloadClick}
          sx={{
            position: "relative",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: busy ? "default" : "pointer",
            flexShrink: 0,
          }}
          aria-label="Download photo"
        >
          {!busy ? (
            <Icon icon="mdi:tray-arrow-down" width={20} height={20} color={ORANGE} />
          ) : (
            <>
              <CircularProgress variant="determinate" value={dlPct ?? 0} size={28} thickness={4} sx={{ color: ORANGE }} />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: tokens.font.sans,
                  fontSize: 8,
                  fontWeight: 700,
                  color: ORANGE,
                }}
              >
                {saveAll ? `${saveAll.done}/${saveAll.total}` : dlPct}
              </Box>
            </>
          )}
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              saveOne(photos[Math.min(page, photos.length - 1)].media_url);
            }}
            sx={{ fontFamily: tokens.font.sans, fontSize: 14 }}
          >
            Save this photo
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              saveEvery();
            }}
            sx={{ fontFamily: tokens.font.sans, fontSize: 14 }}
          >
            Save all {photos.length} photos
          </MenuItem>
        </Menu>
      </Box>

      {/* Photo carousel */}
      <Box sx={{ position: "relative", mx: "12px", mb: "12px" }}>
        <Box
          ref={scrollRef}
          onScroll={onScroll}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            borderRadius: "16px",
            background: "#F0EFF1",
            height: 480,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {photos.map((m) => (
            <Box
              key={m.id}
              sx={{ flex: "0 0 100%", scrollSnapAlign: "start", height: "100%", position: "relative", overflow: "hidden" }}
            >
              {/* Blurred backdrop fills the letterbox — like iOS */}
              <Box
                component="img"
                src={m.media_url}
                alt=""
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(1.1)",
                  filter: "blur(20px)",
                  zIndex: 0,
                }}
              />
              {/* iOS 0.08 dim over the blur */}
              <Box sx={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.08)", zIndex: 0 }} />
              {/* Foreground photo, fully fit (aspect-fit) */}
              <Box
                component="img"
                src={m.media_url}
                alt=""
                loading="lazy"
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>

        {/* n/N badge */}
        {photos.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              minWidth: 36,
              height: 20,
              px: 1,
              borderRadius: "10px",
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontFamily: tokens.font.sans,
              fontWeight: 700,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {page + 1}/{photos.length}
          </Box>
        )}

        {/* page dots */}
        {photos.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 12,
              zIndex: 2,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {/* dark pill keeps the dots visible on any photo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                px: "9px",
                py: "6px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(2px)",
              }}
            >
              {photos.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: i === page ? 9 : 8,
                    height: i === page ? 9 : 8,
                    borderRadius: "50%",
                    background: i === page ? ORANGE : "rgba(255,255,255,0.9)",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Caption + See more */}
      {caption && (
        <Box sx={{ px: "12px", pt: 0, pb: "12px" }}>
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontWeight: 500,
              fontSize: 14,
              color: "#1F1E24",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: expanded ? "unset" : 1,
              overflow: "hidden",
            }}
          >
            {caption}
          </Box>
          {caption.length > 48 && (
            <Box
              component="button"
              onClick={() => setExpanded((v) => !v)}
              sx={{
                mt: "3px",
                background: "none",
                border: "none",
                p: 0,
                cursor: "pointer",
                fontFamily: tokens.font.sans,
                fontWeight: 600,
                fontSize: 13,
                color: "#737079",
              }}
            >
              {expanded ? "See less" : "See more"}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GalleryPostCard;
