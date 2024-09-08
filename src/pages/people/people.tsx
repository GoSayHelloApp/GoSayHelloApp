import PeopleCard from "../../ui/components/peopleCard/peopleCard";

function People() {
  return (
    <>
      <PeopleCard
        picture="https://picsum.photos/120/120"
        name="Jaden Adams"
        interests={2}
        distance={3}
      />
    </>
  );
}

export default People;
