"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from "@/constants";
import { ingredientsService } from "@/services/ingredientsService";
import type { Ingredient, Supplier } from "@/types";
import { calcCostPerGram } from "@/utils/calculations";
import { formatCurrency } from "@/utils/format";
import { toast } from "@/utils/toast";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.enum(INGREDIENT_CATEGORIES),
  unit: z.enum(INGREDIENT_UNITS),
  purchasePrice: z.number().min(0, "Must be 0 or more"),
  purchaseUnitGrams: z.number().positive("Must be greater than 0"),
  currentStock: z.number().min(0, "Must be 0 or more"),
  minimumStock: z.number().min(0, "Must be 0 or more"),
  expireDate: z.string().optional(),
  supplierId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface IngredientFormModalProps {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  suppliers: Supplier[];
}

export function IngredientFormModal({ open, onClose, ingredient, suppliers }: IngredientFormModalProps) {
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
  const previewCostPerGram = calcCostPerGram(Number(purchasePrice) || 0, Number(purchaseUnitGrams) || 0);

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
        toast.success("Ingredient updated.");
      } else {
        await ingredientsService.create(payload);
        toast.success("Ingredient added.");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save ingredient.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={ingredient ? "Edit Ingredient" : "Add Ingredient"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input label="Name" placeholder="e.g. Beef Patty" error={errors.name?.message} {...register("name")} />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" error={errors.category?.message} {...register("category")}>
            {INGREDIENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Unit" error={errors.unit?.message} {...register("unit")}>
            {INGREDIENT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            min={0}
            error={errors.purchasePrice?.message}
            {...register("purchasePrice", { valueAsNumber: true })}
          />
          <Input
            label="Purchase Size (g/ml)"
            type="number"
            step="0.01"
            min={0}
            error={errors.purchaseUnitGrams?.message}
            {...register("purchaseUnitGrams", { valueAsNumber: true })}
          />
        </div>

        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          Cost per gram: <span className="font-semibold text-[var(--color-text)]">{formatCurrency(previewCostPerGram)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Stock"
            type="number"
            step="0.01"
            min={0}
            error={errors.currentStock?.message}
            {...register("currentStock", { valueAsNumber: true })}
          />
          <Input
            label="Minimum Stock"
            type="number"
            step="0.01"
            min={0}
            error={errors.minimumStock?.message}
            {...register("minimumStock", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Expire Date" type="date" {...register("expireDate")} />
          <Select label="Supplier" {...register("supplierId")}>
            <option value="">None</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {ingredient ? "Save Changes" : "Add Ingredient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
