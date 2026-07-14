"use client";

import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN_EMAIL, COLLECTIONS } from "@/constants";
import { subscribeToAuthChanges } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/config";

export type AuthStatus = "loading" | "signed-out" | "forbidden" | "authenticated";

interface AuthContextValue {
  firebaseUser: User | null;
  status: AuthStatus;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  status: "loading",
  isAdmin: false,
});

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || !ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setStatus("signed-out");
        return;
      }

      if (!isAdminEmail(user.email)) {
        setStatus("forbidden");
        return;
      }

      setStatus("authenticated");

      // Keep a lightweight profile doc in sync for logs/audit purposes.
      try {
        await setDoc(
          doc(db, COLLECTIONS.USERS, user.uid),
          {
            email: user.email,
            displayName: user.displayName ?? null,
            photoURL: user.photoURL ?? null,
            role: "admin",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error("Failed to sync user profile", error);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ firebaseUser, status, isAdmin: status === "authenticated" }),
    [firebaseUser, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
