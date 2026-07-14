"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { suppliersService } from "@/services/suppliersService";
import { toast } from "@/utils/toast";

const schema = z.object({
  name: z.string().min(1, "Required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface SupplierQuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (supplierId: string) => void;
}

export function SupplierQuickAddModal({ open, onClose, onCreated }: SupplierQuickAddModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const id = await suppliersService.create({ name: values.name, phone: values.phone, address: values.address });
      toast.success("Supplier added.");
      reset();
      onCreated(id);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add supplier.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Supplier" className="sm:max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input label="Name" placeholder="e.g. Fresh Meats Co." error={errors.name?.message} {...register("name")} />
        <Input label="Phone" placeholder="Optional" {...register("phone")} />
        <Input label="Address" placeholder="Optional" {...register("address")} />
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Add Supplier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
