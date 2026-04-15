import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDocuments } from "../../hooks/useDocuments.js";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS, STATUS_COLORS, CUENCA_BARANGAYS } from "../../utils/constants.js";
import { filterDocuments, formatDate, formatFileSize } from "../../utils/helpers.js";
import StatusModal from "../../components/admin/StatusModal.jsx";
import DeleteConfirmModal from "../../components/shared/DeleteConfirmModal.jsx";
import { Search, FileText, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import "../../components/shared/MainLayout.css";
import "./AdminDocuments.css";

const AdminDocuments = () => {
  const { userProfile, isAdmin } = useAuth();
  const { documents, loading, changeStatus, removeDocument } = useDocuments(isAdmin, null, userProfile);

  const [search,         setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterBarangay, setFilterBarangay] = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [statusModal,    setStatusModal]    = useState({ open:false, document:null });
  const [deleteModal,    setDeleteModal]    = useState({ open:false, document:null });

  const filtered = filterDocuments(documents, {
    search, category: filterCategory, status: filterStatus, dateFrom, dateTo,
  }).filter((d) => !filterBarangay || d.barangayName === filterBarangay);

  const handleStatusSave = async (status, reviewNote) => {
    await changeStatus(
      statusModal.document.id,
      status,
      reviewNote,
      statusModal.document
    );
    setStatusModal({ open:false, document:null });
  };

  const handleDelete = async () => {
    await removeDocument(deleteModal.document);
    setDeleteModal({ open:false, document:null });
  };

  const clearFilters = () => {
    setSearch(""); setFilterCategory(""); setFilterStatus("");
    setFilterBarangay(""); setDateFrom(""); setDateTo("");
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading documents...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">All Documents</span>
        </div>
        <h1 className="page-title">All Documents</h1>
        <p className="page-subtitle">
          Showing <strong>{filtered.length}</strong> of <strong>{documents.length}</strong> total documents.
        </p>
      </div>

      {/* Filters */}
      <div className="adocs-filters">
        <div className="adocs-search-wrap">
          <Search size={16} className="adocs-search-icon" />
          <input
            type="text"
            placeholder="Search document name, barangay, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="adocs-search"
          />
        </div>
        <div className="adocs-filter-row">
          <select value={filterBarangay} onChange={(e) => setFilterBarangay(e.target.value)}>
            <option value="">All Barangays</option>
            {CUENCA_BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
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
          <div className="adocs-date-wrap">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span style={{ color:"#94a3b8" }}>→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="adocs-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__text">No documents found.</div>
          </div>
        ) : filtered.map((doc) => {
          const colors = STATUS_COLORS[doc.status] || STATUS_COLORS.Pending;
          return (
            <div key={doc.id} className="adoc-card">
              <div className="adoc-card__top">
                <div className="adoc-card__icon">
                  <FileText size={16} color="#2563eb" />
                </div>
                <span className="status-badge"
                  style={{ background:colors.bg, color:colors.text }}>
                  <span className="status-dot" style={{ background:colors.dot }} />
                  {doc.status}
                </span>
              </div>
              <div className="adoc-card__name">{doc.fileName}</div>
              <div className="adoc-card__meta">
                <span><MapPin size={12} /> {doc.barangayName}</span>
                <span style={{ textTransform:"capitalize" }}>
                  {doc.category?.replace("_"," ")}
                </span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
              <div className="adoc-card__date">{formatDate(doc.uploadedAt)}</div>
              <div className="adoc-card__actions">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                  className="btn btn-secondary btn-sm">
                  <Eye size={13} /> View
                </a>
                <button className="btn btn-primary btn-sm"
                  onClick={() => setStatusModal({ open:true, document:doc })}>
                  <Pencil size={13} /> Update
                </button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal({ open:true, document:doc })}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="adocs-table-wrap">
        <table className="adocs-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Barangay</th>
              <th>Category</th>
              <th>Size</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7">
                <div className="empty-state">
                  <div className="empty-state__icon">🔍</div>
                  <div className="empty-state__text">No documents found.</div>
                </div>
              </td></tr>
            ) : filtered.map((doc) => {
              const colors = STATUS_COLORS[doc.status] || STATUS_COLORS.Pending;
              return (
                <tr key={doc.id}>
                  <td>
                    <div className="adocs-filename">
                      <div className="adocs-file-icon">
                        <FileText size={13} color="#2563eb" />
                      </div>
                      <span>{doc.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                      <MapPin size={12} color="#94a3b8" />
                      {doc.barangayName}
                    </div>
                  </td>
                  <td>
                    <span className="adocs-category">
                      {doc.category?.replace("_"," ")}
                    </span>
                  </td>
                  <td style={{ color:"#64748b" }}>{formatFileSize(doc.fileSize)}</td>
                  <td style={{ color:"#64748b", fontSize:"0.8rem", whiteSpace:"nowrap" }}>
                    {formatDate(doc.uploadedAt)}
                  </td>
                  <td>
                    <span className="status-badge"
                      style={{ background:colors.bg, color:colors.text }}>
                      <span className="status-dot" style={{ background:colors.dot }} />
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="adocs-actions">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        className="btn btn-secondary btn-sm">
                        <Eye size={13} /> View
                      </a>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => setStatusModal({ open:true, document:doc })}>
                        <Pencil size={13} /> Update
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setDeleteModal({ open:true, document:doc })}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusModal.open && (
        <StatusModal
          document={statusModal.document}
          onClose={() => setStatusModal({ open:false, document:null })}
          onSave={handleStatusSave}
        />
      )}
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

export default AdminDocuments;