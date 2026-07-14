"use client";

import { Plus, Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { PurchaseFormModal } from "@/features/purchases/components/PurchaseFormModal";
import { PurchasesTable } from "@/features/purchases/components/PurchasesTable";
import { usePurchases } from "@/features/purchases/hooks/usePurchases";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function PurchasesContent() {
  const { purchases, suppliers, ingredients, loading } = usePurchases();
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.purchases.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t.purchases.subtitle}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="lg" disabled={ingredients.length === 0}>
          <Plus className="h-5 w-5" />
          {t.purchases.recordPurchase}
        </Button>
      </div>

      {ingredients.length === 0 && !loading && (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--color-warning)]">
          {t.purchases.needIngredientHint}
        </p>
      )}

      <Card>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState icon={Truck} title={t.purchases.noPurchases} description={t.purchases.noPurchasesHint} />
        ) : (
          <PurchasesTable purchases={purchases} />
        )}
      </Card>

      <PurchaseFormModal open={formOpen} onClose={() => setFormOpen(false)} suppliers={suppliers} ingredients={ingredients} />
    </div>
  );
}
