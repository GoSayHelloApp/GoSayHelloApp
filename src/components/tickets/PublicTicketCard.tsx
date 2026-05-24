import React, { useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../pages/events/invitation/tokens";
import { withAlpha } from "../../pages/events/invitation/useColorExtraction";
import type { PublicTicket } from "../../models/responseModels/publicEventTickets";
import {
  formatSalesWindow,
  getTicketSaleState,
} from "../../utils/eventTimezone";

/** iOS ListOfTickets palette (system colors). */
const IOS = {
  card: "#FFFFFF",
  border: "#E8E8ED",
  ink: "#1C1C1E",
  inkSecondary: "#3A3A3C",
  gray: "#8E8E93",
  darkGray: "#555555",
  orange: "#FF9500",
  green: "#34C759",
  red: "#FF3B30",
  black: "#010101",
  fieldBg: "#F5F5F7",
} as const;

const FONT = tokens.font.poppins;
const PAGE_BG = tokens.color.paper;
const formatPrice = (v: number) => `$${v.toFixed(2)}`;

interface Props {
  ticket: PublicTicket;
  timeZone: string;
  onBuy: (ticket: PublicTicket, quantity: number) => void;
}

export default function PublicTicketCard({ ticket, timeZone, onBuy }: Props) {
  const price = ticket.price ?? 0;
  const quantity = ticket.quantity ?? 0;
  const sold = ticket.sold ?? 0;
  const remaining = Math.max(0, quantity - sold);
  const isFree = price === 0;

  const [qty, setQty] = useState(1);

  const state = getTicketSaleState(
    ticket.sales_start_date,
    ticket.sales_end_date,
    sold,
    quantity
  );
  const onSale = state === "on_sale";
  const { dateLine, timeLine } = formatSalesWindow(
    ticket.sales_start_date,
    ticket.sales_end_date,
    timeZone
  );

  const total = price * qty;
  const fee = Math.max(total * 0.15, 2.5);
  const payable = total + fee;

  const soldPct = quantity > 0 ? Math.min(100, (sold / quantity) * 100) : 0;
  const low = remaining > 0 && remaining <= Math.max(5, quantity * 0.15);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(remaining || 1, q + 1));

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: IOS.card,
        borderRadius: "18px",
        border: `1px solid ${IOS.border}`,
        boxShadow:
          "0 1px 2px rgba(16,18,23,0.04), 0 8px 24px rgba(16,18,23,0.06)",
        fontFamily: FONT,
        opacity: onSale ? 1 : 0.96,
        transition: `transform 260ms ${tokens.motion.swift}, box-shadow 260ms ${tokens.motion.swift}, border-color 260ms ${tokens.motion.swift}`,
        "&:hover": onSale
          ? {
              transform: "translateY(-4px)",
              borderColor: withAlpha(IOS.orange, 0.45),
              boxShadow:
                "0 2px 4px rgba(16,18,23,0.05), 0 18px 40px rgba(16,18,23,0.12)",
            }
          : {},
      }}
    >
      {/* ── Upper (info) section ── */}
      <Box sx={{ p: 2.25, pb: 1.75 }}>
        {/* name + price */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.25 }}>
          <Box sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: IOS.ink, lineHeight: 1.25, minWidth: 0 }}>
            {ticket.ticket_name}
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            {isFree ? (
              <Box sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: IOS.green, lineHeight: 1 }}>
                Free
              </Box>
            ) : (
              <Box sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: IOS.orange, lineHeight: 1, letterSpacing: "-0.01em" }}>
                {formatPrice(price)}
              </Box>
            )}
          </Box>
        </Box>

        {/* type chip — under the name */}
        {ticket.ticket_type ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              maxWidth: "100%",
              px: 1,
              py: 0.4,
              mt: 1,
              borderRadius: 999,
              background: withAlpha(IOS.orange, 0.12),
              color: "#B8690A",
              fontFamily: FONT,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: IOS.orange, flexShrink: 0 }} />
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ticket.ticket_type}
            </Box>
          </Box>
        ) : null}

        {/* date + time */}
        {(dateLine || timeLine) && (
          <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.6 }}>
            {dateLine && <Meta icon="ph:calendar-blank-fill">{dateLine}</Meta>}
            {timeLine && <Meta icon="ph:clock-fill">{timeLine}</Meta>}
          </Box>
        )}

        {/* description */}
        {ticket.description ? (
          <Box
            sx={{
              mt: 1,
              fontFamily: FONT,
              fontSize: 13,
              lineHeight: 1.5,
              color: IOS.inkSecondary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {ticket.description}
          </Box>
        ) : null}

        {/* availability */}
        <Box sx={{ mt: 1.75 }}>
          <Box sx={{ height: 6, borderRadius: 999, background: withAlpha(IOS.ink, 0.07), overflow: "hidden" }}>
            <Box
              sx={{
                width: `${soldPct}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  state === "sold_out"
                    ? IOS.red
                    : `linear-gradient(90deg, ${IOS.orange}, ${withAlpha(IOS.orange, 0.7)})`,
                transition: `width 500ms ${tokens.motion.settle}`,
              }}
            />
          </Box>
          <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT, fontSize: 12 }}>
            <Box component="span" sx={{ color: low ? IOS.red : IOS.green, fontWeight: 700 }}>
              {state === "sold_out"
                ? "Sold out"
                : low
                  ? `Only ${remaining} left`
                  : `${remaining} of ${quantity} left`}
            </Box>
            {state === "coming_soon" ? (
              <Box sx={{ color: IOS.orange, fontWeight: 700 }}>Coming soon</Box>
            ) : null}
          </Box>
        </Box>
      </Box>

      {/* ── Stub + action — fills remaining height; button pins to bottom ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Perforated ticket-stub divider */}
        <Box sx={{ position: "relative", height: 0 }}>
          <Notch side="left" />
          <Notch side="right" />
          <Box
            sx={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 0,
              borderTop: `2px dashed ${withAlpha(IOS.ink, 0.14)}`,
            }}
          />
        </Box>

        {/* Lower (action) section — quantity/pricing at top, button at bottom */}
        <Box sx={{ p: 2.25, pt: 1.75, flex: 1, display: "flex", flexDirection: "column" }}>
        {onSale ? (
          <>
            {/* quantity stepper */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: IOS.gray }}>
                Quantity
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", border: `1px solid ${IOS.border}`, borderRadius: 999, overflow: "hidden", background: IOS.fieldBg }}>
                <StepBtn label="−" onClick={dec} disabled={qty <= 1} />
                <Box sx={{ minWidth: 36, textAlign: "center", fontFamily: FONT, fontSize: 15, fontWeight: 700, color: IOS.ink }}>
                  {qty}
                </Box>
                <StepBtn label="+" onClick={inc} disabled={remaining > 0 && qty >= remaining} />
              </Box>
            </Box>

            {/* pricing inset panel (paid) */}
            {!isFree ? (
              <Box sx={{ background: IOS.fieldBg, borderRadius: "12px", p: 1.5, mb: 1.5 }}>
                <Row label="Total" value={formatPrice(total)} />
                <Row label="Processing fee" value={formatPrice(fee)} muted />
                <Box sx={{ mt: 0.75, pt: 0.75, borderTop: `1px solid ${withAlpha(IOS.ink, 0.08)}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Box sx={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: IOS.gray }}>
                    You pay
                  </Box>
                  <Box sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: IOS.ink, letterSpacing: "-0.01em" }}>
                    {formatPrice(payable)}
                  </Box>
                </Box>
              </Box>
            ) : null}

            {/* Free admission note — fills the space paid tickets use for pricing */}
            {isFree ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  background: withAlpha(IOS.green, 0.1),
                  border: `1px solid ${withAlpha(IOS.green, 0.25)}`,
                  borderRadius: "12px",
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <Box sx={{ color: IOS.green, display: "inline-flex", flexShrink: 0 }}>
                  <Icon icon="ph:gift-fill" width={22} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#1B7A3D" }}>
                    Free admission
                  </Box>
                  <Box sx={{ fontFamily: FONT, fontSize: 12, lineHeight: 1.45, color: IOS.darkGray }}>
                    No payment needed — your spot is confirmed instantly.
                  </Box>
                </Box>
              </Box>
            ) : null}

            {/* Refund disclaimer (iOS string) — paid only */}
            {!isFree ? (
              <Box
                sx={{
                  mb: 1.5,
                  fontFamily: FONT,
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: IOS.gray,
                }}
              >
                Continue my purchase — I agree that in case of a refund, the
                ticket price will be refunded, while service fees (for
                processing) are non-refundable.
              </Box>
            ) : null}

            {/* Buy Now — black (unchanged) */}
            <Box
              component="button"
              type="button"
              onClick={() => onBuy(ticket, qty)}
              sx={{
                mt: "auto",
                width: "100%",
                height: 48,
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                background: IOS.black,
                color: "#FFFFFF",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow: "0 6px 16px rgba(1,1,1,0.22)",
                transition: "transform 120ms ease, box-shadow 200ms ease, opacity 200ms ease",
                "& .chev": { transition: `transform 220ms ${tokens.motion.swift}` },
                "&:hover": { opacity: 0.94, boxShadow: "0 10px 22px rgba(1,1,1,0.28)" },
                "&:hover .chev": { transform: "translateX(3px)" },
                "&:active": { transform: "scale(0.985)" },
              }}
            >
              <Icon icon="ph:ticket-fill" width={16} />
              {isFree ? "Get Free Ticket" : "Buy Now"}
              <Box className="chev" component="span" sx={{ display: "inline-flex" }}>
                <Icon icon="ph:arrow-right-bold" width={14} />
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              mt: "auto",
              height: 48,
              borderRadius: "14px",
              background: IOS.fieldBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontSize: 13.5,
              fontWeight: 600,
              color: IOS.gray,
            }}
          >
            {state === "coming_soon" ? "Sale hasn't started" : "Unavailable"}
          </Box>
        )}
        </Box>
      </Box>
    </Box>
  );
}

function Notch({ side }: { side: "left" | "right" }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: "-9px",
        [side]: "-10px",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: PAGE_BG,
        border: `1px solid ${IOS.border}`,
      }}
    />
  );
}

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.85,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 500,
        color: IOS.darkGray,
      }}
    >
      <Box sx={{ display: "inline-flex", color: IOS.orange, flexShrink: 0 }}>
        <Icon icon={icon} width={14} />
      </Box>
      {children}
    </Box>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: FONT,
        fontSize: 13,
        mb: 0.4,
        color: muted ? IOS.gray : IOS.ink,
      }}
    >
      <Box component="span">{label}</Box>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {value}
      </Box>
    </Box>
  );
}

function StepBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Increase quantity" : "Decrease quantity"}
      sx={{
        appearance: "none",
        width: 40,
        height: 38,
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        fontFamily: FONT,
        fontSize: 19,
        fontWeight: 700,
        color: disabled ? IOS.gray : IOS.black,
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "color 150ms ease",
        "&:hover": disabled ? {} : { color: IOS.orange },
      }}
    >
      {label}
    </Box>
  );
}
