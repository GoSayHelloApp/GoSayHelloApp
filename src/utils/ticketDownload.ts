import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const PNG_OPTS = { pixelRatio: 2, cacheBust: true, backgroundColor: "#FFFFFF" };

/** Wait for web fonts so exported text/QR render consistently (esp. on mobile). */
async function whenReady(): Promise<void> {
  try {
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } })
      .fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {
    /* ignore */
  }
}

/**
 * html-to-image can drop content on the very first capture (fonts/images not
 * yet inlined). Render once to warm up, discard, then capture for real.
 */
async function renderPng(node: HTMLElement): Promise<string> {
  await whenReady();
  await toPng(node, PNG_OPTS); // warm-up
  return toPng(node, PNG_OPTS);
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** True on iOS/iPadOS (where Web Share needs a synchronous gesture). */
export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ Safari reports a Mac UA but is touch-capable
  return navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1;
}

/** True only on phones/tablets (incl. iPadOS reporting as desktop Safari). */
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return true;
  // iPadOS Safari reports a Mac UA but is touch-capable
  return (
    /iPad/i.test(ua) ||
    (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1)
  );
}

/**
 * Deliver a file: on MOBILE use the Web Share sheet (lets the user "Save to
 * Files"/Photos). On desktop/web, always do a plain browser download.
 */
async function deliverFile(
  blob: Blob,
  filename: string,
  shareTitle: string
): Promise<void> {
  const file = new File([blob], filename, {
    type: blob.type || "application/octet-stream",
  });
  const nav = navigator as Navigator & {
    canShare?: (data?: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };

  if (
    isMobileDevice() &&
    nav.share &&
    nav.canShare &&
    nav.canShare({ files: [file] })
  ) {
    try {
      await nav.share({ files: [file], title: shareTitle });
      return;
    } catch (err) {
      // user dismissed the share sheet — don't also force a download
      if ((err as { name?: string })?.name === "AbortError") return;
      // otherwise fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Render a DOM node to a PNG and download it. */
export async function downloadNodeAsPng(
  node: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await renderPng(node);
  triggerDownload(dataUrl, filename);
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/png" });
}

/**
 * Share a node as a PNG via the Web Share API (with the image file when
 * supported), falling back to a download if sharing isn't available.
 */
export async function shareNodeAsPng(
  node: HTMLElement,
  filename: string,
  shareText?: string
): Promise<void> {
  const dataUrl = await toPng(node, PNG_OPTS);
  try {
    const file = await dataUrlToFile(dataUrl, filename);
    const nav = navigator as Navigator & {
      canShare?: (data?: { files?: File[] }) => boolean;
      share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: shareText, text: shareText });
      return;
    }
  } catch {
    /* fall back to download */
  }
  triggerDownload(dataUrl, filename);
}

/** Render multiple nodes into a single multi-page PDF and return the Blob. */
export async function buildTicketsPdfBlob(
  nodes: HTMLElement[]
): Promise<Blob | null> {
  if (nodes.length === 0) return null;

  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 32;

  // Lighter options for multi-page export: QR stays crisp at 1.6x, and no
  // cache-bust (the cards have no external images, just inline SVG + fonts).
  const opts = { pixelRatio: 1.6, backgroundColor: "#FFFFFF", cacheBust: false };

  await whenReady();
  // single warm-up (primes font/style embedding for every page)
  try {
    await toPng(nodes[0], opts);
  } catch {
    /* ignore */
  }

  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await toPng(nodes[i], opts); // one render per ticket
    const img = await loadImage(dataUrl);

    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", x, y, w, h);
  }

  return pdf.output("blob");
}

/**
 * Deliver an already-built Blob. SYNCHRONOUS entry so it can be called directly
 * inside a tap handler — required for iOS Safari's Web Share gesture rule.
 * Mobile → share sheet ("Save to Files"); desktop → download.
 */
export function shareOrDownloadBlob(
  blob: Blob,
  filename: string,
  shareTitle: string
): void {
  const file = new File([blob], filename, {
    type: blob.type || "application/octet-stream",
  });
  const nav = navigator as Navigator & {
    canShare?: (data?: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };

  const downloadFallback = () => {
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  if (
    isMobileDevice() &&
    nav.share &&
    nav.canShare &&
    nav.canShare({ files: [file] })
  ) {
    // Call share() synchronously (no await) to keep the user gesture valid.
    nav
      .share({ files: [file], title: shareTitle })
      .catch((err: { name?: string }) => {
        if (err?.name === "AbortError") return; // user cancelled
        downloadFallback();
      });
    return;
  }

  downloadFallback();
}

/** Build the PDF then deliver it (used as a fallback when not pre-built). */
export async function downloadNodesAsPdf(
  nodes: HTMLElement[],
  filename: string
): Promise<void> {
  const blob = await buildTicketsPdfBlob(nodes);
  if (blob) await deliverFile(blob, filename, "Your tickets");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
