"use client";

import { ChefHat, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeFormModal } from "@/features/recipes/components/RecipeFormModal";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { recipesService } from "@/services/recipesService";
import type { Recipe } from "@/types";
import { toast } from "@/utils/toast";

export function RecipesContent() {
  const { recipes, ingredients, loading } = useRecipes();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(term) || r.category?.toLowerCase().includes(term));
  }, [recipes, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(recipe: Recipe) {
    setEditing(recipe);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await recipesService.remove(pendingDelete.id);
      toast.success(t.recipes.toastDeleted);
      setPendingDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t.recipes.toastDeleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.recipes.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t.recipes.subtitle}</p>
        </div>
        <Button onClick={openCreate} size="lg" disabled={ingredients.length === 0}>
          <Plus className="h-5 w-5" />
          {t.recipes.addRecipe}
        </Button>
      </div>

      {ingredients.length === 0 && !loading && (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--color-warning)]">
          {t.recipes.needIngredientHint}
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input placeholder={t.recipes.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title={search ? t.recipes.noMatching : t.recipes.noRecipes}
          description={search ? t.recipes.tryDifferentSearch : t.recipes.addFirstHint}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onEdit={() => openEdit(recipe)} onDelete={() => setPendingDelete(recipe)} />
          ))}
        </div>
      )}

      <RecipeFormModal open={formOpen} onClose={() => setFormOpen(false)} recipe={editing} ingredients={ingredients} />

      <ConfirmDialog
        open={!!pendingDelete}
        title={t.recipes.deleteTitle}
        description={t.recipes.deleteDescription(pendingDelete?.name ?? "")}
        confirmLabel={t.common.delete}
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
