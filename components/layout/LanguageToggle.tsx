"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("th")}
        aria-pressed={locale === "th"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "th" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]",
        )}
      >
        ไทย
      </button>
    </div>
  );
}
