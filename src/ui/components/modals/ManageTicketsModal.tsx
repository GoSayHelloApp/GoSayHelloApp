import React, { useState, useMemo } from "react";
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
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  useGetTicketTypesQuery,
  useGetTicketsByEventQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} from "../../../services/tickets/ticketApi";
import type { TicketListItem } from "../../../models/responseModels/tickets";
import { parseTicketSalesDateTime } from "../../../utils/ticketDates";

export type ManageTicketsView = "list" | "create" | "edit";

interface ManageTicketsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  userId: number;
  eventTimezone?: string; // e.g. "America/New_York" for future use; currently use UTC
}

// API uses naive local datetime string 'YYYY-MM-DD HH:mm:ss' for sales (no timezone shift).
const DATE_FORMAT_API = "YYYY-MM-DD HH:mm:ss";

function toApiSalesDateTimeString(d: Dayjs | null): string {
  if (!d || !d.isValid()) return "";
  return d.format(DATE_FORMAT_API);
}

function fromSalesApiString(s: string): Dayjs | null {
  if (!s) return null;
  const instant = parseTicketSalesDateTime(s);
  if (Number.isNaN(instant.getTime())) return null;
  return dayjs(instant);
}

const defaultForm = {
  ticketName: "",
  price: 0,
  quantity: 0,
  salesStartDate: "" as string,
  salesEndDate: "" as string,
  ticketTypeId: 0,
  description: "",
};

