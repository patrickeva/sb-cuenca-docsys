// src/firebase/authService.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config.js";

// Login
export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

// Logout
export const logoutUser = () => signOut(auth);

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Listen to auth state
export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);