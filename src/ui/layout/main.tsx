import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/sidebar";
import Navbar from "./navbar/navbar";

function Main() {
  return (
    <main>
      <Navbar />
      <Sidebar />
      <Outlet />
    </main>
  );
}

export default Main;
