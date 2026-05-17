import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Collapse,
  Slider,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  useGetTicketsByEventQuery,
  useCreatePaymentIntentMutation,
  useBuyTicketMutation,
  useLazyGetPurchasedTicketByTicketIdQuery,
} from "../../../services/tickets/ticketApi";
import type { TicketListItem } from "../../../models/responseModels/tickets";
import type { PurchasedTicket } from "../../../models/responseModels/tickets";
import { parseTicketSalesDateTime } from "../../../utils/ticketDates";
import {
  processingFeeUsd,
  feeHelloDiscountUsd,
  payableUsd,
  payableCents,
  maxTokensRedeemableAgainstFee,
} from "../../../utils/ticketPricing";
import { formatTimezoneHeader, resolveEventIanaTimeZone } from "../../../utils/eventTimezone";
import { formatSalesWindowLabel } from "../../../utils/ticketDisplayFormat";
import TicketDetailModal from "./TicketDetailModal";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";

interface BuyTicketsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  userId: number;
  eventLat?: number | null;
  eventLong?: number | null;
}

function availableCount(t: TicketListItem): number {
  const sold = t.quantitySold ?? 0;
  return Math.max(0, t.quantity - sold);
}

type CardState = "coming_soon" | "buy" | "sold_out" | "expired" | "purchased";

function cardState(t: TicketListItem, now: Date): CardState {
  const start = parseTicketSalesDateTime(t.salesStartDate);
  const end = parseTicketSalesDateTime(t.salesEndDate);
  if (!Number.isNaN(start.getTime()) && now < start) return "coming_soon";
  if (!Number.isNaN(end.getTime()) && now > end) return "expired";
  const sold = t.quantitySold ?? 0;
  if (sold >= t.quantity) return "sold_out";
  const owned = t.userPurchasedCount ?? 0;
  if (owned > 0) return "purchased";
  return "buy";
}

