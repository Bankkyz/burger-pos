import type { Metadata } from "next";
import { IngredientsContent } from "@/features/ingredients/components/IngredientsContent";

export const metadata: Metadata = {
  title: "Ingredients · Burger POS",
};

export default function IngredientsPage() {
  return <IngredientsContent />;
}
