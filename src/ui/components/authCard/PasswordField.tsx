import React, { useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../pages/events/invitation/tokens";
import AuthTextField, { type AuthTextFieldProps } from "./TextField";

type Props = Omit<AuthTextFieldProps, "type" | "endAdornment">;

/**
 * Password input with a visible/hidden eye toggle.
 * Logic stays in the consumer (Formik); this just flips the rendered input type.
 */
export default function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthTextField
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={props.autoComplete ?? "current-password"}
      endAdornment={
        <Box
          component="button"
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          sx={{
            appearance: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            ml: 0.5,
            flexShrink: 0,
            color: tokens.color.iosFieldIcon,
            transition: `color 180ms ${tokens.motion.swift}`,
            "&:hover, &:focus-visible": {
              color: tokens.color.brandOrange,
            },
          }}
        >
          <Icon
            icon={visible ? "ph:eye-slash-bold" : "ph:eye-bold"}
            width={18}
          />
        </Box>
      }
    />
  );
}
