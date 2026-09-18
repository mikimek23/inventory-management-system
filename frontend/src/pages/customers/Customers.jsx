import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import customerApi from "../../services/customer.api";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import CustomerForm from "../../components/forms/CustomerForm";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const Customers = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [statusConfirmCustomer, setStatusConfirmCustomer] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      success("Customer created successfully!");
      setIsCreateOpen(false);
    },
    onError: (err) => error(apiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      success("Customer updated successfully!");
      setEditingCustomer(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => customerApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      success("Customer status updated!");
      setStatusConfirmCustomer(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const term = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term))
    );
  }, [customers, search]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const columns = [
    {
      header: "Customer Name",
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
                onClick={() => setEditingCustomer(row)}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setStatusConfirmCustomer(row)}
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customers</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Client accounts for sales transactions. Sales also support anonymous walk-ins.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Add Customer
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <Input
          placeholder="Search customers by name, phone, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedCustomers}
        isLoading={isLoading}
        emptyMessage="No customers found"
        emptyActionLabel={isAdmin ? "Create First Customer" : undefined}
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Customer"
        >
          <CustomerForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {editingCustomer && (
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title="Edit Customer"
        >
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingCustomer.id, data })
            }
            onCancel={() => setEditingCustomer(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}

      {statusConfirmCustomer && (
        <Modal
          isOpen={!!statusConfirmCustomer}
          onClose={() => setStatusConfirmCustomer(null)}
          title={`${
            statusConfirmCustomer.status === "ACTIVE" ? "Deactivate" : "Activate"
          } Customer?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{" "}
              {statusConfirmCustomer.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-900">{statusConfirmCustomer.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setStatusConfirmCustomer(null)}
                disabled={toggleStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={
                  statusConfirmCustomer.status === "ACTIVE" ? "danger" : "primary"
                }
                onClick={() =>
                  toggleStatusMutation.mutate(statusConfirmCustomer.id)
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

export default Customers;
