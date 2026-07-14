"use client";

import { useEffect, useState } from "react";
import { ingredientsService } from "@/services/ingredientsService";
import { recipesService } from "@/services/recipesService";
import type { Ingredient, Recipe } from "@/types";
import { toast } from "@/utils/toast";

export function useRecipes() {
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
        toast.error("Failed to load recipes.");
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
        toast.error("Failed to load ingredients.");
      },
    );

    return () => {
      unsubRecipes();
      unsubIngredients();
    };
  }, []);

  return { recipes, ingredients, loading };
}
