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
        <Box component="span" sx={{ color: tokens.color.inkPrimary, fontWeight: 600 }}>
          {name || "Your host"}
        </Box>{" "}
        invites you to
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
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          fontFamily: tokens.font.serif,
          fontWeight: 500,
          fontSize: { xs: 44, sm: 56, md: 72 },
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          color: tokens.color.inkPrimary,
          m: 0,
        }}
      >
        {title || "Untitled event"}
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
}: {
  src?: string;
  title?: string;
  accent: string;
  fallbackGradientFrom?: string;
  fallbackGradientTo?: string;
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
        alignItems: "center",
        width: "100%",
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
          maxWidth: 420,
          aspectRatio: "4 / 5",
          borderRadius: `${tokens.radius.lg}px`,
          overflow: "hidden",
          background: hasImage
            ? tokens.color.raised
            : `linear-gradient(135deg, ${fallbackGradientFrom || accent} 0%, ${
                fallbackGradientTo || withAlpha(accent, 0.4)
              } 100%)`,
          boxShadow: tokens.shadow.poster,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotate(${
            hover ? 0 : -2
          }deg)`,
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

export function DateStamp({
  startDate,
  startTime,
  endTime,
  accent,
}: {
  startDate?: string;
  startTime?: string;
  endTime?: string;
  accent: string;
}) {
  const date = parseDate(startDate);
  if (!date) return null;

  const day = DAYS[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS[date.getMonth()];
  const time = formatTimeRange(startTime, endTime);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        background: tokens.color.raised,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: `${tokens.radius.md}px`,
        boxShadow: tokens.shadow.soft,
        padding: "14px 18px 14px 14px",
        position: "relative",
        transform: "rotate(-1.2deg)",
        transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
        "&:hover": {
          transform: "rotate(-0.5deg) translateY(-2px)",
          boxShadow: tokens.shadow.lift,
        },
        // perforated edge
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 12,
          bottom: 12,
          width: 1,
          backgroundImage: `radial-gradient(circle, ${tokens.color.line} 1px, transparent 1.5px)`,
          backgroundSize: "1px 6px",
          backgroundRepeat: "repeat-y",
        },
        "&::before": { left: 76 },
      }}
    >
      <Box
        sx={{
          minWidth: 56,
          textAlign: "center",
          color: tokens.color.inkPrimary,
          fontFamily: tokens.font.sans,
        }}
      >
        <Box
          sx={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: accent,
          }}
        >
          {day}
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.serif,
            fontSize: 36,
            lineHeight: 1.05,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {dayNum}
        </Box>
        <Box
          sx={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: tokens.color.inkSecondary,
          }}
        >
          {month}
        </Box>
      </Box>
      <Box sx={{ pl: 2 }}>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: tokens.color.inkSecondary,
            textTransform: "uppercase",
          }}
        >
          Doors
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.sans,
            fontSize: 15,
            fontWeight: 600,
            color: tokens.color.inkPrimary,
            mt: 0.25,
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
        display: "inline-flex",
        alignItems: "center",
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
      <Icon icon="ph:map-pin-fill" width={18} color={accent} />
      <Box component="span">{address}</Box>
      <Box
        className="arrow"
        sx={{
          display: "inline-flex",
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
  avatars: { user_image: string }[];
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
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <AvatarGroup
        max={5}
        spacing="small"
        sx={{
          "& .MuiAvatar-root": {
            width: 36,
            height: 36,
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
          fontSize: 14,
          fontWeight: 500,
          color: tokens.color.inkPrimary,
          letterSpacing: "0.01em",
        }}
      >
        <Box component="span" sx={{ fontWeight: 700, color: accent }}>
          <CountUp to={count} />
        </Box>{" "}
        {count === 1 ? "person is" : "people are"} going
      </Box>
    </Box>
  );
}

// ---------- RSVP Button ----------

export function RsvpButton({
  label = "RSVP",
  onClick,
  accent,
  size = "lg",
}: {
  label?: string;
  onClick: () => void;
  accent: string;
  size?: "md" | "lg";
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        appearance: "none",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        background: accent,
        color: "#FFFFFF",
        fontFamily: tokens.font.sans,
        fontWeight: 600,
        fontSize: size === "lg" ? 16 : 14,
        letterSpacing: "0.01em",
        px: size === "lg" ? 3.5 : 2.5,
        py: size === "lg" ? 1.75 : 1.25,
        borderRadius: `${tokens.radius.lg}px`,
        boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
        transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}`,
        "&:hover": {
          transform: "translateY(-1px)",
          filter: "brightness(1.06)",
          boxShadow: `0 8px 24px ${withAlpha(accent, 0.35)}`,
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: `0 4px 12px ${withAlpha(accent, 0.25)}`,
        },
        "&:focus-visible": {
          outline: "none",
          boxShadow: `0 0 0 3px ${withAlpha(accent, 0.4)}, 0 8px 24px ${withAlpha(
            accent,
            0.35
          )}`,
        },
      }}
    >
      <span>{label}</span>
      <Icon icon="ph:arrow-right" width={size === "lg" ? 18 : 16} />
    </Box>
  );
}

