import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  Avatar,
  useMediaQuery,
  IconButton,
  Snackbar,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import OpenAppHome from "../../components/OpenAppHome";
import ConfirmationModal from "../../components/confirmationModal";

interface Event {
  id: number;
  image: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  event_owner_name?: string;
  event_owner_image?: string;
  is_public?: number;
  no_of_users_saved_event?: number;
  is_already_saved?: string;
}

interface UserEventCardProps {
  event: Event;
  onDelete?: (eventId: number) => void;
  showDeleteButton?: boolean;
}

const UserEventCard: React.FC<UserEventCardProps> = ({
  event,
  onDelete,
  showDeleteButton = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [openApp, setOpenApp] = useState(false);
  const [appMessage, setAppMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    navigate(`/events/${event.id}/details`);
  };

  const handleShareClick = (e: any) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the parent Box
    const eventLink = `https://events.gosayhello.app/events/${event.id}`;
    navigator.clipboard.writeText(eventLink).then(() => {
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 2000);
    });
  };

  const handleDeleteClick = (e: any) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      setIsDeleting(true);
      await onDelete(event.id);
      setIsDeleting(false);
    }
    setConfirmOpen(false);
  };

  const handleCancelDelete = (e: any) => {
    e.stopPropagation();
    setConfirmOpen(false);
  };

  const handleActionClick = (action: string) => {
    let message = "";
    switch (action) {
      case "invite":
        message = `Open the GoSayHello app to invite people to "${event.title}"`;
        break;
      case "edit":
        message = `Open the GoSayHello app to edit "${event.title}"`;
        break;
      case "groupChat":
        message = `Open the GoSayHello app to join the group chat for "${event.title}"`;
        break;
      default:
        message = "Open the GoSayHello app to continue";
    }
    setAppMessage(message);
    setOpenApp(true);
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 4,
        boxShadow: theme.shadows[1],
        backgroundColor: "background.paper",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
        },
      }}
      onClick={handleCardClick}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          fontWeight={600}
          color="primary.main"
          noWrap
          sx={{ flex: 1, fontSize: isMobile ? 16 : 20 }}
        >
          {event.title}
        </Typography>
        <Button
          endIcon={<Icon icon="material-symbols:share" />}
          size="small"
          variant="contained"
          color="info"
          sx={{
            flexShrink: 0,
            ml: 1,
          }}
          onClick={handleShareClick}
        >
          Share
        </Button>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 2, md: 3 }}
        sx={{ mb: 1 }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            variant="rounded"
            src={event.image}
            alt={event.title}
            sx={{
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              borderRadius: 3,
            }}
          />
          {showDeleteButton && (
            <IconButton
              size="small"
              color="error"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
              onClick={handleDeleteClick}
            >
              <Icon icon="material-symbols:delete" />
            </IconButton>
          )}
        </Box>
        <Stack spacing={{ xs: 0.5, md: 1 }} flex={1}>
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{ fontSize: isMobile ? 14 : 16 }}
          >
            {event.type}
          </Typography>
          {/* {event.event_owner_name && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? 12 : 14 }}
            >
              By: {event.event_owner_name}
            </Typography>
          )} */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? 12 : 14 }}
            >
              {event.date}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? 12 : 14 }}
            >
              {event.time}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? 12 : 14 }}
            >
              {event.location}
            </Typography>
            {/* {event.no_of_users_saved_event !== undefined && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? 12 : 14 }}
              >
                {event.no_of_users_saved_event} people saved
              </Typography>
            )} */}
          </Box>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Button
          size="large"
          variant="contained"
          sx={{
            bgcolor: theme.palette.info.lighter,
            color: theme.palette.text.primary,
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: theme.palette.info.light },
            fontSize: isMobile ? 12 : 14,
            width: isMobile ? 100 : 120,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick("invite");
          }}
        >
          Invite
        </Button>
        <Button
          size="large"
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: 600,
            borderRadius: 3,
            py: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: "primary.dark" },
            fontSize: isMobile ? 10 : 14,
            width: isMobile ? 100 : 120,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick("edit");
          }}
        >
          Edit
        </Button>
        <Button
          size="large"
          variant="contained"
          sx={{
            bgcolor: theme.palette.success.main,
            color: "white",
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: theme.palette.success.dark },
            fontSize: isMobile ? 12 : 14,
            width: isMobile ? 120 : 120,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick("groupChat");
          }}
        >
          Group Chat
        </Button>
      </Stack>

      <Snackbar
        open={isSnackbarOpen}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <OpenAppHome
        openApp={openApp}
        setOpenApp={setOpenApp}
        text={appMessage}
      />
      <ConfirmationModal
        open={confirmOpen}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
      />
    </Box>
  );
};

export default UserEventCard;
