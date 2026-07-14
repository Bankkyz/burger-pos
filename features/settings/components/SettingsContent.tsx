"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PromptPayQr } from "@/components/PromptPayQr";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { uploadFile } from "@/lib/firebase/storage";
import { settingsService } from "@/services/settingsService";
import { toast } from "@/utils/toast";

const CURRENCIES = ["THB", "USD", "EUR", "GBP", "SGD", "JPY"] as const;

const schema = z.object({
  name: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  taxPercent: z.number().min(0).max(100),
  deliveryGpGrab: z.number().min(0).max(100),
  deliveryGpLineMan: z.number().min(0).max(100),
  deliveryGpFoodpanda: z.number().min(0).max(100),
  promptPayId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function SettingsContent() {
  const { settings, loading } = useSettings();
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (loading) return;
    reset({
      name: settings.name,
      currency: settings.currency,
      taxPercent: settings.taxPercent,
      deliveryGpGrab: settings.deliveryGpPercent.Grab ?? 0,
      deliveryGpLineMan: settings.deliveryGpPercent["LINE MAN"] ?? 0,
      deliveryGpFoodpanda: settings.deliveryGpPercent.Foodpanda ?? 0,
      promptPayId: settings.promptPayId ?? "",
    });
    setLogoUrl(settings.logoUrl ?? null);
  }, [loading, settings, reset]);

  const promptPayId = watch("promptPayId");

  async function onLogoSelected(file: File | undefined) {
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadFile(`logos/${Date.now()}-${file.name}`, file);
      await settingsService.updateSettings({ logoUrl: url });
      setLogoUrl(url);
      toast.success("Logo updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await settingsService.updateSettings({
        name: values.name,
        currency: values.currency,
        taxPercent: values.taxPercent,
        deliveryGpPercent: {
          "Walk-in": 0,
          Grab: values.deliveryGpGrab,
          "LINE MAN": values.deliveryGpLineMan,
          Foodpanda: values.deliveryGpFoodpanda,
        },
        promptPayId: values.promptPayId,
      });
      toast.success("Settings saved.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Restaurant profile, currency, tax, and payments.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URL, not a static/local asset
                  <img src={logoUrl} alt="Restaurant logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">🍔</span>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoSelected(e.target.files?.[0])}
                />
                <Button type="button" variant="secondary" size="sm" loading={logoUploading} onClick={() => fileInputRef.current?.click()}>
                  Upload Logo
                </Button>
              </div>
            </div>

            <Input label="Restaurant Name" error={errors.name?.message} {...register("name")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency &amp; Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Currency" error={errors.currency?.message} {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input
                label="Tax (%)"
                type="number"
                step="0.01"
                min={0}
                max={100}
                error={errors.taxPercent?.message}
                {...register("taxPercent", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery GP (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Grab" type="number" step="0.01" min={0} max={100} {...register("deliveryGpGrab", { valueAsNumber: true })} />
              <Input label="LINE MAN" type="number" step="0.01" min={0} max={100} {...register("deliveryGpLineMan", { valueAsNumber: true })} />
              <Input label="Foodpanda" type="number" step="0.01" min={0} max={100} {...register("deliveryGpFoodpanda", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PromptPay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Input label="PromptPay ID (mobile or tax ID)" placeholder="0812345678" {...register("promptPayId")} />
            </div>
            {promptPayId && (
              <div className="flex flex-col items-center gap-2">
                <PromptPayQr promptPayId={promptPayId} size={140} />
                <span className="text-xs text-[var(--color-text-muted)]">Preview</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={isSubmitting}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