function StripePayBlock({
  onPaid,
  onError,
}: {
  onPaid: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (error) {
        onError(error.message || "Payment failed.");
        return;
      }
      if (paymentIntent && paymentIntent.status === "succeeded" && paymentIntent.id) {
        onPaid(paymentIntent.id);
        return;
      }
      if (paymentIntent?.status === "processing") {
        onError("Payment is processing. Check back shortly.");
        return;
      }
      onError("Payment was not completed.");
    } catch (e: unknown) {
      const err = e as { message?: string };
      onError(err?.message || "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <PaymentElement />
      <Button variant="contained" color="primary" disabled={!stripe || busy} onClick={handle} size="large">
        {busy ? "ProcessingΓÇª" : "Pay & confirm"}
      </Button>
    </Stack>
  );
}

const BuyTicketsModal: React.FC<BuyTicketsModalProps> = ({ open, onClose, eventId, userId, eventLat, eventLong }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selected, setSelected] = useState<TicketListItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tokenRedemption, setTokenRedemption] = useState(0);
  const [helloOpen, setHelloOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"pick" | "pay">("pick");
  const [detailTicket, setDetailTicket] = useState<PurchasedTicket | null>(null);

  const { data, isLoading, refetch } = useGetTicketsByEventQuery(
    { eventId, ...(userId ? { requestedUserId: userId } : {}), isUserView: true },
    { skip: !open || !eventId }
  );
  const [createPaymentIntent, { isLoading: creatingPi }] = useCreatePaymentIntentMutation();
  const [buyTicket, { isLoading: buying }] = useBuyTicketMutation();
  const [fetchPurchasedDetail] = useLazyGetPurchasedTicketByTicketIdQuery();

  const tickets = useMemo(() => data?.tickets ?? [], [data]);
  const walletInfo = data?.walletInfo;
  const walletTokens = walletInfo?.walletTokens ?? 0;
  const walletActive = walletInfo?.isWalletActive ?? false;

  const eventTz = useMemo(() => resolveEventIanaTimeZone(eventLat ?? undefined, eventLong ?? undefined), [eventLat, eventLong]);
  const tzHeader = useMemo(() => formatTimezoneHeader(eventTz), [eventTz]);

  const stripePromise = useMemo(() => (stripePublishableKey ? loadStripe(stripePublishableKey) : null), []);

  const visibleTickets = useMemo(() => {
    const n = new Date();
    return tickets.filter((t) => cardState(t, n) !== "expired");
  }, [tickets]);

  const now = new Date();

  useEffect(() => {
    setCheckoutStep("pick");
    setClientSecret(null);
  }, [selected?.ticketId]);

  const maxQty = useMemo(() => (selected ? availableCount(selected) : 0), [selected]);

  const unitPrice = selected ? Number(selected.price) || 0 : 0;
  const subtotal = unitPrice * quantity;
  const fee = processingFeeUsd(subtotal);
  const discount = feeHelloDiscountUsd(subtotal, tokenRedemption);
  const payable = payableUsd(subtotal, tokenRedemption);
  const payableC = payableCents(subtotal, tokenRedemption);

  const maxRedeemableTokens = useMemo(() => {
    if (!walletActive || unitPrice <= 0) return 0;
    return maxTokensRedeemableAgainstFee(subtotal, walletTokens);
  }, [walletActive, unitPrice, subtotal, walletTokens]);

  useEffect(() => {
    if (tokenRedemption > maxRedeemableTokens) setTokenRedemption(maxRedeemableTokens);
  }, [maxRedeemableTokens, tokenRedemption]);

  const reset = () => {
    setSelected(null);
    setQuantity(1);
    setTokenRedemption(0);
    setHelloOpen(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    setClientSecret(null);
    setCheckoutStep("pick");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startOrContinuePurchase = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!selected || !userId) {
      setSubmitError("Select a ticket.");
      return;
    }
    const avail = availableCount(selected);
    if (avail < 1) {
      setSubmitError("This ticket is sold out.");
      return;
    }
    if (quantity < 1 || quantity > avail) {
      setSubmitError(`Choose a quantity between 1 and ${avail}.`);
      return;
    }

    const isFree = unitPrice <= 0;

    try {
      if (isFree || payableC <= 0) {
        const res = await buyTicket({
          ticketId: selected.ticketId,
          quantity,
          userId,
          intentId: "",
          totalPaidPayment: payable,
          tokenRedemption,
          eventId,
        }).unwrap();
        const ok = (res as { success?: boolean })?.success !== false;
        if (ok) {
          setSubmitSuccess("Ticket purchased.");
          refetch();
          setTimeout(() => handleClose(), 1500);
        } else {
          setSubmitError(String((res as { message?: string })?.message || "Purchase failed."));
        }
        return;
      }

      if (checkoutStep === "pick") {
        if (!stripePublishableKey || !stripePromise) {
          setSubmitError("Card payments are not configured (missing Stripe publishable key).");
          return;
        }
        const pi = await createPaymentIntent({
          ticketId: selected.ticketId,
          quantity,
          amount: payableC,
          currency: "usd",
          tokenRedemption,
        }).unwrap();
        const secret =
          (pi as { clientSecret?: string }).clientSecret ?? (pi as { client_secret?: string }).client_secret ?? "";
        if (!secret) {
          setSubmitError("Could not start payment. Try again later.");
          return;
        }
        setClientSecret(secret);
        setCheckoutStep("pay");
        return;
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string };
      setSubmitError(err?.data?.message || err?.message || "Purchase failed.");
    }
  };

  const finalizeAfterStripe = async (intentId: string) => {
    if (!selected || !userId) return;
    try {
      const res = await buyTicket({
        ticketId: selected.ticketId,
        quantity,
        userId,
        intentId,
        totalPaidPayment: payable,
        tokenRedemption,
        eventId,
      }).unwrap();
      const ok = (res as { success?: boolean })?.success !== false;
      if (ok) {
        setSubmitSuccess("Ticket purchased.");
        refetch();
        setCheckoutStep("pick");
        setClientSecret(null);
        setTimeout(() => handleClose(), 1500);
      } else {
        setSubmitError(String((res as { message?: string })?.message || "Could not confirm purchase."));
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string };
      setSubmitError(err?.data?.message || err?.message || "Could not confirm purchase.");
    }
  };

  const handleViewTicket = async (t: TicketListItem) => {
    setSubmitError(null);
    try {
      const row = await fetchPurchasedDetail({ ticketId: t.ticketId }).unwrap();
      if (row) setDetailTicket(row);
      else setSubmitError("Could not load ticket details.");
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string };
      setSubmitError(err?.data?.message || err?.message || "Could not load ticket details.");
    }
  };

  const busy = creatingPi || buying;
  const showHello = walletActive && unitPrice > 0;

  const salesLabel = useCallback((t: TicketListItem) => {
    const { start, end } = formatSalesWindowLabel(t.salesStartDate, t.salesEndDate);
    return `${start} ΓåÆ ${end}`;
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            minHeight: isMobile ? "100dvh" : "auto",
            maxHeight: isMobile ? "100dvh" : "85vh",
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: { xs: 8, md: 16 }, top: { xs: 8, md: 16 }, zIndex: 1 }}
          aria-label="Close"
        >
          <Icon icon="mdi:close" fontSize={24} />
        </IconButton>

        <DialogTitle sx={{ pr: 6, pt: 2 }}>Buy Tickets</DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 },
            pt: `${theme.spacing(3)} !important`,
            overflow: "auto",
          }}
        >
          {!userId ? (
            <Alert severity="info">Sign in to purchase tickets.</Alert>
          ) : isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : visibleTickets.length === 0 ? (
            <Typography color="text.secondary">No tickets are available for this event right now.</Typography>
          ) : (
            <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">
                {tzHeader}
              </Typography>
              {submitError && (
                <Alert severity="error" onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}
              {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}

              <Typography variant="subtitle2" color="text.secondary">
                Select a ticket
              </Typography>

              {visibleTickets.map((t) => {
                const avail = availableCount(t);
                const state = cardState(t, now);
                const isSel = selected?.ticketId === t.ticketId;
                const stateChip =
                  state === "coming_soon"
                    ? { label: "Coming soon", color: "default" as const }
                    : state === "sold_out"
                    ? { label: "Sold out", color: "error" as const }
                    : state === "purchased"
                    ? { label: "Purchased", color: "success" as const }
                    : { label: "Buy now", color: "primary" as const };

                return (
                  <Card
                    key={t.ticketId}
                    variant="outlined"
                    onClick={() => {
                      if (state === "sold_out" || state === "coming_soon") return;
                      setSelected(t);
                      setCheckoutStep("pick");
                      setClientSecret(null);
                      setQuantity(Math.min(quantity, Math.max(1, avail)) || 1);
                    }}
                    sx={{
                      cursor: state === "buy" || state === "purchased" ? "pointer" : "default",
                      opacity: state === "sold_out" || state === "coming_soon" ? 0.72 : 1,
                      borderColor: isSel ? "primary.main" : undefined,
                      borderWidth: isSel ? 2 : 1,
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Typography fontWeight="bold">{t.ticketName}</Typography>
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography color="primary" fontWeight={600}>
                            {t.price === 0 ? "Free" : `$${Number(t.price).toFixed(2)}`}
                          </Typography>
                          <Chip size="small" label={stateChip.label} color={stateChip.color} variant={stateChip.color === "default" ? "outlined" : "filled"} />
                        </Stack>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Sales: {salesLabel(t)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t.ticketTypeName ?? ""} ΓÇó {avail}/{t.quantity} left
                      </Typography>
                      {t.description && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {t.description}
                        </Typography>
                      )}
                      {state === "purchased" && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTicket(t);
                          }}
                          startIcon={<Icon icon="mdi:ticket-confirmation" />}
                        >
                          View ticket
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {selected && maxQty > 0 && cardState(selected, now) === "buy" && (
                <>
                  <TextField
                    label="Quantity"
                    type="number"
                    inputProps={{ min: 1, max: maxQty }}
                    value={quantity}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isNaN(n)) setQuantity(1);
                      else setQuantity(Math.min(maxQty, Math.max(1, n)));
                    }}
                    fullWidth
                    size="small"
                  />

                  {showHello && (
                    <>
                      <Button size="small" onClick={() => setHelloOpen((v) => !v)} endIcon={<Icon icon={helloOpen ? "mdi:chevron-up" : "mdi:chevron-down"} />}>
                        HELLO tokens ({walletTokens.toLocaleString()} available)
                      </Button>
                      <Collapse in={helloOpen}>
                        <Typography variant="caption" color="text.secondary">
                          1,000 HELLO = $1.00 off the processing fee only (max {maxRedeemableTokens.toLocaleString()} for
                          this order)
                        </Typography>
                        <Slider
                          value={tokenRedemption}
                          min={0}
                          max={maxRedeemableTokens}
                          step={100}
                          onChange={(_, v) => setTokenRedemption(v as number)}
                          disabled={maxRedeemableTokens <= 0}
                        />
                        <Typography variant="body2">Using {tokenRedemption.toLocaleString()} HELLO</Typography>
                      </Collapse>
                    </>
                  )}

                  <Stack spacing={0.5} sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
                    <Typography variant="body2">Total (tickets): ${subtotal.toFixed(2)}</Typography>
                    <Typography variant="body2">Processing fee: ${fee.toFixed(2)}</Typography>
                    {discount > 0 && (
                      <Typography variant="body2" color="success.main">
                        HELLO (fee): ΓêÆ${discount.toFixed(2)}
                      </Typography>
                    )}
                    <Typography fontWeight={700}>Payable: ${payable.toFixed(2)}</Typography>
                  </Stack>

                  {checkoutStep === "pay" && clientSecret && stripePromise && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePayBlock
                        onPaid={(id) => finalizeAfterStripe(id)}
                        onError={(msg) => setSubmitError(msg)}
                      />
                    </Elements>
                  )}

                  {checkoutStep === "pick" && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={busy}
                      onClick={startOrContinuePurchase}
                      startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:cart" />}
                    >
                      {busy ? "ProcessingΓÇª" : unitPrice <= 0 || payableC <= 0 ? "Complete purchase" : "Continue to payment"}
                    </Button>
                  )}
                </>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <TicketDetailModal open={Boolean(detailTicket)} onClose={() => setDetailTicket(null)} ticket={detailTicket} hideTransferButton={false} />
    </>
  );
};

export default BuyTicketsModal;
