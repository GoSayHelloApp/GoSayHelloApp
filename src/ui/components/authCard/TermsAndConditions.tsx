import React from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";

const linkSx = {
  color: tokens.color.brandOrange,
  fontWeight: 700,
  textDecoration: "none",
  transition: `opacity 200ms ${tokens.motion.swift}`,
  "&:hover, &:focus-visible": {
    opacity: 0.7,
  },
};

const TermsAndConditions: React.FC = () => {
  return (
    <Box
      sx={{
        fontFamily: tokens.font.poppins,
        fontSize: 13,
        lineHeight: 1.5,
        fontWeight: 500,
        color: tokens.color.inkMuted,
        textAlign: "center",
      }}
    >
      By continuing you agree to our{" "}
      <Box
        component="a"
        href="https://www.gosayhelloapp.com/terms-conditions/"
        target="_blank"
        rel="noopener noreferrer"
        sx={linkSx}
      >
        Terms of Use
      </Box>{" "}
      and{" "}
      <Box
        component="a"
        href="https://www.gosayhelloapp.com/privacy-policy/"
        target="_blank"
        rel="noopener noreferrer"
        sx={linkSx}
      >
        Privacy Policy
      </Box>
    </Box>
  );
};

export default TermsAndConditions;
