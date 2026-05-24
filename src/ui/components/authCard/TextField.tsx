import React, { useId, useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";

export interface AuthTextFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "ref"
  > {
  /** Field title — floats to the top on focus/value, acts as placeholder when empty. */
  label: string;
  error?: boolean;
  valid?: boolean;
  helperText?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * iOS-style filled input with a floating label. Solid light-gray pill, no
 * border, leading icon. The label sits centered like a placeholder when the
 * field is empty + blurred, and shrinks up to the top edge when focused or
 * filled. Drop-in for Formik getFieldProps.
 */
const AuthTextField = React.forwardRef<HTMLInputElement, AuthTextFieldProps>(
  function AuthTextField(
    {
      label,
      error,
      valid,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth: _fullWidth,
      value,
      placeholder,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) {
    const [focused, setFocused] = useState(false);
    const accent = tokens.color.brandOrange;
    const errColor = "#D14545";
    const inputId = useId();

    const hasValue =
      value !== undefined && value !== null && String(value).length > 0;
    const floated = focused || hasValue;
    const labelText = placeholder ?? label;

    // Focus always wins — a focused field is always orange, even if it was
    // showing a red error state before the user tapped into it.
    const labelColor = focused
      ? accent
      : error
        ? errColor
        : tokens.color.iosPlaceholder;

    return (
      <Box sx={{ width: "100%", minWidth: 0, mb: 1.5 }}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            gap: 1.25,
            px: 1.75,
            height: 56,
            background: tokens.color.iosFieldBg,
            borderRadius: "14px",
            border: `1.5px solid ${
              focused ? accent : error ? errColor : "transparent"
            }`,
            boxShadow: focused ? `0 0 0 4px ${withAlpha(accent, 0.12)}` : "none",
            transition: `border-color 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
          }}
        >
          {startAdornment ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                color: focused
                  ? accent
                  : error
                    ? errColor
                    : tokens.color.iosFieldIcon,
                transition: `color 200ms ${tokens.motion.swift}`,
                flexShrink: 0,
              }}
            >
              {startAdornment}
            </Box>
          ) : null}

          <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
            {/* Floating label */}
            <Box
              component="label"
              htmlFor={inputId}
              sx={{
                position: "absolute",
                left: 0,
                top: floated ? "11px" : "50%",
                transform: floated
                  ? "translateY(0) scale(1)"
                  : "translateY(-50%) scale(1)",
                transformOrigin: "left top",
                fontFamily: tokens.font.poppins,
                fontWeight: floated ? 500 : 400,
                fontSize: floated ? 11 : 16,
                lineHeight: 1,
                letterSpacing: floated ? "0.02em" : "0",
                color: labelColor,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                transition: `top 180ms ${tokens.motion.swift}, font-size 180ms ${tokens.motion.swift}, color 180ms ${tokens.motion.swift}, font-weight 180ms ${tokens.motion.swift}`,
              }}
            >
              {labelText}
            </Box>

            <Box
              component="input"
              id={inputId}
              ref={ref}
              value={value}
              aria-label={label}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              {...rest}
              sx={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                appearance: "none",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: tokens.font.poppins,
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0",
                color: tokens.color.inkPrimary,
                // push text into the lower portion once the label has floated up
                pt: floated ? "18px" : 0,
                pb: floated ? "4px" : 0,
                transition: `padding-top 180ms ${tokens.motion.swift}`,
                WebkitTapHighlightColor: "transparent",
                "&::placeholder": {
                  color: "transparent",
                },
                "&:autofill, &:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${tokens.color.iosFieldBg} inset`,
                  WebkitTextFillColor: tokens.color.inkPrimary,
                  caretColor: accent,
                },
              }}
            />
          </Box>

          {valid && !error ? (
            <Box
              aria-hidden
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: tokens.color.iosSuccess,
                color: "#FFFFFF",
                flexShrink: 0,
                animation: `authCheckIn 260ms ${tokens.motion.settle}`,
                "@keyframes authCheckIn": {
                  from: { opacity: 0, transform: "scale(0.4)" },
                  to: { opacity: 1, transform: "scale(1)" },
                },
              }}
            >
              <Icon icon="ph:check-bold" width={13} />
            </Box>
          ) : null}

          {endAdornment ? (
            <Box
              sx={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
            >
              {endAdornment}
            </Box>
          ) : null}
        </Box>

        {helperText ? (
          <Box
            sx={{
              mt: 0.5,
              ml: 0.5,
              fontFamily: tokens.font.poppins,
              fontSize: 12,
              lineHeight: 1.35,
              color: error ? errColor : tokens.color.inkSecondary,
            }}
          >
            {helperText}
          </Box>
        ) : null}
      </Box>
    );
  }
);

export default AuthTextField;
