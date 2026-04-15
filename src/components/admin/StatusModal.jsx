import React, { useState } from "react";
import { DOCUMENT_STATUS } from "../../utils/constants.js";
import "../shared/Modal.css";

const StatusModal = ({ document, onClose, onSave }) => {
  const [status, setStatus] = useState(document.status || "Pending");
  const [reviewNote, setReviewNote] = useState(document.reviewNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(status, reviewNote);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Update Document Status</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-doc-name">📄 {document.fileName}</p>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.values(DOCUMENT_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review Note (optional)</label>
            <textarea
              rows={3}
              placeholder="Add a note for the barangay..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;