import { Outlet, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./sidebar/sidebar";
import { Box } from "@mui/material";
import { LayoutStyles } from "./layoutStyle";
import Main from "./main";
import Home from "../../pages/home/home";
import Navbar from "./navbar/navbar";

function Layout() {
  const { mainStyle } = LayoutStyles();
  return (
    <Router>
      <Box>
        <Navbar />
        <Sidebar />
        <Main />
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default Layout;
