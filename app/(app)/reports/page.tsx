import type { Metadata } from "next";
import { ReportContent } from "@/features/reports/components/ReportContent";

export const metadata: Metadata = {
  title: "Reports · Burger POS",
};

export default function ReportsPage() {
  return <ReportContent />;
}
