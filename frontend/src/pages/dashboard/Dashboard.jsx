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

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading dashboard metrics...
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

  const products = productsQuery.data || [];
  const stockItems = stockQuery.data || [];
  const purchases = purchasesQuery.data || [];
  const sales = salesQuery.data || [];

  const totalProducts = products.length;
  const totalStockQty = stockItems.reduce(
    (sum, item) => sum + Number(item.currentStock || 0),
    0,
  );

  const lowStockItems = stockItems.filter(
    (item) => Number(item.currentStock || 0) <= Number(item.minimumStock || 0),
  );

  const totalPurchasesAmount = purchases
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.total || 0), 0);

  const totalSalesAmount = sales
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + Number(s.total || 0), 0);

  // Combine recent activity
  const recentActivities = [
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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            WORKSPACE OVERVIEW
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here is your daily snapshot of inventory quantities and transaction
            volumes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Products
          </span>
          <span className="text-3xl font-black text-slate-800">
            {totalProducts}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">Active in catalogue</p>
        </div>

        {/* Stock on Hand */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Stock On Hand
          </span>
          <span className="text-3xl font-black text-emerald-700">
            {totalStockQty}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Total inventory units
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          className={`p-5 rounded-xl border shadow-2xs ${
            lowStockItems.length > 0
              ? "bg-amber-50/60 border-amber-200"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Low Stock Alerts
          </span>
          <span className="text-3xl font-black text-amber-600">
            {lowStockItems.length}
          </span>
          <p className="text-[11px] text-amber-700/80 mt-2">
            {lowStockItems.length > 0
              ? "Requires restock"
              : "All stocks healthy"}
          </p>
        </div>

        {/* Purchases Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Purchases
          </span>
          <span className="text-2xl font-black text-slate-800">
            {formatCurrency(totalPurchasesAmount)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">Completed spend</p>
        </div>

        {/* Sales Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Sales
          </span>
          <span className="text-2xl font-black text-emerald-800">
            {formatCurrency(totalSalesAmount)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">Completed revenue</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Warning Box */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Low-Stock Products
              </h3>
              <p className="text-xs text-slate-500">
                Items falling at or beneath minimum threshold
              </p>
            </div>
            <Link
              to="/stock?lowStock=true"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View all stock →
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                🎉 No products currently below minimum stock level.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase font-bold">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Current</th>
                    <th className="pb-2">Minimum</th>
                    <th className="pb-2 text-right">Status</th>
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
                        <Badge
                          value={
                            Number(item.currentStock) <= 0
                              ? "OUT OF STOCK"
                              : "LOW STOCK"
                          }
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions Activity */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500">
                Latest purchases and sales movements
              </p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Ledger feed
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No recent transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <Link
                    key={`${act.type}-${act.id}`}
                    to={act.link}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          act.type === "PURCHASE"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {act.type === "PURCHASE" ? "IN" : "OUT"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 font-mono">
                            {act.ref}
                          </span>
                          <Badge value={act.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-50">
                          {act.party} • {formatDate(act.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-slate-800">
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
