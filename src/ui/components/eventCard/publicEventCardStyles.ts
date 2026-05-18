/** Styles used only by PublicEventCard — do not import from shared EventCard. */

export const PUBLIC_BRAND = {
  orange: "#EB7D32",
  orangeDark: "#B84C02",
  cream: "#FFF8F3",
  ink: "#161C24",
  muted: "#637381",
} as const;

export const publicEventCardSx = {
  root: {
    position: "relative" as const,
    borderRadius: 3,
    overflow: "hidden",
    bgcolor: "#fff",
    border: "1px solid",
    borderColor: "rgba(235, 125, 50, 0.12)",
    boxShadow: "0 4px 24px rgba(22, 28, 36, 0.06)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 40px rgba(235, 125, 50, 0.18)",
    },
  },
  mediaWrap: {
    position: "relative" as const,
    height: { xs: 168, sm: 200 },
    overflow: "hidden",
    bgcolor: "grey.200",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  mediaGradient: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(22,28,36,0.02) 0%, rgba(22,28,36,0.55) 100%)",
    pointerEvents: "none" as const,
  },
  content: {
    p: { xs: 2, sm: 2.5 },
    pt: { xs: 2, sm: 2.5 },
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 2,
    textTransform: "none" as const,
    fontWeight: 700,
    py: 1.25,
    bgcolor: PUBLIC_BRAND.orange,
    boxShadow: "0 4px 14px rgba(235, 125, 50, 0.35)",
    "&:hover": { bgcolor: PUBLIC_BRAND.orangeDark, boxShadow: "0 6px 18px rgba(235, 125, 50, 0.4)" },
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 2,
    textTransform: "none" as const,
    fontWeight: 600,
    py: 1.25,
    borderWidth: 2,
    borderColor: PUBLIC_BRAND.orange,
    color: PUBLIC_BRAND.orange,
    "&:hover": { borderWidth: 2, bgcolor: PUBLIC_BRAND.cream },
  },
};
