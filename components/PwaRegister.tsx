"use client";

import { useEffect } from "react";

/** Registers the app-shell service worker. Skipped in dev to avoid fighting HMR. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("[PwaRegister] service worker registration failed", error);
    });
  }, []);

  return null;
}
