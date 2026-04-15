// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getUserProfile } from "../firebase/authService.js";
import "./LoginPage.css";

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
      console.error("Firebase error:", err.code, err.message);
      setError(err.code + " — " + err.message);
    } {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🏛️</div>
          <div className="login-badge">🇵🇭 Official Government Portal</div>
          <h1 className="login-title">SB Document System</h1>
          <p className="login-subtitle">Sangguniang Bayan ng Cuenca, Batangas</p>
        </div>

        <div className="login-divider" />

        <form onSubmit={handleLogin} className="login-form">
          <div className="lform-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
                name="email"
              />
            </div>
          </div>

          <div className="lform-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
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

          {error && <div className="login-error">⚠️ {error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Logging in..." : "🔐 Log In to System"}
          </button>
        </form>

        <p className="login-footer">
          🔒 Secure Government Portal · Cuenca, Batangas LGU
        </p>
      </div>
    </div>
  );
};

export default LoginPage;