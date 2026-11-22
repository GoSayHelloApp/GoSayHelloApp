import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";
import { openGoSayHelloApp } from "../utils/openApp";

const OpenAppHome = ({ openApp, setOpenApp, text }: any) => {
  const handleMobileRedirection = () => openGoSayHelloApp(undefined);
  return (
    <Modal
      open={openApp}
      onClose={(e: any) => {
        e.stopPropagation();
        setOpenApp(false);
      }}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          p: 4,
          bgcolor: "black",
          borderRadius: 2,
          width: 400,
          height: 200,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center ",
          gap: 2,
        }}
      >
        <Typography variant="body1" color="white">
          {text}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMobileRedirection}
        >
          Open App
        </Button>
      </Box>
    </Modal>
  );
};

export default OpenAppHome;
