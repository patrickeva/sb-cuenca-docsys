// src/pages/barangay/BarangayDocuments.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDocuments } from "../../hooks/useDocuments.js";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS, STATUS_COLORS } from "../../utils/constants.js";
import { filterDocuments, formatDate, formatFileSize } from "../../utils/helpers.js";
import DeleteConfirmModal from "../../components/shared/DeleteConfirmModal.jsx";
import { Upload, Eye, Trash2, FileText } from "lucide-react";
import "../../components/shared/MainLayout.css";

const getOpenUrl = (doc) => {
  const isWord =
    doc.fileType === "application/msword" ||
    doc.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    doc.fileName?.endsWith(".doc") ||
    doc.fileName?.endsWith(".docx");

  if (isWord) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(doc.fileUrl)}&embedded=false`;
  }
  return doc.fileUrl;
};

const BarangayDocuments = () => {
  const { userProfile, isAdmin, barangayId } = useAuth();
  const { documents, loading, removeDocument } = useDocuments(isAdmin, barangayId, userProfile);

  const [search,         setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [deleteModal,    setDeleteModal]    = useState({ open:false, document:null });

  const filtered = filterDocuments(documents, {
    search, category: filterCategory, status: filterStatus, dateFrom, dateTo,
  });

  const handleDelete = async () => {
    await removeDocument(deleteModal.document);
    setDeleteModal({ open:false, document:null });
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading documents...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div className="breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">My Documents</span>
          </div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-subtitle">
            Showing <strong>{filtered.length}</strong> of <strong>{documents.length}</strong> documents.
          </p>
        </div>
        <Link to="/barangay/upload" className="btn btn-primary">
          <Upload size={16} /> Upload New
        </Link>
      </div>

      <div className="filter-bar">
        <input type="text" className="search-input"
          placeholder="🔍  Search by name or keyword..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.values(DOCUMENT_STATUS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)} />
        <button className="btn btn-secondary btn-sm"
          onClick={() => { setSearch(""); setFilterCategory(""); setFilterStatus(""); setDateFrom(""); setDateTo(""); }}>
          Clear
        </button>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="data-table-wrapper" style={{ borderRadius:14 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Status</th>
                <th>Date Uploaded</th>
                <th>Review Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state__icon">📭</div>
                    <div className="empty-state__text">No documents found.</div>
                    <Link to="/barangay/upload" className="btn btn-primary"
                      style={{ marginTop:"1rem", display:"inline-flex" }}>
                      <Upload size={16} /> Upload First Document
                    </Link>
                  </div>
                </td></tr>
              ) : filtered.map((doc) => {
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
                      <span style={{
                        background:"#f1f5f9", color:"#475569", padding:"0.2rem 0.55rem",
                        borderRadius:6, fontSize:"0.76rem", fontWeight:600, textTransform:"capitalize",
                      }}>
                        {doc.category?.replace("_"," ")}
                      </span>
                    </td>
                    <td style={{ color:"#64748b" }}>{formatFileSize(doc.fileSize)}</td>
                    <td>
                      <span className="status-badge" style={{ background:colors.bg, color:colors.text }}>
                        <span className="status-dot" style={{ background:colors.dot }} />
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ color:"#64748b", fontSize:"0.8rem", whiteSpace:"nowrap" }}>
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td style={{ color:"#64748b", fontSize:"0.8rem", maxWidth:180 }}>
                      {doc.reviewNote || <span style={{ color:"#cbd5e1" }}>No notes yet</span>}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:"0.4rem" }}>
                        <a href={getOpenUrl(doc)} target="_blank" rel="noreferrer"
                          className="btn btn-secondary btn-sm">
                          <Eye size={13} /> View
                        </a>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => setDeleteModal({ open:true, document:doc })}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal.open && (
        <DeleteConfirmModal
          fileName={deleteModal.document?.fileName}
          onClose={() => setDeleteModal({ open:false, document:null })}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default BarangayDocuments;