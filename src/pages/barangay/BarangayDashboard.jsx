import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDocuments } from "../../hooks/useDocuments.js";
import { DOCUMENT_STATUS, STATUS_COLORS } from "../../utils/constants.js";
import { timeAgo } from "../../utils/helpers.js";
import NoteViewerModal from "../../components/admin/NoteViewerModal.jsx";
import {
  FolderOpen, Clock, CheckCircle, XCircle,
  Upload, Eye, FileText, TrendingUp, MessageSquare,
} from "lucide-react";
import "../../components/shared/MainLayout.css";

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

const BarangayDashboard = () => {
  const { userProfile, isAdmin, barangayId } = useAuth();
  const { documents, loading } = useDocuments(isAdmin, barangayId, userProfile);
  const [noteModal, setNoteModal] = useState(EMPTY_NOTE_MODAL);

  const stats = {
    total:    documents.length,
    pending:  documents.filter((d) => d.status === DOCUMENT_STATUS.PENDING).length,
    approved: documents.filter((d) => d.status === DOCUMENT_STATUS.APPROVED).length,
    rejected: documents.filter((d) => d.status === DOCUMENT_STATUS.REJECTED).length,
  };

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
        <h1 className="page-title">
          Welcome, Brgy. {userProfile?.barangayName}! 👋
        </h1>
        <p className="page-subtitle">
          Here's an overview of your document submissions to the SB Office.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Submitted</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--blue">
              <FolderOpen size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color: "#2563eb" }}>
            <TrendingUp size={14} /> All time submissions
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color: "#f59e0b" }}>
                {stats.pending}
              </div>
              <div className="stat-card__label">Pending Review</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--amber">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color: "#f59e0b" }}>
            ⏳ Awaiting SB Office action
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color: "#10b981" }}>
                {stats.approved}
              </div>
              <div className="stat-card__label">Approved</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--green">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color: "#10b981" }}>
            ✅ Successfully processed
          </div>
        </div>

        <div className="stat-card stat-card--red">
          <div className="stat-card__top">
            <div>
              <div className="stat-card__value" style={{ color: "#ef4444" }}>
                {stats.rejected}
              </div>
              <div className="stat-card__label">Rejected</div>
            </div>
            <div className="stat-card__icon-wrap stat-card__icon-wrap--red">
              <XCircle size={22} />
            </div>
          </div>
          <div className="stat-card__trend" style={{ color: "#ef4444" }}>
            ❌ Needs attention
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────── */}
      <div className="quick-actions">
        <Link to="/barangay/upload" className="btn btn-primary">
          <Upload size={16} /> Upload Document
        </Link>
        <Link to="/barangay/documents" className="btn btn-secondary">
          <Eye size={16} /> View All Documents
        </Link>
        <Link to="/barangay/profile" className="btn btn-secondary">
          <FileText size={16} /> Edit Profile
        </Link>
      </div>

      {/* ── Recent Submissions ──────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText size={18} color="#2563eb" />
            Recent Submissions
          </h2>
          <Link to="/barangay/documents" className="btn btn-secondary btn-sm">
            View All →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__text">No documents uploaded yet</div>
            <div className="empty-state__sub">
              Start by uploading your first document
            </div>
            <Link
              to="/barangay/upload"
              className="btn btn-primary"
              style={{ marginTop: "1rem", display: "inline-flex" }}
            >
              <Upload size={16} /> Upload Now
            </Link>
          </div>
        ) : (
          <div className="data-table-wrapper" style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 620, tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: "32%", textAlign: "left" }}>Document</th>
                  <th style={{ width: "15%", textAlign: "center" }}>Category</th>
                  <th style={{ width: "13%", textAlign: "center" }}>Status</th>
                  <th style={{ width: "13%", textAlign: "center" }}>Uploaded</th>
                  <th style={{ width: "27%", textAlign: "center" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 5).map((doc) => {
                  const colors      = STATUS_COLORS[doc.status] || STATUS_COLORS.Pending;
                  const hasMyNote   = Boolean(doc.description);
                  const hasAdminNote = Boolean(doc.reviewNote);

                  return (
                    <tr key={doc.id}>

                      {/* Document name */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                          <div style={{
                            width: 28, height: 28, background: "#eff6ff", borderRadius: 7,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, border: "1px solid #dbeafe",
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
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          background: "#f1f5f9", color: "#475569",
                          padding: "0.2rem 0.55rem", borderRadius: 6,
                          fontSize: "0.76rem", fontWeight: 600, textTransform: "capitalize",
                          display: "inline-block", maxWidth: "100%",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {doc.category?.replace("_", " ")}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          className="status-badge"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          <span className="status-dot" style={{ background: colors.dot }} />
                          {doc.status}
                        </span>
                      </td>

                      {/* Uploaded */}
                      <td style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", whiteSpace: "nowrap" }}>
                        {timeAgo(doc.uploadedAt)}
                      </td>

                      {/* Notes — My Note (green) + Admin Note (blue) */}
                      <td style={{ textAlign: "center" }}>
                        {!hasMyNote && !hasAdminNote ? (
                          <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>—</span>
                        ) : (
                          <div style={{
                            display: "flex", flexDirection: "column",
                            gap: "0.3rem", alignItems: "center",
                          }}>
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

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
};

export default BarangayDashboard;
