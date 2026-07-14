import type { Metadata } from "next";
import { PurchasesContent } from "@/features/purchases/components/PurchasesContent";

export const metadata: Metadata = {
  title: "Purchases · Burger POS",
};

export default function PurchasesPage() {
  return <PurchasesContent />;
}
