import { Box, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Middle from "./middle/middle";
import { Outlet } from "react-router-dom";

function Main() {
  return (
    <Outlet />
  );
}

export default Main;
