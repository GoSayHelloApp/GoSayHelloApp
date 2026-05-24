import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ReactElement, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_BRAND, publicEventCardSx } from "./publicEventCardStyles";
import type { Event, EventInterestedUser } from "../../../models/responseModels/events";

export interface PublicEventCardProps {
  event: Event;
  date: string;
  time: string;
  group: ReactElement;
}

function formatDistanceMi(distance: number | undefined): string {
  if (distance == null || Number.isNaN(distance)) return "";
  return `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} mi away`;
}

const PublicEventCard: React.FC<PublicEventCardProps> = ({ event, date, time, group }) => {
  const navigate = useNavigate();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const isPaid = Boolean(event.is_paid_event);
  const distanceLabel = formatDistanceMi(event.distance);
  const savedCount = event.no_of_users_saved_event ?? 0;
  const interestedCount = event.event_interested_users?.length ?? 0;

  const handleDetailsClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/event-details/${event.id}`);
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const eventLink = `https://events.gosayhello.app/events/${event.id}`;
    navigator.clipboard.writeText(eventLink).then(() => {
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 2000);
    });
  };

  return (
    <Box sx={publicEventCardSx.root} onClick={handleDetailsClick}>
      <Box sx={publicEventCardSx.mediaWrap}>
        <Box
          component="img"
          src={event.image}
          alt={event.name}
          sx={publicEventCardSx.media}
          loading="lazy"
        />
        <Box sx={publicEventCardSx.mediaGradient} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 1 }}
        >
          <Stack direction="row" spacing={0.75}>
            <Chip
              size="small"
              label={isPaid ? "Paid" : "Free"}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                bgcolor: isPaid ? alpha("#161C24", 0.85) : PUBLIC_BRAND.orange,
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            />
            {event.event_type && (
              <Chip
                size="small"
                label={event.event_type}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  bgcolor: alpha("#fff", 0.92),
                  color: PUBLIC_BRAND.ink,
                  backdropFilter: "blur(8px)",
                }}
              />
            )}
          </Stack>
          <IconButton
            size="small"
            onClick={handleShareClick}
            aria-label="Share event"
            sx={{
              bgcolor: alpha("#fff", 0.92),
              backdropFilter: "blur(8px)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <Icon icon="solar:share-linear" width={20} />
          </IconButton>
        </Stack>
        {distanceLabel && (
          <Chip
            size="small"
            icon={<Icon icon="solar:map-point-bold" width={14} />}
            label={distanceLabel}
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              zIndex: 1,
              fontWeight: 600,
              bgcolor: alpha("#fff", 0.95),
              color: PUBLIC_BRAND.ink,
              "& .MuiChip-icon": { color: PUBLIC_BRAND.orange },
            }}
          />
        )}
      </Box>

      <Box sx={publicEventCardSx.content}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.05rem", sm: "1.2rem" },
            lineHeight: 1.3,
            color: PUBLIC_BRAND.ink,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.25,
          }}
        >
          {event.name}
        </Typography>

        <Stack spacing={1} sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="solar:calendar-minimalistic-bold" width={18} color={PUBLIC_BRAND.orange} />
            <Typography variant="body2" fontWeight={600} color={PUBLIC_BRAND.ink}>
              {date}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="solar:clock-circle-bold" width={18} color={PUBLIC_BRAND.orange} />
            <Typography variant="body2" color={PUBLIC_BRAND.muted}>
              {time}
            </Typography>
          </Stack>
          {event.address_1 && (
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Icon
                icon="solar:map-point-wave-bold"
                width={18}
                color={PUBLIC_BRAND.orange}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                color={PUBLIC_BRAND.muted}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {event.address_1}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: PUBLIC_BRAND.cream,
          }}
        >
          <Avatar
            src={event.event_owner_image}
            alt={event.event_owner_name}
            sx={{ width: 36, height: 36, border: `2px solid ${PUBLIC_BRAND.orange}` }}
          />
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" color={PUBLIC_BRAND.muted} fontWeight={600}>
              Hosted by
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {event.event_owner_name}
            </Typography>
          </Box>
        </Stack>

        {(interestedCount > 0 || savedCount > 0) && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {group}
              {interestedCount > 0 && (
                <Typography variant="caption" color={PUBLIC_BRAND.muted} fontWeight={600}>
                  {interestedCount} interested
                </Typography>
              )}
            </Stack>
            {savedCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Icon icon="solar:bookmark-bold" width={16} color={PUBLIC_BRAND.orange} />
                <Typography variant="caption" color={PUBLIC_BRAND.muted} fontWeight={600}>
                  {savedCount} saved
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        <Stack direction="row" gap={1.5}>
          <Button variant="contained" disableElevation sx={publicEventCardSx.primaryBtn} onClick={(e) => handleDetailsClick(e)}>
            View event
          </Button>
          <Button variant="outlined" sx={publicEventCardSx.secondaryBtn} onClick={handleDirectionsClick}>
            Directions
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={isSnackbarOpen}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export function buildInterestedAvatars(users: EventInterestedUser[] | undefined) {
  return (
    <AvatarGroup
      max={4}
      sx={{
        "& .MuiAvatar-root": {
          width: 28,
          height: 28,
          fontSize: 12,
          border: "2px solid #fff",
        },
      }}
    >
      {(users ?? []).map((u) => (
        <Avatar key={u.id} alt={u.user_name} src={u.user_image} />
      ))}
    </AvatarGroup>
  );
}

export default PublicEventCard;
