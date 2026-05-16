import type { SxProps, Theme } from "@mui/material/styles";

/** Long-form event description on public / detail views */
export const descriptionBodyFontSx: SxProps<Theme> = {
  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
  lineHeight: 1.6,
};

/** Multiline description field in event scheduler (and similar forms) */
export const descriptionInputFontSx: SxProps<Theme> = {
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    lineHeight: 1.5,
  },
};