const ManageTicketsModal: React.FC<ManageTicketsModalProps> = ({
  open,
  onClose,
  eventId,
  userId,
  eventTimezone,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // full-screen modal on tablet and below
  const [view, setView] = useState<ManageTicketsView>("list");
  const [editingTicket, setEditingTicket] = useState<TicketListItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [salesStart, setSalesStart] = useState<Dayjs | null>(null);
  const [salesEnd, setSalesEnd] = useState<Dayjs | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: ticketTypesData, isLoading: typesLoading } = useGetTicketTypesQuery(undefined, {
    skip: !open,
  });
  const { data: ticketsData, isLoading: ticketsLoading } = useGetTicketsByEventQuery(
    { eventId, requestedUserId: userId, isUserView: false },
    { skip: !open || !eventId }
  );
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: updating }] = useUpdateTicketMutation();
  const [deleteTicket, { isLoading: deleting }] = useDeleteTicketMutation();

  const ticketTypes = useMemo(
    () => ticketTypesData?.ticketTypes ?? [],
    [ticketTypesData?.ticketTypes]
  );
  const tickets = ticketsData?.tickets ?? [];
  const isFreeType = useMemo(() => {
    const selected = ticketTypes.find((t) => t.ticket_types_id === form.ticketTypeId);
    return selected?.ticket_types_name?.toLowerCase() === "free";
  }, [ticketTypes, form.ticketTypeId]);

  const resetForm = () => {
    setForm(defaultForm);
    setSalesStart(null);
    setSalesEnd(null);
    setEditingTicket(null);
    setSubmitError(null);
  };

  const handleClose = () => {
    setView("list");
    resetForm();
    onClose();
  };

  const openCreate = () => {
    resetForm();
    setView("create");
  };

  const openEdit = (ticket: TicketListItem) => {
    setEditingTicket(ticket);
    setForm({
      ticketName: ticket.ticketName,
      price: ticket.price,
      quantity: ticket.quantity,
      salesStartDate: ticket.salesStartDate,
      salesEndDate: ticket.salesEndDate,
      ticketTypeId: ticket.ticketTypeId,
      description: ticket.description || "",
    });
    setSalesStart(fromSalesApiString(ticket.salesStartDate));
    setSalesEnd(fromSalesApiString(ticket.salesEndDate));
    setView("edit");
    setSubmitError(null);
  };

  const backToList = () => {
    setView("list");
    resetForm();
  };

  const handleDelete = async (ticket: TicketListItem) => {
    if (!window.confirm(`Delete ticket "${ticket.ticketName}"? This cannot be undone.`)) return;
    try {
      await deleteTicket({ ticketId: ticket.ticketId, eventId }).unwrap();
    } catch (e: any) {
      setSubmitError(e?.message || e?.data?.message || e?.data?.detail?.toString?.() || "Failed to delete ticket.");
    }
  };

  const validate = (): string | null => {
    if (!form.ticketName.trim()) return "Ticket name is required.";
    if (!isFreeType && (form.price < 0 || form.price === undefined)) return "Price is required (or select Free).";
    if (!form.quantity || form.quantity < 1) return "Quantity must be at least 1.";
    if (!form.ticketTypeId) return "Please select a ticket type.";
    if (!salesStart || !salesStart.isValid()) return "Sales start date is required.";
    if (!salesEnd || !salesEnd.isValid()) return "Sales end date is required.";
    if (salesEnd.isBefore(salesStart)) return "Sales end date must be after start date.";
    return null;
  };

  const handleSubmitCreate = async () => {
    setSubmitError(null);
    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }
    try {
      const res = await createTicket({
        userId,
        eventId,
        ticketName: form.ticketName.trim(),
        price: isFreeType ? 0 : Number(form.price),
        quantity: Number(form.quantity),
        salesStartDate: toApiSalesDateTimeString(salesStart),
        salesEndDate: toApiSalesDateTimeString(salesEnd),
        ticketTypeId: form.ticketTypeId,
        description: form.description.trim(),
      }).unwrap();
      if (res?.success !== false) backToList();
      else setSubmitError(res?.message || "Failed to create ticket.");
    } catch (e: any) {
      setSubmitError(e?.message || e?.data?.message || e?.data?.detail?.toString?.() || "Failed to create ticket.");
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingTicket) return;
    setSubmitError(null);
    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }
    try {
      const res = await updateTicket({
        ticketId: editingTicket.ticketId,
        body: {
          userId,
          eventId,
          ticketName: form.ticketName.trim(),
          price: isFreeType ? 0 : Number(form.price),
          quantity: Number(form.quantity),
          salesStartDate: toApiSalesDateTimeString(salesStart),
          salesEndDate: toApiSalesDateTimeString(salesEnd),
          ticketTypeId: form.ticketTypeId,
          description: form.description.trim(),
        },
      }).unwrap();
      if (res?.success !== false) backToList();
      else setSubmitError(res?.message || "Failed to update ticket.");
    } catch (e: any) {
      setSubmitError(e?.message || e?.data?.message || e?.data?.detail?.toString?.() || "Failed to update ticket.");
    }
  };

  const isForm = view === "create" || view === "edit";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isForm ? "sm" : "md"}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? "100dvh" : "auto",
          maxHeight: isMobile ? "100dvh" : "85vh",
          height: isMobile ? "100dvh" : "auto",
          display: isMobile ? "flex" : "block",
          flexDirection: isMobile ? "column" : "undefined",
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: { xs: 8, md: 16 },
          top: { xs: 8, md: 16 },
          zIndex: 1,
        }}
        aria-label="Close"
      >
        <Icon icon="mdi:close" fontSize={24} />
      </IconButton>

      <DialogTitle
        sx={{
          pr: { xs: 7, md: 6 },
          pt: { xs: 2, md: 2 },
          pb: { xs: 1, md: 1 },
          fontSize: { xs: "1.1rem", md: "1.25rem" },
        }}
      >
        {view === "list" && "Manage Tickets"}
        {view === "create" && "Create Ticket"}
        {view === "edit" && "Edit Ticket"}
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
          // MUI applies .MuiDialogTitle-root + .MuiDialogContent-root { padding-top: 0 }
          // which clips OutlinedInput floating labels ΓÇö force top padding
          pt: `${theme.spacing(3)} !important`,
          flex: isMobile ? 1 : "none",
          overflow: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {view === "list" && (
          <>
            {/* Timezone & Create button row */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { sm: "center" },
                justifyContent: "space-between",
                gap: 1,
                mb: 2,
                flexShrink: 0,
              }}
            >
              {eventTimezone != null && eventTimezone !== "" && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                >
                  Timezone: {eventTimezone}
                </Typography>
              )}
              <Box sx={{ ml: { sm: "auto" } }}>
                <Button
                  variant="contained"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={openCreate}
                  size="medium"
                  sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
                >
                  Create Ticket
                </Button>
              </Box>
            </Box>
            {ticketsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : tickets.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                No tickets yet. Create one to get started.
              </Typography>
            ) : (
              <Stack
                spacing={2}
                sx={{
                  overflowY: "auto",
                  maxHeight: isMobile ? "50vh" : "none",
                  flex: isMobile ? "1 1 auto" : "none",
                  minHeight: 0,
                }}
              >
                {tickets.map((t) => {
                  const available = t.quantity - (t.quantitySold ?? 0);
                  const dateStart = t.salesStartDate
                    ? dayjs(parseTicketSalesDateTime(t.salesStartDate)).format("ddd, MM-DD-YYYY")
                    : "";
                  const dateEnd = t.salesEndDate
                    ? dayjs(parseTicketSalesDateTime(t.salesEndDate)).format("ddd, MM-DD-YYYY")
                    : "";
                  const timeStart = t.salesStartDate
                    ? dayjs(parseTicketSalesDateTime(t.salesStartDate)).format("hh:mm A")
                    : "";
                  const timeEnd = t.salesEndDate
                    ? dayjs(parseTicketSalesDateTime(t.salesEndDate)).format("hh:mm A")
                    : "";
                  return (
                    <Card
                      key={t.ticketId}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                        {/* Row 1: Name (left) + Price (right) */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            {t.ticketName}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            {t.price === 0 ? "Free" : `$${Number(t.price).toFixed(2)}`}
                          </Typography>
                        </Box>
                        {/* Row 2: Type ΓÇó Qty */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {t.ticketTypeName ?? `Type ${t.ticketTypeId}`} ΓÇó Qty: {t.quantity}
                        </Typography>
                        {/* Row 3: Date range */}
                        {(dateStart || dateEnd) && (
                          <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                            {dateStart}
                            {dateEnd && dateEnd !== dateStart ? ` ΓÇô ${dateEnd}` : ""}
                          </Typography>
                        )}
                        {/* Row 4: Time range */}
                        {(timeStart || timeEnd) && (
                          <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                            {timeStart} to {timeEnd}
                          </Typography>
                        )}
                        {/* Row 5: Description */}
                        {t.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {t.description}
                          </Typography>
                        )}
                        {/* Row 6: Availability */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: available > 0 ? "success.main" : "text.secondary",
                            fontWeight: 500,
                            mb: 1.5,
                          }}
                        >
                          {available}/{t.quantity} Available
                        </Typography>
                        {/* Row 7: Edit & Delete buttons */}
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => openEdit(t)}
                            startIcon={<Icon icon="mdi:pencil" fontSize={18} />}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(t)}
                            disabled={deleting}
                            startIcon={<Icon icon="mdi:delete-outline" fontSize={18} />}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </>
        )}

        {(view === "create" || view === "edit") && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2.5} sx={{ minHeight: 0, overflow: "visible", pt: 0.5 }}>
              {submitError && (
                <Alert severity="error" onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}
              <TextField
                label="Ticket name"
                value={form.ticketName}
                onChange={(e) => setForm((f) => ({ ...f, ticketName: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                select
                label="Ticket type"
                value={form.ticketTypeId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const selectedType = ticketTypes.find((t) => t.ticket_types_id === id);
                  const isFree = selectedType?.ticket_types_name?.toLowerCase() === "free";
                  setForm((f) => ({
                    ...f,
                    ticketTypeId: id,
                    ...(isFree ? { price: 0 } : {}),
                  }));
                }}
                fullWidth
                required
              >
                {ticketTypes.map((t) => (
                  <MenuItem key={t.ticket_types_id} value={t.ticket_types_id}>
                    {t.ticket_types_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={isFreeType ? 0 : form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                fullWidth
                disabled={isFreeType}
                required={!isFreeType}
              />
              <TextField
                label="Quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={form.quantity || ""}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                fullWidth
                required
              />
              <DateTimePicker
                label="Sales start"
                value={salesStart}
                onChange={(v) => setSalesStart(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="Sales end"
                value={salesEnd}
                onChange={(v) => setSalesEnd(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                flexWrap="wrap"
                sx={{ pt: 1, "& .MuiButton-root": { minWidth: { xs: "64px" } } }}
              >
                <Button onClick={backToList} size="medium">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={view === "create" ? handleSubmitCreate : handleSubmitEdit}
                  disabled={creating || updating || typesLoading}
                  size="medium"
                >
                  {(creating || updating) && (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  )}
                  {view === "create" ? "Create" : "Update"}
                </Button>
              </Stack>
            </Stack>
          </LocalizationProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageTicketsModal;
