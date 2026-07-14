import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · Burger POS",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
      <p className="text-[var(--color-text-muted)]">Coming up in Phase 2.</p>
    </div>
  );
}
