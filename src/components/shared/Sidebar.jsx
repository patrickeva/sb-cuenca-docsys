import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard, FolderOpen, MapPin, ClipboardList,
  Users, Upload, Building2, LogOut, ChevronLeft,
  ChevronRight, FileText, Menu, X
} from "lucide-react";
import "./Sidebar.css";

const ADMIN_LINKS = [
  { to: "/admin/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/documents",     icon: FolderOpen,      label: "All Documents" },
  { to: "/admin/barangays",     icon: MapPin,          label: "Barangays" },
  { to: "/admin/activity-logs", icon: ClipboardList,   label: "Activity Logs" },
  { to: "/admin/manage-users",  icon: Users,           label: "Manage Users" },
];

const BARANGAY_LINKS = [
  { to: "/barangay/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/barangay/documents", icon: FolderOpen,      label: "My Documents" },
  { to: "/barangay/upload",    icon: Upload,          label: "Upload Document" },
  { to: "/barangay/profile",   icon: Building2,       label: "Barangay Profile" },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const links = isAdmin ? ADMIN_LINKS : BARANGAY_LINKS;
  const initial = userProfile?.displayName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-logo-sm">
            <FileText size={16} color="white" />
          </div>
          <span className="mobile-brand-name">SB DocSys</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={22} color="white" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <FileText size={18} color="white" />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">SB DocSys</span>
              <span className="brand-sub">Cuenca, Batangas</span>
            </div>
          )}
          <button className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}>
            <X size={15} />
          </button>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="user-avatar">{initial}</div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{userProfile?.displayName}</span>
              <span className="user-role">
                {isAdmin ? "SB Administrator" : `Brgy. ${userProfile?.barangayName}`}
              </span>
            </div>
          )}
        </div>

        {/* Section Label */}
        {!collapsed && (
          <div className="sidebar-section-label">
            <span>NAVIGATION</span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link--active" : ""}`
                }
                title={collapsed ? link.label : ""}
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-icon-wrap">
                  <Icon size={18} />
                </div>
                {!collapsed && <span className="nav-label">{link.label}</span>}
              </NavLink>
            );
          })}

          {/* Collapse Toggle — inside nav at bottom, desktop only */}
          <div className="nav-divider desktop-only" />
          <button
            className="nav-collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="nav-icon-wrap">
              {collapsed
                ? <ChevronRight size={18} />
                : <ChevronLeft size={18} />}
            </div>
            {!collapsed && <span className="nav-label">Collapse Sidebar</span>}
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={17} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;