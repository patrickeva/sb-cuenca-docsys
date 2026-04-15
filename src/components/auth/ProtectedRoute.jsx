import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading habang nag-fe-fetch ng profile
  if (loading || (currentUser && !userProfile)) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4f8",
        gap: "1rem",
      }}>
        <div style={{
          width: 44, height: 44,
          border: "3px solid #e2e8f0",
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color:"#64748b", fontWeight:600, fontSize:"0.9rem" }}>
          Loading profile...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Hindi naka-login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Mali ang role
  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to={
      userProfile?.role === "admin"
        ? "/admin/dashboard"
        : "/barangay/dashboard"
    } replace />;
  }

  return children;
};

export default ProtectedRoute;