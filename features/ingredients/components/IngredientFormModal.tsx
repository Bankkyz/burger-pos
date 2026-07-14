"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from "@/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { ingredientsService } from "@/services/ingredientsService";
import type { Ingredient, Supplier } from "@/types";
import { calcCostPerGram } from "@/utils/calculations";
import { formatCurrency } from "@/utils/format";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  return z.object({
    name: z.string().min(1, t.common.required),
    category: z.enum(INGREDIENT_CATEGORIES),
    unit: z.enum(INGREDIENT_UNITS),
    purchasePrice: z.number().min(0, t.common.mustBeZeroOrMore),
    purchaseUnitGrams: z.number().positive(t.common.mustBeGreaterThanZero),
    currentStock: z.number().min(0, t.common.mustBeZeroOrMore),
    minimumStock: z.number().min(0, t.common.mustBeZeroOrMore),
    expireDate: z.string().optional(),
    supplierId: z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export interface IngredientFormModalProps {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  suppliers: Supplier[];
}

export function IngredientFormModal({ open, onClose, ingredient, suppliers }: IngredientFormModalProps) {
  const { t } = useLanguage();
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "g", category: "Other", purchaseUnitGrams: 1000 },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      ingredient
        ? {
            name: ingredient.name,
            category: ingredient.category,
            unit: ingredient.unit,
            purchasePrice: ingredient.purchasePrice,
            purchaseUnitGrams: ingredient.purchaseUnitGrams,
            currentStock: ingredient.currentStock,
            minimumStock: ingredient.minimumStock,
            expireDate: ingredient.expireDate ?? "",
            supplierId: ingredient.supplierId ?? "",
          }
        : {
            name: "",
            category: "Other",
            unit: "g",
            purchasePrice: 0,
            purchaseUnitGrams: 1000,
            currentStock: 0,
            minimumStock: 0,
            expireDate: "",
            supplierId: "",
          },
    );
  }, [open, ingredient, reset]);

  const purchasePrice = watch("purchasePrice");
  const purchaseUnitGrams = watch("purchaseUnitGrams");
  const watchedUnit = watch("unit");
  const previewCostPerGram = calcCostPerGram(Number(purchasePrice) || 0, Number(purchaseUnitGrams) || 0);
  const unitLabel = t.ingredients.units[watchedUnit] ?? watchedUnit;

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      unit: values.unit,
      purchasePrice: values.purchasePrice,
      purchaseUnitGrams: values.purchaseUnitGrams,
      currentStock: values.currentStock,
      minimumStock: values.minimumStock,
      expireDate: values.expireDate || null,
      supplierId: values.supplierId || null,
    };

    try {
      if (ingredient) {
        await ingredientsService.update(ingredient.id, ingredient, payload);
        toast.success(t.ingredients.toastUpdated);
      } else {
        await ingredientsService.create(payload);
        toast.success(t.ingredients.toastAdded);
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.ingredients.toastSaveFailed);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={ingredient ? t.ingredients.editIngredient : t.ingredients.addIngredient}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t.ingredients.fieldName}
          placeholder={t.ingredients.fieldNamePlaceholder}
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select label={t.ingredients.fieldCategory} error={errors.category?.message} {...register("category")}>
            {INGREDIENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.ingredients.categories[c]}
              </option>
            ))}
          </Select>
          <Select label={t.ingredients.fieldUnit} error={errors.unit?.message} {...register("unit")}>
            {INGREDIENT_UNITS.map((u) => (
              <option key={u} value={u}>
                {t.ingredients.units[u]}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.ingredients.fieldPurchasePrice}
            type="number"
            step="0.01"
            min={0}
            error={errors.purchasePrice?.message}
            {...register("purchasePrice", { valueAsNumber: true })}
          />
          <Input
            label={t.ingredients.fieldPurchaseSize(unitLabel)}
            type="number"
            step="0.01"
            min={0}
            error={errors.purchaseUnitGrams?.message}
            {...register("purchaseUnitGrams", { valueAsNumber: true })}
          />
        </div>

        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          {t.ingredients.costPerGramPreview(unitLabel)}{" "}
          <span className="font-semibold text-[var(--color-text)]">{formatCurrency(previewCostPerGram)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.ingredients.fieldCurrentStock}
            type="number"
            step="0.01"
            min={0}
            error={errors.currentStock?.message}
            {...register("currentStock", { valueAsNumber: true })}
          />
          <Input
            label={t.ingredients.fieldMinimumStock}
            type="number"
            step="0.01"
            min={0}
            error={errors.minimumStock?.message}
            {...register("minimumStock", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label={t.ingredients.fieldExpireDate} type="date" {...register("expireDate")} />
          <Select label={t.ingredients.fieldSupplier} {...register("supplierId")}>
            <option value="">{t.common.none}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {ingredient ? t.ingredients.saveChanges : t.ingredients.addIngredient}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
