// src/components/admin/NoteViewerModal.jsx
import React, { useEffect } from "react";
import { MessageSquare, FileText, Calendar, X } from "lucide-react";
import { formatDate } from "../../utils/helpers.js";
import { STATUS_COLORS } from "../../utils/constants.js";
import "./NoteViewerModal.css";

const NoteViewerModal = ({
  note, fileName, reviewedAt, reviewedBy, status, onClose,
  title = "Review Note",
  authorLabel = "Reviewer",
}) => {
  const colors  = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  const initial = reviewedBy ? reviewedBy.charAt(0).toUpperCase() : "A";

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="nm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="nm-sheet" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ─────────────────────────── */}
        <div className="nm-header">
          <div className="nm-header__left">
            <div className="nm-header__icon">
              <MessageSquare size={15} />
            </div>
            <h3 className="nm-title">{title}</h3>
          </div>
          <button className="nm-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ───────────────────────────── */}
        <div className="nm-body">

          {/* Document chip */}
          <div className="nm-doc-chip">
            <div className="nm-doc-chip__icon">
              <FileText size={13} color="#2563eb" />
            </div>
            <span className="nm-doc-chip__name" title={fileName}>{fileName}</span>
            <span
              className="nm-status-badge"
              style={{ background: colors.bg, color: colors.text }}
            >
              <span className="nm-status-dot" style={{ background: colors.dot }} />
              {status}
            </span>
          </div>

          {/* Reviewer section */}
          <div className="nm-section">
            <div className="nm-section__label">{authorLabel}</div>
            <div className="nm-reviewer">
              <div className="nm-reviewer__avatar">{initial}</div>
              <div className="nm-reviewer__info">
                <span className="nm-reviewer__name">
                  {reviewedBy || "SB Administrator"}
                </span>
                <span className="nm-reviewer__date">
                  <Calendar size={11} />
                  {reviewedAt ? formatDate(reviewedAt) : "Date not recorded"}
                </span>
              </div>
            </div>
          </div>

          {/* Note body section */}
          <div className="nm-section">
            <div className="nm-section__label">Comment</div>
            <div className="nm-note-body">
              {note
                ? note
                : <span className="nm-note-empty">No comment was provided with this review.</span>
              }
            </div>
          </div>

        </div>

        {/* ── Footer ─────────────────────────── */}
        <div className="nm-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

export default NoteViewerModal;
