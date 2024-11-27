import { useTheme } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { transform } from "lodash";

export const NavbarStyles = () => {
  const theme = useTheme();
  return {
    mainStyle: {
      position: "sticky",
      top: 0,
      zIndex: 3,
      backgroundColor: 'transparent',
      padding: '20px',
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      ".logo": {
        width: 60,
        height: 60,
      }
    },
  };
};
