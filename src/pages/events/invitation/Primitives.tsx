import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar, AvatarGroup, Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "./tokens";
import { withAlpha } from "./useColorExtraction";
import { useReveal, prefersReducedMotion } from "./useReveal";

const reduced = () => prefersReducedMotion();

// ---------- Reveal wrapper ----------

export function Reveal({
  children,
  delay = 0,
  y = 12,
  duration = 600,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>(0.12);
  const rm = reduced();
  const style: CSSProperties = rm
    ? { opacity: revealed ? 1 : 0, transition: "opacity 200ms ease" }
    : {
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms ${tokens.motion.settle} ${delay}ms, transform ${duration}ms ${tokens.motion.settle} ${delay}ms`,
        willChange: "opacity, transform",
      };
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

// ---------- Helpers ----------

function pickAccentWord(words: string[]): number {
  if (words.length === 0) return -1;
  if (words.length === 1) return 0;
  const skip = new Set([
    "the",
    "a",
    "an",
    "of",
    "for",
    "and",
    "in",
    "on",
    "at",
    "to",
    "by",
    "with",
  ]);
  for (let i = words.length - 1; i >= 0; i--) {
    if (!skip.has(words[i].toLowerCase())) return i;
  }
  return words.length - 1;
}

// ---------- Kicker (vertical) ----------

export function VerticalKicker({
  text,
  accent,
}: {
  text: string;
  accent: string;
}) {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        position: "absolute",
        left: 0,
        top: 80,
        bottom: 0,
        width: 24,
      }}
    >
      <Box
        sx={{
          width: "1px",
          height: 36,
          background: accent,
        }}
      />
      <Box
        sx={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontFamily: tokens.font.sans,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: tokens.color.inkSecondary,
        }}
      >
        {text}
      </Box>
    </Box>
  );
}

// ---------- Monogram ----------

export function Monogram({ name }: { name?: string }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
  return (
    <Box
      sx={{
        fontFamily: tokens.font.serif,
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: "0.08em",
        color: tokens.color.inkSecondary,
        userSelect: "none",
      }}
    >
      {initials || "GO"}
    </Box>
  );
}

// ---------- Host line ----------

export function HostLine({
  name,
  avatar,
}: {
  name?: string;
  avatar?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        color: tokens.color.inkSecondary,
        fontFamily: tokens.font.sans,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      <Avatar
        src={avatar}
        sx={{
          width: 28,
          height: 28,
          border: `1px solid ${tokens.color.line}`,
        }}
      />
      <Box component="span">
        <Box
          component="span"
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: tokens.color.inkMuted,
            mr: 1,
          }}
        >
          Organized by
        </Box>
        <Box
          component="span"
          sx={{ color: tokens.color.inkPrimary, fontWeight: 600 }}
        >
          {name || "Your host"}
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Organizer credit (inline, prominent) ----------

export function OrganizerCredit({
  name,
  avatar,
  accent,
}: {
  name?: string;
  avatar?: string;
  accent: string;
}) {
  if (!name) return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        pt: 1,
        pb: 1.5,
        borderTop: `1px solid ${tokens.color.line}`,
        borderBottom: `1px solid ${tokens.color.line}`,
      }}
    >
      <Avatar
        src={avatar}
        sx={{
          width: 56,
          height: 56,
          border: `2px solid ${tokens.color.raised}`,
          boxShadow: `0 0 0 1px ${withAlpha(accent, 0.3)}, ${tokens.shadow.soft}`,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: accent,
            mb: 0.25,
          }}
        >
          Organized by
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: { xs: 22, md: 26 },
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: tokens.color.inkPrimary,
          }}
        >
          {name}
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Event headline ----------

export function EventHeadline({
  title,
  category,
  accent,
}: {
  title?: string;
  category?: string;
  accent: string;
}) {
  const words = (title || "Untitled event").trim().split(/\s+/);
  const accentIndex = pickAccentWord(words);
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          fontFamily: tokens.font.serif,
          fontWeight: 700,
          fontSize: { xs: 40, sm: 64, md: 96 },
          lineHeight: 0.98,
          letterSpacing: "-0.035em",
          color: tokens.color.inkPrimary,
          m: 0,
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        {words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && " "}
            {i === accentIndex ? (
              <Box
                component="span"
                sx={{
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: accent,
                }}
              >
                {w}
              </Box>
            ) : (
              w
            )}
          </React.Fragment>
        ))}
      </Typography>
      {category && (
        <Box
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: `${tokens.radius.sm}px`,
            background: withAlpha(accent, 0.12),
            color: accent,
            fontFamily: tokens.font.sans,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
            }}
          />
          {category}
        </Box>
      )}
    </Box>
  );
}

// ---------- Poster card ----------

export function PosterCard({
  src,
  title,
  accent,
  fallbackGradientFrom,
  fallbackGradientTo,
  fillHeight = false,
}: {
  src?: string;
  title?: string;
  accent: string;
  fallbackGradientFrom?: string;
  fallbackGradientTo?: string;
  fillHeight?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced()) return;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 8, ry: x * 10 });
  };
  const onLeave = () => {
    setHover(false);
    setTilt({ rx: 0, ry: 0 });
  };

  const hasImage = !!src;

  return (
    <Box
      sx={{
        perspective: "1400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
        height: fillHeight ? "100%" : "auto",
      }}
    >
      <Box
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: fillHeight ? { xs: 480, md: "none" } : 420,
          height: fillHeight ? { xs: "auto", md: "100%" } : "auto",
          aspectRatio: fillHeight ? { xs: "4 / 5", md: "auto" } : "4 / 5",
          minHeight: fillHeight ? { xs: "auto", md: 480 } : "auto",
          mx: fillHeight ? { xs: "auto", md: 0 } : "auto",
          borderRadius: `${tokens.radius.lg}px`,
          overflow: "hidden",
          background: hasImage
            ? tokens.color.raised
            : `linear-gradient(135deg, ${fallbackGradientFrom || accent} 0%, ${
                fallbackGradientTo || withAlpha(accent, 0.4)
              } 100%)`,
          boxShadow: tokens.shadow.poster,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotate(0deg)`,
          transition: `transform ${
            hover ? "100ms" : "600ms"
          } ${tokens.motion.settle}`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {hasImage ? (
          <img
            src={src}
            alt={title || "Event poster"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.font.serif,
                fontWeight: 500,
                fontSize: { xs: 32, sm: 40 },
                lineHeight: 1.05,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 24px rgba(0,0,0,0.2)",
              }}
            >
              {title || "An evening to remember"}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)",
            opacity: hover ? 1 : 0.6,
            transition: `opacity 400ms ${tokens.motion.settle}`,
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}

// ---------- Date stamp ----------

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function parseDate(date?: string): Date | null {
  if (!date) return null;
  // Parse "yyyy-MM-dd" as a calendar date anchored at noon UTC, so local
  // getDay/getDate/getMonth in DateBlock never drift by a day in negative
  // timezones (e.g. "2026-05-21" was showing as May 20 in the Americas).
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (y && mo && d) return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  }
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "";
  const fmt = (t: string) => {
    const [hh, mm] = t.split(":");
    if (hh === undefined) return t;
    let h = parseInt(hh, 10);
    if (Number.isNaN(h)) return t;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mm || "00"} ${ampm}`;
  };
  return `${fmt(startTime)} — ${fmt(endTime)}`;
}

function DateBlock({
  date,
  accent,
  muted = false,
}: {
  date: Date;
  accent: string;
  muted?: boolean;
}) {
  const day = DAYS[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS[date.getMonth()];
  return (
    <Box
      sx={{
        width: { xs: 76, md: 100 },
        textAlign: "center",
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          fontSize: 12,
          letterSpacing: "0.16em",
          fontWeight: 700,
          color: muted ? tokens.color.inkSecondary : accent,
        }}
      >
        {day}
      </Box>
      <Box
        sx={{
          fontFamily: tokens.font.serif,
          fontSize: { xs: 36, md: 48 },
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          mt: 0.5,
        }}
      >
        {dayNum}
      </Box>
      <Box
        sx={{
          fontSize: 12,
          letterSpacing: "0.16em",
          fontWeight: 700,
          color: tokens.color.inkSecondary,
          mt: 0.5,
        }}
      >
        {month}
      </Box>
    </Box>
  );
}

export function DateStamp({
  startDate,
  startTime,
  endDate,
  endTime,
  accent,
}: {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  accent: string;
}) {
  const start = parseDate(startDate);
  if (!start) return null;
  const end = parseDate(endDate);
  const isMultiDay =
    !!end &&
    !!endDate &&
    !!startDate &&
    endDate !== startDate &&
    end.toDateString() !== start.toDateString();
  const time = formatTimeRange(startTime, endTime);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "stretch" },
        gap: 0,
        width: "100%",
        background: tokens.color.raised,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: `${tokens.radius.md}px`,
        boxShadow: tokens.shadow.soft,
        padding: { xs: "18px 16px", md: "24px 24px" },
        position: "relative",
        transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: tokens.shadow.lift,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          gap: { xs: 1.5, md: 1.5 },
          flexShrink: 0,
        }}
      >
        <DateBlock date={start} accent={accent} />
        {isMultiDay && end && (
          <>
            <Box
              sx={{
                display: "inline-flex",
                color: tokens.color.inkMuted,
                px: { xs: 0.5, md: 0.5 },
              }}
            >
              <Icon icon="ph:arrow-right-bold" width={18} />
            </Box>
            <DateBlock date={end} accent={accent} muted />
          </>
        )}
      </Box>

      {/* perforated divider — horizontal on mobile, vertical on tablet+ */}
      <Box
        aria-hidden
        sx={{
          display: { xs: "block", sm: "block" },
          alignSelf: "stretch",
          width: { xs: "100%", sm: "1px" },
          height: { xs: "1px", sm: "auto" },
          my: { xs: 2, sm: 0 },
          mx: { xs: 0, sm: 3 },
          backgroundImage: {
            xs: `radial-gradient(circle, ${tokens.color.line} 1px, transparent 1.5px)`,
            sm: `radial-gradient(circle, ${tokens.color.line} 1px, transparent 1.5px)`,
          },
          backgroundSize: { xs: "6px 1px", sm: "1px 6px" },
          backgroundRepeat: { xs: "repeat-x", sm: "repeat-y" },
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: { xs: "center", sm: "flex-start" },
          textAlign: { xs: "center", sm: "left" },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 11,
            letterSpacing: "0.18em",
            fontWeight: 700,
            color: tokens.color.inkSecondary,
            textTransform: "uppercase",
          }}
        >
          Doors
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: { xs: 22, md: 28 },
            fontWeight: 500,
            color: tokens.color.inkPrimary,
            mt: 0.75,
            letterSpacing: "-0.015em",
            lineHeight: 1.1,
          }}
        >
          {time || "Time TBA"}
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Location line ----------

export function LocationLine({
  address,
  onDirections,
  accent,
}: {
  address?: string;
  onDirections: () => void;
  accent: string;
}) {
  if (!address) return null;
  return (
    <Box
      onClick={onDirections}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDirections();
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        cursor: "pointer",
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        fontSize: 15,
        fontWeight: 500,
        py: 0.5,
        outline: "none",
        "&:hover .arrow, &:focus-visible .arrow": {
          transform: "translateX(4px)",
          opacity: 1,
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 2px ${withAlpha(accent, 0.6)}`,
          borderRadius: `${tokens.radius.sm}px`,
        },
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexShrink: 0,
          mt: "2px",
        }}
      >
        <Icon icon="ph:map-pin-fill" width={18} color={accent} />
      </Box>
      <Box
        component="span"
        sx={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}
      >
        {address}
      </Box>
      <Box
        className="arrow"
        sx={{
          display: "inline-flex",
          flexShrink: 0,
          mt: "3px",
          opacity: 0.5,
          transition: `transform 200ms ${tokens.motion.swift}, opacity 200ms ${tokens.motion.swift}`,
        }}
      >
        <Icon icon="ph:arrow-right" width={16} />
      </Box>
    </Box>
  );
}

