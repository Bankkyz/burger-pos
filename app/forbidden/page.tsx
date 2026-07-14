"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";

export default function ForbiddenPage() {
  const { firebaseUser } = useAuth();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[var(--color-bg)] p-6 text-center">
      <ShieldAlert className="h-16 w-16 text-[var(--color-danger)]" />
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">403 · Forbidden</h1>
      <p className="max-w-sm text-[var(--color-text-muted)]">
        {firebaseUser?.email ? (
          <>
            <span className="font-medium text-[var(--color-text)]">{firebaseUser.email}</span> is not
            authorized to access Burger POS. This system is restricted to a single predefined admin account.
          </>
        ) : (
          "You are not authorized to access this system."
        )}
      </p>
      <Button variant="secondary" onClick={() => signOut()}>
        Sign out
      </Button>
    </main>
  );
}
