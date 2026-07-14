"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/services/settingsService";
import type { RestaurantSettings } from "@/types";
import { toast } from "@/utils/toast";

export function useSettings() {
  const { t } = useLanguage();
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
        toast.error(t.settings.toastLoadFailed);
        setLoading(false);
      },
    );
    return unsub;
  }, [t]);

  return { settings, loading };
}
