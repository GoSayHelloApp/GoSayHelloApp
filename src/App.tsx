import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button, Stack } from "@mui/material";
import { Icon } from "@iconify/react";

function App() {
  return (
    <div className="App">
      <Stack direction={"row"} width={630} gap={2}>
        <Button
          variant="contained"
          size="small"
          color="info"
          disableElevation
          endIcon={<Icon icon={'material-symbols:share'} />}
        >
          Share
        </Button>
        <Button
          variant="contained"
          size="large"
          color="success"
          disableElevation
          sx={{ flex: "1 1 auto" }}
        >
          Directions
        </Button>
        <Button
          variant="soft"
          size="large"
          color="inherit"
          disableElevation
          sx={{ flex: "1 1 auto" }}
        >
          Cancel
        </Button>
      </Stack>
    </div>
  );
}

export default App;