// ---------- Section label ----------

export function SectionLabel({
  children,
  accent,
}: {
  children: ReactNode;
  accent: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        fontFamily: tokens.font.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        color: tokens.color.inkSecondary,
        textTransform: "uppercase",
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 1,
          background: accent,
          opacity: 0.6,
        }}
      />
      {children}
      <Box
        sx={{
          flex: 1,
          height: 1,
          background: tokens.color.line,
        }}
      />
    </Box>
  );
}

// ---------- About section ----------

export function AboutSection({
  description,
  eventUrl,
  accent,
}: {
  description?: string;
  eventUrl?: string;
  accent: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (description?.length || 0) > 320;
  const display = !expanded && isLong
    ? description!.slice(0, 320).trimEnd() + "…"
    : description;

  const showUrl = eventUrl && eventUrl !== "https://" && eventUrl.trim() !== "";

  if (!description) return null;

  return (
    <Box>
      <SectionLabel accent={accent}>About</SectionLabel>
      <Box
        sx={{
          maxWidth: tokens.page.readingWidth,
          mx: "auto",
          color: tokens.color.inkPrimary,
          fontFamily: tokens.font.sans,
          fontSize: 17,
          lineHeight: 1.7,
          letterSpacing: "0.005em",
          whiteSpace: "pre-line",
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
        {display && display.length > 0 && (
          <>
            <span className="dropcap">{display.charAt(0)}</span>
            {display.slice(1)}
          </>
        )}
      </Box>
      {isLong && (
        <Box sx={{ maxWidth: tokens.page.readingWidth, mx: "auto", mt: 2 }}>
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
      {showUrl && (
        <Box sx={{ maxWidth: tokens.page.readingWidth, mx: "auto", mt: 3 }}>
          <Box
            component="a"
            href={eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: accent,
              fontFamily: tokens.font.sans,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <Icon icon="ph:link" width={14} />
            {eventUrl}
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
  avatars: { user_image: string }[];
  accent: string;
  onShowMore: () => void;
}) {
  if (count === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          fontFamily: tokens.font.sans,
          color: tokens.color.inkSecondary,
          fontSize: 14,
        }}
      >
        No one has RSVP'd yet — be the first.
      </Box>
    );
  }
  const display = avatars.slice(0, 15);
  const remainder = count - display.length;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(5, 1fr)",
          sm: "repeat(6, 1fr)",
          md: "repeat(8, 1fr)",
        },
        gap: 1.5,
        justifyItems: "center",
      }}
    >
      {display.map((g, i) => (
        <Avatar
          key={i}
          src={g.user_image}
          sx={{
            width: 56,
            height: 56,
            cursor: "pointer",
            border: `2px solid ${tokens.color.paper}`,
            boxShadow: tokens.shadow.soft,
            transition: `transform 200ms ${tokens.motion.swift}`,
            "&:hover": { transform: "translateY(-2px) scale(1.04)" },
          }}
          onClick={onShowMore}
        />
      ))}
      {remainder > 0 && (
        <Box
          onClick={onShowMore}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: withAlpha(accent, 0.12),
            color: accent,
            fontFamily: tokens.font.sans,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            border: `2px solid ${tokens.color.paper}`,
            boxShadow: tokens.shadow.soft,
            transition: `transform 200ms ${tokens.motion.swift}`,
            "&:hover": { transform: "translateY(-2px) scale(1.04)" },
          }}
        >
          +{remainder}
        </Box>
      )}
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
      icon: "ph:chat-circle-text",
      label: "Chat with the host",
      msg: "Open the app to chat with the host.",
    },
    {
      icon: "ph:users-three",
      label: "See everyone who's going",
      msg: "Open the App to view complete guest list.",
    },
    {
      icon: "ph:calendar-plus",
      label: "Add to your calendar",
      msg: "Open the app to save this event.",
    },
  ];
  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 1,
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
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 2,
            borderRadius: `${tokens.radius.md}px`,
            background: tokens.color.raised,
            border: `1px solid ${tokens.color.line}`,
            cursor: "pointer",
            outline: "none",
            transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, border-color 200ms ${tokens.motion.swift}`,
            "&:hover, &:focus-visible": {
              transform: "translateY(-1px)",
              borderColor: withAlpha(accent, 0.4),
              boxShadow: tokens.shadow.soft,
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: withAlpha(accent, 0.12),
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon icon={it.icon} width={18} />
          </Box>
          <Box
            sx={{
              flex: 1,
              fontFamily: tokens.font.sans,
              fontSize: 15,
              fontWeight: 500,
              color: tokens.color.inkPrimary,
            }}
          >
            {it.label}
          </Box>
          <Icon
            icon="ph:arrow-right"
            width={16}
            color={tokens.color.inkSecondary}
          />
        </Box>
      ))}
    </Box>
  );
}
