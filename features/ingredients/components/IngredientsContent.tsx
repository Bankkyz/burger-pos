"use client";

import { Boxes, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { IngredientFormModal } from "@/features/ingredients/components/IngredientFormModal";
import { IngredientsTable } from "@/features/ingredients/components/IngredientsTable";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ingredientsService } from "@/services/ingredientsService";
import type { Ingredient } from "@/types";
import { toast } from "@/utils/toast";

export function IngredientsContent() {
  const { ingredients, suppliers, loading } = useIngredients();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Ingredient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ingredients;
    return ingredients.filter(
      (i) => i.name.toLowerCase().includes(term) || i.category.toLowerCase().includes(term),
    );
  }, [ingredients, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await ingredientsService.remove(pendingDelete.id);
      toast.success(t.ingredients.toastDeleted);
      setPendingDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t.ingredients.toastDeleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.ingredients.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t.ingredients.subtitle}</p>
        </div>
        <Button onClick={openCreate} size="lg">
          <Plus className="h-5 w-5" />
          {t.ingredients.addIngredient}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          placeholder={t.ingredients.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title={search ? t.ingredients.noMatching : t.ingredients.noIngredients}
            description={search ? t.ingredients.tryDifferentSearch : t.ingredients.addFirstHint}
            action={
              !search && (
                <Button onClick={openCreate} size="sm">
                  <Plus className="h-4 w-4" />
                  {t.ingredients.addIngredient}
                </Button>
              )
            }
          />
        ) : (
          <IngredientsTable ingredients={filtered} suppliers={suppliers} onEdit={openEdit} onDelete={setPendingDelete} />
        )}
      </Card>

      <IngredientFormModal open={formOpen} onClose={() => setFormOpen(false)} ingredient={editing} suppliers={suppliers} />

      <ConfirmDialog
        open={!!pendingDelete}
        title={t.ingredients.deleteTitle}
        description={t.ingredients.deleteDescription(pendingDelete?.name ?? "")}
        confirmLabel={t.common.delete}
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
