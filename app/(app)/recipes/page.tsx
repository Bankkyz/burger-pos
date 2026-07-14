import type { Metadata } from "next";
import { RecipesContent } from "@/features/recipes/components/RecipesContent";

export const metadata: Metadata = {
  title: "Recipes · Burger POS",
};

export default function RecipesPage() {
  return <RecipesContent />;
}
