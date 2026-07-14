"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/services/settingsService";
import type { RestaurantSettings } from "@/types";
import { toast } from "@/utils/toast";

export function useSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSettings(
      (value) => {
        setSettings(value);
        setLoading(false);
      },
      (error) => {
        console.error("[settings]", error);
        toast.error("Failed to load settings.");
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { settings, loading };
}
