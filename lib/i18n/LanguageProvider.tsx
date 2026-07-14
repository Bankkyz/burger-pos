"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { en, type Translations } from "@/lib/i18n/en";
import { th } from "@/lib/i18n/th";

export type Locale = "en" | "th";

const DICTIONARIES: Record<Locale, Translations> = { en, th };
const STORAGE_KEY = "burger-pos-locale";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "th" ? "th" : "en";
}

// Locale lives outside React state entirely (a tiny external store) so reading
// it on mount never needs a setState-in-effect: useSyncExternalStore renders
// the safe "en" server snapshot during SSR/hydration, then automatically
// re-renders with the real client value right after mount.
let currentLocale: Locale = typeof window !== "undefined" ? readStoredLocale() : "en";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Locale {
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return "en";
}

function setStoredLocale(next: Locale) {
  currentLocale = next;
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: setStoredLocale, t: DICTIONARIES[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
