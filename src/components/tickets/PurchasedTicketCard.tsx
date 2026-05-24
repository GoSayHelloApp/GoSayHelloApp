import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { QRCodeSVG } from "qrcode.react";
import { tokens } from "../../pages/events/invitation/tokens";
import type { FlatTicket } from "../../models/responseModels/purchasedTickets";
import { downloadNodeAsPng } from "../../utils/ticketDownload";
import {
  resolveEventIanaTimeZone,
  formatUtcDateTimeInZone,
} from "../../utils/eventTimezone";

// iOS TicketDetail palette
const ORANGE = "#FF9500"; // systemOrange (border, save, footer)
const BLACK = "#010101"; // AppColors.blackColor (text, share)
const RED = "#FF3B30"; // systemRed (already used)
const SEP = "#E5E5EA"; // systemGray5 (separators)
const QR_BORDER = "#D1D1D6"; // systemGray4
const FONT = tokens.font.poppins;

interface Props {
  ticket: FlatTicket;
  buyerEmail: string;
  onReady?: (id: number, node: HTMLElement | null) => void;
}

export default function PurchasedTicketCard({ ticket, buyerEmail, onReady }: Props) {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    onReady?.(ticket.purchasedTicketId, captureRef.current);
    return () => onReady?.(ticket.purchasedTicketId, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.purchasedTicketId]);

  const qrValue =
    typeof window !== "undefined"
      ? window.btoa(`QR-${ticket.purchasedTicketId}-${ticket.eventId ?? 0}`)
      : `QR-${ticket.purchasedTicketId}-${ticket.eventId ?? 0}`;

  const tz = resolveEventIanaTimeZone(ticket.latitude, ticket.longitude);
  const start = formatUtcDateTimeInZone(ticket.startDate, ticket.startTime, tz);
  const end = formatUtcDateTimeInZone(ticket.endDate, ticket.endTime, tz);
  const dateLine =
    start.date && end.date ? `${start.date} - ${end.date}` : start.date;
  const timeLine =
    start.time && end.time ? `${start.time} to ${end.time}` : start.time;
  const priceText =
    ticket.price != null ? `$${Number(ticket.price).toFixed(2)}` : "";

  const handleDownload = async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(captureRef.current, `ticket-${ticket.purchasedTicketId}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Capture container (white, like iOS captureContainerView) */}
      <Box ref={captureRef} sx={{ background: "#FFFFFF", p: 1.25, borderRadius: "18px" }}>
        {/* cardView — white, orange 1.2px border, rounded 16, shadow */}
        <Box
          sx={{
            background: "#FFFFFF",
            border: `1.2px solid ${ORANGE}`,
            borderRadius: "16px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            px: 2.25,
            pt: 3,
            pb: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
            fontFamily: FONT,
          }}
        >
          {/* QR */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                p: 1.25,
                background: "#FFFFFF",
                border: `1px solid ${QR_BORDER}`,
                borderRadius: "12px",
                lineHeight: 0,
              }}
            >
              <QRCodeSVG value={qrValue} size={176} level="Q" marginSize={0} />
            </Box>
          </Box>

          {ticket.isUsed ? (
            <Box
              sx={{
                py: 1,
                borderRadius: "10px",
                background: RED,
                border: "2px solid #FFFFFF",
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 700,
                boxShadow: `0 2px 4px ${RED}80`,
              }}
            >
              Already Used
            </Box>
          ) : null}

          <Separator />

          {/* ticket name (bold, left) + type + price */}
          <Box sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: BLACK, textAlign: "left", lineHeight: 1.25 }}>
            {ticket.ticketName}
          </Box>
          {ticket.ticketType ? <Line>{`Type: ${ticket.ticketType}`}</Line> : null}
          {priceText ? <Line>{priceText}</Line> : null}

          <Separator />

          {/* event details */}
          {ticket.eventName ? (
            <Box sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: BLACK, lineHeight: 1.3 }}>
              {ticket.eventName}
            </Box>
          ) : null}
          {ticket.eventType ? <Line>{`Type: ${ticket.eventType}`}</Line> : null}
          {ticket.organizerName ? <Line>{`Organizer: ${ticket.organizerName}`}</Line> : null}
          {dateLine ? <Line>{`Date: ${dateLine}`}</Line> : null}
          {timeLine ? <Line>{`Time: ${timeLine}`}</Line> : null}
          {ticket.address ? <Line>{`Address: ${ticket.address}`}</Line> : null}

          <Separator />

          {/* buyer + quantity */}
          <Line>{`Buyer: ${buyerEmail}`}</Line>
          <Line>{`Quantity: ${ticket.quantity}`}</Line>

          <Separator />

          {/* footer */}
          <Box sx={{ textAlign: "center", fontFamily: FONT, fontSize: 12, fontWeight: 600, color: ORANGE }}>
            Powered by GoSayHELLO
          </Box>
        </Box>
      </Box>

      {/* Download (outside the captured visual) */}
      <Box
        component="button"
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        sx={{
          mt: 1.5,
          width: "100%",
          height: 46,
          border: "none",
          borderRadius: "14px",
          cursor: downloading ? "default" : "pointer",
          background: BLACK,
          color: "#FFFFFF",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 15,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          opacity: downloading ? 0.7 : 1,
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          transition: "transform 120ms ease, opacity 200ms ease",
          "&:active": downloading ? {} : { transform: "scale(0.98)" },
        }}
      >
        <Icon icon={downloading ? "ph:spinner-gap-bold" : "ph:download-simple-bold"} width={17} />
        {downloading ? "Preparing…" : "Download"}
      </Box>
    </Box>
  );
}

function Separator() {
  return <Box sx={{ height: "1px", background: SEP }} />;
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: BLACK, lineHeight: 1.4, wordBreak: "break-word" }}>
      {children}
    </Box>
  );
}

