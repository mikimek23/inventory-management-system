import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import categoryApi from "../../services/category.api";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import CategoryForm from "../../components/forms/CategoryForm";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const Categories = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [statusConfirmCategory, setStatusConfirmCategory] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      success("Category created successfully!");
      setIsCreateOpen(false);
    },
    onError: (err) => error(apiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      success("Category updated successfully!");
      setEditingCategory(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => categoryApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      success("Category status updated!");
      setStatusConfirmCategory(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.code && c.code.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  }, [categories, search]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const columns = [
    {
      header: "Category Name",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.name}</span>
          {row.description && (
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm truncate">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Prefix Code",
      accessor: "code",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.code}
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
                onClick={() => setEditingCategory(row)}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setStatusConfirmCategory(row)}
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
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize products into groups. Codes generate SKU sequences automatically.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Add Category
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <Input
          placeholder="Search categories by name or code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedCategories}
        isLoading={isLoading}
        emptyMessage="No categories found"
        emptyActionLabel={isAdmin ? "Create First Category" : undefined}
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCategories.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Category"
        >
          <CategoryForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <Modal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          title="Edit Category"
        >
          <CategoryForm
            initialData={editingCategory}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingCategory.id, data })
            }
            onCancel={() => setEditingCategory(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}

      {/* Status Toggle Modal */}
      {statusConfirmCategory && (
        <Modal
          isOpen={!!statusConfirmCategory}
          onClose={() => setStatusConfirmCategory(null)}
          title={`${
            statusConfirmCategory.status === "ACTIVE" ? "Deactivate" : "Activate"
          } Category?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{" "}
              {statusConfirmCategory.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-900">{statusConfirmCategory.name}</strong>?
            </p>
            {statusConfirmCategory.status === "ACTIVE" && (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 font-medium">
                Deactivated categories cannot have new products assigned to them.
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setStatusConfirmCategory(null)}
                disabled={toggleStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={
                  statusConfirmCategory.status === "ACTIVE" ? "danger" : "primary"
                }
                onClick={() =>
                  toggleStatusMutation.mutate(statusConfirmCategory.id)
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

export default Categories;
