import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getBarangayProfile,
  updateBarangayProfile,
} from "../../firebase/firestoreService.js";
import { MapPin, Save } from "lucide-react";
import "../../components/shared/MainLayout.css";
import "./BarangayProfile.css";

const EMPTY_MEMBER    = { name:"", position:"" };
const EMPTY_COMMITTEE = { memberName:"", committees:"" };

const BarangayProfile = () => {
  const { barangayId, userProfile } = useAuth();

  const [address,       setAddress]       = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email,         setEmail]         = useState("");
  const [vmvbMembers,   setVmvbMembers]   = useState([{ ...EMPTY_MEMBER }]);
  const [secretariat,   setSecretariat]   = useState([{ ...EMPTY_MEMBER }]);
  const [committees,    setCommittees]    = useState([{ ...EMPTY_COMMITTEE }]);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [errors,        setErrors]        = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getBarangayProfile(barangayId);
      if (data) {
        setAddress(data.address || "");
        setContactNumber(data.contactNumber || "");
        setEmail(data.email || "");
        setVmvbMembers(data.orgChartVMVB?.length ? data.orgChartVMVB : [{ ...EMPTY_MEMBER }]);
        setSecretariat(data.orgChartSecretariat?.length ? data.orgChartSecretariat : [{ ...EMPTY_MEMBER }]);
        setCommittees(data.committees?.length ? data.committees : [{ ...EMPTY_COMMITTEE }]);
      }
      setLoading(false);
    };
    if (barangayId) load();
  }, [barangayId]);

  const validate = () => {
    const errs = [];
    if (!address.trim())       errs.push("📍 Address is required.");
    if (!contactNumber.trim()) errs.push("📞 Contact Number is required.");
    if (!email.trim())         errs.push("✉️ Email Address is required.");

    vmvbMembers.forEach((m, i) => {
      if (m.name && !m.position)
        errs.push(`👥 VM & VB Member #${i+1}: Position is required.`);
      if (!m.name && m.position)
        errs.push(`👥 VM & VB Member #${i+1}: Full Name is required.`);
    });

    secretariat.forEach((m, i) => {
      if (m.name && !m.position)
        errs.push(`🏛️ Secretariat #${i+1}: Position is required.`);
      if (!m.name && m.position)
        errs.push(`🏛️ Secretariat #${i+1}: Full Name is required.`);
    });

    committees.forEach((c, i) => {
      if (c.memberName && !c.committees)
        errs.push(`📋 Committee #${i+1}: Committee/s is required.`);
      if (!c.memberName && c.committees)
        errs.push(`📋 Committee #${i+1}: SB Member Name is required.`);
    });

    return errs;
  };

  const handleSave = async () => {
    setErrors([]);
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      await updateBarangayProfile(barangayId, {
        name:                userProfile?.barangayName,
        address,
        contactNumber,
        email,
        orgChartVMVB:        vmvbMembers.filter((m) => m.name && m.position),
        orgChartSecretariat: secretariat.filter((m) => m.name && m.position),
        committees:          committees.filter((c) => c.memberName && c.committees),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrors(["Failed to save: " + err.message]);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (list, setList, i, field, value) => {
    const c = [...list];
    c[i] = { ...c[i], [field]: value };
    setList(c);
  };
  const addItem    = (list, setList, template) => setList([...list, { ...template }]);
  const removeItem = (list, setList, i) => setList(list.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Barangay Profile</span>
        </div>
        <h1 className="page-title">Barangay Profile</h1>
        <p className="page-subtitle">
          Brgy. {userProfile?.barangayName} — Cuenca, Batangas
        </p>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div style={{
          background:"#fef2f2", border:"1.5px solid #fecaca",
          borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem",
        }}>
          <p style={{ fontWeight:700, color:"#991b1b", marginBottom:"0.5rem" }}>
            ⚠️ Please fix the following before saving:
          </p>
          <ul style={{ margin:0, paddingLeft:"1.25rem", color:"#b91c1c", fontSize:"0.875rem" }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Basic Info */}
      <div className="card profile-section">
        <h2 className="section-title">
          <MapPin size={18} color="#2563eb" /> Basic Information
        </h2>
        <div className="profile-grid">
          <div className="form-group">
            <label>📍 Address <span style={{ color:"#ef4444" }}>*</span></label>
            <input type="text" value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Complete barangay address..."
              style={{ borderColor: errors.some(e => e.includes("Address")) ? "#ef4444" : "" }}
            />
          </div>
          <div className="form-group">
            <label>📞 Contact Number <span style={{ color:"#ef4444" }}>*</span></label>
            <input type="text" value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="09XX-XXX-XXXX"
              style={{ borderColor: errors.some(e => e.includes("Contact")) ? "#ef4444" : "" }}
            />
          </div>
          <div className="form-group">
            <label>✉️ Email Address <span style={{ color:"#ef4444" }}>*</span></label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barangay@cuenca.gov.ph"
              style={{ borderColor: errors.some(e => e.includes("Email")) ? "#ef4444" : "" }}
            />
          </div>
        </div>
      </div>

      {/* VM & VB Members */}
      <div className="card profile-section">
        <div className="section-header">
          <h2 className="section-title">👥 Org Chart — VM & VB Members</h2>
          <button className="btn btn-secondary btn-sm"
            onClick={() => addItem(vmvbMembers, setVmvbMembers, EMPTY_MEMBER)}>
            + Add Member
          </button>
        </div>
        <div className="member-list">
          {vmvbMembers.map((m, i) => (
            <div key={i} className="member-row">
              <input type="text" placeholder="Full Name" value={m.name}
                onChange={(e) => updateItem(vmvbMembers, setVmvbMembers, i, "name", e.target.value)} />
              <input type="text" placeholder="Position (e.g., Barangay Captain, Kagawad)" value={m.position}
                onChange={(e) => updateItem(vmvbMembers, setVmvbMembers, i, "position", e.target.value)} />
              {vmvbMembers.length > 1 && (
                <button className="remove-btn"
                  onClick={() => removeItem(vmvbMembers, setVmvbMembers, i)}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Secretariat */}
      <div className="card profile-section">
        <div className="section-header">
          <h2 className="section-title">🏛️ Org Chart — SB Secretariat</h2>
          <button className="btn btn-secondary btn-sm"
            onClick={() => addItem(secretariat, setSecretariat, EMPTY_MEMBER)}>
            + Add Member
          </button>
        </div>
        <div className="member-list">
          {secretariat.map((m, i) => (
            <div key={i} className="member-row">
              <input type="text" placeholder="Full Name" value={m.name}
                onChange={(e) => updateItem(secretariat, setSecretariat, i, "name", e.target.value)} />
              <input type="text" placeholder="Position (e.g., Secretary, Treasurer)" value={m.position}
                onChange={(e) => updateItem(secretariat, setSecretariat, i, "position", e.target.value)} />
              {secretariat.length > 1 && (
                <button className="remove-btn"
                  onClick={() => removeItem(secretariat, setSecretariat, i)}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Committees */}
      <div className="card profile-section">
        <div className="section-header">
          <h2 className="section-title">📋 Committees of each SB Member</h2>
          <button className="btn btn-secondary btn-sm"
            onClick={() => addItem(committees, setCommittees, EMPTY_COMMITTEE)}>
            + Add Entry
          </button>
        </div>
        <div className="member-list">
          {committees.map((c, i) => (
            <div key={i} className="member-row">
              <input type="text" placeholder="SB Member Name" value={c.memberName}
                onChange={(e) => updateItem(committees, setCommittees, i, "memberName", e.target.value)} />
              <input type="text" placeholder="Committee/s (e.g., Finance, Health)" value={c.committees}
                onChange={(e) => updateItem(committees, setCommittees, i, "committees", e.target.value)} />
              {committees.length > 1 && (
                <button className="remove-btn"
                  onClick={() => removeItem(committees, setCommittees, i)}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Single Save Button at Bottom */}
      <div className="profile-save-bar">
        {saved && (
          <span className="profile-saved-msg">
            ✅ Profile saved successfully!
          </span>
        )}
        <button className="btn btn-primary profile-save-btn"
          onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};

export default BarangayProfile;