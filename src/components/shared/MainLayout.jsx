import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import "./MainLayout.css";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`main-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;