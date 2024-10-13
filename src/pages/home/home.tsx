import { Accordion, AccordionDetails, AccordionSummary, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Middle from "../../ui/layout/middle/middle";
import React from "react";
import RightPanel from "../../ui/components/rightPanel/rightPanel";

function Main() {
  const [expanded, setExpanded] = React.useState('panel1');

  const handleChange = (panel: any) => (event:any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false);
  };
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Middle />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
           <RightPanel />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Main;
