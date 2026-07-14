"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { recipesService } from "@/services/recipesService";
import type { Recipe } from "@/types";
import { toast } from "@/utils/toast";

export function useMenu() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = recipesService.subscribeAll(
      (items) => {
        setRecipes(items.filter((r) => r.active));
        setLoading(false);
      },
      (error) => {
        console.error("[menu]", error);
        toast.error(t.sales.toastLoadFailed);
      },
    );
    return unsub;
  }, [t]);

  return { recipes, loading };
}
