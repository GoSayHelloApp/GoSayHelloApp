import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "./invitation/tokens";
import { withAlpha } from "./invitation/useColorExtraction";
import EventFooter from "../../components/events/eventFooter";
import { usePublicEventTickets } from "../../hooks/usePublicEventTickets";
import {
  resolveEventIanaTimeZone,
  formatTimezoneHeader,
} from "../../utils/eventTimezone";
import PublicTicketCard from "../../components/tickets/PublicTicketCard";
import PurchasedTicketCard from "../../components/tickets/PurchasedTicketCard";
import TicketEmailModal from "../../components/tickets/TicketEmailModal";
import type { PublicTicket } from "../../models/responseModels/publicEventTickets";
import {
  flattenPurchasedTickets,
  type FlatTicket,
  type PurchasedTicketGroup,
} from "../../models/responseModels/purchasedTickets";
import {
  buildTicketsPdfBlob,
  shareOrDownloadBlob,
  isIOSDevice,
} from "../../utils/ticketDownload";

const accent = tokens.color.brandOrange;

export default function PublicEventTicketsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, tickets, isLoading, error } = usePublicEventTickets(eventId);

  // Always start at the top when entering / switching events — React Router
  // doesn't auto-scroll, so without this the new page inherits the previous
  // page's scroll position (e.g. tapping Buy from the bottom of event detail
  // would land us at the bottom of the tickets screen).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [eventId]);

  const timeZone = useMemo(
    () => resolveEventIanaTimeZone(event?.latitude, event?.longitude),
    [event?.latitude, event?.longitude]
  );

  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    ticket: PublicTicket | null;
    qty: number;
  }>({ open: false, ticket: null, qty: 1 });

  const [purchased, setPurchased] = useState<{
    tickets: FlatTicket[];
    email: string;
    message: string;
  } | null>(null);

  // Scroll to top when transitioning into the purchased-tickets view, so the
  // user lands at the heading no matter where they were scrolled on the buy
  // list when the purchase completed.
  const justPurchased = !!purchased;
  useEffect(() => {
    if (!justPurchased) return;
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [justPurchased]);

  const nodeMap = useRef<Map<number, HTMLElement>>(new Map());
  const pdfBlobRef = useRef<Blob | null>(null);
  const [iosPdfReady, setIosPdfReady] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const isIOS = useMemo(() => isIOSDevice(), []);

  const fileName = `${(event?.event_name || "tickets").replace(/[^a-z0-9]+/gi, "-")}-tickets.pdf`;

  // iOS ONLY: pre-build the combined PDF in the background so the "Download all"
  // tap can call share() synchronously (iOS Safari requires the Web Share
  // gesture to be unbroken by async work). Android/web build on tap instead.
  useEffect(() => {
    pdfBlobRef.current = null;
    setIosPdfReady(false);
    if (!isIOS || !purchased || purchased.tickets.length < 2) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      const nodes = purchased.tickets
        .map((tk) => nodeMap.current.get(tk.purchasedTicketId))
        .filter((n): n is HTMLElement => Boolean(n));
      if (nodes.length === 0) return;
      try {
        const blob = await buildTicketsPdfBlob(nodes);
        if (!cancelled && blob) pdfBlobRef.current = blob;
      } catch {
        /* will fall back to building on tap */
      } finally {
        if (!cancelled) setIosPdfReady(true);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isIOS, purchased]);

  const handleBuy = (ticket: PublicTicket, qty: number) => {
    setEmailModal({ open: true, ticket, qty });
  };

  const handlePurchased = (
    groups: PurchasedTicketGroup[],
    buyerEmail: string,
    message: string
  ) => {
    nodeMap.current.clear();
    setEmailModal((s) => ({ ...s, open: false }));
    setPurchased({
      tickets: flattenPurchasedTickets(groups),
      email: buyerEmail,
      message,
    });
    // scroll-to-top now handled by a useEffect on `purchased` (above)
  };

  const registerNode = (id: number, node: HTMLElement | null) => {
    if (node) nodeMap.current.set(id, node);
    else nodeMap.current.delete(id);
  };

  const handleDownloadAll = async () => {
    if (!purchased || downloadingAll) return;

    // iOS: PDF is pre-built → share synchronously (keeps the Web Share gesture).
    if (pdfBlobRef.current) {
      shareOrDownloadBlob(pdfBlobRef.current, fileName, "Your tickets");
      return;
    }

    // Android / web: build the PDF on tap (loader), then deliver.
    const nodes = purchased.tickets
      .map((t) => nodeMap.current.get(t.purchasedTicketId))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;
    setDownloadingAll(true);
    try {
      const blob = await buildTicketsPdfBlob(nodes);
      if (blob) shareOrDownloadBlob(blob, fileName, "Your tickets");
    } finally {
      setDownloadingAll(false);
    }
  };

  const goBack = () => {
    // If we're showing purchased tickets, first step back to the buy list.
    if (purchased) {
      setPurchased(null);
      return;
    }
    // We arrive here from the event detail (via "Buy Tickets"), so prefer
    // browser-history back; fall back to the event-details path / events list.
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (eventId) navigate(`/event-details/${eventId}`);
    else navigate("/events-list");
  };

  const eventType = event?.event_type_name || event?.event_type;
  const isEmpty = !isLoading && !error && tickets.length === 0;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: tokens.color.paper,
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        overflowX: "hidden",
      }}
    >
      {/* Soft top wash */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 480,
          background: `radial-gradient(60% 80% at 70% 10%, ${withAlpha(
            accent,
            0.12
          )} 0%, ${withAlpha(accent, 0)} 70%), linear-gradient(180deg, ${withAlpha(
            accent,
            0.05
          )} 0%, ${tokens.color.paper} 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          borderBottom: `1px solid ${tokens.color.line}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2.5, sm: 5, md: 8 },
            py: { xs: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            component="a"
            href="/events-list"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/images/gosayhello-hand.png"
              alt=""
              sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 }, borderRadius: "50%", display: "block" }}
            />
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontSize: { xs: 18, md: 22 },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: tokens.color.inkPrimary,
              }}
            >
              GoSay
              <Box component="span" sx={{ color: accent }}>
                HELLO
              </Box>
            </Box>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={goBack}
            sx={{
              appearance: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              py: 1,
              color: tokens.color.inkPrimary,
              fontFamily: tokens.font.sans,
              fontSize: { xs: 12, md: 13 },
              fontWeight: 600,
              letterSpacing: "0.01em",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              transition: `color 200ms ${tokens.motion.swift}`,
              "& .back": { display: "inline-flex", transition: `transform 220ms ${tokens.motion.swift}` },
              "&:hover": { color: accent },
              "&:hover .back": { transform: "translateX(-3px)" },
            }}
          >
            <Box component="span" className="back">
              <Icon icon="ph:arrow-left-bold" width={12} />
            </Box>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Back to event
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Event
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          pt: { xs: 1.5, sm: 1.75, md: 2 },
          pb: { xs: 6, sm: 8, md: 10 },
        }}
      >
        {purchased ? (
          <PurchasedTicketsView
            tickets={purchased.tickets}
            email={purchased.email}
            message={purchased.message}
            onRegisterNode={registerNode}
            onDownloadAll={handleDownloadAll}
            downloadAllBusy={isIOS ? !iosPdfReady : downloadingAll}
            onDone={goBack}
          />
        ) : (
        <>
        {/* Hero */}
        <Box sx={{ mb: { xs: 1.25, md: 1.75 }, maxWidth: 820 }}>
          {/* Kicker — top */}
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              mb: 1.75,
            }}
          >
            Buy Tickets
          </Box>

          {/* Image + (name above, type below) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {event?.event_image ? (
              <Box
                component="img"
                src={event.event_image}
                alt={event.event_name}
                sx={{
                  width: { xs: 60, sm: 72, md: 88 },
                  height: { xs: 60, sm: 72, md: 88 },
                  borderRadius: "18px",
                  objectFit: "cover",
                  display: "block",
                  flexShrink: 0,
                  border: `1px solid ${tokens.color.line}`,
                  boxShadow: tokens.shadow.soft,
                }}
              />
            ) : null}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: tokens.font.serif,
                  fontWeight: 700,
                  fontSize: { xs: 30, sm: 44, md: 56 },
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                  color: tokens.color.inkPrimary,
                  m: 0,
                }}
              >
                {event?.event_name || "Tickets"}
              </Typography>

              {/* Event type — under the event name */}
              {eventType ? (
                <Box
                  sx={{
                    mt: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    background: withAlpha(accent, 0.12),
                    color: accent,
                    fontFamily: tokens.font.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: accent }} />
                  {eventType}
                </Box>
              ) : null}
            </Box>
          </Box>

          {/* address */}
          {event?.address_1 ? (
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "flex-start",
                gap: 0.75,
                fontFamily: tokens.font.sans,
                fontSize: 14,
                lineHeight: 1.45,
                color: tokens.color.inkSecondary,
                maxWidth: { xs: "100%", md: 540 },
              }}
            >
              <Box sx={{ display: "inline-flex", color: accent, flexShrink: 0, mt: "2px" }}>
                <Icon icon="ph:map-pin-fill" width={15} />
              </Box>
              <Box component="span" sx={{ minWidth: 0 }}>
                {event.address_1}
              </Box>
            </Box>
          ) : null}

          {/* timezone line — under address */}
          {event ? (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                fontFamily: tokens.font.sans,
                fontSize: 12.5,
                fontWeight: 600,
                color: accent,
              }}
            >
              <Icon icon="ph:globe-simple" width={14} />
              {formatTimezoneHeader(timeZone)}
            </Box>
          ) : null}
        </Box>

        {/* Grid */}
        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 360,
                  borderRadius: `${tokens.radius.lg}px`,
                  border: `1px solid ${tokens.color.line}`,
                  background: `linear-gradient(90deg, ${withAlpha(
                    tokens.color.inkPrimary,
                    0.04
                  )} 25%, ${withAlpha(tokens.color.inkPrimary, 0.07)} 37%, ${withAlpha(
                    tokens.color.inkPrimary,
                    0.04
                  )} 63%)`,
                  backgroundSize: "400% 100%",
                  animation: "ticketShimmer 1.4s ease infinite",
                  "@keyframes ticketShimmer": {
                    "0%": { backgroundPosition: "100% 0" },
                    "100%": { backgroundPosition: "0 0" },
                  },
                }}
              />
            ))}
          </Box>
        ) : null}

        {!isLoading && !error && tickets.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: { xs: 2.5, md: 3 },
              alignItems: "stretch",
            }}
          >
            {tickets.map((t) => (
              <PublicTicketCard
                key={t.ticket_id}
                ticket={t}
                timeZone={timeZone}
                onBuy={handleBuy}
              />
            ))}
          </Box>
        ) : null}

        {/* Empty */}
        {isEmpty ? (
          <StateCard
            title="No tickets on sale"
            subtitle="There are no tickets available for this event right now. Check back soon."
            actionLabel="Back to event"
            onAction={goBack}
          />
        ) : null}

        {/* Error */}
        {error && !isLoading ? (
          <StateCard
            title="Couldn't load tickets"
            subtitle="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => window.location.reload()}
            filled
          />
        ) : null}

        </>
        )}

        {/* Footer */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <EventFooter />
        </Box>
      </Box>

      {/* Email capture modal */}
      <TicketEmailModal
        open={emailModal.open}
        ticket={emailModal.ticket}
        quantity={emailModal.qty}
        eventName={event?.event_name}
        onClose={() => setEmailModal((s) => ({ ...s, open: false }))}
        onPurchased={handlePurchased}
      />
    </Box>
  );
}

