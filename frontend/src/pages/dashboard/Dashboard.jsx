import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import productApi from "../../services/product.api";
import stockApi from "../../services/stock.api";
import purchaseApi from "../../services/purchase.api";
import saleApi from "../../services/sale.api";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import useAuth from "../../hooks/useAuth";
import { AreaTrendChart, StockHealthBar } from "../../components/charts/Charts";

export const Dashboard = () => {
  const { user } = useAuth();

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

  const isLoading =
    productsQuery.isLoading ||
    stockQuery.isLoading ||
    purchasesQuery.isLoading ||
    salesQuery.isLoading;

  const isError =
    productsQuery.isError ||
    stockQuery.isError ||
    purchasesQuery.isError ||
    salesQuery.isError;

  const products = productsQuery.data || [];
  const stockItems = stockQuery.data || [];
  const purchases = purchasesQuery.data || [];
  const sales = salesQuery.data || [];

  const totalProducts = products.length;
  const totalStockQty = stockItems.reduce(
    (sum, item) => sum + Number(item.currentStock || 0),
    0
  );

  const lowStockItems = useMemo(
    () =>
      stockItems.filter(
        (item) => Number(item.currentStock || 0) <= Number(item.minimumStock || 0)
      ),
    [stockItems]
  );

  const completedPurchases = useMemo(
    () => purchases.filter((p) => p.status === "COMPLETED"),
    [purchases]
  );
  const completedSales = useMemo(
    () => sales.filter((s) => s.status === "COMPLETED"),
    [sales]
  );

  const totalPurchasesAmount = completedPurchases.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );
  const totalSalesAmount = completedSales.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  );

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

  // 6-Month Trend Data for Mini Chart
  const trendData = useMemo(() => {
    const monthMap = {};
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

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
  }, [completedSales, completedPurchases]);

  // Combine recent activity
  const recentActivities = useMemo(() => {
    return [
      ...purchases.map((p) => ({
        id: p.id,
        type: "PURCHASE",
        ref: p.referenceNumber,
        party: p.supplier?.name || "Supplier",
        date: p.transactionDate || p.createdAt,
        amount: p.total,
        status: p.status,
        link: `/purchases/${p.id}`,
      })),
      ...sales.map((s) => ({
        id: s.id,
        type: "SALE",
        ref: s.referenceNumber,
        party: s.customer?.name || "Walk-in Customer",
        date: s.transactionDate || s.createdAt,
        amount: s.total,
        status: s.status,
        link: `/sales/${s.id}`,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [purchases, sales]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">
          Loading workspace metrics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load dashboard data"
        message="Please check your backend connection and try again."
        onRetry={() => {
          productsQuery.refetch();
          stockQuery.refetch();
          purchasesQuery.refetch();
          salesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            WORKSPACE OVERVIEW
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
            Welcome back, {user?.name || "Admin"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time snapshot of inventory levels, transaction activity, and performance trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/analysis">
            <Button variant="secondary" size="md">
              📊 View Analytics
            </Button>
          </Link>
          <Link to="/sales/new">
            <Button variant="primary" size="md">
              + New Sale
            </Button>
          </Link>
          <Link to="/purchases/new">
            <Button variant="outline" size="md">
              + New Purchase
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards (Reference Image Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Catalog Products
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 truncate">
              {totalProducts}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Total cataloged items</p>
        </div>

        {/* Stock on Hand */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Stock On Hand
            </span>
            <p className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight mt-1 truncate">
              {totalStockQty}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Total inventory units</p>
        </div>

        {/* Low Stock Items */}
        <div
          className={`p-5 rounded-2xl border shadow-2xs space-y-1 min-w-0 flex flex-col justify-between ${
            lowStockItems.length > 0
              ? "bg-amber-50/40 border-amber-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block truncate">
              Low Stock Alerts
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight mt-1 truncate">
              {lowStockItems.length}
            </p>
          </div>
          <p className="text-[11px] text-amber-700/80 truncate">
            {lowStockItems.length > 0 ? "Requires restock" : "All stocks healthy"}
          </p>
        </div>

        {/* Completed Purchases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Purchases
            </span>
            <p
              className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 font-mono tracking-tight mt-1 truncate"
              title={formatCurrency(totalPurchasesAmount)}
            >
              {formatCurrency(totalPurchasesAmount)}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Completed procurement</p>
        </div>

        {/* Completed Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0 sm:col-span-2 md:col-span-1 xl:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Sales
            </span>
            <p
              className="text-lg sm:text-xl xl:text-2xl font-black text-blue-900 font-mono tracking-tight mt-1 truncate"
              title={formatCurrency(totalSalesAmount)}
            >
              {formatCurrency(totalSalesAmount)}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Completed gross revenue</p>
        </div>
      </div>

      {/* Trend Preview & Stock Health Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Purchases Trend Preview */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Transaction Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sales revenue vs procurement spend over the last 6 months.
              </p>
            </div>
            <Link
              to="/analysis"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              Full Analysis →
            </Link>
          </div>

          <AreaTrendChart data={trendData} height={200} showPurchases={true} />
        </div>

        {/* Inventory Stock Health Gauge */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Stock Health
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current inventory thresholds
              </p>
            </div>

            <div className="mt-4">
              <StockHealthBar
                healthy={stockHealth.healthy}
                low={stockHealth.low}
                outOfStock={stockHealth.outOfStock}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link to="/stock">
              <Button variant="outline" size="sm" fullWidth>
                Review All Stock Levels →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Section: Low Stock & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Warning Box */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Low-Stock Products
              </h3>
              <p className="text-xs text-slate-500">
                Products requiring replenishment
              </p>
            </div>
            <Link
              to="/stock"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              View all stock →
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                🎉 All products are currently above minimum stock levels!
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase font-bold">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Current</th>
                    <th className="pb-2">Minimum</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-medium text-slate-800">
                        {item.name}
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {item.sku}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-slate-700">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {item.minimumStock}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to="/purchases/new"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-semibold transition-colors inline-block"
                        >
                          + Restock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions Activity */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500">
                Latest procurement and sales activities
              </p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No recent transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <Link
                    key={`${act.type}-${act.id}`}
                    to={act.link}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          act.type === "PURCHASE"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {act.type === "PURCHASE" ? "IN" : "OUT"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 font-mono transition-colors">
                            {act.ref}
                          </span>
                          <Badge value={act.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-48">
                          {act.party} • {formatDate(act.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-slate-900 font-mono">
                      {formatCurrency(act.amount)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
