import { Button, Chip, Stack, Typography } from "@mui/material";
import EventCard from "../../ui/components/eventCard/eventCard";
import React from "react";

const events = [
  {
    id: 0,
    picture: "https://picsum.photos/120/120",
    name: "Juneteenth Atlanta Parade and Music Festival",
    type: 'Festival',
    date: 'Jun. 16 - Jun. 18',
    time: '12:00 PM to 09:00 PM',
    distance: 3,
  },
];

function Events() {
  return (
    <React.Fragment>
      <Typography variant="h5" pl={4}>34 Events</Typography>
      <Stack width={"100%"} direction={"column"} gap={{ xs: 1, lg: 2.5 }}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            picture={event.picture}
            type={event.type}
            name={event.name}
            date={event.date}
            time={event.time}
            distance={event.distance}
            action={
              <Button
                variant="contained"
                color="success"
                size="large"
                disableElevation
              >
                Message
              </Button>
              // <Button variant="contained" color="inherit" size="large" disableElevation>
              //   You Waved
              // </Button>
              // <Button variant="contained" color="error" size="large" disableElevation>
              //   Wave Back
              // </Button>
            }
          />
        ))}
      </Stack>
    </React.Fragment>
  );
}

export default Events;
