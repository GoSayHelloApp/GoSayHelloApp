import { useEffect, useState } from "react";
import { tokens } from "./tokens";

type Rgb = { r: number; g: number; b: number };

function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function adjust({ r, g, b }: Rgb): Rgb {
  let lum = relativeLuminance({ r, g, b });
  let sat = saturation({ r, g, b });

  if (sat < 0.18) {
    const boost = 1.4;
    const max = Math.max(r, g, b);
    r = clamp(r + (r - max * 0.6) * boost * 0.3, 0, 255);
    g = clamp(g + (g - max * 0.6) * boost * 0.3, 0, 255);
    b = clamp(b + (b - max * 0.6) * boost * 0.3, 0, 255);
  }

  if (lum < 0.08) {
    r = clamp(r * 1.6, 0, 255);
    g = clamp(g * 1.6, 0, 255);
    b = clamp(b * 1.6, 0, 255);
  } else if (lum > 0.72) {
    r = clamp(r * 0.7, 0, 255);
    g = clamp(g * 0.7, 0, 255);
    b = clamp(b * 0.7, 0, 255);
  }

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

const cache = new Map<string, string>();

export function useColorExtraction(imageUrl?: string): string {
  const [accent, setAccent] = useState<string>(
    imageUrl && cache.has(imageUrl)
      ? (cache.get(imageUrl) as string)
      : tokens.color.fallbackAccent
  );

  useEffect(() => {
    if (!imageUrl) {
      setAccent(tokens.color.fallbackAccent);
      return;
    }
    if (cache.has(imageUrl)) {
      setAccent(cache.get(imageUrl) as string);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const dr = data[i];
          const dg = data[i + 1];
          const db = data[i + 2];
          const lum = relativeLuminance({ r: dr, g: dg, b: db });
          if (lum < 0.04 || lum > 0.96) continue;
          r += dr;
          g += dg;
          b += db;
          count += 1;
        }

        if (count === 0) return;
        const avg = adjust({
          r: r / count,
          g: g / count,
          b: b / count,
        });
        const lum = relativeLuminance(avg);
        const sat = saturation(avg);
        if (lum < 0.18 || sat < 0.25) {
          cache.set(imageUrl, tokens.color.brandOrange);
          setAccent(tokens.color.brandOrange);
          return;
        }
        const hex = rgbToHex(avg);
        cache.set(imageUrl, hex);
        setAccent(hex);
      } catch {
        // CORS or canvas failure — keep fallback
      }
    };

    img.onerror = () => {
      // keep fallback
    };

    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return accent;
}

export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
