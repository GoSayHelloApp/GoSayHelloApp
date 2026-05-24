import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { tokens } from "../../pages/events/invitation/tokens";
import { withAlpha } from "../../pages/events/invitation/useColorExtraction";
import type { PublicTicket } from "../../models/responseModels/publicEventTickets";
import AuthTextField from "../../ui/components/authCard/TextField";
import { getStripe } from "../../services/stripe/stripeClient";
import {
  buyPublicTicket,
  createPublicPaymentIntent,
  type BuyTicketResponse,
} from "../../services/events/publicCheckoutApi";
import type { PurchasedTicketGroup } from "../../models/responseModels/purchasedTickets";

const IOS = {
  ink: "#1C1C1E",
  gray: "#8E8E93",
  darkGray: "#555555",
  orange: "#FF9500",
  green: "#34C759",
  red: "#D14545",
  black: "#010101",
  fieldBg: "#F5F5F7",
} as const;

const FONT = tokens.font.poppins;
const formatPrice = (v: number) => `$${v.toFixed(2)}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "payment";

interface Props {
  open: boolean;
  ticket: PublicTicket | null;
  quantity: number;
  eventName?: string;
  onClose: () => void;
  /** Called on a successful purchase — parent renders the purchased tickets. */
  onPurchased: (
    groups: PurchasedTicketGroup[],
    email: string,
    message: string
  ) => void;
}

export default function TicketEmailModal({
  open,
  ticket,
  quantity,
  eventName,
  onClose,
  onPurchased,
}: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [kbInset, setKbInset] = useState(0);

  // Lift the bottom-sheet above the on-screen keyboard (mobile). The keyboard
  // overlays the layout viewport without resizing it, so we measure the gap via
  // visualViewport and pad the sheet up by that amount.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbInset(inset);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
      setKbInset(0);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setTouched(false);
      setBusy(false);
      setError(null);
      setClientSecret(null);
      setIntentId(null);
    }
  }, [open, ticket?.ticket_id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !ticket) return null;

  const ticketId = ticket.ticket_id;
  const price = ticket.price ?? 0;
  const isFree = price === 0;
  const total = price * quantity;
  const fee = Math.max(total * 0.15, 2.5);
  const payable = total + fee;

  const valid = EMAIL_RE.test(email.trim());
  const showError = touched && !valid;

  const goSuccess = (res: BuyTicketResponse) => {
    onPurchased(res.tickets ?? [], email.trim(), res.message || "");
  };

  const handleEmailContinue = async () => {
    setTouched(true);
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      if (isFree) {
        const res = await buyPublicTicket({
          ticketId,
          quantity,
          buyerEmail: email.trim(),
        });
        if (res.success) goSuccess(res);
        else setError(res.message || "Couldn't get your ticket.");
      } else {
        const res = await createPublicPaymentIntent({
          ticketId,
          quantity,
          buyerEmail: email.trim(),
        });
        if (res.success && res.clientSecret) {
          setClientSecret(res.clientSecret);
          setIntentId(res.paymentIntentId || null);
          setStep("payment");
        } else {
          setError(res.message || "Couldn't start checkout.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(16,18,23,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: { xs: "flex-end", sm: "center" },
        justifyContent: "center",
        p: { xs: 0, sm: 2 },
        // push the sheet above the on-screen keyboard on mobile
        pb: kbInset > 0 ? `${kbInset}px` : { xs: 0, sm: 2 },
        transition: "padding-bottom 180ms ease",
        animation: "ticketFadeIn 200ms ease",
        "@keyframes ticketFadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          maxHeight: { xs: "92vh", sm: "90vh" },
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: { xs: "24px 24px 0 0", sm: "20px" },
          p: { xs: 2.5, sm: 3 },
          fontFamily: FONT,
          boxShadow: "0 24px 64px rgba(16,18,23,0.28)",
          animation: "ticketSlideUp 280ms cubic-bezier(0.22,1,0.36,1)",
          "@keyframes ticketSlideUp": {
            from: { transform: "translateY(24px)", opacity: 0 },
            to: { transform: "translateY(0)", opacity: 1 },
          },
        }}
      >
        {/* close */}
        <Box
          component="button"
          type="button"
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            border: "none",
            borderRadius: "50%",
            background: IOS.fieldBg,
            color: IOS.darkGray,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            zIndex: 1,
            "&:hover": { background: "#ECECEF" },
          }}
        >
          <Icon icon="ph:x-bold" width={15} />
        </Box>

        <>
          {/* header */}
            <Box
              sx={{
                fontFamily: FONT,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: IOS.orange,
                mb: 0.75,
              }}
            >
              {step === "payment"
                ? "Payment"
                : isFree
                  ? "Get your ticket"
                  : "Almost there"}
            </Box>
            <Box sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: IOS.ink, lineHeight: 1.2, mb: 2, pr: 4 }}>
              {step === "payment" ? "Payment details" : "Where should we send it?"}
            </Box>

            {/* order summary */}
            <Box sx={{ background: IOS.fieldBg, borderRadius: "14px", p: 1.75, mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, alignItems: "flex-start" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: IOS.ink, lineHeight: 1.3 }}>
                    {ticket.ticket_name}
                  </Box>
                  {eventName ? (
                    <Box sx={{ fontFamily: FONT, fontSize: 12.5, color: IOS.gray, mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {eventName}
                    </Box>
                  ) : null}
                  <Box sx={{ fontFamily: FONT, fontSize: 12.5, color: IOS.darkGray, mt: 0.5 }}>
                    Quantity: <Box component="span" sx={{ fontWeight: 700, color: IOS.ink }}>{quantity}</Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Box sx={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: IOS.gray }}>
                    {isFree ? "Total" : "You pay"}
                  </Box>
                  <Box sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: isFree ? IOS.green : IOS.ink, letterSpacing: "-0.01em" }}>
                    {isFree ? "Free" : formatPrice(payable)}
                  </Box>
                </Box>
              </Box>
            </Box>

            {error ? <ErrorNote text={error} /> : null}

            {step === "email" ? (
              <>
                <AuthTextField
                  label="Email address"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  autoFocus
                  startAdornment={<Icon icon="ph:envelope-simple" width={20} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  error={showError}
                  valid={valid}
                  helperText={
                    showError
                      ? email.trim().length === 0
                        ? "Email is required"
                        : "Enter a valid email address"
                      : undefined
                  }
                />

                <Box sx={{ mb: 2 }} />

                <PrimaryButton
                  busy={busy}
                  label={isFree ? "Get my ticket" : "Continue"}
                  onClick={handleEmailContinue}
                />
              </>
            ) : null}

            {step === "payment" && clientSecret ? (
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: IOS.orange,
                      colorText: IOS.ink,
                      fontFamily: "Poppins, sans-serif",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <PaymentForm
                  amountLabel={formatPrice(payable)}
                  ticketId={ticketId}
                  quantity={quantity}
                  intentId={intentId || ""}
                  onComplete={goSuccess}
                />
              </Elements>
            ) : null}
        </>
      </Box>
    </Box>
  );
}

/* ── Stripe payment step ── */
function PaymentForm({
  amountLabel,
  ticketId,
  quantity,
  intentId,
  onComplete,
}: {
  amountLabel: string;
  ticketId: number;
  quantity: number;
  intentId: string;
  onComplete: (res: BuyTicketResponse) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements || paying) return;
    setError(null);
    setPaying(true);
    try {
      const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (stripeErr) {
        setError(stripeErr.message || "Payment failed. Please try again.");
        setPaying(false);
        return;
      }
      if (paymentIntent && paymentIntent.status === "succeeded") {
        const res = await buyPublicTicket({ ticketId, quantity, intentId });
        if (res.success) {
          onComplete(res);
          return; // component unmounts on step change
        }
        setError(res.message || "Couldn't issue your ticket.");
        setPaying(false);
      } else {
        setError("Payment was not completed.");
        setPaying(false);
      }
    } catch {
      setError("Something went wrong during payment.");
      setPaying(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <PaymentElement options={{ layout: "tabs" }} />
      </Box>
      {error ? <ErrorNote text={error} /> : null}
      <PrimaryButton
        busy={paying}
        label={`Pay ${amountLabel}`}
        onClick={handlePay}
        disabled={!stripe}
      />
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, fontFamily: FONT, fontSize: 11, color: IOS.gray }}>
        <Icon icon="ph:lock-simple-fill" width={12} />
        Secured by Stripe
      </Box>
    </>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0.75,
        mb: 2,
        px: 1.5,
        py: 1.25,
        borderRadius: "12px",
        background: withAlpha(IOS.red, 0.08),
        border: `1px solid ${withAlpha(IOS.red, 0.2)}`,
        color: "#9F2A2A",
        fontFamily: FONT,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <Box sx={{ display: "inline-flex", mt: "1px", flexShrink: 0 }}>
        <Icon icon="ph:warning-circle-fill" width={15} />
      </Box>
      {text}
    </Box>
  );
}

function PrimaryButton({
  label,
  onClick,
  busy,
  disabled,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      sx={{
        width: "100%",
        height: 50,
        border: "none",
        borderRadius: "14px",
        cursor: busy || disabled ? "default" : "pointer",
        background: IOS.black,
        color: "#FFFFFF",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 15,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        outline: "none",
        opacity: busy || disabled ? 0.7 : 1,
        WebkitTapHighlightColor: "transparent",
        boxShadow: "0 6px 16px rgba(1,1,1,0.2)",
        transition: "transform 120ms ease, opacity 200ms ease",
        "&:active": busy || disabled ? {} : { transform: "scale(0.985)" },
      }}
    >
      {busy ? (
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "#FFFFFF",
            animation: "ticketSpin 700ms linear infinite",
            "@keyframes ticketSpin": { to: { transform: "rotate(360deg)" } },
          }}
        />
      ) : (
        <>
          {label}
          <Icon icon="ph:arrow-right-bold" width={15} />
        </>
      )}
    </Box>
  );
}
