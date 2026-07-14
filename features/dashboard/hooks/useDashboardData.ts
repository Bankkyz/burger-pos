"use client";

import { useEffect, useState } from "react";
import {
  type DailyRevenuePoint,
  subscribeIngredients,
  subscribeMonthlyRevenue,
  subscribeTodaySummary,
  subscribeTopSellingMenu,
  type TodaySummary,
  type TopSellingItem,
} from "@/services/dashboardService";
import type { Ingredient } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { toast } from "@/utils/toast";

export interface DashboardData {
  loading: boolean;
  today: TodaySummary;
  monthlyRevenue: DailyRevenuePoint[];
  topSelling: TopSellingItem[];
  lowStock: Ingredient[];
  outOfStock: Ingredient[];
}

const EMPTY_TODAY: TodaySummary = { sales: 0, cost: 0, profit: 0, orders: 0 };

export function useDashboardData(): DashboardData {
  const { t } = useLanguage();
  const [today, setToday] = useState<TodaySummary>(EMPTY_TODAY);
  const [monthlyRevenue, setMonthlyRevenue] = useState<DailyRevenuePoint[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadedFlags, setLoadedFlags] = useState({
    today: false,
    revenue: false,
    topSelling: false,
    ingredients: false,
  });

  useEffect(() => {
    const onError = (error: Error) => {
      console.error("[dashboard]", error);
      toast.error(t.dashboard.failedToLoad);
    };

    const unsubToday = subscribeTodaySummary((value) => {
      setToday(value);
      setLoadedFlags((f) => ({ ...f, today: true }));
    }, onError);

    const unsubRevenue = subscribeMonthlyRevenue((value) => {
      setMonthlyRevenue(value);
      setLoadedFlags((f) => ({ ...f, revenue: true }));
    }, onError);

    const unsubTopSelling = subscribeTopSellingMenu((value) => {
      setTopSelling(value);
      setLoadedFlags((f) => ({ ...f, topSelling: true }));
    }, 5, onError);

    const unsubIngredients = subscribeIngredients((value) => {
      setIngredients(value);
      setLoadedFlags((f) => ({ ...f, ingredients: true }));
    }, onError);

    return () => {
      unsubToday();
      unsubRevenue();
      unsubTopSelling();
      unsubIngredients();
    };
  }, [t]);

  const lowStock = ingredients.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock);
  const outOfStock = ingredients.filter((i) => i.currentStock <= 0);
  const loading = !Object.values(loadedFlags).every(Boolean);

  return { loading, today, monthlyRevenue, topSelling, lowStock, outOfStock };
}
