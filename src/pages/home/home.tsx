import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Middle from "../../ui/layout/middle/middle";
import React from "react";
import RightPanel from "../../ui/components/rightPanel/rightPanel";
import { LayoutStyles } from "../../ui/layout/layoutStyle";

function Main() {
  const [expanded, setExpanded] = React.useState("panel1");

  const handleChange = (panel: any) => (event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false);
  };

  const {layoutStyle} = LayoutStyles();
  return (
    <Box component={'main'} sx={{...layoutStyle}}>
      <Container maxWidth={'xl'}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Middle />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <RightPanel />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Main;
