// src/components/admin/StatusModal.jsx
import React, { useState } from "react";
import { DOCUMENT_STATUS, STATUS_COLORS } from "../../utils/constants.js";
import { X, Save } from "lucide-react";
import "../shared/Modal.css";

const StatusModal = ({ document, onClose, onSave }) => {
  const [status,     setStatus]     = useState(document?.status || "Pending");
  const [reviewNote, setReviewNote] = useState(document?.reviewNote || "");
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(status, reviewNote);
    setSaving(false);
  };

  const colors = STATUS_COLORS[status] || STATUS_COLORS.Pending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Update Document Status</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Document info */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
          }}>
            <p style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:600, margin:"0 0 0.25rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              Document
            </p>
            <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#0f172a", margin:0, wordBreak:"break-word" }}>
              {document?.fileName}
            </p>
            <p style={{ fontSize:"0.78rem", color:"#64748b", margin:"0.2rem 0 0" }}>
              {document?.barangayName} · {document?.category?.replace("_"," ")}
            </p>
          </div>

          {/* Status selector */}
          <div className="form-group" style={{ marginBottom:"1.25rem" }}>
            <label style={{ fontSize:"0.8rem", fontWeight:700, color:"#374151", marginBottom:"0.5rem", display:"block" }}>
              Status
            </label>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {Object.values(DOCUMENT_STATUS).map((s) => {
                const c = STATUS_COLORS[s] || STATUS_COLORS.Pending;
                const isSelected = status === s;
                return (
                  <label key={s} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.875rem",
                    borderRadius: 9,
                    border: `1.5px solid ${isSelected ? c.dot : "#e2e8f0"}`,
                    background: isSelected ? c.bg : "#f9fafb",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={isSelected}
                      onChange={() => setStatus(s)}
                      style={{ display:"none" }}
                    />
                    <span style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: isSelected ? c.dot : "#cbd5e1",
                      flexShrink: 0,
                      boxShadow: isSelected ? `0 0 0 3px ${c.bg}` : "none",
                    }} />
                    <span style={{
                      fontSize: "0.85rem",
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? c.text : "#64748b",
                    }}>
                      {s}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Review Note */}
          <div className="form-group">
            <label style={{ fontSize:"0.8rem", fontWeight:700, color:"#374151", marginBottom:"0.5rem", display:"block" }}>
              Review Note
              <span style={{ color:"#9ca3af", fontWeight:400, marginLeft:"0.4rem" }}>(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write your feedback or comments here... This will be visible to the barangay."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                fontSize: "0.875rem",
                color: "#111827",
                background: "#f9fafb",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.background = "#fff";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.background = "#f9fafb";
                e.target.style.boxShadow = "none";
              }}
            />
            <p style={{ fontSize:"0.75rem", color:"#94a3b8", marginTop:"0.4rem", margin:"0.4rem 0 0" }}>
              💡 This note will be visible to the barangay on their documents page.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}
            style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem" }}>
            <Save size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;