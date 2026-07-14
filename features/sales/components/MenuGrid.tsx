import { ChefHat } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Recipe } from "@/types";
import { formatCurrency } from "@/utils/format";

export interface MenuGridProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

export function MenuGrid({ recipes, onSelect }: MenuGridProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={ChefHat}
        title="No menu items available"
        description="Mark a recipe as active to sell it here."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => (
        <button
          key={recipe.id}
          type="button"
          onClick={() => onSelect(recipe)}
          className="flex min-h-[104px] flex-col items-start justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
        >
          <span className="font-semibold text-[var(--color-text)]">{recipe.name}</span>
          <span className="text-lg font-bold text-[var(--color-primary)]">{formatCurrency(recipe.sellingPrice)}</span>
        </button>
      ))}
    </div>
  );
}
