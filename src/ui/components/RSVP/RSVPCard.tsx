import {
  Avatar,
  Box,
  Button,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { RSVPCardStyles } from "./style";
import { ReactElement, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import OpenApp from "../../../components/events/OpenApp";
import RSVPButton from "./RSVPButton";

function RSVPCard({
  eventDetails,
  picture,
  type,
  id,
  name,
  date,
  time,
  distance,
  group,
  isPaid,
  isAlreadySaved,
  latitude,
  longitude,
  onRSVPAction,
}: {
  eventDetails: any;
  picture: string;
  type: string;
  id: string;
  name: string;
  date: string;
  time: string;
  distance: number;
  isPaid: any;
  group: ReactElement;
  isAlreadySaved: string;
  latitude: number;
  longitude: number;
  onRSVPAction?: () => void;
}) {
  const { main } = RSVPCardStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [openApp, setOpenApp] = useState(false);
  const [isEventSaved, setIsEventSaved] = useState(isAlreadySaved === "1");

  const handleDirectionsClick = (e: any) => {
    e.stopPropagation();
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleShareClick = (e: any) => {
    e.stopPropagation();
    const eventLink = `https://events.gosayhello.app/events/${id}`;
    navigator.clipboard.writeText(eventLink).then(() => {
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 2000);
    });
  };

  const handleDetailsClick = () => {
    navigate(`/events/${id}/details`);
  };

  const handleGroupChatClick = (e: any) => {
    e.stopPropagation();
    setOpenApp(true);
  };

  return (
    <Box sx={{ ...main }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        sx={{ gap: { xs: 0.5, lg: 2 } }}
      >
        <Box
          sx={{
            position: "absolute",
            zIndex: 1,
            px: { xs: 2, lg: 2 },
            py: 0.5,
            top: 35,
            left: {
              xs: 37,
              md: 74,
            },
            fontSize: {
              xs: 14,
              md: 24,
            },
            fontWeight: "600",
            border: `3px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {isPaid ? "Paid" : "Free"}
        </Box>
        <Avatar
          variant="rounded"
          onClick={handleDetailsClick}
          sx={{
            width: { xs: 90, lg: 150 },
            height: { xs: 90, lg: 170 },
            borderRadius: { xs: 2.5, lg: 5 },
          }}
          src={picture}
        />
        <Box flex={1} sx={{ px: { xs: 1, lg: 2 }, py: { xs: 0.5, lg: 1 } }}>
          <Stack gap={1}>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{ gap: { xs: 1, lg: 2, overflow: "hidden" } }}
            >
              <Typography
                onClick={handleDetailsClick}
                sx={{
                  fontSize: { xs: 15, lg: 22 },
                  color: theme.palette.primary.main,
                  maxWidth: "100%",
                  // width: "calc(100% - 78px)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                fontWeight={"600"}
              >
                {/* {name} */}
                {isMobile ? name.substring(0, 30) : name.substring(0, 88)}
                {isMobile && name.length > 30
                  ? "..."
                  : isMobile && name.length > 30
                  ? ""
                  : name.length > 88
                  ? "..."
                  : ""}
              </Typography>
            </Stack>

            <Stack
              direction={"row"}
              alignItems={"center"}
              gap={2}
              justifyContent={"space-between"}
            >
              <Typography
                sx={{ fontSize: { xs: 12, lg: 18 } }}
                fontWeight={"700"}
              >
                {type}
              </Typography>
              <Button
                endIcon={<Icon icon="material-symbols:share" />}
                size="small"
                variant="contained"
                color="info"
                onClick={handleShareClick}
              >
                Share
              </Button>
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              sx={{ gap: { xs: 0.5, lg: 2 } }}
            >
              <Box flex={"1 1 auto"}>
                <Typography
                  sx={{ fontSize: { xs: 12, lg: 18 } }}
                  fontWeight={"500"}
                >
                  {date}
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: 12, lg: 18 } }}
                  fontWeight={"500"}
                >
                  {time}
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: 12, lg: 18 } }}
                  fontWeight={"500"}
                >
                  {distance} mintues walk
                </Typography>
              </Box>
              {group}
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <Stack direction={"row"} gap={2} mt={{ xs: 2, lg: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ flex: "1 1 auto" }}
          onClick={handleDetailsClick}
        >
          Details
        </Button>

        <Button
          variant="contained"
          color="success"
          size="large"
          sx={{ flex: "1 1 auto" }}
          onClick={handleGroupChatClick}
        >
          Group Chat
        </Button>
        <RSVPButton
          eventDetails={{ id: eventDetails.event_id, ...eventDetails }}
          isEventSaved={isEventSaved}
          onRSVPStatusChange={(isSaved) => setIsEventSaved(isSaved)}
          onRSVPAction={onRSVPAction}
        />
      </Stack>
      {/* Snackbar for "Link copied" message */}
      <Snackbar
        open={isSnackbarOpen}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      <OpenApp
        eventId={id}
        openApp={openApp}
        setOpenApp={setOpenApp}
        text="Please open the app to access group chat"
      />
    </Box>
  );
}

export default RSVPCard;
