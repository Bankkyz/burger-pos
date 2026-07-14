import type { Metadata } from "next";
import { ExpensesContent } from "@/features/expenses/components/ExpensesContent";

export const metadata: Metadata = {
  title: "Expenses · Burger POS",
};

export default function ExpensesPage() {
  return <ExpensesContent />;
}
