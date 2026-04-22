// src/firebase/firestoreService.js
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where,
  orderBy, serverTimestamp, onSnapshot,
  writeBatch, limit, Timestamp,
} from "firebase/firestore";
import { db } from "./config.js";

// ── HELPERS ────────────────────────────────────

const mapDoc = (d) => ({ id: d.id, ...d.data() });

// ── USERS ──────────────────────────────────────

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ── BARANGAY PROFILES ──────────────────────────

export const getBarangayProfile = async (barangayId) => {
  const snap = await getDoc(doc(db, "barangays", barangayId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateBarangayProfile = async (barangayId, data) => {
  const ref = doc(db, "barangays", barangayId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
};

export const getAllBarangays = async () => {
  const snap = await getDocs(collection(db, "barangays"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ── DOCUMENTS ──────────────────────────────────

export const uploadDocumentRecord = async (docData) => {
  const ref = await addDoc(collection(db, "documents"), {
    ...docData,
    status: "Pending",
    uploadedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getDocumentsByBarangay = async (barangayId) => {
  const q = query(
    collection(db, "documents"),
    where("barangayId", "==", barangayId),
    orderBy("uploadedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const getAllDocuments = async () => {
  const q = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const updateDocumentStatus = async (docId, status, reviewNote = "") => {
  await updateDoc(doc(db, "documents", docId), {
    status,
    reviewNote,
    reviewedAt: serverTimestamp(),
  });
};

/**
 * OLD function — Firestore only. Kept for backward compatibility.
 */
export const deleteDocumentRecord = async (docId) => {
  await deleteDoc(doc(db, "documents", docId));
};

// ── REAL-TIME LISTENERS ────────────────────────

export const listenToBarangayDocs = (barangayId, callback) => {
  const q = query(
    collection(db, "documents"),
    where("barangayId", "==", barangayId),
    orderBy("uploadedAt", "desc")
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const listenToAllDocs = (callback) => {
  const q = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

// ── ACTIVITY LOGS ──────────────────────────────

// Auto-reset threshold: when total logs reach this number,
// all logs are cleared automatically to keep storage clean.
const AUTO_RESET_THRESHOLD = 200;

export const addActivityLog = async (logData) => {
  // 1. Add the new log first
  await addDoc(collection(db, "activityLogs"), {
    ...logData,
    timestamp: serverTimestamp(),
  });

  // 2. Check total count — if at/over threshold, auto-reset
  try {
    const snap = await getDocs(collection(db, "activityLogs"));
    if (snap.size >= AUTO_RESET_THRESHOLD) {
      // Batch delete all logs (max 500 per batch)
      const batchSize = 500;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      console.log(`✨ Auto-reset: cleared ${snap.size} activity logs.`);
    }
  } catch (err) {
    // Don't block the original log action if cleanup fails
    console.warn("Auto-reset check failed:", err);
  }
};

export const getActivityLogs = async () => {
  const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Real-time listener for activity logs (all actions).
 */
export const listenToActivityLogs = (callback) => {
  const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

/**
 * Delete a single activity log by ID.
 */
export const deleteActivityLog = async (logId) => {
  try {
    await deleteDoc(doc(db, "activityLogs", logId));
    return { success: true, message: "Log deleted successfully." };
  } catch (error) {
    console.error("Delete log error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete log.",
    };
  }
};

/**
 * 🗑️ CLEAR ALL activity logs. Uses batch deletion (max 500 per batch).
 * Returns count of deleted logs.
 */
export const clearAllActivityLogs = async () => {
  try {
    const snap = await getDocs(collection(db, "activityLogs"));
    const total = snap.size;

    if (total === 0) {
      return { success: true, message: "No logs to delete.", count: 0 };
    }

    // Firestore batch limit is 500 per commit
    const batchSize = 500;
    const docs = snap.docs;
    let deleted = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + batchSize);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += chunk.length;
    }

    // Note: We don't log cleanup actions to keep activity logs upload-only.

    return {
      success: true,
      message: `Successfully cleared ${deleted} log${deleted !== 1 ? "s" : ""}.`,
      count: deleted,
    };
  } catch (error) {
    console.error("Clear all logs error:", error);
    return {
      success: false,
      message: error.message || "Failed to clear logs.",
      count: 0,
    };
  }
};

/**
 * 🧹 CLEAR OLD activity logs older than N days (default 30).
 * Safe cleanup — keeps recent activity, removes old clutter.
 */
export const clearOldActivityLogs = async (daysOld = 30) => {
  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    // Query logs older than cutoff
    const q = query(
      collection(db, "activityLogs"),
      where("timestamp", "<", cutoffTimestamp)
    );
    const snap = await getDocs(q);
    const total = snap.size;

    if (total === 0) {
      return {
        success: true,
        message: `No logs older than ${daysOld} days found.`,
        count: 0,
      };
    }

    // Batch delete
    const batchSize = 500;
    const docs = snap.docs;
    let deleted = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + batchSize);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += chunk.length;
    }

    // Note: We don't log cleanup actions to keep activity logs upload-only.

    return {
      success: true,
      message: `Successfully cleared ${deleted} log${deleted !== 1 ? "s" : ""} older than ${daysOld} days.`,
      count: deleted,
    };
  } catch (error) {
    console.error("Clear old logs error:", error);
    return {
      success: false,
      message: error.message || "Failed to clear old logs.",
      count: 0,
    };
  }
};