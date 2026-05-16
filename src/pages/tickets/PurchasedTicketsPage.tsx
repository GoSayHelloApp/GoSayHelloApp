import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Fab,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  useGetPurchasedTicketsQuery,
  useGetTicketTransfersQuery,
  useTransferTicketsMutation,
} from "../../services/tickets/ticketApi";
import type { PurchasedTicket } from "../../models/responseModels/tickets";
import { formatPurchasedEventDateTime } from "../../utils/ticketDisplayFormat";
import TicketDetailModal from "../../ui/components/modals/TicketDetailModal";

/** Reference UI (mobile) */
const ORANGE = "#E67E22";
const IOS_BLUE = "#007AFF";
const PRICE_GREEN = "#2E7D32";
const SEGMENT_BG = "#1C1C1E";
const META_GREY = "#6B6B6B";

function formatMoney(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

/** Count phrase only used with "ticket" → correct plural (was "2 ticket"). */
function tabLabel(n: number, singular: string): string {
  if (n === 1) return `1 ${singular}`;
  return `${n} ${singular}s`;
}

const PurchasedTicketsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  /** `theme.shape.borderRadius` (8). In `sx`, numeric `borderRadius: n` = n×this value — never pass raw `br` as a number. */
  const br = theme.shape.borderRadius;
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState<PurchasedTicket | null>(null);
  const [detailHideTransfer, setDetailHideTransfer] = useState(false);
  const [transferFor, setTransferFor] = useState<PurchasedTicket | null>(null);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferQty, setTransferQty] = useState(1);
  const [transferErr, setTransferErr] = useState<string | null>(null);

  const { data: mine = [], isFetching: loadingMine } = useGetPurchasedTicketsQuery(undefined, { skip: tab !== 0 });
  const { data: sent = [], isFetching: loadingSent } = useGetTicketTransfersQuery({ transferType: 1 }, { skip: tab !== 1 });
  const { data: recv = [], isFetching: loadingRecv } = useGetTicketTransfersQuery({ transferType: 2 }, { skip: tab !== 2 });

  const [transferTickets, { isLoading: transferring }] = useTransferTicketsMutation();

  const list = tab === 0 ? mine : tab === 1 ? sent : recv;
  const loading = tab === 0 ? loadingMine : tab === 1 ? loadingSent : loadingRecv;

  const openDetail = (t: PurchasedTicket, hideTransfer: boolean) => {
    setDetailHideTransfer(hideTransfer);
    setDetail(t);
  };

  const countLabel = (t: PurchasedTicket) => {
    const n = t.purchasedQuantity || t.purchases.reduce((s, p) => s + p.quantity, 0) || 0;
    if (tab === 0) return `You have ${tabLabel(n, "ticket")}`;
    if (tab === 1) return `Sent ${tabLabel(n, "ticket")}`;
    return `Received ${tabLabel(n, "ticket")}`;
  };

  const submitBulkTransfer = async () => {
    setTransferErr(null);
    if (!transferFor || !transferEmail.trim()) {
      setTransferErr("Enter recipient email.");
      return;
    }
    const maxQ = transferFor.purchasedQuantity || 1;
    if (transferQty < 1 || transferQty > maxQ) {
      setTransferErr(`Quantity must be between 1 and ${maxQ}.`);
      return;
    }
    try {
      const res = await transferTickets({
        ticketId: transferFor.ticketId,
        recipientEmail: transferEmail.trim(),
        quantity: transferQty,
      }).unwrap();
      if (res?.success === false) {
        setTransferErr(String(res?.message || "Transfer failed."));
        return;
      }
      setTransferFor(null);
      setTransferEmail("");
      setTransferQty(1);
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string };
      setTransferErr(err?.data?.message || err?.message || "Transfer failed.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        maxWidth: 720,
        mx: "auto",
        px: { xs: 2, sm: 2.5 },
        pt: { xs: 1, sm: 2 },
        pb: { xs: 10, sm: 12 },
        position: "relative",
        bgcolor: "#FAFAFA",
      }}
    >
      {/* Header — back, title, wallet */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, minHeight: 48 }}>
        <IconButton edge="start" onClick={() => navigate(-1)} aria-label="Back" sx={{ color: "#111" }}>
          <Icon icon="mdi:chevron-left" width={32} height={32} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111", textAlign: "center", flex: 1 }}>
          My Tickets
        </Typography>
        <IconButton
          onClick={() => navigate("/wallet")}
          aria-label="Wallet"
          sx={{
            bgcolor: ORANGE,
            color: "#111",
            width: 44,
            height: 44,
            borderRadius: "50%",
            "&:hover": { bgcolor: ORANGE, filter: "brightness(1.05)" },
          }}
        >
          <Icon icon="mdi:wallet" width={22} height={22} />
        </IconButton>
      </Stack>

      {/* Filter tabs — pill bar, orange active (not theme primary) */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(typeof newValue === "number" ? newValue : Number(newValue))}
        variant="fullWidth"
        /* Do not use textColor="inherit" — theme text.primary is dark, so inactive labels vanish on SEGMENT_BG */
        TabIndicatorProps={{ sx: { display: "none" } }}
        sx={{
          mb: 2.5,
          minHeight: 52,
          p: theme.spacing(0.75),
          bgcolor: SEGMENT_BG,
          color: "#fff",
          /* String so MUI does not multiply by theme.shape.borderRadius (br*50 as number → huge radius) */
          borderRadius: "9999px",
          overflow: "visible",
          "& .MuiTabs-scroller": {
            overflow: "visible !important",
          },
          "& .MuiTabs-flexContainer": { gap: theme.spacing(0.75) },
          "& .MuiTab-root": {
            flex: 1,
            minWidth: 0,
            minHeight: 40,
            py: 1,
            px: 1,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            /* One theme unit (8px) — rounded segments inside the pill rail; not square (0) */
            borderRadius: "9999px",
            opacity: 1,
            /* Inactive: bright on dark rail (MUI defaults would use dark theme.palette.text.*) */
            color: "rgba(255,255,255,0.95) !important",
            transition: "background-color 0.15s ease, color 0.15s ease",
            "&.Mui-selected": {
              color: "#fff !important",
              bgcolor: `${ORANGE} !important`,
            },
            "&.Mui-selected:hover": {
              color: "#fff !important",
              bgcolor: `${ORANGE} !important`,
            },
            "&:hover:not(.Mui-selected)": {
              bgcolor: "rgba(255,255,255,0.1)",
              color: "#fff !important",
            },
          },
        }}
      >
        <Tab label="All" value={0} disableRipple />
        <Tab label="Sent" value={1} disableRipple />
        <Tab label="Received" value={2} disableRipple />
      </Tabs>

      {loading && list.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: ORANGE }} />
        </Box>
      ) : list.length === 0 ? (
        <Typography sx={{ color: META_GREY, textAlign: "center", py: 4 }}>No tickets here yet.</Typography>
      ) : (
        <Stack spacing={2.5}>
          {list.map((t) => {
            const { date, time } = formatPurchasedEventDateTime(t.address1, t.startDate, t.startTime, t.endDate, t.endTime);
            const headline = t.venueName?.trim() || t.ticketName || "Event";
            const ticketSubtitle = t.ticketTypeName?.trim() || t.ticketName?.trim() || "—";

            return (
              <Card
                key={`${t.ticketId}-${t.eventId}-${tab}`}
                elevation={0}
                sx={{
                  /* 2 units = 2×theme.shape.borderRadius — do not use br*2 as number (16→128px) */
                  borderRadius: 2,
                  boxShadow: "0px 4px 24px rgba(0,0,0,0.08)",
                  bgcolor: "#fff",
                  overflow: "visible",
                }}
              >
                <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
                  <Stack spacing={1.75}>
                    {/*
                      Mobile reference: thumbnail only (left); title / category / dates / price (top-right);
                      then full-width organizer (orange), ticket type (bold), address, count.
                    */}
                    <Box
                      sx={(theme) => ({
                        display: "grid",
                        gridTemplateColumns: "88px 1fr",
                        columnGap: theme.spacing(1.75),
                        rowGap: theme.spacing(0.5),
                      })}
                    >
                      <Box
                        sx={{
                          gridColumn: 1,
                          gridRow: "1 / 5",
                          width: 88,
                          alignSelf: "start",
                        }}
                      >
                        {t.eventImage ? (
                          <Box
                            component="img"
                            src={t.eventImage}
                            alt=""
                            sx={{
                              width: 88,
                              height: 88,
                              borderRadius: `${br}px`,
                              objectFit: "cover",
                              bgcolor: "#ECECEC",
                              display: "block",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 88,
                              height: 88,
                              borderRadius: `${br}px`,
                              bgcolor: "#ECECEC",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon icon="mdi:image-outline" width={36} color={META_GREY} />
                          </Box>
                        )}
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap={1}
                        sx={{ gridColumn: 2, gridRow: 1, minWidth: 0 }}
                      >
                        <Typography
                          sx={{
                            color: ORANGE,
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            lineHeight: 1.25,
                            flex: 1,
                          }}
                        >
                          {headline}
                        </Typography>
                        <Typography sx={{ color: PRICE_GREEN, fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
                          {formatMoney(t.totalPaidLabel)}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          gridColumn: 2,
                          gridRow: 2,
                          fontWeight: 700,
                          color: "#111",
                          fontSize: "0.95rem",
                          minWidth: 0,
                        }}
                      >
                        {t.eventTypeName || "—"}
                      </Typography>
                      <Typography
                        sx={{ gridColumn: 2, gridRow: 3, color: META_GREY, fontSize: "0.875rem", lineHeight: 1.4, minWidth: 0 }}
                      >
                        {date}
                      </Typography>
                      <Typography
                        sx={{ gridColumn: 2, gridRow: 4, color: META_GREY, fontSize: "0.875rem", lineHeight: 1.4, minWidth: 0 }}
                      >
                        {time}
                      </Typography>

                      <Typography
                        sx={{
                          gridColumn: "1 / -1",
                          gridRow: 5,
                          color: ORANGE,
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          lineHeight: 1.35,
                          mt: 0.25,
                        }}
                      >
                        {t.organizerName || "—"}
                      </Typography>
                      <Typography
                        sx={{
                          gridColumn: "1 / -1",
                          gridRow: 6,
                          fontWeight: 700,
                          color: "#111",
                          fontSize: "0.95rem",
                          lineHeight: 1.35,
                        }}
                      >
                        {ticketSubtitle}
                      </Typography>
                      <Typography
                        sx={{
                          gridColumn: "1 / -1",
                          gridRow: 7,
                          color: META_GREY,
                          fontSize: "0.85rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {t.address1 || "—"}
                      </Typography>
                      <Typography
                        sx={{
                          gridColumn: "1 / -1",
                          gridRow: 8,
                          color: IOS_BLUE,
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {countLabel(t)}
                      </Typography>
                    </Box>

                    {(tab === 1 || tab === 2) && (t.counterpartyName || t.counterpartyEmail) && (
                      <Typography sx={{ color: META_GREY, fontSize: "0.85rem" }}>
                        {tab === 1 ? "To" : "From"}: {t.counterpartyName || "—"}
                        {t.counterpartyEmail ? ` (${t.counterpartyEmail})` : ""}
                      </Typography>
                    )}

                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1.25}>
                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          onClick={() => navigate(`/events/${t.eventId}/details`)}
                          sx={{
                            bgcolor: ORANGE,
                            color: "#fff",
                            fontWeight: 700,
                            textTransform: "none",
                            py: 1.35,
                            "&:hover": { bgcolor: ORANGE, filter: "brightness(0.95)" },
                          }}
                        >
                          View Event
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          onClick={() => openDetail(t, tab !== 0)}
                          sx={{
                            bgcolor: "#111",
                            color: "#fff",
                            fontWeight: 700,
                            textTransform: "none",
                            py: 1.35,
                            "&:hover": { bgcolor: "#333" },
                          }}
                        >
                          View Ticket
                        </Button>
                      </Stack>
                      {tab === 0 && (t.purchasedQuantity || 0) > 0 && (
                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          onClick={() => {
                            setTransferFor(t);
                            setTransferQty(1);
                            setTransferEmail("");
                            setTransferErr(null);
                          }}
                          sx={{
                            bgcolor: IOS_BLUE,
                            color: "#fff",
                            fontWeight: 700,
                            textTransform: "none",
                            py: 1.35,
                            "&:hover": { bgcolor: "#0066D6" },
                          }}
                        >
                          Transfer Ticket
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Fab
        aria-label="Discover events"
        onClick={() => navigate("/nearby")}
        sx={(theme) => ({
          position: "fixed",
          right: { xs: 20, sm: 32 },
          bottom: { xs: 24, sm: 32 },
          zIndex: theme.zIndex.fab,
          bgcolor: "#111",
          color: ORANGE,
          width: 56,
          height: 56,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          "&:hover": { bgcolor: "#222", color: ORANGE },
        })}
      >
        <Icon icon="mdi:plus" width={32} height={32} />
      </Fab>

      <TicketDetailModal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        ticket={detail}
        hideTransferButton={detailHideTransfer}
        onTransferred={() => {
          /* RTK invalidates PurchasedTickets */
        }}
      />

      <Dialog
        open={Boolean(transferFor)}
        onClose={() => setTransferFor(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Transfer tickets</DialogTitle>
        <DialogContent>
          {transferErr && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {transferErr}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Recipient email"
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Quantity"
              type="number"
              inputProps={{ min: 1, max: transferFor?.purchasedQuantity ?? 1 }}
              value={transferQty}
              onChange={(e) => setTransferQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTransferFor(null)} sx={{ textTransform: "none", color: META_GREY }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={submitBulkTransfer}
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
    </Box>
  );
};

export default PurchasedTicketsPage;
