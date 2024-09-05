import { Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Middle from "../../pages/middle/middle";

function Main() {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
            <Middle />
        </Grid>
        <Grid size={{xs: 12, md: 5}}>

        </Grid>
      </Grid>
    </Container>
  );
}

export default Main;
