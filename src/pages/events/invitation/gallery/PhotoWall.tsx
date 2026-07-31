import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import type { GalleryPost } from "../../../../models/responseModels/galleries";
import { tokens } from "../tokens";

// A responsive photo grid for a Cover / Photo gallery, with a click-to-open lightbox
// (arrow / swipe / keyboard navigation). Flattens every image across all posts.

interface Slide {
  url: string;
  caption: string;
  uploader: string;
}

interface PhotoWallProps {
  posts: GalleryPost[];
  accent: string;
}

const PhotoWall: React.FC<PhotoWallProps> = ({ posts, accent }) => {
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    posts.forEach((p) => {
      (p.media ?? [])
        .filter((m) => m.media_type !== "video")
        .forEach((m) => {
          out.push({
            url: m.thumb_url || m.media_url,
            caption: (p.caption ?? "").trim(),
            uploader: p.uploader_name ?? "",
          });
        });
    });
    return out;
  }, [posts]);

  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + slides.length) % slides.length)),
    [slides.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % slides.length)),
    [slides.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, prev, next]);

  if (slides.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center", color: tokens.color.inkMuted, fontFamily: tokens.font.sans }}>
        No photos yet.
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 1,
          p: { xs: 1.5, md: 3 },
          overflowY: "auto",
          height: "100%",
        }}
      >
        {slides.map((s, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              position: "relative",
              paddingTop: "100%",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              background: "#111",
            }}
          >
            <Box
              component="img"
              src={s.url}
              alt=""
              loading="lazy"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 300ms ease",
                "&:hover": { transform: "scale(1.04)" },
              }}
            />
          </Box>
        ))}
      </Box>

      {index !== null && (
        <Box
          onClick={close}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            onClick={close}
            sx={{ position: "absolute", top: 16, right: 16, cursor: "pointer", p: 1 }}
          >
            <Icon icon="mdi:close" width={30} height={30} color="#fff" />
          </Box>

          <Box
            onClick={(e) => { e.stopPropagation(); prev(); }}
            sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", cursor: "pointer", p: 1 }}
          >
            <Icon icon="mdi:chevron-left" width={40} height={40} color="#fff" />
          </Box>
          <Box
            onClick={(e) => { e.stopPropagation(); next(); }}
            sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", cursor: "pointer", p: 1 }}
          >
            <Icon icon="mdi:chevron-right" width={40} height={40} color="#fff" />
          </Box>

          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ maxWidth: "92vw", maxHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Box
              component="img"
              src={slides[index].url}
              alt=""
              sx={{ maxWidth: "92vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 2 }}
            />
            {slides[index].caption && (
              <Box
                sx={{
                  mt: 1.5,
                  color: "#fff",
                  fontFamily: tokens.font.sans,
                  fontSize: 14,
                  textAlign: "center",
                  maxWidth: 640,
                }}
              >
                {slides[index].caption}
              </Box>
            )}
            <Box sx={{ mt: 0.5, color: accent, fontFamily: tokens.font.mono, fontSize: 12 }}>
              {index + 1} / {slides.length}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default PhotoWall;
