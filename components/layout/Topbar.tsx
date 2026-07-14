"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";

export function Topbar() {
  const { firebaseUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-base">
          🍔
        </div>
        <span className="font-semibold text-[var(--color-text)]">Burger POS</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {firebaseUser?.displayName ?? "Admin"}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">{firebaseUser?.email}</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut()}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
