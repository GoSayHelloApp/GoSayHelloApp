export const tokens = {
  color: {
    paper: "#F7F4ED",
    raised: "#FFFFFF",
    inkPrimary: "#14131A",
    inkSecondary: "#5A5763",
    inkMuted: "#9A96A3",
    line: "rgba(20, 19, 26, 0.08)",
    brandOrange: "#EB7D32",
    brandOrangeDark: "#B84C02",
    fallbackAccent: "#EB7D32",
  },
  font: {
    serif: '"Fraunces", "Times New Roman", Georgia, serif',
    sans: '"Inter", "Montserrat", system-ui, -apple-system, sans-serif',
  },
  radius: {
    sm: 4,
    md: 12,
    lg: 20,
    xl: 28,
  },
  shadow: {
    soft: "0 1px 2px rgba(20,19,26,0.04), 0 4px 16px rgba(20,19,26,0.06)",
    lift: "0 2px 4px rgba(20,19,26,0.06), 0 12px 32px rgba(20,19,26,0.10)",
    poster:
      "0 6px 16px rgba(20,19,26,0.08), 0 24px 48px rgba(20,19,26,0.18), 0 1px 0 rgba(255,255,255,0.6) inset",
  },
  motion: {
    settle: "cubic-bezier(0.22, 1, 0.36, 1)",
    swift: "cubic-bezier(0.4, 0, 0.2, 1)",
    durFast: "200ms",
    durBase: "500ms",
    durSlow: "800ms",
  },
  page: {
    maxWidth: 1120,
    readingWidth: 640,
  },
} as const;

export type Tokens = typeof tokens;
