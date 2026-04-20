// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
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

/* ── Helpers ─────────────────────────────────── */
const PH_DAYS   = ["Linggo", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado"];
const PH_MONTHS = ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
                   "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"];

const getGreeting = (d) => {
  const h = d.getHours();
  if (h < 12) return "Magandang Umaga";
  if (h < 18) return "Magandang Hapon";
  return "Magandang Gabi";
};

const formatPhDate = (d) =>
  `${PH_DAYS[d.getDay()]} · ${PH_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

const formatTime = (d) => {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

/* ── Animated count-up component ─────────────── */
// (Removed — replaced stats with civic motto)

/* ── Main Component ──────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  /* Live clock — updates every minute */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

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

          {/* TOP — Logos + Title + Greeting */}
          <div className="login-left__top">
            <div className="login-seal">
              <div className="login-seal__item">
                <img src="/logo.png" alt="Bayan ng Cuenca Logo" className="login-seal__img" />
              </div>
              <div className="login-seal__item">
                <img src="/sb logo.png" alt="Sangguniang Bayan Logo" className="login-seal__img" />
              </div>
            </div>
            <h1 className="login-left__title">Sangguniang Bayan</h1>
            <p className="login-left__sub">Legislative Tracking System</p>

            {/* Live Greeting */}
            <div className="login-greeting">
              <p className="login-greeting__hello">{getGreeting(now)}!</p>
              <p className="login-greeting__date">
                {formatPhDate(now)} · {formatTime(now)}
              </p>
            </div>
          </div>

          {/* BOTTOM — Motto + Badge */}
          <div className="login-left__bottom">
            <div className="login-motto">
              <svg className="login-motto__icon" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
              </svg>
              <p className="login-motto__text">
                Lingkod-Bayan, Para sa Kapakanan ng Bawat Mamamayan.
              </p>
              <div className="login-motto__divider">
                <span className="login-motto__line" />
                <svg className="login-motto__star" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l3.668 8.475 9.232.879-7 6.182 2.1 9.064-7-4.815-7 4.815 2.1-9.064-7-6.182 9.232-.879z"/>
                </svg>
                <span className="login-motto__line" />
              </div>
              <p className="login-motto__attr">Sangguniang Bayan ng Cuenca</p>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-right__pattern" />

        {/* Rotating concentric circles — top right */}
        <svg className="login-right__shape" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 4"/>
          <circle cx="50" cy="50" r="30" stroke="#2563eb" strokeWidth="1"/>
          <circle cx="50" cy="50" r="15" stroke="#2563eb" strokeWidth="1" strokeDasharray="2 3"/>
          <circle cx="50" cy="50" r="3" fill="#2563eb"/>
        </svg>

        {/* Hexagonal shape — bottom right */}
        <svg className="login-right__shape-2" viewBox="0 0 100 100" fill="none">
          <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 5"/>
          <polygon points="50,25 72,37 72,63 50,75 28,63 28,37" stroke="#7c3aed" strokeWidth="1"/>
          <circle cx="50" cy="50" r="5" fill="#7c3aed"/>
        </svg>

        {/* Triangle/pyramid — top left */}
        <svg className="login-right__shape-3" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,85 10,85" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3"/>
          <polygon points="50,30 75,77 25,77" stroke="#2563eb" strokeWidth="1"/>
        </svg>

        {/* Diamond accent — middle left */}
        <svg className="login-right__accent" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="20" width="60" height="60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2"/>
          <rect x="35" y="35" width="30" height="30" stroke="#f59e0b" strokeWidth="1.5"/>
        </svg>

        {/* Sparkle dots scattered */}
        <div className="login-right__sparkles">
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
          <div className="login-right__sparkle" />
        </div>

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