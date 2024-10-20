import { useTheme } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { transform } from "lodash";

export const SidebarStyles = () => {
  const theme = useTheme();
  return {
    mainStyle: {
      position: "fixed",
      left: 0,
      zIndex: 1,
      top: "50%",
      transform: "translateY(-50%)",
      minWidth: '234px',
      width: '234px',
      maxWidth: '234px',
      backgroundColor: theme.palette.grey[200],
      borderRadius: '0 24px 24px 0',
      padding: '96px 20px 24px 24px',
      ".MuiListItem-root": {
        px: 0,
      },
      ".MuiListItemButton-root": {
        borderRadius: 50,
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