// ---------- Attendee strip ----------

function CountUp({ to }: { to: number }) {
  const { ref, revealed } = useReveal<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!revealed) return;
    if (reduced() || to <= 0) {
      setN(to);
      return;
    }
    const start = performance.now();
    const dur = Math.min(800, 200 + to * 30);
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealed, to]);
  return <span ref={ref}>{n}</span>;
}

export function AttendeeStrip({
  count,
  avatars,
  accent,
}: {
  count: number;
  avatars: { user_image: string; user_name?: string }[];
  accent: string;
}) {
  if (count === 0) {
    return (
      <Box
        sx={{
          fontFamily: tokens.font.sans,
          fontSize: 14,
          fontWeight: 500,
          color: tokens.color.inkSecondary,
          letterSpacing: "0.01em",
        }}
      >
        Be the first to RSVP.
      </Box>
    );
  }
  const firstNames = avatars
    .map((a) => (a.user_name || "").trim().split(/\s+/)[0])
    .filter((n) => n && n.length > 1)
    .slice(0, 8);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <AvatarGroup
          max={5}
          spacing="small"
          sx={{
            "& .MuiAvatar-root": {
              width: 38,
              height: 38,
              fontSize: 12,
              borderColor: tokens.color.paper,
              borderWidth: 2,
            },
          }}
        >
          {avatars.slice(0, 5).map((a, i) => (
            <Avatar key={i} src={a.user_image} />
          ))}
        </AvatarGroup>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 15,
            fontWeight: 500,
            color: tokens.color.inkPrimary,
            letterSpacing: "0.01em",
          }}
        >
          <Box
            component="span"
            sx={{ fontWeight: 800, color: accent, fontSize: 17 }}
          >
            <CountUp to={count} />
          </Box>{" "}
          {count === 1 ? "person is" : "people are"} going
        </Box>
      </Box>
      {firstNames.length >= 2 && (
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontStyle: "italic",
            fontSize: 14,
            color: tokens.color.inkSecondary,
            letterSpacing: "0.005em",
            mt: 0.25,
          }}
        >
          {firstNames.slice(0, 3).join(", ")}
          {count > firstNames.slice(0, 3).length
            ? ` and ${count - 3} other${count - 3 === 1 ? "" : "s"}`
            : ""}
        </Box>
      )}
    </Box>
  );
}

