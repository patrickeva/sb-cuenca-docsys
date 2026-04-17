// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getUserProfile } from "../firebase/authService.js";
import "./LoginPage.css";

const getFriendlyError = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your administrator.";
    default:
      return "Login failed. Please check your credentials and try again.";
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const user    = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        setError("Account not found. Contact your administrator.");
        setLoading(false);
        return;
      }

      if (profile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/barangay/dashboard");
      }
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-mesh" />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="login-badge">
            <span className="login-badge__dot" />
            PH Official Government Portal
          </div>
          <h1 className="login-title">SB Document System</h1>
          <p className="login-subtitle">Sangguniang Bayan ng Cuenca, Batangas</p>
        </div>

        <div className="login-divider" />

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="lform-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="lform-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
                    stroke="#9ca3af" strokeWidth="1.8"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                <circle cx="12" cy="12" r="10" stroke="#b91c1c" strokeWidth="1.8"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Log In to System
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2"
              stroke="#9ca3af" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Secure Government Portal · Cuenca, Batangas LGU
        </p>
      </div>
    </div>
  );
};

export default LoginPage;