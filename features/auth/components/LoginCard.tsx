"use client";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LoginCard() {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex justify-end">
        <LanguageToggle />
      </div>
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-2xl">
          🍔
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{t.auth.appName}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t.auth.signInTagline}</p>
      </div>
      <LoginForm />
    </div>
  );
}
