"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ingredientsService } from "@/services/ingredientsService";
import { recipesService } from "@/services/recipesService";
import type { Ingredient, Recipe } from "@/types";
import { toast } from "@/utils/toast";

export function useRecipes() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let recipesLoaded = false;
    let ingredientsLoaded = false;
    const maybeStopLoading = () => {
      if (recipesLoaded && ingredientsLoaded) setLoading(false);
    };

    const unsubRecipes = recipesService.subscribeAll(
      (items) => {
        setRecipes(items);
        recipesLoaded = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[recipes]", error);
        toast.error(t.recipes.toastLoadFailed);
      },
    );

    const unsubIngredients = ingredientsService.subscribeAll(
      (items) => {
        setIngredients(items);
        ingredientsLoaded = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[ingredients]", error);
        toast.error(t.ingredients.toastLoadFailed);
      },
    );

    return () => {
      unsubRecipes();
      unsubIngredients();
    };
  }, [t]);

  return { recipes, ingredients, loading };
}
