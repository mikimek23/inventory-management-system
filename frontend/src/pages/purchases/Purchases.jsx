import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePurchases } from "../../hooks/usePurchases";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";

export const Purchases = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: purchases = [], isLoading } = usePurchases();

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.referenceNumber?.toLowerCase().includes(term) ||
        p.supplier?.name?.toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [purchases, search, statusFilter]);

  const totalPages = Math.ceil(filteredPurchases.length / pageSize) || 1;
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage, pageSize]);

  const columns = [
    {
      header: "Reference",
      accessor: "referenceNumber",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
          {row.referenceNumber}
        </span>
      ),
    },
    {
      header: "Supplier",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.supplier?.name || "—"}</span>
          <span className="text-xs text-slate-400 block">{row.supplier?.phone}</span>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {formatDate(row.transactionDate || row.createdAt)}
        </span>
      ),
    },
    {
      header: "Created By",
      render: (row) => (
        <span className="text-xs text-slate-600">{row.createdBy?.name || "System"}</span>
      ),
    },
    {
      header: "Total Amount",
      render: (row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <Badge value={row.status} size="sm" />,
    },
    {
      header: "Action",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/purchases/${row.id}`}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-md text-xs font-semibold transition-colors"
          >
            View Details →
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Purchases</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Stock-in procurement transactions. Complete a draft to increase inventory.
          </p>
        </div>
        <Link to="/purchases/new">
          <Button variant="primary">+ New Purchase</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <Input
          placeholder="Search by reference or supplier..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: "DRAFT", label: "DRAFT" },
            { value: "COMPLETED", label: "COMPLETED" },
            { value: "CANCELLED", label: "CANCELLED" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedPurchases}
        isLoading={isLoading}
        emptyMessage="No purchases found"
        emptyActionLabel="Create Purchase Draft"
        onEmptyAction={() => navigate("/purchases/new")}
        onRowClick={(row) => navigate(`/purchases/${row.id}`)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPurchases.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default Purchases;
