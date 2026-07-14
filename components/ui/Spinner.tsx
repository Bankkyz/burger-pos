import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Spinner({ className, size = 24 }: { className?: string; size?: number }) {
  return <Loader2 className={cn("animate-spin text-[var(--color-primary)]", className)} size={size} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