// ---------- RSVP Button ----------

export function RsvpButton({
  label = "RSVP",
  onClick,
  accent,
  size = "lg",
  variant = "filled",
  icon,
}: {
  label?: string;
  onClick: () => void;
  accent: string;
  size?: "md" | "lg";
  variant?: "filled" | "outlined" | "dark";
  icon?: string;
}) {
  const DARK = "#14131A";
  const isOutlined = variant === "outlined";
  const isDark = variant === "dark";

  const background = isOutlined
    ? "transparent"
    : isDark
      ? `linear-gradient(180deg, #2A2730 0%, ${DARK} 60%, #050407 100%)`
      : `linear-gradient(180deg, ${accent} 0%, ${accent} 60%, ${withAlpha(
          "#000000",
          0.15
        )} 100%), ${accent}`;

  const color = isOutlined ? accent : "#FFFFFF";

  const border = isOutlined ? `2px solid ${accent}` : "none";

  const baseShadow = isOutlined
    ? "none"
    : isDark
      ? `0 1px 0 ${withAlpha(
          "#FFFFFF",
          0.12
        )} inset, 0 -2px 0 ${withAlpha(
          "#000000",
          0.4
        )} inset, 0 10px 28px rgba(20,19,26,0.35)`
      : `0 1px 0 ${withAlpha(
          "#FFFFFF",
          0.25
        )} inset, 0 -2px 0 ${withAlpha(
          "#000000",
          0.12
        )} inset, 0 8px 24px ${withAlpha(accent, 0.35)}`;

  const hoverShadow = isOutlined
    ? `0 8px 20px ${withAlpha(accent, 0.18)}`
    : isDark
      ? `0 1px 0 ${withAlpha(
          "#FFFFFF",
          0.16
        )} inset, 0 -2px 0 ${withAlpha(
          "#000000",
          0.45
        )} inset, 0 18px 40px rgba(20,19,26,0.5)`
      : `0 1px 0 ${withAlpha(
          "#FFFFFF",
          0.3
        )} inset, 0 -2px 0 ${withAlpha(
          "#000000",
          0.12
        )} inset, 0 14px 32px ${withAlpha(accent, 0.45)}`;

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        appearance: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        background,
        backgroundBlendMode: !isOutlined && !isDark ? "overlay" : "normal",
        border,
        color,
        fontFamily: tokens.font.sans,
        fontWeight: 700,
        fontSize: size === "lg" ? 17 : 14,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        px: size === "lg" ? 4.5 : 2.5,
        py: size === "lg" ? 2.25 : 1.25,
        borderRadius: `${tokens.radius.xl}px`,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        whiteSpace: "nowrap",
        boxShadow: baseShadow,
        transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}, background 200ms ${tokens.motion.swift}, color 200ms ${tokens.motion.swift}`,
        "& .chev": {
          display: "inline-flex",
          transition: `transform 280ms ${tokens.motion.swift}`,
        },
        "&:hover": isOutlined
          ? {
              transform: "translateY(-2px)",
              background: withAlpha(accent, 0.08),
              boxShadow: hoverShadow,
            }
          : {
              transform: "translateY(-2px)",
              filter: "brightness(1.04) saturate(1.08)",
              boxShadow: hoverShadow,
            },
        "&:hover .chev": {
          transform: "translateX(4px)",
        },
        "&:active": {
          transform: "translateY(1px) scale(0.985)",
          boxShadow: isOutlined
            ? "none"
            : isDark
              ? `0 1px 0 ${withAlpha("#FFFFFF", 0.08)} inset, 0 -1px 0 ${withAlpha("#000000", 0.35)} inset, 0 4px 12px rgba(20,19,26,0.3)`
              : `0 1px 0 ${withAlpha("#FFFFFF", 0.18)} inset, 0 -1px 0 ${withAlpha("#000000", 0.16)} inset, 0 3px 10px ${withAlpha(accent, 0.32)}`,
          transition: `transform 80ms ${tokens.motion.swift}, box-shadow 80ms ${tokens.motion.swift}`,
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 3px ${withAlpha(accent, 0.4)}, ${baseShadow}`,
        },
      }}
    >
      {icon && (
        <Box component="span" sx={{ display: "inline-flex" }}>
          <Icon icon={icon} width={size === "lg" ? 20 : 16} />
        </Box>
      )}
      <span>{label}</span>
      <Box component="span" className="chev">
        <Icon icon="ph:arrow-right-bold" width={size === "lg" ? 20 : 16} />
      </Box>
    </Box>
  );
}

