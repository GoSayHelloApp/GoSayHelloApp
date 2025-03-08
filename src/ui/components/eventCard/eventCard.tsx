import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { EventCardStyles } from "./style";
import { ReactElement } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";

function EventCard({
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
}: {
  picture: string;
  type: string;
  id: string,
  name: string;
  date: string;
  time: string;
  distance: number;
  isPaid: any
  group: ReactElement;
  isAlreadySaved: string;
}) {
  const { main } = EventCardStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box sx={{ ...main }}>
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Box
          sx={{
            position: "absolute",
            zIndex: 1,
            px: { xs: 2, lg: 2 },
            py: 0.5,
            top: 20,
            left: 74,
            fontSize: 24,
            fontWeight: "600",
            border: `3px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {isPaid ? "Paid" : "Free"}
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 72, lg: 150 },
            height: { xs: 72, lg: 170 },
            borderRadius: { xs: 2.5, lg: 5 },
          }}
          src={picture}
        />
        <Box>
          <Stack gap={1} maxWidth={'87%'}>
            <Typography
              sx={{
                fontSize: { xs: 15, lg: 22 },
                width: "calc(100% - 48px)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              fontWeight={"600"}
            >
              {name}
            </Typography>
            <Stack direction={"row"} alignItems={"center"} gap={2}>
              <Typography
                sx={{ fontSize: { xs: 12, lg: 18 } }}
                fontWeight={"500"}
              >
                {type}
              </Typography>
              <Button
                endIcon={<Icon icon="material-symbols:share" />}
                size="small"
                variant="contained"
                color="info"
              >
                Share
              </Button>
            </Stack>
            <Stack direction={"row"} alignItems={"center"} gap={4}>
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
          onClick={() => {
            navigate(`/home/events/${id}/details`);
          }}
        >
          Details
        </Button>

        <Button
          variant="contained"
          color="success"
          size="large"
          sx={{ flex: "1 1 auto" }}
        >
          Directions
        </Button>
        <Button
          variant="soft"
          color="inherit"
          size="large"
          sx={{ flex: "1 1 auto" }}
        >
          {isAlreadySaved != "0" ? "RSVP" : "Cancel"}
        </Button>
      </Stack>
    </Box >
  );
}

export default EventCard;
