import { Theme } from "@mui/material/styles";
import { tabClasses } from "@mui/material/Tab";

// ----------------------------------------------------------------------

export function tabs(theme: Theme) {
  return {
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "none",
        },
        indicator: {
          backgroundColor: "transparent",
        },
        scrollButtons: {
          width: 48,
          borderRadius: "50%",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: "24px 40px",
          opacity: 1,
          minHeight: 48,
          fontSize: 22,
          borderRadius: "500px",
          fontWeight: theme.typography.fontWeightMedium,
          // '&:not(:last-of-type)': {
          //   marginRight: theme.spacing(3),
          //   [theme.breakpoints.up('sm')]: {
          //     marginRight: theme.spacing(5)
          //   }
          // },
          [theme.breakpoints.down("lg")]: {
            padding: "12px 20px",
            fontSize: 15,
          },
          [`&:not(.${tabClasses.selected})`]: {
            color: theme.palette.text.primary,
          },
          [`&.${tabClasses.selected}`]: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.primary.main,
            borderBottom: "none",
          },
        },
      },
    },
  };
}
