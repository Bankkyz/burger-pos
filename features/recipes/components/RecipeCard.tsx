import { ChefHat, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Recipe } from "@/types";
import { cn } from "@/utils/cn";
import { formatCurrency, formatPercent } from "@/utils/format";

export interface RecipeCardProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <ChefHat className="h-5 w-5" />
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label={`Edit ${recipe.name}`} onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${recipe.name}`} onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[var(--color-text)]">{recipe.name}</h3>
          {!recipe.active && (
            <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              Inactive
            </span>
          )}
        </div>
        {recipe.category && <p className="text-xs text-[var(--color-text-muted)]">{recipe.category}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-3 text-xs">
        <div>
          <div className="text-[var(--color-text-muted)]">Price</div>
          <div className="font-semibold text-[var(--color-text)]">{formatCurrency(recipe.sellingPrice)}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-muted)]">Cost</div>
          <div className="font-semibold text-[var(--color-text)]">{formatCurrency(recipe.cost)}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-muted)]">Margin</div>
          <div
            className={cn(
              "font-semibold",
              recipe.margin >= 0.3
                ? "text-[var(--color-success)]"
                : recipe.margin >= 0.1
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--color-danger)]",
            )}
          >
            {formatPercent(recipe.margin)}
          </div>
        </div>
      </div>
    </Card>
  );
}
