import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDocuments, getAllBarangays } from "../../firebase/firestoreService.js";
import { STATUS_COLORS, DOCUMENT_STATUS } from "../../utils/constants.js";
import { timeAgo } from "../../utils/helpers.js";
import {
  FolderOpen, Clock, CheckCircle, MapPin,
  FileText, TrendingUp, Eye, Users
} from "lucide-react";
import "../../components/shared/MainLayout.css";

const AdminDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [docs, brgys] = await Promise.all([
        getAllDocuments(),
        getAllBarangays(),
      ]);
      setDocuments(docs);
      setBarangays(brgys);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    total:     documents.length,
    pending:   documents.filter((d) => d.status === DOCUMENT_STATUS.PENDING).length,
    approved:  documents.filter((d) => d.status === DOCUMENT_STATUS.APPROVED).length,
    barangays: barangays.length,
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Dashboard</span>
        </div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Overview of all barangay submissions — Municipality of Cuenca, Batangas
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Documents</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--blue">
              <FolderOpen size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color:"#2563eb" }}>
            <TrendingUp size={14} /> All barangay submissions
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color:"#f59e0b" }}>
                {stats.pending}
              </div>
              <div className="stat-card__label">Pending Review</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--amber">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color:"#f59e0b" }}>
            ⏳ Needs your attention
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color:"#10b981" }}>
                {stats.approved}
              </div>
              <div className="stat-card__label">Approved</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--green">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color:"#10b981" }}>
            ✅ Successfully processed
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color:"#8b5cf6" }}>
                {stats.barangays}
              </div>
              <div className="stat-card__label">Barangays</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--purple">
              <MapPin size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color:"#8b5cf6" }}>
            🏘️ Cuenca, Batangas
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/admin/documents" className="btn btn-primary">
          <Eye size={16} /> Review Documents
        </Link>
        <Link to="/admin/barangays" className="btn btn-secondary">
          <MapPin size={16} /> View Barangays
        </Link>
        <Link to="/admin/manage-users" className="btn btn-secondary">
          <Users size={16} /> Manage Users
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText size={18} color="#2563eb" />
            Recent Submissions
          </h2>
          <Link to="/admin/documents" className="btn btn-secondary btn-sm">
            View All →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__text">No documents submitted yet.</div>
            <div className="empty-state__sub">
              Barangays can start uploading documents.
            </div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Barangay</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 5).map((doc) => {
                  const colors = STATUS_COLORS[doc.status] || STATUS_COLORS.Pending;
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                          <div style={{
                            width:28, height:28, background:"#eff6ff",
                            borderRadius:7, display:"flex",
                            alignItems:"center", justifyContent:"center",
                            flexShrink:0,
                          }}>
                            <FileText size={13} color="#2563eb" />
                          </div>
                          <span style={{ fontWeight:600, fontSize:"0.82rem" }}>
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                          <MapPin size={12} color="#94a3b8" />
                          {doc.barangayName}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background:"#f1f5f9", color:"#475569",
                          padding:"0.2rem 0.55rem", borderRadius:6,
                          fontSize:"0.76rem", fontWeight:600,
                          textTransform:"capitalize",
                        }}>
                          {doc.category?.replace("_"," ")}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge"
                          style={{ background:colors.bg, color:colors.text }}>
                          <span className="status-dot" style={{ background:colors.dot }} />
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ color:"#64748b", fontSize:"0.8rem" }}>
                        {timeAgo(doc.uploadedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;