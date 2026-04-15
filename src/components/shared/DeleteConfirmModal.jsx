// src/components/shared/DeleteConfirmModal.jsx
import React, { useState } from "react";
import "./Modal.css";

const DeleteConfirmModal = ({ fileName, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">⚠️ Confirm Delete</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ margin:0, color:"#374151", lineHeight:1.6 }}>
            Are you sure you want to permanently delete:
          </p>
          <p className="modal-doc-name">📄 {fileName}</p>
          <p style={{ margin:0, color:"#ef4444", fontSize:"0.875rem" }}>
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;