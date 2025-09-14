import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React from "react";
import { LayoutStyles } from "../../ui/layout/layoutStyle";
import { Outlet } from "react-router-dom";

function MessagesLayout() {
  const { layoutStyle } = LayoutStyles();

  return (
    <Box component={"main"} sx={{ ...layoutStyle }}>
      <Container
        sx={{
          padding: {
            xs: 0,
          },
        }}
        maxWidth={"xl"}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Outlet />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MessagesLayout;