// ---------- Section label ----------

export function SectionLabel({
  numeral,
  title,
  accent,
}: {
  numeral?: string;
  title: string;
  accent: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        gap: 2,
        mb: 5,
        pb: 2,
        borderBottom: `1px solid ${tokens.color.line}`,
      }}
    >
      {numeral && (
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: 22,
            fontWeight: 500,
            color: accent,
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          {numeral}
        </Box>
      )}
      <Box
        sx={{
          fontFamily: tokens.font.serif,
          fontSize: { xs: 22, md: 28 },
          fontWeight: 500,
          fontStyle: "italic",
          color: tokens.color.inkPrimary,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        {title}
      </Box>
    </Box>
  );
}

// ---------- Event URL link ----------

export function EventUrlLink({
  url,
  accent,
}: {
  url?: string;
  accent: string;
}) {
  if (!url || url === "https://" || url.trim() === "") return null;
  let display = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (display.length > 40) display = display.slice(0, 37) + "…";
  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        maxWidth: "100%",
        px: 1.5,
        py: 1,
        borderRadius: `${tokens.radius.md}px`,
        border: `1px solid ${withAlpha(accent, 0.25)}`,
        background: withAlpha(accent, 0.06),
        color: accent,
        fontFamily: tokens.font.sans,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.005em",
        textDecoration: "none",
        transition: `transform 200ms ${tokens.motion.swift}, background 200ms ${tokens.motion.swift}, border-color 200ms ${tokens.motion.swift}`,
        "&:hover, &:focus-visible": {
          transform: "translateY(-1px)",
          background: withAlpha(accent, 0.12),
          borderColor: withAlpha(accent, 0.45),
        },
      }}
    >
      <Icon icon="ph:link-bold" width={14} />
      <Box
        component="span"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {display}
      </Box>
      <Icon icon="ph:arrow-up-right" width={12} />
    </Box>
  );
}

