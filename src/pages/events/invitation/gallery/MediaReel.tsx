import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Menu, MenuItem } from "@mui/material";
import { Icon } from "@iconify/react";
import type { GalleryPost } from "../../../../models/responseModels/galleries";
import { tokens } from "../tokens";
import { usePullToRefresh } from "./usePullToRefresh";
import { PullSpinner } from "./PullSpinner";
import { isMobileDevice } from "../../../../utils/isMobile";

// Reel gallery detail (video OR mixed): the same iOS-style card (white card + uploader header +
// rounded media), one card per screen with vertical scroll-snap. Each post renders per its media
// type — a video (autoplay-on-center, scrubber, mute) or a photo carousel (dots + n/N) — with the
// caption overlaid on the media (TikTok style). Only the centred clip plays (IntersectionObserver).

const ORANGE = tokens.color.brandOrange;

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(s?: string | null): string {
  if (!s) return "";
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

// Fetch as blob (works cross-origin thanks to S3 CORS) and save it, resolving when done.
function fetchAndSave(url: string, onPct?: (p: number) => void): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const filename = (url.split("/").pop() || "media").split("?")[0];
    // Cache-bust so the download is a fresh CORS request, independent of the cached display media.
    const dlUrl = url + (url.includes("?") ? "&" : "?") + "cb=" + Date.now();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", dlUrl, true);
    xhr.responseType = "blob";
    xhr.onprogress = (e) => {
      if (e.lengthComputable) onPct?.(Math.round((e.loaded / e.total) * 100));
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
    xhr.send();
  });
}

// Caption block overlaid at the bottom of the media (1 line + more/less toggle).
const CaptionOverlay: React.FC<{ caption: string }> = ({ caption }) => {
  const [expanded, setExpanded] = useState(false);
  if (!caption) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          fontFamily: tokens.font.sans,
          fontSize: 14,
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: expanded ? "unset" : 1,
          overflow: expanded ? "auto" : "hidden",
          maxHeight: expanded ? "38vh" : "none",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
        }}
      >
        {caption}
      </Box>
      {caption.length > 48 && (
        <Box
          component="button"
          onClick={() => setExpanded((v) => !v)}
          sx={{ mt: 0.5, background: "none", border: "none", p: 0, cursor: "pointer", color: ORANGE, fontFamily: tokens.font.sans, fontSize: 13, fontWeight: 700 }}
        >
          {expanded ? "less" : "more"}
        </Box>
      )}
    </Box>
  );
};

