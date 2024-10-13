import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/sidebar";
import { Box } from "@mui/material";
import { LayoutStyles } from "./layoutStyle";
import Main from "./main";

function Layout() {
  const { mainStyle } = LayoutStyles();
  return (
    <Box>
      <Sidebar />
      <Main />
    </Box>
  );
}

export default Layout;
