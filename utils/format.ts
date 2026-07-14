import { DEFAULT_CURRENCY } from "@/constants";

export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value || 0);
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(value: number | string | Date, opts?: Intl.DateTimeFormatOptions) {
  // Plain "YYYY-MM-DD" strings parse as UTC midnight, which can display as the
  // previous day in timezones behind UTC. Parse those as local-midnight instead.
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" && DATE_ONLY_PATTERN.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);
  // `dateStyle` cannot be combined with component options (day/month/year, etc.) —
  // Intl.DateTimeFormat throws "Invalid option : option" if both are present.
  return new Intl.DateTimeFormat("en-US", opts ?? { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: number | string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}