interface ReelCardProps {
  post: GalleryPost;
  muted: boolean;
  onToggleMute: () => void;
  onToast?: (message: string) => void;
  onSave?: () => void; // mobile: open the "open the app" popup instead of downloading
  onSharePost?: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ post, muted, onToggleMute, onToast, onSave, onSharePost }) => {
  const isVideo = post.media?.[0]?.media_type === "video";
  const media = post.media?.[0];
  const photos = (post.media ?? []).filter((m) => m.media_type !== "video");
  const caption = (post.caption ?? "").trim();

  // Video state
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(media?.duration_seconds ?? 0);

  // Photo carousel state
  const photoScrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // Download state (shared)
  const [dlPct, setDlPct] = useState<number | null>(null);
  const [saveAll, setSaveAll] = useState<{ done: number; total: number } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const busy = dlPct !== null || saveAll !== null;

  // Autoplay only the centred clip.
  useEffect(() => {
    if (!isVideo) return;
    const el = videoWrapRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.6) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isVideo]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !dur) return;
    const frac = Number(e.target.value) / 1000;
    v.currentTime = frac * dur;
    setProgress(frac);
  };

  const onPhotoScroll = () => {
    const el = photoScrollRef.current;
    if (!el) return;
    const p = Math.round(el.scrollLeft / el.clientWidth);
    if (p !== page) setPage(p);
  };

  // ── Downloads ──
  const saveVideo = async () => {
    if (isMobileDevice()) return onSave?.();
    const url = media?.media_url;
    if (!url || busy) return;
    setDlPct(0);
    const ok = await fetchAndSave(url, setDlPct);
    setDlPct(null);
    onToast?.(ok ? "Saved to your device ✓" : "Couldn't save the video");
  };
  const savePhoto = async (url: string) => {
    if (busy || !url) return;
    setDlPct(0);
    const ok = await fetchAndSave(url, setDlPct);
    setDlPct(null);
    onToast?.(ok ? "Saved to your device ✓" : "Couldn't save the photo");
  };
  const savePhotosAll = async () => {
    if (busy) return;
    setSaveAll({ done: 0, total: photos.length });
    let saved = 0;
    for (let i = 0; i < photos.length; i++) {
      const ok = await fetchAndSave(photos[i].media_url, setDlPct);
      if (ok) saved += 1;
      setSaveAll({ done: i + 1, total: photos.length });
    }
    setSaveAll(null);
    setDlPct(null);
    onToast?.(`Saved ${saved} photo${saved === 1 ? "" : "s"} ✓`);
  };
  const onDownloadClick = (e: React.MouseEvent<HTMLElement>) => {
    if (busy) return;
    if (isMobileDevice()) return onSave?.();
    if (isVideo) return void saveVideo();
    if (photos.length <= 1) savePhoto(photos[Math.min(page, photos.length - 1)].media_url);
    else setMenuAnchor(e.currentTarget);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        height: "100%",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 5px 16px rgba(0,0,0,0.22)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px", p: "12px", flexShrink: 0 }}>
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
            sx={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            aria-label="Share post"
          >
            <Icon icon="mdi:share-variant" width={19} height={19} color={ORANGE} />
          </Box>
        )}
        <Box
          onClick={onDownloadClick}
          sx={{ position: "relative", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: busy ? "default" : "pointer", flexShrink: 0 }}
          aria-label="Download"
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
              savePhoto(photos[Math.min(page, photos.length - 1)].media_url);
            }}
            sx={{ fontFamily: tokens.font.sans, fontSize: 14 }}
          >
            Save this photo
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); savePhotosAll(); }} sx={{ fontFamily: tokens.font.sans, fontSize: 14 }}>
            Save all {photos.length} photos
          </MenuItem>
        </Menu>
      </Box>

      {/* Media area */}
      <Box
        ref={videoWrapRef}
        sx={{ position: "relative", flex: 1, mx: "12px", mb: "12px", borderRadius: "16px", overflow: "hidden", background: isVideo ? "#000" : "#F0EFF1" }}
      >
        {isVideo ? (
          <>
            {/* Blurred backdrop fills the letterbox behind the video */}
            {media?.thumb_url && (
              <Box
                component="img"
                src={media.thumb_url}
                alt=""
                aria-hidden
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.15)", filter: "blur(24px) brightness(0.75)", pointerEvents: "none", zIndex: 0 }}
              />
            )}
            <video
              ref={videoRef}
              src={media?.media_url}
              poster={media?.thumb_url ?? undefined}
              playsInline
              loop
              muted={muted}
              preload="auto"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration || dur)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCur(v.currentTime);
                if (v.duration) setProgress(v.currentTime / v.duration);
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer", display: "block", position: "relative", zIndex: 1 }}
            />

            {!playing && (
              <Box sx={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <Icon icon="mdi:play-circle" width={70} height={70} color="rgba(255,255,255,0.92)" />
              </Box>
            )}

            {/* Mute */}
            <Box
              onClick={onToggleMute}
              sx={{ position: "absolute", top: 12, right: 12, zIndex: 2, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}
            >
              <Icon icon={muted ? "mdi:volume-off" : "mdi:volume-high"} width={20} height={20} color="#fff" />
            </Box>

            {/* Bottom scrim: caption + scrubber */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                px: 1.75,
                pt: 5,
                pb: 1.25,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)",
                color: "#fff",
              }}
            >
              <CaptionOverlay caption={caption} />
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(progress * 1000)}
                onChange={onSeek}
                style={{ width: "100%", accentColor: ORANGE, height: 4, cursor: "pointer" }}
              />
              <Box sx={{ fontFamily: tokens.font.mono, fontSize: 11, fontWeight: 600, opacity: 0.9, mt: 0.5 }}>
                {fmt(cur)} / {fmt(dur)}
              </Box>
            </Box>
          </>
        ) : (
          <>
            {/* Photo carousel — one full-height card, swipe between images */}
            <Box
              ref={photoScrollRef}
              onScroll={onPhotoScroll}
              sx={{
                display: "flex",
                height: "100%",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {photos.map((m) => (
                <Box key={m.id} sx={{ flex: "0 0 100%", scrollSnapAlign: "start", height: "100%", position: "relative", overflow: "hidden" }}>
                  {/* Blurred backdrop fills the letterbox */}
                  <Box
                    component="img"
                    src={m.media_url}
                    alt=""
                    aria-hidden
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)", filter: "blur(20px)", zIndex: 0 }}
                  />
                  <Box sx={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.08)", zIndex: 0 }} />
                  <Box
                    component="img"
                    src={m.media_url}
                    alt=""
                    loading="lazy"
                    sx={{ position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </Box>
              ))}
            </Box>

            {/* n/N badge */}
            {photos.length > 1 && (
              <Box
                sx={{ position: "absolute", top: 10, right: 10, zIndex: 2, minWidth: 36, height: 20, px: 1, borderRadius: "10px", background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: tokens.font.sans, fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {page + 1}/{photos.length}
              </Box>
            )}

            {/* Bottom scrim: caption + page dots */}
            {(caption || photos.length > 1) && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 2,
                  px: 1.75,
                  pt: 5,
                  pb: 1.25,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 100%)",
                  color: "#fff",
                }}
              >
                <CaptionOverlay caption={caption} />
                {photos.length > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", gap: "7px", pt: caption ? 0.5 : 0 }}>
                    {photos.map((_, i) => (
                      <Box
                        key={i}
                        sx={{ width: i === page ? 9 : 8, height: i === page ? 9 : 8, borderRadius: "50%", background: i === page ? ORANGE : "rgba(255,255,255,0.9)" }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

interface MediaReelProps {
  posts: GalleryPost[];
  accent: string;
  mixed?: boolean; // true = keep photo AND video posts; false = video-only reel
  onToast?: (message: string) => void;
  onSave?: () => void;
  onSharePost?: (postId: number) => void;
  onRefresh?: () => Promise<unknown> | void;
  targetPostId?: number | null;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

const MediaReel: React.FC<MediaReelProps> = ({ posts, accent, mixed, onToast, onSave, onSharePost, onRefresh, targetPostId, onLoadMore, loadingMore, hasMore }) => {
  // Default to sound on — the user reached this page via a tap (a user gesture in the same SPA
  // document), so autoplay with audio is permitted.
  const [muted, setMuted] = useState(false);
  const items = mixed
    ? posts.filter((p) => (p.media?.length ?? 0) > 0)
    : posts.filter((p) => p.media?.[0]?.media_type === "video");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(scrollRef, onRefresh ?? (() => {}));

  // Infinite scroll: load the next page when within ~one screen of the bottom.
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onLoadMore || !hasMore || loadingMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loadingMore]);

  // A shared post link (…?post=<id>) → jump to that card once.
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!targetPostId || items.length === 0 || scrolledRef.current) return;
    const el = document.getElementById(`gpost-${targetPostId}`);
    if (el) {
      scrolledRef.current = true;
      setTimeout(() => el.scrollIntoView({ behavior: "auto", block: "start" }), 120);
    }
  }, [targetPostId, items.length]);

  return (
    <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <PullSpinner pull={pull} refreshing={refreshing} />
      <Box
        ref={scrollRef}
        onScroll={onScroll}
        sx={{
          height: "100%",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          background: "transparent",
          px: 2,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((p) => (
          <Box
            key={p.id}
            id={`gpost-${p.id}`}
            sx={{ height: "94%", scrollSnapAlign: "start", display: "flex", alignItems: "center", justifyContent: "center", py: "14px" }}
          >
            <ReelCard
              post={p}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onToast={onToast}
              onSave={onSave}
              onSharePost={onSharePost ? () => onSharePost(p.id) : undefined}
            />
          </Box>
        ))}
        {loadingMore && (
          <Box sx={{ height: "8%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={22} sx={{ color: accent }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaReel;
