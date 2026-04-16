import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config.js";

const AuthContext = createContext(null);

const fetchProfileWithRetry = async (uid, retries = 5, delay = 800) => {
  for (let i = 0; i < retries; i++) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    // Hindi pa nandoon ang document — hintayin bago ulitin
    await new Promise((res) => setTimeout(res, delay));
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [currentUser,  setCurrentUser]  = useState(undefined);
  const [userProfile,  setUserProfile]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          const profile = await fetchProfileWithRetry(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const isAdmin    = userProfile?.role === "admin";
  const isBarangay = userProfile?.role === "barangay";
  const barangayId = userProfile?.barangayId || null;

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      logout, isAdmin, isBarangay, barangayId,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};