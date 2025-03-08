import { Outlet, useNavigate } from "react-router-dom";
import { LayoutStyles } from "./layoutStyle";
import Sidebar from "./sidebar/sidebar";
import Navbar from "./navbar/navbar";
import { useEffect } from "react";
import { getStartUp } from "../../utils/tokenStorage";
import { setUser } from "../../services/auth/authSlice";
import { useDispatch } from "react-redux";

function Main() {

  const { mainStyle } = LayoutStyles();
  return (
    <main >
      <Navbar />
      <Sidebar />
      <Outlet />
    </main>
  );
}

export default Main;
