import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { PeopleCardStyles } from "./style";

function PeopleCard({
  picture,
  name,
  interests,
  distance,
}: {
  picture: string;
  name: string;
  interests: number;
  distance: number;
}) {
  const { main } = PeopleCardStyles();
  return (
    <Box sx={{ ...main }}>
      <Stack direction={"row"} alignItems={"center"} gap={0.5}>
        <Stack direction={"row"} alignItems={"center"} gap={{ xs: 2.75 }} sx={{flex: '1 1 auto'}}>
          <Avatar
            variant="rounded"
            sx={{ width: 120, height: 120, borderRadius: 5 }}
            src={picture}
          />
          <Stack gap={1}>
            <Typography variant="h5" fontWeight={"700"}>
              {name}
            </Typography>
            <Typography variant="h5" fontWeight={"500"}>
              {interests} common interests
            </Typography>
            <Typography variant="h5" fontWeight={"500"}>
              {distance} minute walk
            </Typography>
          </Stack>
        </Stack>
        <Button variant="contained" color="success" size="large" disableElevation>Message</Button>
      </Stack>
    </Box>
  );
}

export default PeopleCard;
