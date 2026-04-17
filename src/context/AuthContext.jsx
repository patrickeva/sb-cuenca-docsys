import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config.js";
import { addActivityLog } from "../firebase/firestoreService.js";

const AuthContext = createContext(null);

const fetchProfileWithRetry = async (uid, retries = 5, delay = 800) => {
  for (let i = 0; i < retries; i++) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
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

          // Log LOGIN action
          if (profile) {
            await addActivityLog({
              action:       "LOGIN",
              description:  `${profile.displayName} logged in`,
              barangayId:   profile.barangayId || null,
              barangayName: profile.barangayName || null,
              userId:       profile.id,
              userName:     profile.displayName,
            });
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
    // Log LOGOUT action before signing out
    if (userProfile) {
      await addActivityLog({
        action:       "LOGOUT",
        description:  `${userProfile.displayName} logged out`,
        barangayId:   userProfile.barangayId || null,
        barangayName: userProfile.barangayName || null,
        userId:       userProfile.id,
        userName:     userProfile.displayName,
      });
    }
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