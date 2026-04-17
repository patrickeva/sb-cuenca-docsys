import React, { useEffect, useState } from "react";
import {
  collection, getDocs, doc,
  setDoc, serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { db } from "../../firebase/config.js";
import { CUENCA_BARANGAYS } from "../../utils/constants.js";
import { formatDate } from "../../utils/helpers.js";
import { Users, Plus } from "lucide-react";
import "../../components/shared/MainLayout.css";
import "../../components/shared/Modal.css";

// Secondary Firebase app — para hindi ma-affect ang admin session
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const secondaryApp  = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = initializeAuth(secondaryApp, {
  persistence: browserLocalPersistence,
});

// Friendly error messages para sa Firebase Auth errors
const getFriendlyError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email address is already registered. Please use a different email.";
    case "auth/invalid-email":
      return "The email address is not valid. Please check and try again.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
};

const EMPTY_FORM = {
  displayName:  "",
  email:        "",
  password:     "",
  barangayName: CUENCA_BARANGAYS[0],
};

const AdminManageUsers = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "barangay");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.displayName || !form.email || !form.password) {
      setError("Please fill in all fields."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    // Check if email already exists in users list
    const emailExists = users.some(
      (u) => u.email?.toLowerCase() === form.email.toLowerCase()
    );
    if (emailExists) {
      setError("This email address is already registered. Please use a different email.");
      return;
    }

    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth, form.email, form.password
      );
      const uid = cred.user.uid;

      await secondaryAuth.signOut();

      await setDoc(doc(db, "barangays", uid), {
        name:                form.barangayName,
        address:             "",
        contactNumber:       "",
        email:               form.email,
        orgChartVMVB:        [],
        orgChartSecretariat: [],
        committees:          [],
        createdAt:           serverTimestamp(),
      });

      await setDoc(doc(db, "users", uid), {
        displayName:  form.displayName,
        email:        form.email,
        role:         "barangay",
        barangayId:   uid,
        barangayName: form.barangayName,
        createdAt:    serverTimestamp(),
      });

      setSuccess(`Account created successfully for Brgy. ${form.barangayName}!`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      // Show friendly error message instead of raw Firebase error
      const friendly = getFriendlyError(err.code);
      setError(friendly);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading users...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Manage Users</span>
          </div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">
            Create and manage barangay accounts. ({users.length} accounts)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setSuccess(""); setError(""); }}>
          <Plus size={16} /> Add Barangay Account
        </button>
      </div>

      {success && (
        <div style={{
          background:"#f0fdf4", border:"1px solid #86efac",
          borderRadius:10, padding:"0.75rem 1rem",
          color:"#16a34a", marginBottom:"1rem", fontSize:"0.9rem"
        }}>
          ✅ {success}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setError(""); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Barangay Account</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setError(""); }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Barangay</label>
                  <select value={form.barangayName}
                    onChange={(e) => setForm({ ...form, barangayName: e.target.value })}>
                    {CUENCA_BARANGAYS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact Person / Display Name</label>
                  <input type="text" placeholder="e.g., Brgy. Secretary Name"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="barangay@cuenca.gov.ph"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="text" placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>

                {error && (
                  <div style={{
                    background:"#fef2f2", border:"1px solid #fecaca",
                    borderRadius:8, padding:"0.6rem 0.85rem",
                    color:"#dc2626", fontSize:"0.85rem",
                  }}>
                    ⚠️ {error}
                  </div>
                )}
                {saving && (
                  <p style={{ margin:0, color:"#3b82f6", fontSize:"0.875rem" }}>
                    ⏳ Creating account...
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setShowForm(false); setError(""); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding:0 }}>
        <div className="data-table-wrapper" style={{ borderRadius:14 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Email</th>
                <th>Barangay</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4">
                  <div className="empty-state">
                    <div className="empty-state__icon">👥</div>
                    <div className="empty-state__text">No barangay accounts yet.</div>
                    <div className="empty-state__sub">
                      Click "Add Barangay Account" to create one.
                    </div>
                  </div>
                </td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <div style={{
                        width:32, height:32,
                        background:"linear-gradient(135deg,#f59e0b,#d97706)",
                        borderRadius:8, display:"flex",
                        alignItems:"center", justifyContent:"center",
                        color:"white", fontWeight:800, fontSize:"0.875rem",
                        flexShrink:0,
                      }}>
                        {u.displayName?.charAt(0)?.toUpperCase()}
                      </div>
                      {u.displayName}
                    </div>
                  </td>
                  <td style={{ color:"#64748b" }}>{u.email}</td>
                  <td>{u.barangayName}</td>
                  <td style={{ color:"#64748b", fontSize:"0.8rem" }}>
                    {u.createdAt?.toDate
                      ? u.createdAt.toDate().toLocaleDateString("en-PH", {
                          year:"numeric", month:"short", day:"numeric"
                        })
                      : "—"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;