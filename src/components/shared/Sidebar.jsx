// src/components/shared/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard, FolderOpen, MapPin, ClipboardList,
  Users, Upload, Building2, LogOut, ChevronLeft,
  ChevronRight, FileText, Menu, X, Shield,
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
  const links  = isAdmin ? ADMIN_LINKS : BARANGAY_LINKS;
  const initial = userProfile?.displayName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-logo-sm">
            <FileText size={15} color="white" />
          </div>
          <span className="mobile-brand-name">Cuenca Docs</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={20} color="white" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}>

        {/* Animated stars canvas */}
        <canvas className="sidebar-stars" ref={(canvas) => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          canvas.width  = canvas.offsetWidth  || 268;
          canvas.height = canvas.offsetHeight || window.innerHeight;

          const stars = Array.from({ length: 60 }, () => ({
            x:    Math.random() * canvas.width,
            y:    Math.random() * canvas.height,
            r:    Math.random() * 1.2 + 0.2,
            o:    Math.random(),
            dir:  Math.random() > 0.5 ? 1 : -1,
            speed: Math.random() * 0.008 + 0.003,
          }));

          let raf;
          const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach((s) => {
              s.o += s.speed * s.dir;
              if (s.o >= 1 || s.o <= 0) s.dir *= -1;
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255,255,255,${s.o * 0.7})`;
              ctx.fill();
            });
            raf = requestAnimationFrame(draw);
          };
          draw();
          canvas._cleanup = () => cancelAnimationFrame(raf);
        }} />

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <FileText size={17} color="white" />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">Cuenca Docs</span>
              <span className="brand-sub">Cuenca, Batangas</span>
            </div>
          )}
          <button className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}>
            <X size={14} />
          </button>
        </div>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">{initial}</div>
          {!collapsed && (
            <>
              <div className="user-info">
                <span className="user-name">{userProfile?.displayName}</span>
                <span className="user-role">
                  {isAdmin
                    ? "SB Administrator"
                    : `Brgy. ${userProfile?.barangayName}`}
                </span>
              </div>
              <div className="user-status" title="Online" />
            </>
          )}
        </div>

        {/* Role badge — only when expanded */}
        {!collapsed && (
          <div style={{
            margin: "0.625rem 0.875rem 0",
            padding: "0.45rem 0.75rem",
            background: isAdmin
              ? "rgba(37,99,235,0.1)"
              : "rgba(16,185,129,0.1)",
            border: `1px solid ${isAdmin ? "rgba(37,99,235,0.18)" : "rgba(16,185,129,0.18)"}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <Shield size={11} color={isAdmin ? "#60a5fa" : "#34d399"} />
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: isAdmin ? "#60a5fa" : "#34d399",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {isAdmin ? "Admin Access" : "Barangay Access"}
            </span>
          </div>
        )}

        {/* Section Label */}
        {!collapsed && (
          <div className="sidebar-section-label">
            <span>Navigation</span>
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
                  <Icon size={17} />
                </div>
                {!collapsed && (
                  <span className="nav-label">{link.label}</span>
                )}
              </NavLink>
            );
          })}

          {/* Bottom actions — pinned below nav links */}
          <div className="sidebar-bottom-actions">
            <div className="nav-divider" />
            <button className="logout-btn" onClick={handleLogout} title="Log Out">
              <LogOut size={16} />
              {!collapsed && <span>Log Out</span>}
            </button>
            <div className="nav-divider desktop-only" />
            <button
              className="nav-collapse-btn desktop-only"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="nav-icon-wrap">
                {collapsed
                  ? <ChevronRight size={17} />
                  : <ChevronLeft size={17} />}
              </div>
              {!collapsed && (
                <span className="nav-label">Collapse Sidebar</span>
              )}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;