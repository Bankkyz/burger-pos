"use client";

import { useEffect, useState } from "react";
import { recipesService } from "@/services/recipesService";
import type { Recipe } from "@/types";
import { toast } from "@/utils/toast";

export function useMenu() {
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
        toast.error("Failed to load menu.");
      },
    );
    return unsub;
  }, []);

  return { recipes, loading };
}
