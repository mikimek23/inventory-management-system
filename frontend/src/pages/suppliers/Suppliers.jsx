import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supplierApi from "../../services/supplier.api";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SupplierForm from "../../components/forms/SupplierForm";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const Suppliers = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [statusConfirmSupplier, setStatusConfirmSupplier] = useState(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      success("Supplier created successfully!");
      setIsCreateOpen(false);
    },
    onError: (err) => error(apiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      success("Supplier updated successfully!");
      setEditingSupplier(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => supplierApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      success("Supplier status updated!");
      setStatusConfirmSupplier(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const term = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.address && s.address.toLowerCase().includes(term))
    );
  }, [suppliers, search]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  const columns = [
    {
      header: "Supplier Name",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.name}</span>
          {row.notes && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{row.notes}</p>
          )}
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.phone}</span>,
    },
    {
      header: "Email",
      accessor: "email",
      render: (row) => (
        <span className="text-xs text-slate-600">{row.email || "—"}</span>
      ),
    },
    {
      header: "Address",
      accessor: "address",
      render: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-[180px] block">
          {row.address || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <Badge value={row.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button
                onClick={() => setEditingSupplier(row)}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setStatusConfirmSupplier(row)}
                className={`p-1.5 rounded-md text-xs font-semibold ${
                  row.status === "ACTIVE"
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Suppliers</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage vendors and procurement contacts for inventory purchasing.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Add Supplier
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <Input
          placeholder="Search suppliers by name, phone, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedSuppliers}
        isLoading={isLoading}
        emptyMessage="No suppliers found"
        emptyActionLabel={isAdmin ? "Create First Supplier" : undefined}
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSuppliers.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Supplier"
        >
          <SupplierForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {editingSupplier && (
        <Modal
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          title="Edit Supplier"
        >
          <SupplierForm
            initialData={editingSupplier}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingSupplier.id, data })
            }
            onCancel={() => setEditingSupplier(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}

      {statusConfirmSupplier && (
        <Modal
          isOpen={!!statusConfirmSupplier}
          onClose={() => setStatusConfirmSupplier(null)}
          title={`${
            statusConfirmSupplier.status === "ACTIVE" ? "Deactivate" : "Activate"
          } Supplier?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{" "}
              {statusConfirmSupplier.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-900">{statusConfirmSupplier.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setStatusConfirmSupplier(null)}
                disabled={toggleStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={
                  statusConfirmSupplier.status === "ACTIVE" ? "danger" : "primary"
                }
                onClick={() =>
                  toggleStatusMutation.mutate(statusConfirmSupplier.id)
                }
                isLoading={toggleStatusMutation.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Suppliers;
