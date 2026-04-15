// src/utils/helpers.js

export const formatDate = (timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const timeAgo = (timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const truncate = (text, max = 50) =>
  !text ? "" : text.length > max ? `${text.substring(0, max)}...` : text;

export const generateDocumentName = (barangayName, category, originalName) => {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, "0");
  const d   = String(now.getDate()).padStart(2, "0");
  const b   = barangayName.replace(/\s+/g, "-").toUpperCase();
  const c   = category.toUpperCase();
  const ext = originalName.split(".").pop();
  return `${b}_${c}_${y}${m}${d}.${ext}`;
};

export const filterDocuments = (documents, { search, category, status, dateFrom, dateTo }) => {
  return documents.filter((doc) => {
    const s = search?.toLowerCase() || "";
    const matchSearch =
      !search ||
      doc.fileName?.toLowerCase().includes(s) ||
      doc.barangayName?.toLowerCase().includes(s) ||
      doc.description?.toLowerCase().includes(s);
    const matchCategory = !category || doc.category === category;
    const matchStatus   = !status   || doc.status === status;
    let   matchDate     = true;
    if (dateFrom || dateTo) {
      const up = doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : new Date(doc.uploadedAt);
      if (dateFrom) matchDate = matchDate && up >= new Date(dateFrom);
      if (dateTo)   matchDate = matchDate && up <= new Date(dateTo);
    }
    return matchSearch && matchCategory && matchStatus && matchDate;
  });
};