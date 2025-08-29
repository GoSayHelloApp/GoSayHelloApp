import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./sidebar/sidebar";
import Navbar from "./navbar/navbar";

function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <main>
      <Navbar onSidebarToggle={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      <Outlet />
    </main>
  );
}

export default Main;
