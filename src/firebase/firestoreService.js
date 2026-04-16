// src/firebase/firestoreService.js
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where,
  orderBy, serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { db } from "./config.js";

// ── HELPER ─────────────────────────────────────

const patchCloudinaryUrl = (url) => {
  if (!url || url.includes("fl_attachment")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
};

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
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    fileUrl: patchCloudinaryUrl(d.data().fileUrl),
  }));
};

export const getAllDocuments = async () => {
  const q = query(
    collection(db, "documents"),
    orderBy("uploadedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    fileUrl: patchCloudinaryUrl(d.data().fileUrl),
  }));
};

export const updateDocumentStatus = async (docId, status, reviewNote = "") => {
  await updateDoc(doc(db, "documents", docId), {
    status,
    reviewNote,
    reviewedAt: serverTimestamp(),
  });
};

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
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      fileUrl: patchCloudinaryUrl(d.data().fileUrl),
    })));
  });
};

export const listenToAllDocs = (callback) => {
  const q = query(
    collection(db, "documents"),
    orderBy("uploadedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      fileUrl: patchCloudinaryUrl(d.data().fileUrl),
    })));
  });
};

// ── ACTIVITY LOGS ──────────────────────────────

export const addActivityLog = async (logData) => {
  await addDoc(collection(db, "activityLogs"), {
    ...logData,
    timestamp: serverTimestamp(),
  });
};

export const getActivityLogs = async () => {
  const q = query(
    collection(db, "activityLogs"),
    orderBy("timestamp", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};