import type { Purchase } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatCurrency, formatDateTime } from "@/utils/format";

export function PurchasesTable({ purchases }: { purchases: Purchase[] }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.purchases.colDate}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.purchases.colSupplier}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.purchases.colItems}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.purchases.colTotal}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.purchases.colNote}</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">{formatDateTime(purchase.createdAt)}</td>
              <td className="whitespace-nowrap px-3 py-3 font-medium text-[var(--color-text)]">{purchase.supplierName}</td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">{purchase.itemCount}</td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--color-text)]">{formatCurrency(purchase.total)}</td>
              <td className="max-w-[220px] truncate px-3 py-3 text-[var(--color-text-muted)]">{purchase.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
