// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDocuments, getAllBarangays } from "../../firebase/firestoreService.js";
import { STATUS_COLORS, DOCUMENT_STATUS, DOCUMENT_CATEGORIES } from "../../utils/constants.js";
import { timeAgo } from "../../utils/helpers.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import {
  FolderOpen, Clock, CheckCircle, MapPin,
  FileText, TrendingUp, Eye, Users, BarChart2,
  AlertTriangle, HardDrive, Trash2,
} from "lucide-react";
import "../../components/shared/MainLayout.css";

const COLORS = [
  "#2563eb","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#06b6d4","#f97316","#84cc16",
  "#ec4899","#64748b",
];

const SUPABASE_FREE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1GB

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

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

  // ── Storage Calculation ─────────────────────
  const totalUsedBytes  = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  const usagePercent    = Math.min((totalUsedBytes / SUPABASE_FREE_LIMIT_BYTES) * 100, 100);
  const showWarning     = usagePercent >= 70;
  const isCritical      = usagePercent >= 90;

  // ── Chart Data ──────────────────────────────
  const barangayData = barangays
    .map((b) => ({
      name: b.name?.replace("Barangay ", "Brgy. ") || "Unknown",
      uploads: documents.filter((d) => d.barangayId === b.id).length,
    }))
    .filter((b) => b.uploads > 0)
    .sort((a, b) => b.uploads - a.uploads)
    .slice(0, 10);

  const categoryData = DOCUMENT_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: documents.filter((d) => d.category === cat.value).length,
  })).filter((c) => c.value > 0);

  const monthlyData = (() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-PH", { month: "short", year: "2-digit" });
      const count = documents.filter((doc) => {
        const uploaded = doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : null;
        return uploaded &&
          uploaded.getMonth() === d.getMonth() &&
          uploaded.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, uploads: count });
    }
    return months;
  })();

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

      {/* ── Storage Warning Banner ── */}
      {showWarning && (
        <div style={{
          background: isCritical ? "#fef2f2" : "#fffbeb",
          border: `1.5px solid ${isCritical ? "#fecaca" : "#fde68a"}`,
          borderRadius: 14,
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.875rem",
        }}>
          <div style={{
            width: 40, height: 40, flexShrink: 0,
            background: isCritical ? "#fee2e2" : "#fef3c7",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={20} color={isCritical ? "#dc2626" : "#d97706"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: isCritical ? "#991b1b" : "#92400e",
              marginBottom: "0.3rem",
            }}>
              {isCritical
                ? "⚠️ Storage Critical — Immediate Action Required!"
                : "⚠️ Storage Warning — Getting Full"}
            </div>
            <div style={{ fontSize: "0.82rem", color: isCritical ? "#b91c1c" : "#a16207", marginBottom: "0.75rem" }}>
              {`Currently using `}
              <strong>{formatBytes(totalUsedBytes)}</strong>
              {` out of 1GB free storage (`}
              <strong>{usagePercent.toFixed(1)}%</strong>
              {`). `}
              {isCritical
                ? "Storage is almost full. Delete old or unnecessary documents immediately to prevent upload failures."
                : "Consider deleting old or unnecessary documents to free up space."}
            </div>

            {/* Progress Bar */}
            <div style={{
              background: "rgba(0,0,0,0.08)",
              borderRadius: 999,
              height: 8,
              marginBottom: "0.75rem",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${usagePercent}%`,
                height: "100%",
                background: isCritical
                  ? "linear-gradient(90deg, #ef4444, #dc2626)"
                  : "linear-gradient(90deg, #f59e0b, #d97706)",
                borderRadius: 999,
                transition: "width 0.5s ease",
              }} />
            </div>

            <Link to="/admin/documents" className="btn btn-danger btn-sm"
              style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem" }}>
              <Trash2 size={14} /> Go to Documents to Delete
            </Link>
          </div>
        </div>
      )}

      {/* ── Storage Meter (always visible) ── */}
      <div className="card" style={{ marginBottom:"1.25rem", padding:"1rem 1.25rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <HardDrive size={17} color="#2563eb" />
            <span style={{ fontWeight:700, fontSize:"0.875rem", color:"#0f172a" }}>
              Storage Usage
            </span>
          </div>
          <span style={{ fontSize:"0.8rem", color:"#64748b", fontWeight:600 }}>
            {formatBytes(totalUsedBytes)} / 1 GB
          </span>
        </div>
        <div style={{
          background:"#f1f5f9", borderRadius:999, height:10, overflow:"hidden",
        }}>
          <div style={{
            width: `${usagePercent}%`,
            height: "100%",
            background: isCritical
              ? "linear-gradient(90deg,#ef4444,#dc2626)"
              : usagePercent >= 70
              ? "linear-gradient(90deg,#f59e0b,#d97706)"
              : "linear-gradient(90deg,#2563eb,#1d4ed8)",
            borderRadius: 999,
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{
          display:"flex", justifyContent:"space-between",
          marginTop:"0.4rem", fontSize:"0.72rem", color:"#94a3b8",
        }}>
          <span>0 GB</span>
          <span style={{ color: isCritical ? "#ef4444" : usagePercent >= 70 ? "#f59e0b" : "#94a3b8", fontWeight:600 }}>
            {usagePercent.toFixed(1)}% used
          </span>
          <span>1 GB</span>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Quick Actions */}
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

      {/* Charts */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
        gap:"1.25rem",
        marginBottom:"1.25rem",
      }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><BarChart2 size={18} color="#2563eb" /> Monthly Uploads</h2>
          </div>
          {monthlyData.every((m) => m.uploads === 0) ? (
            <div className="empty-state" style={{ padding:"2rem" }}>
              <div className="empty-state__icon">📈</div>
              <div className="empty-state__text">No uploads yet.</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top:10, right:20, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize:11, fill:"#64748b" }} />
                <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }} />
                <Line type="monotone" dataKey="uploads" stroke="#2563eb"
                  strokeWidth={2.5} dot={{ r:4, fill:"#2563eb" }} activeDot={{ r:6 }} name="Uploads" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><BarChart2 size={18} color="#8b5cf6" /> By Category</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding:"2rem" }}>
              <div className="empty-state__icon">🥧</div>
              <div className="empty-state__text">No documents yet.</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) =>
                    `${name.length > 10 ? name.slice(0,10)+"…" : name} ${(percent*100).toFixed(0)}%`
                  }
                  labelLine={false} fontSize={10}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom:"1.25rem" }}>
        <div className="card-header">
          <h2 className="card-title"><BarChart2 size={18} color="#10b981" /> Uploads per Barangay</h2>
        </div>
        {barangayData.length === 0 ? (
          <div className="empty-state" style={{ padding:"2rem" }}>
            <div className="empty-state__icon">📊</div>
            <div className="empty-state__text">No uploads yet.</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barangayData} margin={{ top:10, right:20, left:-10, bottom:60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:"#64748b" }}
                angle={-35} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize:11, fill:"#64748b" }} />
              <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }} />
              <Bar dataKey="uploads" name="Uploads" radius={[6,6,0,0]}>
                {barangayData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><FileText size={18} color="#2563eb" /> Recent Submissions</h2>
          <Link to="/admin/documents" className="btn btn-secondary btn-sm">View All →</Link>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__text">No documents submitted yet.</div>
            <div className="empty-state__sub">Barangays can start uploading documents.</div>
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
                            width:28, height:28, background:"#eff6ff", borderRadius:7,
                            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                          }}>
                            <FileText size={13} color="#2563eb" />
                          </div>
                          <span style={{ fontWeight:600, fontSize:"0.82rem" }}>{doc.fileName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                          <MapPin size={12} color="#94a3b8" />{doc.barangayName}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background:"#f1f5f9", color:"#475569",
                          padding:"0.2rem 0.55rem", borderRadius:6,
                          fontSize:"0.76rem", fontWeight:600, textTransform:"capitalize",
                        }}>
                          {doc.category?.replace("_"," ")}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background:colors.bg, color:colors.text }}>
                          <span className="status-dot" style={{ background:colors.dot }} />
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ color:"#64748b", fontSize:"0.8rem" }}>{timeAgo(doc.uploadedAt)}</td>
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