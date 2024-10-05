import { Button, Chip, Stack } from "@mui/material";
import PeopleCard from "../../ui/components/peopleCard/peopleCard";

const people = [
  {
    id: 0,
    picture: "https://picsum.photos/120/120",
    name: "Jaden Adams",
    interests: 2,
    distance: 3,
    tags: (
      <Stack direction={'row'} gap={1.25} flexWrap={'wrap'} mt={1}>
        <Chip color="info" label="App Developer" />
        <Chip color="info" label="Arts & Craft" />
        <Chip color="info" label="Beauty" />
      </Stack>
    ),
  },
  {
    id: 1,
    picture: "https://picsum.photos/120/120",
    name: "Jaden Adams",
    interests: 2,
    distance: 3,
    tags: (
      <Stack direction={'row'} gap={1.25} flexWrap={'wrap'} mt={1}>
        <Chip color="info" label="App Developer" />
        <Chip color="info" label="Arts & Craft" />
      </Stack>
    ),
  },
];

function People() {
  return (
    <Stack width={"100%"} direction={"column"} gap={{ xs: 1, lg: 2.5 }}>
      {people.map((person) => (
        <PeopleCard
          key={person.id}
          picture={person.picture}
          name={person.name}
          interests={person.interests}
          distance={person.distance}
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
          tags={person.tags}
        />
      ))}
    </Stack>
  );
}

export default People;
