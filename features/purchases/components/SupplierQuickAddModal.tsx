"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { suppliersService } from "@/services/suppliersService";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  return z.object({
    name: z.string().min(1, t.common.required),
    phone: z.string().optional(),
    address: z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export interface SupplierQuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (supplierId: string) => void;
}

export function SupplierQuickAddModal({ open, onClose, onCreated }: SupplierQuickAddModalProps) {
  const { t } = useLanguage();
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const id = await suppliersService.create({ name: values.name, phone: values.phone, address: values.address });
      toast.success(t.purchases.toastSupplierAdded);
      reset();
      onCreated(id);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.purchases.toastSupplierAddFailed);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t.purchases.supplierModalTitle} className="sm:max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t.purchases.supplierName}
          placeholder={t.purchases.supplierNamePlaceholder}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input label={t.purchases.supplierPhone} placeholder={t.common.optional} {...register("phone")} />
        <Input label={t.purchases.supplierAddress} placeholder={t.common.optional} {...register("address")} />
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t.purchases.supplierModalTitle}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
