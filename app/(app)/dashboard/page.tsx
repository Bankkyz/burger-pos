import type { Metadata } from "next";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard · Burger POS",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
