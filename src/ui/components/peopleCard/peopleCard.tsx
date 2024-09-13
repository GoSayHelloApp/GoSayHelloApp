import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { PeopleCardStyles } from "./style";
import { ReactElement } from "react";

function PeopleCard({
  picture,
  name,
  interests,
  distance,
  action,
  tags,
}: {
  picture: string;
  name: string;
  interests: number;
  distance: number;
  action: ReactElement;
  tags: ReactElement;
}) {
  const { main } = PeopleCardStyles();
  const theme = useTheme();
  return (
    <Box sx={{ ...main }}>
      <Stack direction={"row"} alignItems={"center"} gap={0.5}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          gap={{ xs: 1.5, lg: 2.75 }}
          sx={{ flex: "1 1 auto" }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 72, lg: 120 },
              height: { xs: 72, lg: 120 },
              borderRadius: { xs: 2.5, lg: 5 },
            }}
            src={picture}
          />
          <Stack gap={1}>
            <Typography
              sx={{ fontSize: { xs: 15, lg: theme.typography.h5 } }}
              fontWeight={"700"}
            >
              {name}
            </Typography>
            <Typography
              sx={{ fontSize: { xs: 12, lg: theme.typography.h5 } }}
              fontWeight={"500"}
            >
              {interests} common interests
            </Typography>
            <Typography
              sx={{ fontSize: { xs: 12, lg: theme.typography.h5 } }}
              fontWeight={"500"}
            >
              {distance} minute walk
            </Typography>
          </Stack>
        </Stack>
        {action}
      </Stack>
      {tags}
    </Box>
  );
}

export default PeopleCard;
