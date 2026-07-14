import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import type { Expense, Sale } from "@/types";
import { toLocalDateString } from "@/utils/dateOnly";

const salesCollection = collection(db, COLLECTIONS.SALES).withConverter(makeConverter<Sale>());
const expensesCollection = collection(db, COLLECTIONS.EXPENSES).withConverter(makeConverter<Expense>());

export interface ReportRow {
  label: string;
  bucketStart: number;
  revenue: number;
  cost: number;
  profit: number;
  expense: number;
  netProfit: number;
}

export interface ReportData {
  rows: ReportRow[];
  totals: Omit<ReportRow, "label" | "bucketStart">;
}

async function fetchSalesAndExpenses(start: Date, end: Date) {
  const [salesSnap, expensesSnap] = await Promise.all([
    getDocs(
      query(
        salesCollection,
        where("createdAt", ">=", Timestamp.fromDate(start)),
        where("createdAt", "<", Timestamp.fromDate(end)),
      ),
    ),
    getDocs(query(expensesCollection, where("date", ">=", toLocalDateString(start)), where("date", "<", toLocalDateString(end)))),
  ]);

  const sales = salesSnap.docs.map((d) => d.data()).filter((s) => s.status === "completed");
  const expenses = expensesSnap.docs.map((d) => d.data());
  return { sales, expenses };
}

function bucketKey(date: Date, granularity: "day" | "week" | "month" | "year"): { key: string; bucketStart: number; label: string } {
  // All bucketing uses local calendar components — sales/expenses are grouped
  // by the day/week/month/year they occurred in for the person using the POS,
  // not by UTC (see toLocalDateString for why that distinction matters).
  if (granularity === "day") {
    const key = toLocalDateString(date);
    const bucketStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return { key, bucketStart, label: key.slice(5) };
  }
  if (granularity === "week") {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = (d.getDay() + 6) % 7; // Monday as start of week
    d.setDate(d.getDate() - diff);
    const key = toLocalDateString(d);
    return { key, bucketStart: d.getTime(), label: `Wk of ${key.slice(5)}` };
  }
  if (granularity === "month") {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucketStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    return { key, bucketStart, label: key };
  }
  const key = String(date.getFullYear());
  return { key, bucketStart: new Date(date.getFullYear(), 0, 1).getTime(), label: key };
}

/**
 * Builds a report over [start, end) bucketed at `granularity`. `end` is
 * exclusive so callers can pass the start of the day *after* the range.
 */
export async function getReport(
  start: Date,
  end: Date,
  granularity: "day" | "week" | "month" | "year",
): Promise<ReportData> {
  const { sales, expenses } = await fetchSalesAndExpenses(start, end);

  const byBucket = new Map<string, ReportRow>();

  sales.forEach((sale) => {
    const { key, bucketStart, label } = bucketKey(new Date(sale.createdAt), granularity);
    const row = byBucket.get(key) ?? { label, bucketStart, revenue: 0, cost: 0, profit: 0, expense: 0, netProfit: 0 };
    row.revenue += sale.total;
    row.cost += sale.totalCost;
    row.profit += sale.profit;
    row.netProfit = row.profit - row.expense;
    byBucket.set(key, row);
  });

  expenses.forEach((expense) => {
    // No "Z" suffix: parse as local midnight so it lands in the correct local-date bucket.
    const { key, bucketStart, label } = bucketKey(new Date(`${expense.date}T00:00:00`), granularity);
    const row = byBucket.get(key) ?? { label, bucketStart, revenue: 0, cost: 0, profit: 0, expense: 0, netProfit: 0 };
    row.expense += expense.amount;
    row.netProfit = row.profit - row.expense;
    byBucket.set(key, row);
  });

  const rows = [...byBucket.values()].sort((a, b) => a.bucketStart - b.bucketStart);
  const totals = rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cost: acc.cost + row.cost,
      profit: acc.profit + row.profit,
      expense: acc.expense + row.expense,
      netProfit: acc.netProfit + row.netProfit,
    }),
    { revenue: 0, cost: 0, profit: 0, expense: 0, netProfit: 0 },
  );

  return { rows, totals };
}

export const reportsService = { getReport };