function PurchasedTicketsView({
  tickets,
  email,
  message,
  onRegisterNode,
  onDownloadAll,
  downloadAllBusy,
  onDone,
}: {
  tickets: FlatTicket[];
  email: string;
  message: string;
  onRegisterNode: (id: number, node: HTMLElement | null) => void;
  onDownloadAll: () => void;
  downloadAllBusy: boolean;
  onDone: () => void;
}) {
  const count = tickets.length;
  const isPaid = tickets.some((t) => (t.price ?? 0) > 0);
  // On iOS this is true while the PDF pre-builds; on Android/web it's true only
  // while building on tap.
  const preparingAll = downloadAllBusy;
  return (
    <Box>
      {/* heading */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            mb: 1.5,
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            background: withAlpha("#34C759", 0.14),
            color: "#1B7A3D",
            fontFamily: tokens.font.sans,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <Icon icon="ph:check-circle-fill" width={15} />
          {isPaid ? "Payment confirmed" : "Confirmed"}
        </Box>
        <Typography
          component="h1"
          sx={{
            fontFamily: tokens.font.serif,
            fontWeight: 700,
            fontSize: { xs: 32, sm: 44, md: 54 },
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: tokens.color.inkPrimary,
            m: 0,
          }}
        >
          {count === 1 ? "This is your " : "These are your "}
          <Box component="span" sx={{ fontStyle: "italic", fontWeight: 500, color: accent }}>
            {count === 1 ? "ticket" : "tickets"}
          </Box>
          .
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            fontFamily: tokens.font.sans,
            fontSize: { xs: 14, md: 15 },
            color: tokens.color.inkSecondary,
            maxWidth: 620,
          }}
        >
          {count === 1 ? (
            <>
              Your ticket has been sent to{" "}
              <Box component="span" sx={{ fontWeight: 700, color: tokens.color.inkPrimary }}>
                {email}
              </Box>
              . Show the QR code at the door, or download it below.
            </>
          ) : (
            <>
              {count} tickets have been sent to{" "}
              <Box component="span" sx={{ fontWeight: 700, color: tokens.color.inkPrimary }}>
                {email}
              </Box>
              . Show the QR codes at the door, or download them below.
            </>
          )}
        </Box>

        {/* actions */}
        <Box sx={{ mt: 2.5, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {count > 1 ? (
            <Box
              component="button"
              type="button"
              onClick={onDownloadAll}
              disabled={preparingAll}
              sx={{
                appearance: "none",
                border: "none",
                cursor: preparingAll ? "default" : "pointer",
                background: tokens.color.brandOrange,
                color: "#FFFFFF",
                fontFamily: tokens.font.sans,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                px: 3,
                py: 1.4,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                opacity: preparingAll ? 0.7 : 1,
                boxShadow: `0 4px 12px ${withAlpha(tokens.color.brandOrange, 0.25)}`,
                transition: "filter 200ms ease, transform 200ms ease",
                "&:hover": preparingAll ? {} : { filter: "brightness(1.05)", transform: "translateY(-1px)" },
              }}
            >
              {preparingAll ? (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#FFFFFF",
                    animation: "ticketBtnSpin 700ms linear infinite",
                    "@keyframes ticketBtnSpin": { to: { transform: "rotate(360deg)" } },
                  }}
                />
              ) : (
                <Icon icon="ph:download-simple-bold" width={16} />
              )}
              {preparingAll ? "Preparing PDF…" : "Download all"}
            </Box>
          ) : null}
          <Box
            component="button"
            type="button"
            onClick={onDone}
            sx={{
              appearance: "none",
              border: `1px solid ${tokens.color.line}`,
              background: tokens.color.raised,
              color: tokens.color.inkPrimary,
              fontFamily: tokens.font.sans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              px: 3,
              py: 1.4,
              borderRadius: 999,
              cursor: "pointer",
              transition: "border-color 200ms ease, color 200ms ease",
              "&:hover": { borderColor: accent, color: accent },
            }}
          >
            Done
          </Box>
        </Box>
      </Box>

      {/* App sign-in note */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: `${tokens.radius.lg}px`,
          background: withAlpha(accent, 0.07),
          border: `1px solid ${withAlpha(accent, 0.2)}`,
        }}
      >
        <Box sx={{ color: accent, mt: "2px", flexShrink: 0, display: "inline-flex" }}>
          <Icon icon="ph:device-mobile-fill" width={22} />
        </Box>
        <Box>
          <Box
            sx={{
              fontFamily: tokens.font.serif,
              fontStyle: "italic",
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.4,
              color: tokens.color.inkPrimary,
            }}
          >
            “Your tickets travel with you.”
          </Box>
          <Box
            sx={{
              mt: 0.5,
              fontFamily: tokens.font.sans,
              fontSize: 13.5,
              lineHeight: 1.5,
              color: tokens.color.inkSecondary,
            }}
          >
            You can also access these tickets anytime — just sign in to the
            GoSayHELLO app with{" "}
            <Box component="span" sx={{ fontWeight: 700, color: tokens.color.inkPrimary }}>
              {email}
            </Box>
            .
          </Box>
        </Box>
      </Box>

      {/* 3-col grid */}
      {count > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: { xs: 2.5, md: 3 },
            alignItems: "start",
          }}
        >
          {tickets.map((t) => (
            <PurchasedTicketCard
              key={t.purchasedTicketId}
              ticket={t}
              buyerEmail={email}
              onReady={onRegisterNode}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            background: tokens.color.raised,
            border: `1px solid ${tokens.color.line}`,
            borderRadius: `${tokens.radius.lg}px`,
            maxWidth: 560,
          }}
        >
          <Box sx={{ color: "#34C759", mb: 1 }}>
            <Icon icon="ph:check-circle-fill" width={44} />
          </Box>
          <Box sx={{ fontFamily: tokens.font.serif, fontStyle: "italic", fontSize: { xs: 20, md: 24 }, color: tokens.color.inkPrimary, mb: 0.5 }}>
            {message || "You're all set."}
          </Box>
          <Box sx={{ fontFamily: tokens.font.sans, fontSize: 14, color: tokens.color.inkSecondary }}>
            Your {count === 1 ? "ticket has" : "tickets have"} been sent to {email}. Check your inbox.
          </Box>
        </Box>
      )}
    </Box>
  );
}

function StateCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  filled,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  filled?: boolean;
}) {
  return (
    <Box
      sx={{
        mt: 2,
        p: { xs: 4, md: 6 },
        textAlign: "center",
        background: tokens.color.raised,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: `${tokens.radius.lg}px`,
        maxWidth: 560,
        mx: "auto",
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
        {title}
      </Box>
      <Box
        sx={{
          fontFamily: tokens.font.sans,
          fontSize: 14,
          color: tokens.color.inkSecondary,
          mb: 3,
        }}
      >
        {subtitle}
      </Box>
      <Box
        component="button"
        onClick={onAction}
        sx={{
          appearance: "none",
          border: filled ? "none" : `1px solid ${accent}`,
          background: filled ? accent : "transparent",
          color: filled ? "#FFFFFF" : accent,
          fontFamily: tokens.font.sans,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          px: 2.5,
          py: 1.25,
          borderRadius: 999,
          cursor: "pointer",
          transition: "background 200ms ease, color 200ms ease, filter 200ms ease",
          "&:hover": filled
            ? { filter: "brightness(1.05)" }
            : { background: accent, color: "#FFFFFF" },
        }}
      >
        {actionLabel}
      </Box>
    </Box>
  );
}
