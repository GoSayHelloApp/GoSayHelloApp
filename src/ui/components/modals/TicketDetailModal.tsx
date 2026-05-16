import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Alert,
  Divider,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { QRCodeCanvas } from "qrcode.react";
import type { PurchasedTicket, PurchasedTicketPurchase } from "../../../models/responseModels/tickets";
import { formatPurchasedEventDateTime } from "../../../utils/ticketDisplayFormat";
import { buildTicketQrPayload } from "../../../utils/ticketQr";
import { useTransferTicketSingleMutation } from "../../../services/tickets/ticketApi";

export interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: PurchasedTicket | null;
  hideTransferButton?: boolean;
  onTransferred?: () => void;
}

/** Match PurchasedTickets / mobile handoff */
const ORANGE = "#E67E22";
const IOS_BLUE = "#007AFF";
const META_GREY = "#9E9E9E";

function formatMoney(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Typography variant="body2" sx={{ color: "#111", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}
      </Box>{" "}
      {value}
    </Typography>
  );
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  open,
  onClose,
  ticket,
  hideTransferButton = false,
  onTransferred,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(0);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferTicketSingle, { isLoading: transferring }] = useTransferTicketSingleMutation();

  const buildPages = useCallback((t: PurchasedTicket): PurchasedTicketPurchase[] => {
    if (t.purchases.length) return t.purchases;
    const fid = t.fallbackPurchasedTicketId;
    if (fid) {
      return [
        {
          purchasedTicketId: fid,
          quantity: t.purchasedQuantity || 1,
          totalPaid: t.totalPaidLabel,
          purchaseDate: "",
          isUsed: false,
        },
      ];
    }
    return [
      {
        purchasedTicketId: 0,
        quantity: t.purchasedQuantity || 1,
        totalPaid: t.totalPaidLabel,
        purchaseDate: "",
        isUsed: false,
      },
    ];
  }, []);

  const [localPages, setLocalPages] = useState<PurchasedTicketPurchase[]>([]);

  useEffect(() => {
    if (open && ticket) {
      setLocalPages(buildPages(ticket));
      setPage(0);
      setTransferModalOpen(false);
      setTransferEmail("");
      setTransferError(null);
    }
  }, [open, ticket, buildPages]);

  const current = localPages[page] ?? null;
  const qrValue =
    ticket && current && current.purchasedTicketId > 0
      ? buildTicketQrPayload(current.purchasedTicketId, ticket.eventId)
      : "";

  const { date, time } = ticket
    ? formatPurchasedEventDateTime(ticket.address1, ticket.startDate, ticket.startTime, ticket.endDate, ticket.endTime)
    : { date: "", time: "" };

  const resetLocal = useCallback(() => {
    setPage(0);
    setTransferModalOpen(false);
    setTransferEmail("");
    setTransferError(null);
  }, []);

  const handleClose = () => {
    resetLocal();
    onClose();
  };

  const downloadQrPng = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-qr-${ticket?.eventId ?? "event"}.png`;
    a.click();
  };

  const shareTicket = async () => {
    const canvas = qrRef.current;
    if (!canvas || !ticket) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], "ticket.png", { type: "image/png" })] })) {
        const file = new File([blob], "ticket-qr.png", { type: "image/png" });
        await navigator.share({ files: [file], title: ticket.ticketName, text: `${ticket.venueName} — ${ticket.ticketName}` });
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      await navigator.clipboard.writeText(qrValue);
      setTransferError(null);
    } catch {
      setTransferError("Could not share or copy. Try Save.");
    }
  };

  const submitSingleTransfer = async () => {
    setTransferError(null);
    if (!current?.purchasedTicketId || !transferEmail.trim()) {
      setTransferError("Enter a recipient email.");
      return;
    }
    try {
      const res = await transferTicketSingle({
        purchasedTicketId: current.purchasedTicketId,
        recipientEmail: transferEmail.trim(),
      }).unwrap();
      if (res?.success === false) {
        setTransferError(String(res?.message || "Transfer failed."));
        return;
      }
      setTransferModalOpen(false);
      setTransferEmail("");
      const nextPages = localPages.filter((_, i) => i !== page);
      onTransferred?.();
      if (nextPages.length === 0) {
        setTimeout(() => handleClose(), 600);
      } else {
        setLocalPages(nextPages);
        setPage((p) => Math.min(p, nextPages.length - 1));
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string };
      setTransferError(err?.data?.message || err?.message || "Transfer failed.");
    }
  };

  if (!ticket) return null;

  const pillButtonSx = {
    borderRadius: "9999px",
    fontWeight: 700,
    textTransform: "none" as const,
    py: 1.35,
    fontSize: "0.95rem",
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      aria-label="View ticket"
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0,0,0,0.45)" } },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? "100dvh" : "92vh",
          bgcolor: isMobile ? "#F0F0F0" : "#fff",
          boxShadow: isMobile ? "none" : "0 12px 48px rgba(0,0,0,0.12)",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: { xs: 12, sm: 16 },
          top: { xs: 12, sm: 16 },
          zIndex: 2,
          color: "#111",
        }}
        aria-label="Close"
      >
        <Icon icon="mdi:close" width={28} height={28} />
      </IconButton>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 7, sm: 8 },
          pb: { xs: 3, sm: 3 },
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        {localPages.length > 1 && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: "center", mt: -1 }}>
            <IconButton size="small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0} aria-label="Previous ticket">
              <Icon icon="mdi:chevron-left" />
            </IconButton>
            <Typography variant="body2" sx={{ color: META_GREY, fontWeight: 600 }}>
              {page + 1} / {localPages.length}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.min(localPages.length - 1, p + 1))}
              disabled={page >= localPages.length - 1}
              aria-label="Next ticket"
            >
              <Icon icon="mdi:chevron-right" />
            </IconButton>
          </Stack>
        )}

        {/* Main ticket card — orange border (mobile reference) */}
        <Box
          sx={{
            bgcolor: "#fff",
            border: `2px solid ${ORANGE}`,
            borderRadius: 3,
            p: { xs: 2.25, sm: 2.75 },
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <Stack spacing={0} alignItems="stretch">
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                border: `1px solid ${META_GREY}`,
                borderRadius: 2,
                bgcolor: "#FAFAFA",
                alignSelf: "center",
                width: "100%",
                maxWidth: 280,
                mx: "auto",
                position: "relative",
              }}
            >
              {qrValue ? (
                <QRCodeCanvas value={qrValue} size={200} level="Q" marginSize={2} ref={qrRef} />
              ) : (
                <Box sx={{ width: 200, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 1 }}>
                  <Typography variant="body2" sx={{ color: META_GREY }}>
                    QR code is not available for this ticket yet.
                  </Typography>
                </Box>
              )}
              {current?.isUsed && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "error.main",
                    color: "error.contrastText",
                    px: 1.25,
                    py: 0.35,
                    borderRadius: "9999px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Already used
                </Box>
              )}
            </Box>

            <Box sx={{ pt: 2.5 }}>
              <Typography sx={{ fontWeight: 700, color: "#111", fontSize: "1.1rem", lineHeight: 1.3 }}>{ticket.ticketName || "—"}</Typography>
              <Typography sx={{ mt: 0.75, fontSize: "0.9rem", color: "#111" }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  Type:
                </Box>{" "}
                {ticket.ticketTypeName || "—"}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: "0.9rem", color: "#111" }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  Price:
                </Box>{" "}
                {formatMoney(current?.totalPaid ?? ticket.totalPaidLabel)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />

            <Box>
              <Typography sx={{ fontWeight: 700, color: "#111", fontSize: "1.05rem", mb: 1 }}>{ticket.venueName || "—"}</Typography>
              <Stack spacing={0.5}>
                <DetailRow label="Type:" value={ticket.eventTypeName || "—"} />
                <DetailRow label="Organizer:" value={ticket.organizerName || "—"} />
                <DetailRow label="Date:" value={date || "—"} />
                <DetailRow label="Time:" value={time || "—"} />
                <DetailRow label="Address:" value={ticket.address1 || "—"} />
              </Stack>
            </Box>

            <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />

            <Stack spacing={0.5}>
              <DetailRow label="Buyer:" value={(ticket.buyerFirstName + " " + ticket.buyerLastName).trim() || "—"} />
              <DetailRow label="Quantity:" value={String(current?.quantity ?? ticket.purchasedQuantity ?? 0)} />
            </Stack>

            <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />

            <Typography
              align="center"
              sx={{
                color: ORANGE,
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              Powered by GoSayHELLO
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={1.25} sx={{ width: "100%", pt: 0.5 }}>
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              disableElevation
              fullWidth
              disabled={!qrValue}
              onClick={downloadQrPng}
              sx={{
                ...pillButtonSx,
                bgcolor: ORANGE,
                color: "#fff",
                "&:hover": { bgcolor: ORANGE, filter: "brightness(0.95)" },
                "&.Mui-disabled": { bgcolor: "rgba(230,126,34,0.4)", color: "#fff" },
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              disableElevation
              fullWidth
              disabled={!qrValue}
              onClick={shareTicket}
              sx={{
                ...pillButtonSx,
                bgcolor: "#111",
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.25)", color: "#fff" },
              }}
            >
              Share
            </Button>
          </Stack>

          {!hideTransferButton && current && current.purchasedTicketId > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "center", py: 0.25 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ORANGE }} aria-hidden />
              </Box>
              <Button
                variant="contained"
                disableElevation
                fullWidth
                onClick={() => {
                  setTransferError(null);
                  setTransferEmail("");
                  setTransferModalOpen(true);
                }}
                sx={{
                  ...pillButtonSx,
                  bgcolor: IOS_BLUE,
                  color: "#fff",
                  "&:hover": { bgcolor: "#0066D6" },
                }}
              >
                Transfer Ticket
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>

    <Dialog
      open={transferModalOpen}
      onClose={() => {
        if (transferring) return;
        setTransferModalOpen(false);
        setTransferEmail("");
        setTransferError(null);
      }}
      maxWidth="xs"
      fullWidth
      /* Stack above view-ticket dialog */
      disableScrollLock
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.5)" } } }}
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Transfer ticket</DialogTitle>
      <DialogContent>
        {transferError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {transferError}
          </Alert>
        )}
        <TextField
          label="Recipient email"
          type="email"
          value={transferEmail}
          onChange={(e) => setTransferEmail(e.target.value)}
          fullWidth
          size="small"
          sx={{ mt: 1 }}
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => {
            setTransferModalOpen(false);
            setTransferEmail("");
            setTransferError(null);
          }}
          disabled={transferring}
          sx={{ textTransform: "none", color: META_GREY }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={submitSingleTransfer}
          disabled={transferring}
          sx={{
            textTransform: "none",
            bgcolor: IOS_BLUE,
            "&:hover": { bgcolor: "#0066D6" },
          }}
        >
          {transferring ? "Sending…" : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default TicketDetailModal;
