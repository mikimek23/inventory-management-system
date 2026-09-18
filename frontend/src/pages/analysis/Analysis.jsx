import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import productApi from "../../services/product.api";
import stockApi from "../../services/stock.api";
import purchaseApi from "../../services/purchase.api";
import saleApi from "../../services/sale.api";
import categoryApi from "../../services/category.api";
import formatCurrency from "../../utils/formatCurrency";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import {
  AreaTrendChart,
  BarComparisonChart,
  DonutBreakdown,
  StockHealthBar,
} from "../../components/charts/Charts";

export const Analysis = () => {
  const [timeRange, setTimeRange] = useState("ALL"); // "30D", "6M", "ALL"

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getAll(),
  });

  const stockQuery = useQuery({
    queryKey: ["stock"],
    queryFn: () => stockApi.getStockList(),
  });

  const purchasesQuery = useQuery({
    queryKey: ["purchases"],
    queryFn: () => purchaseApi.getAll(),
  });

  const salesQuery = useQuery({
    queryKey: ["sales"],
    queryFn: () => saleApi.getAll(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
  });

  const isLoading =
    productsQuery.isLoading ||
    stockQuery.isLoading ||
    purchasesQuery.isLoading ||
    salesQuery.isLoading ||
    categoriesQuery.isLoading;

  const isError =
    productsQuery.isError ||
    stockQuery.isError ||
    purchasesQuery.isError ||
    salesQuery.isError ||
    categoriesQuery.isError;

  const products = productsQuery.data || [];
  const stockItems = stockQuery.data || [];
  const purchases = purchasesQuery.data || [];
  const sales = salesQuery.data || [];
  const categories = categoriesQuery.data || [];

  // Filter transactions by timeRange
  const filterByTime = (dateStr) => {
    if (timeRange === "ALL") return true;
    const date = new Date(dateStr);
    const now = new Date();
    if (timeRange === "30D") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= past30;
    }
    if (timeRange === "6M") {
      const past6M = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      return date >= past6M;
    }
    return true;
  };

  const filteredSales = useMemo(
    () => sales.filter((s) => filterByTime(s.transactionDate || s.createdAt)),
    [sales, timeRange]
  );

  const filteredPurchases = useMemo(
    () =>
      purchases.filter((p) =>
        filterByTime(p.transactionDate || p.createdAt)
      ),
    [purchases, timeRange]
  );

  // Financial aggregates
  const completedSales = useMemo(
    () => filteredSales.filter((s) => s.status === "COMPLETED"),
    [filteredSales]
  );
  const completedPurchases = useMemo(
    () => filteredPurchases.filter((p) => p.status === "COMPLETED"),
    [filteredPurchases]
  );

  const totalRevenue = useMemo(
    () => completedSales.reduce((sum, s) => sum + Number(s.total || 0), 0),
    [completedSales]
  );

  const totalProcurement = useMemo(
    () => completedPurchases.reduce((sum, p) => sum + Number(p.total || 0), 0),
    [completedPurchases]
  );

  const grossMargin = totalRevenue - totalProcurement;
  const marginPercentage =
    totalRevenue > 0 ? Math.round((grossMargin / totalRevenue) * 100) : 0;

  // Inventory valuation: sum of (product.costPrice * stock.currentStock)
  const productCostMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = Number(p.costPrice || 0);
    });
    return map;
  }, [products]);

  const inventoryValuation = useMemo(() => {
    return stockItems.reduce((sum, item) => {
      const cost = productCostMap[item.id] || 0;
      return sum + cost * Number(item.currentStock || 0);
    }, 0);
  }, [stockItems, productCostMap]);

  // Stock health counts
  const stockHealth = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let outOfStock = 0;

    stockItems.forEach((item) => {
      const stock = Number(item.currentStock || 0);
      const min = Number(item.minimumStock || 0);
      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= min) {
        low++;
      } else {
        healthy++;
      }
    });

    return { healthy, low, outOfStock };
  }, [stockItems]);

  // Time-series data for AreaTrendChart based on selected timeRange
  const trendData = useMemo(() => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (timeRange === "30D") {
      // 30 Days view: 4 weekly buckets covering the last 30 days
      const now = new Date();
      const buckets = [];
      const bucketDays = 7;

      for (let i = 3; i >= 0; i--) {
        const startDayOffset = (i + 1) * bucketDays;
        const endDayOffset = i * bucketDays;
        const start = new Date(now.getTime() - startDayOffset * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - endDayOffset * 24 * 60 * 60 * 1000);

        const startMonth = monthNames[start.getMonth()];
        const endMonth = monthNames[end.getMonth()];
        const label =
          startMonth === endMonth
            ? `${startMonth} ${start.getDate()}-${end.getDate()}`
            : `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}`;

        buckets.push({
          id: `w-${i}`,
          label,
          startTime: start.getTime(),
          endTime: end.getTime(),
          sales: 0,
          purchases: 0,
        });
      }

      completedSales.forEach((s) => {
        const t = new Date(s.transactionDate || s.createdAt).getTime();
        const b = buckets.find((b) => t >= b.startTime && t <= b.endTime);
        if (b) {
          b.sales += Number(s.total || 0);
        } else if (t > buckets[buckets.length - 1].endTime) {
          // If latest transaction falls on current day edge
          buckets[buckets.length - 1].sales += Number(s.total || 0);
        }
      });

      completedPurchases.forEach((p) => {
        const t = new Date(p.transactionDate || p.createdAt).getTime();
        const b = buckets.find((b) => t >= b.startTime && t <= b.endTime);
        if (b) {
          b.purchases += Number(p.total || 0);
        } else if (t > buckets[buckets.length - 1].endTime) {
          buckets[buckets.length - 1].purchases += Number(p.total || 0);
        }
      });

      return buckets.map((item) => ({
        label: item.label,
        sales: Math.round(item.sales),
        purchases: Math.round(item.purchases),
        margin: Math.round(item.sales - item.purchases),
      }));
    }

    if (timeRange === "6M") {
      // 6 Months view: Last 6 calendar months
      const monthMap = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = `${monthNames[d.getMonth()]}`;
        monthMap[key] = { label, sales: 0, purchases: 0, order: d.getTime() };
      }

      completedSales.forEach((s) => {
        const d = new Date(s.transactionDate || s.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap[key]) {
          monthMap[key].sales += Number(s.total || 0);
        }
      });

      completedPurchases.forEach((p) => {
        const d = new Date(p.transactionDate || p.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap[key]) {
          monthMap[key].purchases += Number(p.total || 0);
        }
      });

      return Object.values(monthMap)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          label: item.label,
          sales: Math.round(item.sales),
          purchases: Math.round(item.purchases),
          margin: Math.round(item.sales - item.purchases),
        }));
    }

    // "ALL" view: Group all historical months or minimum 6-12 months
    const allDates = [
      ...completedSales.map((s) => new Date(s.transactionDate || s.createdAt)),
      ...completedPurchases.map((p) => new Date(p.transactionDate || p.createdAt)),
    ];

    const now = new Date();
    let minDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    allDates.forEach((d) => {
      if (d < minDate) {
        minDate = new Date(d.getFullYear(), d.getMonth(), 1);
      }
    });

    const monthMap = {};
    const curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (curr <= now || (curr.getFullYear() === now.getFullYear() && curr.getMonth() === now.getMonth())) {
      const key = `${curr.getFullYear()}-${curr.getMonth()}`;
      const label = `${monthNames[curr.getMonth()]} ${String(curr.getFullYear()).slice(-2)}`;
      monthMap[key] = { label, sales: 0, purchases: 0, order: curr.getTime() };
      curr.setMonth(curr.getMonth() + 1);
    }

    completedSales.forEach((s) => {
      const d = new Date(s.transactionDate || s.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[key]) {
        monthMap[key].sales += Number(s.total || 0);
      }
    });

    completedPurchases.forEach((p) => {
      const d = new Date(p.transactionDate || p.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[key]) {
        monthMap[key].purchases += Number(p.total || 0);
      }
    });

    return Object.values(monthMap)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        label: item.label,
        sales: Math.round(item.sales),
        purchases: Math.round(item.purchases),
        margin: Math.round(item.sales - item.purchases),
      }));
  }, [completedSales, completedPurchases, timeRange]);

  // Category Stock Valuation Breakdown
  // Joined by Product: Products contain categoryId and costPrice, mapped to stock quantities
  const categoryData = useMemo(() => {
    const stockQtyMap = {};
    stockItems.forEach((s) => {
      stockQtyMap[s.id] = Number(s.currentStock || 0);
    });

    const catNameMap = {};
    categories.forEach((c) => {
      catNameMap[c.id] = c.name;
    });

    const catMap = {};
    // Pre-initialize defined categories
    categories.forEach((c) => {
      catMap[c.id] = { label: c.name, value: 0, count: 0, units: 0 };
    });

    products.forEach((p) => {
      const catId = p.categoryId || "uncategorized";
      const catName = p.categoryId ? (catNameMap[p.categoryId] || "Unknown Category") : "General / Uncategorized";

      if (!catMap[catId]) {
        catMap[catId] = { label: catName, value: 0, count: 0, units: 0 };
      }

      const currentQty = stockQtyMap[p.id] || 0;
      const cost = Number(p.costPrice || 0);
      const valuation = currentQty * cost;

      catMap[catId].value += valuation;
      catMap[catId].count += 1;
      catMap[catId].units += currentQty;
    });

    const palette = [
      "#1d4ed8", "#2563eb", "#3b82f6", "#0284c7",
      "#0d9488", "#4f46e5", "#7c3aed", "#64748b"
    ];

    return Object.values(catMap)
      .filter((c) => c.value > 0 || c.units > 0 || c.count > 0)
      .sort((a, b) => b.value - a.value)
      .map((c, i) => ({
        ...c,
        color: palette[i % palette.length],
      }));
  }, [categories, products, stockItems]);

  // Transaction Status distribution
  const transactionDistribution = useMemo(() => {
    const allTxns = [...filteredSales, ...filteredPurchases];
    const completed = allTxns.filter((t) => t.status === "COMPLETED").length;
    const draft = allTxns.filter((t) => t.status === "DRAFT").length;
    const cancelled = allTxns.filter((t) => t.status === "CANCELLED").length;

    return [
      { label: "Completed", value: completed, color: "#1d4ed8" },
      { label: "Draft", value: draft, color: "#f59e0b" },
      { label: "Cancelled", value: cancelled, color: "#ef4444" },
    ];
  }, [filteredSales, filteredPurchases]);

  // Top Products by Stock Volume
  const topStockProducts = useMemo(() => {
    return [...stockItems]
      .sort(
        (a, b) => Number(b.currentStock || 0) - Number(a.currentStock || 0)
      )
      .slice(0, 5)
      .map((item, idx) => ({
        label: item.name,
        value: Number(item.currentStock || 0),
        color: idx === 0 ? "#1d4ed8" : idx === 1 ? "#2563eb" : "#60a5fa",
      }));
  }, [stockItems]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">
          Generating financial & inventory analytics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load analytics data"
        message="Please check server connectivity and reload."
        onRetry={() => {
          productsQuery.refetch();
          stockQuery.refetch();
          purchasesQuery.refetch();
          salesQuery.refetch();
          categoriesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            EXECUTIVE INTELLIGENCE
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Analytics & Reports
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time visual charts of sales revenue, procurement spend, inventory valuation, and stock health.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          {[
            { id: "30D", label: "30 Days" },
            { id: "6M", label: "6 Months" },
            { id: "ALL", label: "All Time" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTimeRange(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === btn.id
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Total Revenue
              </span>
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                $
              </span>
            </div>
            <p
              className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight mt-1 truncate"
              title={formatCurrency(totalRevenue)}
            >
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <p className="text-xs text-slate-500 truncate">
            From {completedSales.length} completed sales
          </p>
        </div>

        {/* Total Procurement Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Procurement Spend
              </span>
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                📦
              </span>
            </div>
            <p
              className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight mt-1 truncate"
              title={formatCurrency(totalProcurement)}
            >
              {formatCurrency(totalProcurement)}
            </p>
          </div>
          <p className="text-xs text-slate-500 truncate">
            From {completedPurchases.length} completed purchases
          </p>
        </div>

        {/* Net Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Net Gross Margin
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  grossMargin >= 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {marginPercentage}%
              </span>
            </div>
            <p
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight mt-1 truncate ${
                grossMargin >= 0 ? "text-blue-900" : "text-rose-600"
              }`}
              title={formatCurrency(grossMargin)}
            >
              {formatCurrency(grossMargin)}
            </p>
          </div>
          <p className="text-xs text-slate-500 truncate">Revenue minus purchase costs</p>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Stock Valuation
              </span>
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                🏛
              </span>
            </div>
            <p
              className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight mt-1 truncate"
              title={formatCurrency(inventoryValuation)}
            >
              {formatCurrency(inventoryValuation)}
            </p>
          </div>
          <p className="text-xs text-slate-500 truncate">
            Asset value based on acquisition costs
          </p>
        </div>
      </div>

      {/* Primary Chart: Sales vs Purchases Trend */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Revenue & Expense Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between incoming sales revenue and outbound inventory procurement spend.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-700" />
              <span className="text-slate-700">Sales (Revenue)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-slate-600">Purchases (Spend)</span>
            </div>
          </div>
        </div>

        <AreaTrendChart data={trendData} height={260} showPurchases={true} />
      </div>

      {/* Grid: Category Breakdown & Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Stock Valuation Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inventory Valuation by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Financial asset concentration across product lines.
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              View Categories →
            </Link>
          </div>

          <BarComparisonChart
            data={categoryData}
            valueFormatter={formatCurrency}
            maxItems={6}
          />
        </div>

        {/* Transaction Distribution Donut */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Transaction Status Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All sales & purchase states across the selected period.
            </p>
          </div>

          <div className="py-2">
            <DonutBreakdown
              data={transactionDistribution}
              totalLabel="Transactions"
            />
          </div>
        </div>
      </div>

      {/* Grid: Top Stock Volume & Stock Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stock Health Ratio */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Inventory Health Gauge
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of products exceeding minimum threshold levels.
            </p>
          </div>

          <StockHealthBar
            healthy={stockHealth.healthy}
            low={stockHealth.low}
            outOfStock={stockHealth.outOfStock}
          />

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Total Cataloged Items: <strong>{products.length}</strong></span>
            <Link
              to="/stock"
              className="text-blue-700 font-bold hover:underline"
            >
              Manage Stock Thresholds →
            </Link>
          </div>
        </div>

        {/* Top Products by Stock Volume */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Highest Volume Inventory Products
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Items with largest current on-hand unit counts.
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              All Products →
            </Link>
          </div>

          <BarComparisonChart
            data={topStockProducts}
            valueFormatter={(val) => `${val} units`}
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
