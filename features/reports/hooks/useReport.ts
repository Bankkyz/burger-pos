"use client";

import { useEffect, useState } from "react";
import { getReport, type ReportData } from "@/services/reportsService";
import { toast } from "@/utils/toast";

export const REPORT_PERIODS = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

const PERIOD_CONFIG: Record<ReportPeriod, { granularity: "day" | "week" | "month" | "year"; lookbackDays: number }> = {
  Daily: { granularity: "day", lookbackDays: 30 },
  Weekly: { granularity: "week", lookbackDays: 84 },
  Monthly: { granularity: "month", lookbackDays: 365 },
  Yearly: { granularity: "year", lookbackDays: 365 * 5 },
};

export function dateRangeForPeriod(period: ReportPeriod): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1); // exclusive upper bound = start of tomorrow
  const start = new Date(end);
  start.setDate(start.getDate() - PERIOD_CONFIG[period].lookbackDays);
  return { start, end };
}

const EMPTY_REPORT: ReportData = { rows: [], totals: { revenue: 0, cost: 0, profit: 0, expense: 0, netProfit: 0 } };

interface ReportState {
  period: ReportPeriod | null;
  data: ReportData;
  fetching: boolean;
}

export function useReport(period: ReportPeriod) {
  const [state, setState] = useState<ReportState>({ period: null, data: EMPTY_REPORT, fetching: true });

  useEffect(() => {
    let cancelled = false;
    const { start, end } = dateRangeForPeriod(period);

    getReport(start, end, PERIOD_CONFIG[period].granularity)
      .then((result) => {
        if (!cancelled) setState({ period, data: result, fetching: false });
      })
      .catch((error) => {
        console.error("[reports]", error);
        toast.error("Failed to load report.");
        if (!cancelled) setState((s) => ({ ...s, fetching: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  // Still "loading" if we haven't yet received data for the currently-selected period.
  const loading = state.fetching || state.period !== period;

  return { ...state.data, loading };
}
