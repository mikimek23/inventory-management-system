import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useProducts, useCategories, useProductMutations } from "../../hooks/useProducts";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ProductForm from "../../components/forms/ProductForm";
import formatCurrency from "../../utils/formatCurrency";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const Products = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusConfirmProduct, setStatusConfirmProduct] = useState(null);

  // Queries
  const { data: products = [], isLoading } = useProducts({
    search: search || undefined,
    categoryId: categoryFilter || undefined,
    status: statusFilter || undefined,
  });

  const { data: categories = [] } = useCategories();
  const { createProduct, updateProduct, toggleProductStatus } = useProductMutations();

  // Category lookup map
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Client-side pagination for seamless UX
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  const handleCreateSubmit = async (data) => {
    try {
      await createProduct.mutateAsync(data);
      success("Product created successfully!");
      setIsCreateOpen(false);
    } catch (err) {
      error(apiError(err));
    }
  };

  const handleEditSubmit = async (data) => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({ id: editingProduct.id, data });
      success("Product updated successfully!");
      setEditingProduct(null);
    } catch (err) {
      error(apiError(err));
    }
  };

  const handleStatusToggle = async () => {
    if (!statusConfirmProduct) return;
    try {
      await toggleProductStatus.mutateAsync(statusConfirmProduct.id);
      success(
        `Product marked as ${
          statusConfirmProduct.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        }`
      );
      setStatusConfirmProduct(null);
    } catch (err) {
      error(apiError(err));
    }
  };

  const columns = [
    {
      header: "Product Name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 block">{row.name}</span>
          <span className="text-xs text-slate-400">Unit: {row.unit}</span>
        </div>
      ),
    },
    {
      header: "SKU",
      accessor: "sku",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {row.sku}
        </span>
      ),
    },
    {
      header: "Category",
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {categoryMap[row.categoryId] || "—"}
        </span>
      ),
    },
    {
      header: "Cost Price",
      render: (row) => formatCurrency(row.costPrice),
    },
    {
      header: "Selling Price",
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {formatCurrency(row.sellingPrice)}
        </span>
      ),
    },
    {
      header: "Min Stock",
      render: (row) => `${row.minimumStock} ${row.unit}`,
    },
    {
      header: "Status",
      render: (row) => <Badge value={row.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/products/${row.id}`}
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
            title="View Details"
          >
            View
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => setEditingProduct(row)}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setStatusConfirmProduct(row)}
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your product catalogue, unit pricing, and thresholds.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Add Product
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          placeholder="All Categories"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />

        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: "ACTIVE", label: "ACTIVE" },
            { value: "INACTIVE", label: "INACTIVE" },
          ]}
        />
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        isLoading={isLoading}
        emptyMessage="No products found"
        emptyActionLabel={isAdmin ? "Create First Product" : undefined}
        onEmptyAction={() => setIsCreateOpen(true)}
        onRowClick={(row) => navigate(`/products/${row.id}`)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={products.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create Product Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Product"
        >
          <ProductForm
            categories={categories}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createProduct.isPending}
          />
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title="Edit Product"
        >
          <ProductForm
            initialData={editingProduct}
            categories={categories}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingProduct(null)}
            isLoading={updateProduct.isPending}
          />
        </Modal>
      )}

      {/* Status Toggle Confirmation Modal */}
      {statusConfirmProduct && (
        <Modal
          isOpen={!!statusConfirmProduct}
          onClose={() => setStatusConfirmProduct(null)}
          title={`${
            statusConfirmProduct.status === "ACTIVE" ? "Deactivate" : "Activate"
          } Product?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{" "}
              {statusConfirmProduct.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-900">{statusConfirmProduct.name}</strong>?
            </p>
            {statusConfirmProduct.status === "ACTIVE" && (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 font-medium">
                Deactivated products cannot be selected for new purchases or sales, but existing transaction history is safely preserved.
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setStatusConfirmProduct(null)}
                disabled={toggleProductStatus.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={
                  statusConfirmProduct.status === "ACTIVE" ? "danger" : "primary"
                }
                onClick={handleStatusToggle}
                isLoading={toggleProductStatus.isPending}
              >
                Confirm{" "}
                {statusConfirmProduct.status === "ACTIVE"
                  ? "Deactivation"
                  : "Activation"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Products;
