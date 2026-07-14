import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, onFocus, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          // Numeric fields default to 0 — select-on-focus so typing replaces it
          // instead of appending (e.g. "0" + "150" becoming "0150").
          onFocus={type === "number" ? (e) => e.target.select() : onFocus}
          className={cn(
            "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
            error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20",
            className,
          )}
          {...props}
        />
        {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
