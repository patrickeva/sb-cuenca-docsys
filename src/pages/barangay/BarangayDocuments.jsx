// src/pages/barangay/BarangayDocuments.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDocuments } from "../../hooks/useDocuments.js";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS, STATUS_COLORS } from "../../utils/constants.js";
import { filterDocuments, formatDate, formatFileSize } from "../../utils/helpers.js";
import DeleteConfirmModal from "../../components/shared/DeleteConfirmModal.jsx";
import NoteViewerModal from "../../components/admin/NoteViewerModal.jsx";
import { Upload, Eye, Trash2, FileText, MessageSquare } from "lucide-react";
import "../../components/shared/MainLayout.css";

const getOpenUrl = (doc) => doc.fileUrl || "";

const EMPTY_NOTE_MODAL = {
  open: false,
  note: "",
  fileName: "",
  reviewedAt: null,
  reviewedBy: "",
  status: "Pending",
  title: "Note",
  authorLabel: "From",
};

const BarangayDocuments = () => {
  const { userProfile, isAdmin, barangayId } = useAuth();
  const { documents, loading, removeDocument } = useDocuments(isAdmin, barangayId, userProfile);

  const [search,         setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [deleteModal,    setDeleteModal]    = useState({ open: false, document: null });
  const [noteModal,      setNoteModal]      = useState(EMPTY_NOTE_MODAL);

  const filtered = filterDocuments(documents, {
    search, category: filterCategory, status: filterStatus, dateFrom, dateTo,
  });

  const openAdminNote = (doc) => setNoteModal({
    open: true,
    note: doc.reviewNote,
    fileName: doc.fileName,
    reviewedAt: doc.reviewedAt,
    reviewedBy: doc.reviewedBy,
    status: doc.status,
    title: "Admin Review Note",
    authorLabel: "Reviewed By",
  });

  const openMyNote = (doc) => setNoteModal({
    open: true,
    note: doc.description,
    fileName: doc.fileName,
    reviewedAt: doc.uploadedAt,
    reviewedBy: userProfile?.displayName,
    status: doc.status,
    title: "My Note",
    authorLabel: "Submitted By",
  });

  const closeNoteModal = () => setNoteModal(EMPTY_NOTE_MODAL);

  const handleDelete = async () => {
    await removeDocument(deleteModal.document);
    setDeleteModal({ open: false, document: null });
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading documents...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
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
        <input
          type="text"
          className="search-input"
          placeholder="🔍  Search by name or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setSearch(""); setFilterCategory(""); setFilterStatus("");
            setDateFrom(""); setDateTo("");
          }}
        >
          Clear
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="data-table-wrapper" style={{ borderRadius: 14 }}>
          <table className="data-table" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "28%", textAlign: "left" }}>Document Name</th>
                <th style={{ width: "13%", textAlign: "center" }}>Category</th>
                <th style={{ width: "7%",  textAlign: "center" }}>Size</th>
                <th style={{ width: "11%", textAlign: "center" }}>Status</th>
                <th style={{ width: "13%", textAlign: "center" }}>Date Uploaded</th>
                <th style={{ width: "14%", textAlign: "center" }}>Notes</th>
                <th style={{ width: "14%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state__icon">📭</div>
                      <div className="empty-state__text">No documents found.</div>
                      <Link
                        to="/barangay/upload"
                        className="btn btn-primary"
                        style={{ marginTop: "1rem", display: "inline-flex" }}
                      >
                        <Upload size={16} /> Upload First Document
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((doc) => {
                const colors = STATUS_COLORS[doc.status] || STATUS_COLORS.Pending;
                const hasAdminNote = Boolean(doc.reviewNote);
                const hasMyNote    = Boolean(doc.description);

                return (
                  <tr key={doc.id}>

                    {/* Document Name */}
                    <td data-label="Document">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                        <div style={{
                          width: 28, height: 28, background: "#eff6ff", borderRadius: 7, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid #dbeafe",
                        }}>
                          <FileText size={13} color="#2563eb" />
                        </div>
                        <span style={{
                          fontWeight: 600, fontSize: "0.82rem",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {doc.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td data-label="Category" style={{ textAlign: "center" }}>
                      <span style={{
                        background: "#f1f5f9", color: "#475569", padding: "0.2rem 0.55rem",
                        borderRadius: 6, fontSize: "0.76rem", fontWeight: 600, textTransform: "capitalize",
                        display: "inline-block", maxWidth: "100%",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {doc.category?.replace("_", " ")}
                      </span>
                    </td>

                    {/* Size */}
                    <td data-label="Size" style={{ color: "#64748b", textAlign: "center", fontSize: "0.8rem" }}>
                      {formatFileSize(doc.fileSize)}
                    </td>

                    {/* Status */}
                    <td data-label="Status" style={{ textAlign: "center" }}>
                      <span className="status-badge" style={{ background: colors.bg, color: colors.text }}>
                        <span className="status-dot" style={{ background: colors.dot }} />
                        {doc.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td data-label="Uploaded" style={{ color: "#64748b", fontSize: "0.8rem", whiteSpace: "nowrap", textAlign: "center" }}>
                      {formatDate(doc.uploadedAt)}
                    </td>

                    {/* Notes — Admin Note (blue) + My Note (green), stacked */}
                    <td data-label="Notes" style={{ textAlign: "center" }}>
                      {!hasAdminNote && !hasMyNote ? (
                        <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center" }}>
                          {hasMyNote && (
                            <button
                              onClick={() => openMyNote(doc)}
                              style={{
                                background: "#f0fdf4", border: "1px solid #bbf7d0",
                                borderRadius: 7, padding: "0.28rem 0.6rem",
                                fontSize: "0.73rem", color: "#15803d", fontWeight: 700,
                                cursor: "pointer", whiteSpace: "nowrap",
                                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                width: "100%", justifyContent: "center",
                              }}
                            >
                              <FileText size={11} /> My Note
                            </button>
                          )}
                          {hasAdminNote && (
                            <button
                              onClick={() => openAdminNote(doc)}
                              style={{
                                background: "#eff6ff", border: "1px solid #bfdbfe",
                                borderRadius: 7, padding: "0.28rem 0.6rem",
                                fontSize: "0.73rem", color: "#2563eb", fontWeight: 700,
                                cursor: "pointer", whiteSpace: "nowrap",
                                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                width: "100%", justifyContent: "center",
                              }}
                            >
                              <MessageSquare size={11} /> Admin Note
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td data-label="Actions" style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                        <a
                          href={getOpenUrl(doc)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} /> View
                        </a>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteModal({ open: true, document: doc })}
                        >
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

      {noteModal.open && (
        <NoteViewerModal
          title={noteModal.title}
          authorLabel={noteModal.authorLabel}
          note={noteModal.note}
          fileName={noteModal.fileName}
          reviewedAt={noteModal.reviewedAt}
          reviewedBy={noteModal.reviewedBy}
          status={noteModal.status}
          onClose={closeNoteModal}
        />
      )}

      {deleteModal.open && (
        <DeleteConfirmModal
          fileName={deleteModal.document?.fileName}
          onClose={() => setDeleteModal({ open: false, document: null })}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default BarangayDocuments;
