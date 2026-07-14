import type { Metadata } from "next";
import { SalesContent } from "@/features/sales/components/SalesContent";

export const metadata: Metadata = {
  title: "Sales · Burger POS",
};

export default function SalesPage() {
  return <SalesContent />;
}
