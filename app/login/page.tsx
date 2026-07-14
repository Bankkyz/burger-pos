import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In · Burger POS",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-2xl">
            🍔
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Burger POS</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Sign in to manage your restaurant</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
