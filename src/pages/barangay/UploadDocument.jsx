// src/pages/barangay/UploadDocument.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDocuments } from "../../hooks/useDocuments.js";
import { DOCUMENT_CATEGORIES, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "../../utils/constants.js";
import { formatFileSize } from "../../utils/helpers.js";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import "../../components/shared/MainLayout.css";
import "./UploadDocument.css";

// Poll the Cloudinary URL until the file is actually accessible (max 15 tries)
const waitUntilReady = (url, maxTries = 15, interval = 1000) => {
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      fetch(url, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            resolve(true);
          } else if (++tries < maxTries) {
            setTimeout(check, interval);
          } else {
            resolve(false); // give up, redirect anyway
          }
        })
        .catch(() => {
          if (++tries < maxTries) setTimeout(check, interval);
          else resolve(false);
        });
    };
    check();
  });
};

const UploadDocument = () => {
  const navigate = useNavigate();
  const { userProfile, isAdmin, barangayId } = useAuth();
  const { uploadDocument } = useDocuments(isAdmin, barangayId, userProfile);

  const [file,        setFile]        = useState(null);
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [progress,    setProgress]    = useState(0);
  const [uploading,   setUploading]   = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [fileUrl,     setFileUrl]     = useState(null);
  const [error,       setError]       = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError("");
    if (rejectedFiles.length > 0) {
      setError(`File rejected. PDF lang ang tinatanggap — max ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    setError("");
    if (!file)     { setError("Please select a file."); return; }
    if (!category) { setError("Please select a document category."); return; }

    setUploading(true);
    setProgress(0);

    try {
      const docId = await uploadDocument(file, category, description, setProgress, (url) => {
        setFileUrl(url);
      });
      setSuccess(true);
    } catch (err) {
      setError("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  // Once success, wait for Cloudinary to be ready then redirect
  React.useEffect(() => {
    if (!success) return;
    if (!fileUrl) {
      // No URL yet, just redirect after 3s
      const t = setTimeout(() => navigate("/barangay/documents"), 3000);
      return () => clearTimeout(t);
    }
    // Poll until file is accessible, then redirect
    waitUntilReady(fileUrl).then(() => {
      navigate("/barangay/documents");
    });
  }, [success, fileUrl, navigate]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Upload Document</span>
        </div>
        <h1 className="page-title">Upload Document</h1>
        <p className="page-subtitle">
          Submit a document to the Sangguniang Bayan Office, Cuenca, Batangas.
        </p>
      </div>

      {success ? (
        <div className="upload-success">
          <div className="upload-success__icon">
            <CheckCircle size={56} color="#10b981" />
          </div>
          <h3>Document Uploaded Successfully!</h3>
          <p>Please wait, preparing your document...</p>
        </div>
      ) : (
        <div className="upload-container">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "dropzone--active" : ""} ${file ? "dropzone--has-file" : ""}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="dropzone-file-preview">
                <div className="file-icon-wrap">
                  <FileText size={28} color="#2563eb" />
                </div>
                <div className="file-meta">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setProgress(0);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="dropzone-placeholder">
                <div className="dropzone-icon">
                  <Upload size={40} color={isDragActive ? "#2563eb" : "#94a3b8"} />
                </div>
                <p className="dropzone-text">
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag & drop a file, or click to browse"}
                </p>
                <p className="dropzone-hint">
                  PDF lang — max {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            )}
          </div>

          <div className="upload-form">
            <div className="form-group">
              <label>
                Document Category
                <span style={{ color:"#ef4444" }}> *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
              >
                <option value="">-- Select Category --</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Description
                <span style={{ color:"#9ca3af", fontWeight:400 }}> (optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="upload-info">
              <p>🏛️ Submitting to: <strong>SB Office, Cuenca, Batangas</strong></p>
              <p>👤 Uploaded by: <strong>{userProfile?.displayName}</strong></p>
              <p>📍 Barangay: <strong>{userProfile?.barangayName}</strong></p>
            </div>

            {error && <div className="upload-error">⚠️ {error}</div>}

            {uploading && (
              <div className="progress-bar-wrapper">
                <div className="progress-label">Uploading... {progress}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${progress}%` }} />
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{ flex:1 }}
              >
                <Upload size={16} />
                {uploading ? `Uploading ${progress}%...` : "Submit Document"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/barangay/documents")}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;