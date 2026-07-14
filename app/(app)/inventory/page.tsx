import type { Metadata } from "next";
import { InventoryContent } from "@/features/inventory/components/InventoryContent";

export const metadata: Metadata = {
  title: "Inventory · Burger POS",
};

export default function InventoryPage() {
  return <InventoryContent />;
}
