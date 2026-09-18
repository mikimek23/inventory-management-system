import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStock } from "../../hooks/useStock";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export const Stock = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialLowStock = searchParams.get("lowStock") === "true";
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: stockList = [], isLoading } = useStock({
    lowStock: lowStockOnly ? true : undefined,
  });

  const handleLowStockChange = (checked) => {
    setLowStockOnly(checked);
    setCurrentPage(1);
    if (checked) {
      searchParams.set("lowStock", "true");
    } else {
      searchParams.delete("lowStock");
    }
    setSearchParams(searchParams);
  };

  const filteredStock = useMemo(() => {
    if (!search.trim()) return stockList;
    const term = search.toLowerCase();
    return stockList.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term)
    );
  }, [stockList, search]);

  const totalPages = Math.ceil(filteredStock.length / pageSize) || 1;
  const paginatedStock = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStock.slice(start, start + pageSize);
  }, [filteredStock, currentPage, pageSize]);

  const columns = [
    {
      header: "Product Name",
      accessor: "name",
      render: (row) => (
        <div>
          <Link
            to={`/products/${row.id}`}
            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
          >
            {row.name}
          </Link>
          <span className="text-xs text-slate-400 block">Unit: {row.unit}</span>
        </div>
      ),
    },
    {
      header: "SKU",
      accessor: "sku",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.sku}
        </span>
      ),
    },
    {
      header: "Current Stock",
      accessor: "currentStock",
      render: (row) => {
        const qty = Number(row.currentStock || 0);
        const min = Number(row.minimumStock || 0);
        return (
          <span
            className={`text-base font-black ${
              qty <= 0
                ? "text-rose-600"
                : qty <= min
                ? "text-amber-600"
                : "text-emerald-700"
            }`}
          >
            {qty} {row.unit}
          </span>
        );
      },
    },
    {
      header: "Min Stock Alert",
      accessor: "minimumStock",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.minimumStock} {row.unit}
        </span>
      ),
    },
    {
      header: "Stock Status",
      render: (row) => {
        const qty = Number(row.currentStock || 0);
        const min = Number(row.minimumStock || 0);
        const status =
          qty <= 0 ? "OUT OF STOCK" : qty <= min ? "LOW STOCK" : "HEALTHY";
        return <Badge value={status} size="sm" />;
      },
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/products/${row.id}`}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
          >
            View
          </Link>
          <Link
            to="/purchases/new"
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-xs font-semibold"
          >
            + Restock
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Current Stock Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time quantities calculated directly from inventory transactions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link to="/stock/adjustments">
              <Button variant="outline">Stock Adjustments History →</Button>
            </Link>
          )}
          <Link to="/purchases/new">
            <Button variant="primary">+ Restock Purchase</Button>
          </Link>
        </div>
      </div>

      {/* Filter and Low Stock Checkbox */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search stock by product name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none self-start sm:self-center">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => handleLowStockChange(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span className={lowStockOnly ? "text-amber-700 font-bold" : ""}>
            Show Low-Stock Only
          </span>
        </label>
      </div>

      {/* Stock Table */}
      <DataTable
        columns={columns}
        data={paginatedStock}
        isLoading={isLoading}
        emptyMessage="No inventory records found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredStock.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default Stock;
