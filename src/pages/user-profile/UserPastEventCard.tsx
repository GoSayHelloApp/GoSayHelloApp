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

interface Event {
  id: number;
  image: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
}

interface UserPastEventProps {
  event: Event;
}

const UserPastEventCard: React.FC<UserPastEventProps> = ({ event }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

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
        {/* <Button
          endIcon={<Icon icon="material-symbols:share" />}
          size="small"
          variant="contained"
          color="info"
          sx={{
            alignSelf: "flex-start",
            mt: 1,
          }}
          onClick={handleShareClick}
        >
          Share
        </Button> */}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 2, md: 3 }}
        sx={{ mb: 1 }}
      >
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
        <Stack spacing={{ xs: 0.5, md: 1 }} flex={1}>
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{ fontSize: isMobile ? 14 : 16 }}
          >
            {event.type}
          </Typography>
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
          </Box>
        </Stack>
      </Stack>
      {/* 
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
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
            width: "100%",
          }}
        >
          Group Chat
        </Button>
      </Stack> */}
      <Snackbar
        open={isSnackbarOpen}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default UserPastEventCard;
