import { ArrowDownCircle, ArrowUpCircle, History, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { StockMovement } from "@/types";
import { cn } from "@/utils/cn";
import { formatDateTime, formatNumber } from "@/utils/format";

const TYPE_ICON = {
  sale: ArrowDownCircle,
  purchase: ArrowUpCircle,
  adjustment: SlidersHorizontal,
} as const;

export function StockMovementList({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) {
    return <EmptyState icon={History} title="No stock movements yet" description="Purchases and sales will appear here." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {movements.map((movement) => {
        const Icon = TYPE_ICON[movement.type] ?? SlidersHorizontal;
        const isIn = movement.quantity > 0;
        return (
          <li key={movement.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                isIn ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">{movement.ingredientName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {movement.type === "sale" ? "Sale" : movement.type === "purchase" ? "Purchase" : "Adjustment"} ·{" "}
                {formatDateTime(movement.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-semibold tabular-nums", isIn ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
                {isIn ? "+" : ""}
                {formatNumber(movement.quantity)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Balance: {formatNumber(movement.balanceAfter)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
