import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Main from "../main";
import { SidebarStyles } from "./style";
import Home from "../../../pages/home/home";

export default function Sidebar() {
  const { mainStyle } = SidebarStyles();
  return (
    <Router>
      <Box sx={{...mainStyle}}>
        <List>
          <ListItem>
            <ListItemButton LinkComponent={"a"} href="/">
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
