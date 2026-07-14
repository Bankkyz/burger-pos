import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <Icon className="h-7 w-7 text-[var(--color-text-muted)]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-[var(--color-text)]">{title}</p>
        {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
