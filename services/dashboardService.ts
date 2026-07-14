import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import type { Ingredient, Sale, SaleItem } from "@/types";

const salesCollection = collection(db, COLLECTIONS.SALES).withConverter(makeConverter<Sale>());
const saleItemsCollection = collection(db, COLLECTIONS.SALE_ITEMS).withConverter(makeConverter<SaleItem>());
const ingredientsCollection = collection(db, COLLECTIONS.INGREDIENTS).withConverter(makeConverter<Ingredient>());

export interface TodaySummary {
  sales: number;
  cost: number;
  profit: number;
  orders: number;
}

const EMPTY_TODAY_SUMMARY: TodaySummary = { sales: 0, cost: 0, profit: 0, orders: 0 };

/** Live-subscribes to today's completed sales and rolls them up into headline stats. */
export function subscribeTodaySummary(
  onData: (summary: TodaySummary) => void,
  onError?: (error: Error) => void,
) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const q = query(salesCollection, where("createdAt", ">=", Timestamp.fromDate(startOfToday)));

  return onSnapshot(
    q,
    (snapshot) => {
      const sales = snapshot.docs.map((d) => d.data()).filter((s) => s.status === "completed");
      const summary = sales.reduce<TodaySummary>(
        (acc, sale) => ({
          sales: acc.sales + sale.total,
          cost: acc.cost + sale.totalCost,
          profit: acc.profit + sale.profit,
          orders: acc.orders + 1,
        }),
        { ...EMPTY_TODAY_SUMMARY },
      );
      onData(summary);
    },
    (error) => onError?.(error),
  );
}

/** Live-subscribes to every ingredient so low/out-of-stock alerts stay current. */
export function subscribeIngredients(
  onData: (ingredients: Ingredient[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    ingredientsCollection,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (error) => onError?.(error),
  );
}

export interface DailyRevenuePoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  cost: number;
  profit: number;
}

/** Live-subscribes to this calendar month's sales, bucketed by day for the revenue chart. */
export function subscribeMonthlyRevenue(
  onData: (points: DailyRevenuePoint[]) => void,
  onError?: (error: Error) => void,
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const q = query(salesCollection, where("createdAt", ">=", Timestamp.fromDate(startOfMonth)));

  return onSnapshot(
    q,
    (snapshot) => {
      const byDay = new Map<string, DailyRevenuePoint>();
      snapshot.docs
        .map((d) => d.data())
        .filter((s) => s.status === "completed")
        .forEach((sale) => {
          const key = new Date(sale.createdAt).toISOString().slice(0, 10);
          const existing = byDay.get(key) ?? { date: key, revenue: 0, cost: 0, profit: 0 };
          existing.revenue += sale.total;
          existing.cost += sale.totalCost;
          existing.profit += sale.profit;
          byDay.set(key, existing);
        });
      onData([...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)));
    },
    (error) => onError?.(error),
  );
}

export interface TopSellingItem {
  recipeId: string;
  recipeName: string;
  quantity: number;
  revenue: number;
}

/** Live-subscribes to this month's sale line items, aggregated per recipe. */
export function subscribeTopSellingMenu(
  onData: (items: TopSellingItem[]) => void,
  topN = 5,
  onError?: (error: Error) => void,
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const q = query(saleItemsCollection, where("createdAt", ">=", Timestamp.fromDate(startOfMonth)));

  return onSnapshot(
    q,
    (snapshot) => {
      const byRecipe = new Map<string, TopSellingItem>();
      snapshot.docs
        .map((d) => d.data())
        .forEach((item) => {
          const existing = byRecipe.get(item.recipeId) ?? {
            recipeId: item.recipeId,
            recipeName: item.recipeName,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += item.quantity;
          existing.revenue += item.lineTotal;
          byRecipe.set(item.recipeId, existing);
        });
      onData([...byRecipe.values()].sort((a, b) => b.quantity - a.quantity).slice(0, topN));
    },
    (error) => onError?.(error),
  );
}
