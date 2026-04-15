import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser,  setCurrentUser]  = useState(undefined);
  const [userProfile,  setUserProfile]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            setUserProfile({ id: snap.id, ...snap.data() });
          } else {
            setUserProfile(null);
          }
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