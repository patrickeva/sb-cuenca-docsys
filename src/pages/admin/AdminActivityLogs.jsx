import React, { useEffect, useState } from "react";
import { getActivityLogs } from "../../firebase/firestoreService.js";
import { formatDate } from "../../utils/helpers.js";
import "../../components/shared/MainLayout.css";

const ACTION_ICONS = {
  UPLOAD:        "Upload",
  DELETE:        "Delete",
  STATUS_CHANGE: "Status Change",
  VIEW:          "View",
  LOGIN:         "Login",
  LOGOUT:        "Logout",
  DEFAULT:       "Action",
};

const ACTION_COLORS = {
  UPLOAD:        { bg:"#d1fae5", text:"#065f46" },
  DELETE:        { bg:"#fee2e2", text:"#991b1b" },
  STATUS_CHANGE: { bg:"#dbeafe", text:"#1e40af" },
  VIEW:          { bg:"#f3e8ff", text:"#6b21a8" },
  LOGIN:         { bg:"#fef9c3", text:"#854d0e" },
  LOGOUT:        { bg:"#f1f5f9", text:"#475569" },
  DEFAULT:       { bg:"#f1f5f9", text:"#374151" },
};

const ALL_ACTIONS = ["UPLOAD", "DELETE", "STATUS_CHANGE", "VIEW", "LOGIN", "LOGOUT"];

const AdminActivityLogs = () => {
  const [logs,         setLogs]         = useState([]);
  const [search,       setSearch]       = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    getActivityLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.barangayName?.toLowerCase().includes(search.toLowerCase()) ||
      l.userName?.toLowerCase().includes(search.toLowerCase());

    const matchAction = !filterAction || l.action === filterAction;

    const logDate = l.timestamp?.toDate ? l.timestamp.toDate() : null;
    const matchFrom = !dateFrom || (logDate && logDate >= new Date(dateFrom));
    const matchTo   = !dateTo   || (logDate && logDate <= new Date(dateTo + "T23:59:59"));

    return matchSearch && matchAction && matchFrom && matchTo;
  });

  const clearFilters = () => {
    setSearch(""); setFilterAction(""); setDateFrom(""); setDateTo("");
  };

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
          All system actions — <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> records.
        </p>
      </div>

      <div className="filter-bar">
        <input type="text" className="search-input"
          placeholder="🔍  Search by action, user, or barangay..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          <option value="">All Actions</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace("_"," ")}
            </option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
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
                        {ACTION_ICONS[log.action] || ACTION_ICONS.DEFAULT}
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