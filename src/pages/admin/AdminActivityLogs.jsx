import React, { useEffect, useState } from "react";
import { getActivityLogs } from "../../firebase/firestoreService.js";
import { formatDate } from "../../utils/helpers.js";
import "../../components/shared/MainLayout.css";

const ACTION_ICONS = {
  UPLOAD: "⬆️", DELETE: "🗑️", STATUS_CHANGE: "🔄", DEFAULT: "📋",
};
const ACTION_COLORS = {
  UPLOAD:        { bg:"#d1fae5", text:"#065f46" },
  DELETE:        { bg:"#fee2e2", text:"#991b1b" },
  STATUS_CHANGE: { bg:"#dbeafe", text:"#1e40af" },
  DEFAULT:       { bg:"#f1f5f9", text:"#374151" },
};

const AdminActivityLogs = () => {
  const [logs,    setLogs]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter((l) =>
    l.description?.toLowerCase().includes(search.toLowerCase()) ||
    l.barangayName?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading logs...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Activity Logs</span>
        </div>
        <h1 className="page-title">Activity Logs</h1>
        <p className="page-subtitle">
          All system actions — {logs.length} records total.
        </p>
      </div>

      <div className="filter-bar">
        <input type="text" className="search-input"
          placeholder="🔍  Search by action, user, or barangay..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="data-table-wrapper" style={{ borderRadius:14 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Description</th>
                <th>User</th>
                <th>Barangay</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-state__icon">📋</div>
                    <div className="empty-state__text">No logs found.</div>
                    <div className="empty-state__sub">
                      Logs will appear when barangays start uploading documents.
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map((log) => {
                const color = ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;
                return (
                  <tr key={log.id}>
                    <td>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:"0.35rem",
                        background:color.bg, color:color.text,
                        padding:"0.2rem 0.6rem", borderRadius:"999px",
                        fontSize:"0.75rem", fontWeight:600, whiteSpace:"nowrap",
                      }}>
                        {ACTION_ICONS[log.action] || ACTION_ICONS.DEFAULT} {log.action}
                      </span>
                    </td>
                    <td style={{ maxWidth:280, wordBreak:"break-word" }}>
                      {log.description}
                    </td>
                    <td style={{ color:"#64748b" }}>{log.userName || "—"}</td>
                    <td>{log.barangayName || "—"}</td>
                    <td style={{ color:"#64748b", fontSize:"0.8rem", whiteSpace:"nowrap" }}>
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;