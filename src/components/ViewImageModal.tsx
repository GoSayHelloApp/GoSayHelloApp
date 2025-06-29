import React from "react";
import {
  Dialog,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react";

interface ViewImageModalProps {
  open: boolean;
  image: string;
  alt?: string;
  onClose: () => void;
}

const ViewImageModal: React.FC<ViewImageModalProps> = ({
  open,
  image,
  alt = "",
  onClose,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: "transparent",
          boxShadow: "none",
          m: isDesktop ? 1 : 2,
          maxWidth: isDesktop ? "90vw" : "95vw",
          maxHeight: isDesktop ? "90vh" : "95vh",
          width: isDesktop ? "auto" : "auto",
          height: isDesktop ? "90vh" : "auto",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0, 0, 0, 0.8)",
          borderRadius: isDesktop ? 1 : 2,
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: isDesktop ? "contain" : "contain",
            display: "block",
          }}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: isDesktop ? 12 : 16,
            right: isDesktop ? 12 : 16,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            color: "#232323",
            boxShadow: 2,
            borderRadius: "50%",
            width: isDesktop ? 36 : 40,
            height: isDesktop ? 36 : 40,
            zIndex: 2,
            "&:hover": {
              bgcolor: "white",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <Icon
            icon="material-symbols:close"
            style={{ fontSize: isDesktop ? 20 : 24 }}
          />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default ViewImageModal;
