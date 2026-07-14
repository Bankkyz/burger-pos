"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { recipesService } from "@/services/recipesService";
import type { Ingredient, Recipe } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/format";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  const itemSchema = z.object({
    ingredientId: z.string().min(1, t.common.required),
    quantity: z.number().positive(t.common.mustBeGreaterThanZero),
  });

  return z.object({
    name: z.string().min(1, t.common.required),
    category: z.string().optional(),
    sellingPrice: z.number().min(0, t.common.mustBeZeroOrMore),
    active: z.boolean(),
    items: z.array(itemSchema).min(1, t.recipes.itemsRequired),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export interface RecipeFormModalProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  ingredients: Ingredient[];
}

export function RecipeFormModal({ open, onClose, recipe, ingredients }: RecipeFormModalProps) {
  const { t } = useLanguage();
  const [itemsLoading, setItemsLoading] = useState(false);
  const ingredientsById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "", sellingPrice: 0, active: true, items: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!open) return;

    if (!recipe) {
      reset({ name: "", category: "", sellingPrice: 0, active: true, items: [] });
      return;
    }

    reset({
      name: recipe.name,
      category: recipe.category ?? "",
      sellingPrice: recipe.sellingPrice,
      active: recipe.active,
      items: [],
    });

    setItemsLoading(true);
    const unsub = recipesService.subscribeRecipeItems(
      recipe.id,
      (items) => {
        reset({
          name: recipe.name,
          category: recipe.category ?? "",
          sellingPrice: recipe.sellingPrice,
          active: recipe.active,
          items: items.map((i) => ({ ingredientId: i.ingredientId, quantity: i.quantity })),
        });
        setItemsLoading(false);
      },
      () => setItemsLoading(false),
    );
    return unsub;
  }, [open, recipe, reset]);

  const watchedItems = watch("items");
  const watchedSellingPrice = watch("sellingPrice");
  const totals = recipesService.computeTotals(
    (watchedItems ?? []).map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: ingredientsById.get(item.ingredientId)?.name ?? "",
      quantity: Number(item.quantity) || 0,
      unit: ingredientsById.get(item.ingredientId)?.unit ?? "g",
    })),
    ingredientsById,
    Number(watchedSellingPrice) || 0,
  );

  async function onSubmit(values: FormValues) {
    const items = values.items.map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: ingredientsById.get(item.ingredientId)?.name ?? "",
      quantity: item.quantity,
      unit: ingredientsById.get(item.ingredientId)?.unit ?? "g",
    }));

    try {
      await recipesService.saveRecipe(
        recipe?.id ?? null,
        { name: values.name, category: values.category || undefined, sellingPrice: values.sellingPrice, active: values.active, imageUrl: recipe?.imageUrl ?? null },
        items,
        ingredientsById,
      );
      toast.success(recipe ? t.recipes.toastUpdated : t.recipes.toastAdded);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.recipes.toastSaveFailed);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={recipe ? t.recipes.editRecipe : t.recipes.addRecipe} className="sm:max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.recipes.fieldName}
            placeholder={t.recipes.fieldNamePlaceholder}
            error={errors.name?.message}
            {...register("name")}
          />
          <Input label={t.recipes.fieldCategory} placeholder={t.recipes.fieldCategoryPlaceholder} {...register("category")} />
        </div>

        <Input
          label={t.recipes.fieldSellingPrice}
          type="number"
          step="0.01"
          min={0}
          error={errors.sellingPrice?.message}
          {...register("sellingPrice", { valueAsNumber: true })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">{t.recipes.ingredientsLabel}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ ingredientId: ingredients[0]?.id ?? "", quantity: 1 })}
              disabled={ingredients.length === 0}
            >
              <Plus className="h-4 w-4" />
              {t.recipes.addIngredient}
            </Button>
          </div>

          {itemsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {fields.length === 0 && (
                <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  {t.recipes.noItemsYet}
                </p>
              )}
              {fields.map((field, index) => {
                const selectedIngredient = ingredientsById.get(watchedItems?.[index]?.ingredientId ?? "");
                return (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Select {...register(`items.${index}.ingredientId` as const)}>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder={t.common.qty}
                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                      />
                    </div>
                    <span className="mb-2.5 w-10 shrink-0 text-sm text-[var(--color-text-muted)]">
                      {selectedIngredient ? t.ingredients.units[selectedIngredient.unit] : ""}
                    </span>
                    <Button type="button" variant="ghost" size="icon" aria-label={t.recipes.removeIngredient} onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          {errors.items?.message && <span className="text-sm text-[var(--color-danger)]">{errors.items.message}</span>}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3 text-sm">
          <div>
            <div className="text-[var(--color-text-muted)]">{t.recipes.cost}</div>
            <div className="font-semibold text-[var(--color-text)]">{formatCurrency(totals.cost)}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">{t.recipes.profit}</div>
            <div className={`font-semibold ${totals.profit >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {formatCurrency(totals.profit)}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">{t.recipes.margin}</div>
            <div className="font-semibold text-[var(--color-text)]">{formatPercent(totals.margin)}</div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--color-primary)]" {...register("active")} />
          {t.recipes.active}
        </label>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {recipe ? t.recipes.saveChanges : t.recipes.addRecipe}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
