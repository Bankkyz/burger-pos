import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
  hint?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
};

export function StatCard({ label, value, icon: Icon, tone = "primary", hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
          <span className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">{value}</span>
          {hint && <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)]", TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--color-surface-2)]" />
          <div className="h-7 w-20 animate-pulse rounded bg-[var(--color-surface-2)]" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-2)]" />
      </div>
    </Card>
  );
}
