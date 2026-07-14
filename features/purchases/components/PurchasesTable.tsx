import type { Purchase } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

export function PurchasesTable({ purchases }: { purchases: Purchase[] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Date</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Supplier</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Items</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">Total</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Note</th>
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
