import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useStock, useStockAdjustments, useStockAdjustmentMutations } from "../../hooks/useStock";
import { useProducts } from "../../hooks/useProducts";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import StockAdjustmentForm from "../../components/forms/StockAdjustmentForm";
import formatDate from "../../utils/formatDate";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const StockAdjustments = () => {
  const { success, error } = useToast();

  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Queries
  const { data: adjustments = [], isLoading } = useStockAdjustments({
    productId: productFilter || undefined,
    type: typeFilter || undefined,
  });

  const { data: products = [] } = useProducts();
  const { data: stockItems = [] } = useStock();
  const { createAdjustment } = useStockAdjustmentMutations();

  const stockMap = useMemo(() => {
    const map = {};
    stockItems.forEach((item) => {
      map[item.id] = Number(item.currentStock || 0);
    });
    return map;
  }, [stockItems]);

  const totalPages = Math.ceil(adjustments.length / pageSize) || 1;
  const paginatedAdjustments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return adjustments.slice(start, start + pageSize);
  }, [adjustments, currentPage, pageSize]);

  const handleCreateSubmit = async (data) => {
    try {
      await createAdjustment.mutateAsync(data);
      success("Stock adjustment applied successfully!");
      setIsCreateOpen(false);
    } catch (err) {
      error(apiError(err));
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: "product",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.product?.name}</span>
          <span className="text-xs text-slate-400 font-mono block">
            {row.product?.sku}
          </span>
        </div>
      ),
    },
    {
      header: "Adjustment Type",
      accessor: "type",
      render: (row) => (
        <Badge
          value={row.type}
          variant={row.type === "INCREASE" ? "success" : "danger"}
          size="sm"
        />
      ),
    },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (row) => (
        <span
          className={`font-black text-sm ${
            row.type === "INCREASE" ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {row.type === "INCREASE" ? `+${row.quantity}` : `-${row.quantity}`}
        </span>
      ),
    },
    {
      header: "Reason / Note",
      accessor: "reason",
      render: (row) => (
        <span className="text-xs text-slate-600 max-w-xs block font-medium">
          {row.reason}
        </span>
      ),
    },
    {
      header: "Authorized By",
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800">
            {row.createdBy?.name || "System"}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {row.createdBy?.role}
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDate(row.createdAt, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/stock" className="hover:text-emerald-700">Stock</Link>
            <span>/</span>
            <span className="text-slate-700">Adjustments</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Stock Adjustments Audit
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Admin-only manual inventory corrections. All entries are audited and irreversible.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/stock">
            <Button variant="outline">← Current Stock</Button>
          </Link>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + New Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <Select
          placeholder="All Products"
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={products.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
        />

        <Select
          placeholder="All Adjustment Types"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: "INCREASE", label: "INCREASE (Stock Additions)" },
            { value: "DECREASE", label: "DECREASE (Stock Reductions)" },
          ]}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedAdjustments}
        isLoading={isLoading}
        emptyMessage="No stock adjustments found"
        emptyActionLabel="Create Adjustment"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={adjustments.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Manual Stock Adjustment"
        >
          <StockAdjustmentForm
            products={products}
            stockMap={stockMap}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createAdjustment.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default StockAdjustments;