// ---------- About section ----------

export function AboutSection({
  description,
  accent,
}: {
  description?: string;
  accent: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (description?.length || 0) > 320;
  const display = !expanded && isLong
    ? description!.slice(0, 320).trimEnd() + "…"
    : description;

  if (!description) return null;

  return (
    <Box sx={{ pl: { xs: 0, md: 6 } }}>
      <Box
        sx={{
          maxWidth: tokens.page.readingWidth,
          color: tokens.color.inkPrimary,
          fontFamily: tokens.font.sans,
          fontSize: 17,
          lineHeight: 1.7,
          letterSpacing: "0.005em",
          whiteSpace: "pre-line",
          textAlign: "left",
          "& .dropcap": {
            float: "left",
            fontFamily: tokens.font.serif,
            fontSize: 56,
            lineHeight: 0.9,
            fontWeight: 500,
            paddingRight: "10px",
            paddingTop: "6px",
            color: accent,
          },
        }}
      >
        {display && display.length > 0 && (() => {
          const chars = Array.from(display);
          const first = chars[0];
          const rest = chars.slice(1).join("");
          const isLetter = /^\p{L}$/u.test(first);
          return isLetter ? (
            <>
              <span className="dropcap">{first}</span>
              {rest}
            </>
          ) : (
            <>{display}</>
          );
        })()}
      </Box>
      {isLong && (
        <Box sx={{ maxWidth: tokens.page.readingWidth, mt: 2 }}>
          <Box
            component="button"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              appearance: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: accent,
              fontFamily: tokens.font.sans,
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {expanded ? "Show less" : "Read more"}
            <Icon
              icon="ph:caret-down"
              width={14}
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 200ms ease",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ---------- Guest grid ----------

export function GuestGrid({
  count,
  avatars,
  accent,
  onShowMore,
}: {
  count: number;
  avatars: { user_image: string; user_name?: string }[];
  accent: string;
  onShowMore: () => void;
}) {
  if (count === 0) {
    return (
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: `${tokens.radius.xl}px`,
          background: `linear-gradient(135deg, ${withAlpha(
            accent,
            0.06
          )} 0%, ${withAlpha(accent, 0.02)} 100%)`,
          border: `1px solid ${withAlpha(accent, 0.18)}`,
          p: { xs: 4, md: 6 },
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontStyle: "italic",
            fontSize: { xs: 22, md: 28 },
            fontWeight: 500,
            color: tokens.color.inkPrimary,
            mb: 1,
          }}
        >
          Be the first in the room.
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 14,
            color: tokens.color.inkSecondary,
          }}
        >
          No one has RSVP'd yet. Your name belongs at the top of this list.
        </Box>
      </Box>
    );
  }

  const featured = avatars.slice(0, 4);
  const rest = avatars.slice(4, 16);
  const remainder = count - featured.length - rest.length;

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: `${tokens.radius.xl}px`,
        background: `linear-gradient(135deg, ${withAlpha(
          accent,
          0.08
        )} 0%, ${withAlpha(accent, 0.02)} 60%, ${withAlpha(accent, 0.1)} 100%)`,
        border: `1px solid ${withAlpha(accent, 0.18)}`,
        p: { xs: 3, md: 5 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -70,
          left: -50,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(
            accent,
            0.2
          )} 0%, ${withAlpha(accent, 0)} 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -80,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(
            accent,
            0.16
          )} 0%, ${withAlpha(accent, 0)} 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "flex-end" },
          gap: { xs: 2, sm: 4 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              mb: 0.5,
            }}
          >
            Confirmed
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontSize: { xs: 56, sm: 72, md: 96 },
                fontWeight: 600,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                color: tokens.color.inkPrimary,
              }}
            >
              {count}
            </Box>
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontStyle: "italic",
                fontSize: { xs: 18, sm: 22, md: 28 },
                fontWeight: 500,
                color: tokens.color.inkPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {count === 1 ? "person going" : "people going"}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            fontFamily: tokens.font.serif,
            fontStyle: "italic",
            fontSize: { xs: 15, md: 17 },
            color: tokens.color.inkSecondary,
            lineHeight: 1.4,
            maxWidth: 360,
            pb: { xs: 0, sm: 1.5 },
          }}
        >
          A room of strangers about to become a story you'll tell later.
        </Box>
      </Box>

      {/* Featured row */}
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
          },
          gap: { xs: 1.5, md: 2 },
          mb: rest.length > 0 ? { xs: 2.5, md: 3 } : 0,
        }}
      >
        {featured.map((g, i) => {
          const name = (g.user_name || "").trim();
          const firstName = name.split(/\s+/)[0] || name;
          return (
            <Box
              key={`f-${i}`}
              onClick={onShowMore}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onShowMore();
              }}
              sx={{
                cursor: "pointer",
                outline: "none",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.25,
                py: 2.5,
                px: 1.5,
                borderRadius: `${tokens.radius.lg}px`,
                background: tokens.color.raised,
                border: `1px solid ${tokens.color.line}`,
                transition: `transform 220ms ${tokens.motion.swift}, box-shadow 220ms ${tokens.motion.swift}, border-color 220ms ${tokens.motion.swift}`,
                "& .feat-avatar": {
                  transition: `transform 240ms ${tokens.motion.swift}, box-shadow 240ms ${tokens.motion.swift}`,
                },
                "&:hover, &:focus-visible": {
                  transform: "translateY(-3px)",
                  borderColor: withAlpha(accent, 0.4),
                  boxShadow: `0 10px 28px ${withAlpha(accent, 0.16)}`,
                },
                "&:hover .feat-avatar, &:focus-visible .feat-avatar": {
                  transform: "scale(1.05)",
                  boxShadow: `0 0 0 3px ${withAlpha(accent, 0.5)}`,
                },
              }}
            >
              <Avatar
                className="feat-avatar"
                src={g.user_image}
                sx={{
                  width: { xs: 64, md: 76 },
                  height: { xs: 64, md: 76 },
                  border: `2px solid ${tokens.color.raised}`,
                  boxShadow: `0 0 0 1px ${tokens.color.line}`,
                }}
              />
              <Box
                sx={{
                  fontFamily: tokens.font.serif,
                  fontSize: { xs: 14, md: 16 },
                  fontWeight: 500,
                  color: tokens.color.inkPrimary,
                  textAlign: "center",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.2,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {firstName || "Guest"}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Secondary grid */}
      {rest.length > 0 && (
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(5, 1fr)",
              sm: "repeat(8, 1fr)",
              md: "repeat(10, 1fr)",
            },
            gap: { xs: 1, sm: 1.25 },
            justifyItems: "center",
          }}
        >
          {rest.map((g, i) => {
            const name = (g.user_name || "").trim();
            return (
              <Box
                key={`r-${i}`}
                onClick={onShowMore}
                sx={{
                  position: "relative",
                  width: 44,
                  height: 44,
                  cursor: "pointer",
                  "&:hover .small-name, &:focus-visible .small-name": {
                    opacity: 1,
                    transform: "translate(-50%, -8px)",
                  },
                  "&:hover .small-avatar": {
                    transform: "translateY(-2px) scale(1.06)",
                    boxShadow: `0 0 0 2px ${withAlpha(accent, 0.5)}`,
                  },
                }}
              >
                <Avatar
                  className="small-avatar"
                  src={g.user_image}
                  sx={{
                    width: 44,
                    height: 44,
                    border: `2px solid ${tokens.color.raised}`,
                    boxShadow: `0 0 0 1px ${tokens.color.line}`,
                    transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
                  }}
                />
                {name && (
                  <Box
                    className="small-name"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      bottom: "100%",
                      transform: "translate(-50%, 0)",
                      px: 1.25,
                      py: 0.5,
                      borderRadius: `${tokens.radius.sm}px`,
                      background: tokens.color.inkPrimary,
                      color: "#FFFFFF",
                      fontFamily: tokens.font.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      opacity: 0,
                      pointerEvents: "none",
                      transition: `opacity 180ms ${tokens.motion.swift}, transform 220ms ${tokens.motion.swift}`,
                      zIndex: 3,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: `4px solid ${tokens.color.inkPrimary}`,
                      },
                    }}
                  >
                    {name}
                  </Box>
                )}
              </Box>
            );
          })}
          {remainder > 0 && (
            <Box
              onClick={onShowMore}
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: accent,
                color: "#FFFFFF",
                fontFamily: tokens.font.sans,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                border: `2px solid ${tokens.color.raised}`,
                boxShadow: `0 0 0 1px ${withAlpha(accent, 0.5)}`,
                transition: `transform 200ms ${tokens.motion.swift}`,
                "&:hover": {
                  transform: "translateY(-2px) scale(1.06)",
                  filter: "brightness(1.05)",
                },
              }}
            >
              +{remainder}
            </Box>
          )}
        </Box>
      )}

      {/* Footer CTA */}
      <Box
        sx={{
          position: "relative",
          mt: { xs: 3, md: 4 },
          pt: { xs: 2.5, md: 3 },
          borderTop: `1px solid ${withAlpha(accent, 0.18)}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontStyle: "italic",
            fontSize: 14,
            color: tokens.color.inkSecondary,
          }}
        >
          Full guest list, photos &amp; intros live in the app.
        </Box>
        <Box
          onClick={onShowMore}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onShowMore();
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            cursor: "pointer",
            outline: "none",
            borderRadius: `${tokens.radius.xl}px`,
            background: tokens.color.raised,
            border: `1px solid ${withAlpha(accent, 0.4)}`,
            color: accent,
            fontFamily: tokens.font.sans,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            transition: `transform 200ms ${tokens.motion.swift}, background 200ms ${tokens.motion.swift}, color 200ms ${tokens.motion.swift}`,
            "& .arrow": {
              transition: `transform 220ms ${tokens.motion.swift}`,
            },
            "&:hover, &:focus-visible": {
              transform: "translateY(-1px)",
              background: accent,
              color: "#FFFFFF",
            },
            "&:hover .arrow, &:focus-visible .arrow": {
              transform: "translateX(3px)",
            },
          }}
        >
          See everyone
          <Box component="span" className="arrow" sx={{ display: "inline-flex" }}>
            <Icon icon="ph:arrow-right-bold" width={14} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Unlock-more list ----------

export function UnlockMore({
  accent,
  onOpen,
}: {
  accent: string;
  onOpen: (msg: string) => void;
}) {
  const items = [
    {
      icon: "ph:chat-circle-text-fill",
      label: "Chat with the host",
      desc: "Ask questions, plan rides, share a vibe check before you go.",
      msg: "Open the app to chat with the host.",
    },
    {
      icon: "ph:users-three-fill",
      label: "See everyone who's going",
      desc: "Full guest list with photos. Find your people before you arrive.",
      msg: "Open the App to view complete guest list.",
    },
    {
      icon: "ph:calendar-heart-fill",
      label: "Save & get reminders",
      desc: "We'll nudge you the day-of so you don't miss a beat.",
      msg: "Open the app to save this event.",
    },
  ];
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: `${tokens.radius.xl}px`,
        background: `linear-gradient(135deg, ${withAlpha(
          accent,
          0.08
        )} 0%, ${withAlpha(accent, 0.02)} 60%, ${withAlpha(accent, 0.12)} 100%)`,
        border: `1px solid ${withAlpha(accent, 0.18)}`,
        p: { xs: 3, md: 5 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(
            accent,
            0.22
          )} 0%, ${withAlpha(accent, 0)} 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -80,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(
            accent,
            0.14
          )} 0%, ${withAlpha(accent, 0)} 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", maxWidth: 760 }}>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: accent,
            mb: 1.5,
          }}
        >
          The best parts live inside
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: { xs: 28, md: 40 },
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: tokens.color.inkPrimary,
            maxWidth: 560,
          }}
        >
          The web page got you here.{" "}
          <Box
            component="span"
            sx={{ fontStyle: "italic", color: accent, fontWeight: 500 }}
          >
            The app gets you in.
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: { xs: 1.5, md: 2 },
            mt: { xs: 4, md: 5 },
          }}
        >
          {items.map((it, i) => (
            <Box
              key={i}
              onClick={() => onOpen(it.msg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpen(it.msg);
              }}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                p: { xs: 2.5, md: 3 },
                borderRadius: `${tokens.radius.lg}px`,
                background: tokens.color.raised,
                border: `1px solid ${tokens.color.line}`,
                cursor: "pointer",
                outline: "none",
                overflow: "hidden",
                transition: `transform 250ms ${tokens.motion.swift}, box-shadow 250ms ${tokens.motion.swift}, border-color 250ms ${tokens.motion.swift}`,
                "& .arrow": {
                  transition: `transform 250ms ${tokens.motion.swift}, opacity 250ms ${tokens.motion.swift}`,
                  opacity: 0.5,
                },
                "&:hover, &:focus-visible": {
                  transform: "translateY(-4px)",
                  borderColor: withAlpha(accent, 0.5),
                  boxShadow: `0 12px 32px ${withAlpha(accent, 0.18)}`,
                },
                "&:hover .arrow, &:focus-visible .arrow": {
                  transform: "translateX(4px)",
                  opacity: 1,
                },
                "&:hover .icon, &:focus-visible .icon": {
                  background: accent,
                  color: "#FFFFFF",
                  transform: "scale(1.06)",
                },
              }}
            >
              <Box
                className="icon"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: `${tokens.radius.md}px`,
                  background: withAlpha(accent, 0.14),
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: `transform 250ms ${tokens.motion.swift}, background 250ms ${tokens.motion.swift}, color 250ms ${tokens.motion.swift}`,
                }}
              >
                <Icon icon={it.icon} width={22} />
              </Box>
              <Box
                sx={{
                  fontFamily: tokens.font.serif,
                  fontSize: 19,
                  fontWeight: 500,
                  color: tokens.color.inkPrimary,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {it.label}
              </Box>
              <Box
                sx={{
                  fontFamily: tokens.font.sans,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: tokens.color.inkSecondary,
                  flex: 1,
                }}
              >
                {it.desc}
              </Box>
              <Box
                className="arrow"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontFamily: tokens.font.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: accent,
                  mt: 0.5,
                }}
              >
                Open in app
                <Icon icon="ph:arrow-right-bold" width={14} />
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2.5,
          }}
        >
          <RsvpButton
            label="Get the app"
            accent={accent}
            onClick={() => onOpen("Open the GoSayHELLO app to continue.")}
          />
          <Box
            sx={{
              fontFamily: tokens.font.serif,
              fontStyle: "italic",
              fontSize: 14,
              color: tokens.color.inkSecondary,
            }}
          >
            Free on iOS &amp; Android · Takes 30 seconds.
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
