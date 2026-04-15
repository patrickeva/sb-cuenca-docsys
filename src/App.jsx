import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import MainLayout from "./components/shared/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDocuments from "./pages/admin/AdminDocuments.jsx";
import AdminBarangays from "./pages/admin/AdminBarangays.jsx";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs.jsx";
import AdminManageUsers from "./pages/admin/AdminManageUsers.jsx";
import BarangayDashboard from "./pages/barangay/BarangayDashboard.jsx";
import BarangayDocuments from "./pages/barangay/BarangayDocuments.jsx";
import UploadDocument from "./pages/barangay/UploadDocument.jsx";
import BarangayProfile from "./pages/barangay/BarangayProfile.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"      element={<AdminDashboard />} />
            <Route path="documents"      element={<AdminDocuments />} />
            <Route path="barangays"      element={<AdminBarangays />} />
            <Route path="activity-logs"  element={<AdminActivityLogs />} />
            <Route path="manage-users"   element={<AdminManageUsers />} />
          </Route>

          <Route path="/barangay" element={
            <ProtectedRoute requiredRole="barangay">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/barangay/dashboard" replace />} />
            <Route path="dashboard" element={<BarangayDashboard />} />
            <Route path="documents" element={<BarangayDocuments />} />
            <Route path="upload"    element={<UploadDocument />} />
            <Route path="profile"   element={<BarangayProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;