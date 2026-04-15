import React, { useEffect, useState } from "react";
import { getAllBarangays } from "../../firebase/firestoreService.js";
import { MapPin } from "lucide-react";
import "../../components/shared/MainLayout.css";
import "./AdminBarangays.css";

const AdminBarangays = () => {
  const [barangays, setBarangays] = useState([]);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getAllBarangays().then((data) => {
      setBarangays(data);
      setLoading(false);
    });
  }, []);

  const filtered = barangays.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading barangays...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Barangays</span>
        </div>
        <h1 className="page-title">Barangays</h1>
        <p className="page-subtitle">
          {barangays.length} registered barangays in Cuenca, Batangas.
        </p>
      </div>

      <div className="filter-bar">
        <input type="text" className="search-input"
          placeholder="🔍  Search barangay..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏘️</div>
          <div className="empty-state__text">No barangays found.</div>
          <div className="empty-state__sub">
            Create barangay accounts in Manage Users first.
          </div>
        </div>
      ) : (
        <div className="barangay-grid">
          {filtered.map((b) => (
            <div key={b.id} className="barangay-card"
              onClick={() => setSelected(b)}>
              <div className="barangay-card__avatar">
                {b.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="barangay-card__info">
                <h3 className="barangay-card__name">Brgy. {b.name}</h3>
                <p><MapPin size={12} /> {b.address || "No address set"}</p>
                <p>📞 {b.contactNumber || "—"}</p>
                <p>✉️ {b.email || "—"}</p>
              </div>
              <button className="btn btn-secondary btn-sm"
                style={{ alignSelf:"flex-end" }}>
                View Profile →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="brgy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brgy-modal__header">
              <h2>Brgy. {selected.name}</h2>
              <button onClick={() => setSelected(null)}
                className="modal-close-btn">✕</button>
            </div>
            <div className="brgy-modal__body">
              <p><strong>📍 Address:</strong> {selected.address || "—"}</p>
              <p><strong>📞 Contact:</strong> {selected.contactNumber || "—"}</p>
              <p><strong>✉️ Email:</strong> {selected.email || "—"}</p>

              <h4 style={{ marginTop:"1rem" }}>👥 VM & VB Members</h4>
              {selected.orgChartVMVB?.length ? (
                <ul>
                  {selected.orgChartVMVB.map((m, i) => (
                    <li key={i}>{m.position} — {m.name}</li>
                  ))}
                </ul>
              ) : <p style={{ color:"#9ca3af" }}>No data yet.</p>}

              <h4 style={{ marginTop:"1rem" }}>🏛️ Secretariat</h4>
              {selected.orgChartSecretariat?.length ? (
                <ul>
                  {selected.orgChartSecretariat.map((m, i) => (
                    <li key={i}>{m.position} — {m.name}</li>
                  ))}
                </ul>
              ) : <p style={{ color:"#9ca3af" }}>No data yet.</p>}

              <h4 style={{ marginTop:"1rem" }}>📋 Committees</h4>
              {selected.committees?.length ? (
                <ul>
                  {selected.committees.map((c, i) => (
                    <li key={i}><strong>{c.memberName}:</strong> {c.committees}</li>
                  ))}
                </ul>
              ) : <p style={{ color:"#9ca3af" }}>No data yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBarangays;