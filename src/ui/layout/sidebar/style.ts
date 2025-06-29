import { useMediaQuery, useTheme } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { transform } from "lodash";

export const SidebarStyles = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return {
    mainStyle: {
      position: "fixed",
      left: 0,
      zIndex: 3,
      top: {
        xs: 'auto',
        sm: 'auto',
        md: '50%',
        lg: '50%',
      },
      bottom: {
        xs: 0,
        sm: 0,
        md: 'auto',
        lg: 'auto',
      },
      transform: {
        xs: 'none',
        sm: 'none',
        md: "translateY(-50%)",
        lg: "translateY(-50%)",
      },
      minWidth: {
        xs: '100%',
        sm: '100%',
        md: '234px',
        lg: '234px',
      },
      maxWidth: {
        xs: '100%',
        sm: '100%',
        md: '234px',
        lg: '234px',
      },
      backgroundColor: theme.palette.grey[200],
      borderRadius: {
        xs: '24px 24px 0 0',
        sm: '24px 24px 0 0',
        md: '0 24px 24px 0',
        lg: '0 24px 24px 0',
      },
      padding: {
        xs: '32px 20px 12px 20px',
        sm: '32px 20px 12px 20px',
        md: '96px 20px 24px 24px',
        lg: '96px 20px 24px 24px',
      },
      display: 'block',
      transition: 'all 0.3s ease-in-out',
      ".MuiListItem-root": {
        px: 0,
      },
      ".MuiListItemButton-root": {
        borderRadius: 50,
      },
      ".MuiList-root": {
        display: {
          xs: 'flex',
          sm: 'flex',
          md: 'block',
          lg: 'block',
        },
        justifyContent: {
          xs: 'space-around',
          sm: 'space-around',
          md: 'flex-start',
          lg: 'flex-start',
        },
        padding: {
          xs: 0,
          sm: 0,
          md: '8px',
          lg: '8px',
        },
      },
    },
    activeStyle: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      "path, svg": {
        fill: theme.palette.common.white,
      },
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        "path, svg": {
          fill: theme.palette.common.white,
        },
      },
    },
  };
};
