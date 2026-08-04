import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Icon } from "@iconify/react";
import type { GalleryPost } from "../../../../models/responseModels/galleries";
import { tokens } from "../tokens";
import { usePullToRefresh } from "./usePullToRefresh";
import { PullSpinner } from "./PullSpinner";
import { isMobileDevice } from "../../../../utils/isMobile";

// Video gallery detail: the same iOS-style card (white card + uploader header + rounded
// video), one card per screen with vertical scroll-snap so the next card peeks at the bottom.
// Only the centred clip plays (IntersectionObserver). Autoplay is muted (browser policy) with
// a shared unmute control.

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

interface ReelCardProps {
  post: GalleryPost;
  muted: boolean;
  onToggleMute: () => void;
  onToast?: (message: string) => void;
  onSave?: () => void; // mobile: open the "open the app" popup instead of downloading
  onSharePost?: () => void; // share this clip
}

const ReelCard: React.FC<ReelCardProps> = ({ post, muted, onToggleMute, onToast, onSave, onSharePost }) => {
  const media = post.media?.[0];
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(media?.duration_seconds ?? 0);
  const [expanded, setExpanded] = useState(false);
  const [dlPct, setDlPct] = useState<number | null>(null); // null = idle
  const caption = (post.caption ?? "").trim();

  useEffect(() => {
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
  }, []);

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

  const download = () => {
    // Mobile can't save into the gallery from a browser → prompt to open the app instead.
    if (isMobileDevice()) {
      onSave?.();
      return;
    }
    const url = media?.media_url;
    if (!url || dlPct !== null) return;
    const filename = (url.split("/").pop() || "video.mp4").split("?")[0];
    // Cache-bust so the download is a fresh CORS request, independent of the plainly-cached video.
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
      setDlPct(null);
      onToast?.(ok ? "Saved to your device ✓" : "Couldn't save the video");
    };
    xhr.onerror = () => {
      setDlPct(null);
      onToast?.("Couldn't save the video");
    };
    setDlPct(0);
    xhr.send();
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
            sx={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Share video"
          >
            <Icon icon="mdi:share-variant" width={19} height={19} color={ORANGE} />
          </Box>
        )}
        <Box
          onClick={download}
          sx={{
            position: "relative",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: dlPct === null ? "pointer" : "default",
            flexShrink: 0,
          }}
          aria-label="Download video"
        >
          {dlPct === null ? (
            <Icon icon="mdi:tray-arrow-down" width={20} height={20} color={ORANGE} />
          ) : (
            <>
              <CircularProgress
                variant="determinate"
                value={dlPct}
                size={28}
                thickness={4}
                sx={{ color: ORANGE }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: tokens.font.sans,
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: ORANGE,
                }}
              >
                {dlPct}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Video */}
      <Box
        ref={videoWrapRef}
        sx={{ position: "relative", flex: 1, mx: "12px", mb: "12px", borderRadius: "16px", overflow: "hidden", background: "#000" }}
      >
        {/* Blurred backdrop (same poster) fills the letterbox behind the video — like iOS */}
        {media?.thumb_url && (
          <Box
            component="img"
            src={media.thumb_url}
            alt=""
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scale(1.15)",
              filter: "blur(24px) brightness(0.75)",
              pointerEvents: "none",
              zIndex: 0,
            }}
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

        {/* Centre play badge (paused) */}
        {!playing && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <Icon icon="mdi:play-circle" width={70} height={70} color="rgba(255,255,255,0.92)" />
          </Box>
        )}

        {/* Mute */}
        <Box
          onClick={onToggleMute}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
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
          {caption && (
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
                  maxHeight: expanded ? "38%" : "none",
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
          )}
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
      </Box>
    </Box>
  );
};

interface VideoReelProps {
  posts: GalleryPost[];
  accent: string;
  onToast?: (message: string) => void;
  onSave?: () => void;
  onSharePost?: (postId: number) => void;
  onRefresh?: () => Promise<unknown> | void;
}

const VideoReel: React.FC<VideoReelProps> = ({ posts, onToast, onSave, onSharePost, onRefresh }) => {
  // Default to sound on. The user reached this page by tapping a gallery tile (a user gesture
  // in the same SPA document), so autoplay with audio is permitted.
  const [muted, setMuted] = useState(false);
  const clips = posts.filter((p) => p.media?.[0]?.media_type === "video");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(scrollRef, onRefresh ?? (() => {}));

  return (
    <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <PullSpinner pull={pull} refreshing={refreshing} />
      <Box
        ref={scrollRef}
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
        {clips.map((p) => (
          <Box
            key={p.id}
            sx={{
              height: "94%",
              scrollSnapAlign: "start",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: "14px",
            }}
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
      </Box>
    </Box>
  );
};

export default VideoReel;
