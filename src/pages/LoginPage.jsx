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
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const user    = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);
      if (!profile) { setError("Account not found. Contact your administrator."); return; }
      navigate(profile.role === "admin" ? "/admin/dashboard" : "/barangay/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left__bg" />
        <div className="login-left__content">
          <div className="login-seal">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-left__title">Cuenca Docs</h1>
          <p className="login-left__sub">Sangguniang Bayan ng<br/>Cuenca, Batangas</p>

          <div className="login-left__divider" />

          <div className="login-left__features">
            <div className="login-feature">
              <div className="login-feature__icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Secure document submission</span>
            </div>
            <div className="login-feature">
              <div className="login-feature__icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
                  <polyline points="13,2 13,9 20,9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Real-time document tracking</span>
            </div>
            <div className="login-feature">
              <div className="login-feature__icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span>21 barangays connected</span>
            </div>
          </div>

          <div className="login-left__footer">
            <div className="login-left__badge">
              <span className="login-left__badge-dot" />
              Sangguniang Bayan Tracking System
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-sub">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="lform-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9ca3af" strokeWidth="1.8"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button type="button" className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
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
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5"/>
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
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9ca3af" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Secure Government Portal · Cuenca, Batangas LGU
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;