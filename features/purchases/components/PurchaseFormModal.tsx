"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SupplierQuickAddModal } from "@/features/purchases/components/SupplierQuickAddModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { purchasesService } from "@/services/purchasesService";
import type { Ingredient, Supplier } from "@/types";
import { calcPieceCount } from "@/utils/calculations";
import { formatCurrency, formatNumber } from "@/utils/format";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  const itemSchema = z.object({
    ingredientId: z.string().min(1, t.common.required),
    quantity: z.number().positive(t.common.mustBeGreaterThanZero),
    unitPrice: z.number().min(0, t.common.mustBeZeroOrMore),
  });

  return z.object({
    supplierId: z.string().min(1, t.purchases.supplierRequired),
    note: z.string().optional(),
    items: z.array(itemSchema).min(1, t.recipes.itemsRequired),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export interface PurchaseFormModalProps {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  ingredients: Ingredient[];
}

export function PurchaseFormModal({ open, onClose, suppliers, ingredients }: PurchaseFormModalProps) {
  const { firebaseUser } = useAuth();
  const { t } = useLanguage();
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const ingredientsById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { supplierId: "", note: "", items: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const total = (watchedItems ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  async function onSubmit(values: FormValues) {
    const supplier = suppliers.find((s) => s.id === values.supplierId);
    if (!supplier) return;

    try {
      await purchasesService.recordPurchase({
        supplierId: supplier.id,
        supplierName: supplier.name,
        note: values.note,
        actorEmail: firebaseUser?.email ?? "unknown",
        items: values.items.map((item) => ({
          ingredientId: item.ingredientId,
          ingredientName: ingredientsById.get(item.ingredientId)?.name ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      toast.success(t.purchases.toastRecorded);
      reset({ supplierId: "", note: "", items: [] });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.purchases.toastRecordFailed);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={t.purchases.recordPurchase} className="sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select label={t.purchases.fieldSupplier} error={errors.supplierId?.message} {...register("supplierId")}>
                <option value="">{t.purchases.selectSupplier}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" variant="secondary" onClick={() => setSupplierModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.purchases.newSupplier}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">{t.purchases.itemsLabel}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ ingredientId: ingredients[0]?.id ?? "", quantity: 1, unitPrice: 0 })}
                disabled={ingredients.length === 0}
              >
                <Plus className="h-4 w-4" />
                {t.purchases.addItem}
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                {t.purchases.noItemsYet}
              </p>
            )}

            {fields.map((field, index) => {
              const ingredient = ingredientsById.get(watchedItems?.[index]?.ingredientId ?? "");
              const qty = Number(watchedItems?.[index]?.quantity) || 0;
              const price = Number(watchedItems?.[index]?.unitPrice) || 0;
              const pieces = calcPieceCount(qty, ingredient?.pieceWeight);
              return (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1 pt-0">
                    <Select {...register(`items.${index}.ingredientId` as const)}>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex w-24 flex-col gap-1">
                    <Input type="number" step="0.01" min={0} placeholder={t.common.qty} {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                    {pieces !== null && (
                      <span className="text-xs leading-tight text-[var(--color-text-muted)]">{t.ingredients.pieceCountHint(formatNumber(pieces, 1))}</span>
                    )}
                  </div>
                  <span className="w-8 shrink-0 pt-2.5 text-sm text-[var(--color-text-muted)]">
                    {ingredient ? t.ingredients.units[ingredient.unit] : ""}
                  </span>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder={t.common.price}
                      {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <span className="w-16 shrink-0 pt-2.5 text-right text-sm font-medium text-[var(--color-text)]">
                    {formatCurrency(qty * price)}
                  </span>
                  <Button type="button" variant="ghost" size="icon" aria-label={t.purchases.removeItem} onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                  </Button>
                </div>
              );
            })}
            {errors.items?.message && <span className="text-sm text-[var(--color-danger)]">{errors.items.message}</span>}
          </div>

          <Input label={t.purchases.fieldNote} placeholder={t.common.optional} {...register("note")} />

          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">{t.purchases.total}</span>
            <span className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(total)}</span>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t.purchases.recordPurchase}
            </Button>
          </div>
        </form>
      </Modal>

      <SupplierQuickAddModal
        open={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onCreated={(id) => setValue("supplierId", id)}
      />
    </>
  );
}
