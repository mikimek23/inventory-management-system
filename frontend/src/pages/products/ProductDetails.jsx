import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct, useCategories, useProductMutations } from "../../hooks/useProducts";
import { useStock } from "../../hooks/useStock";
import useAuth from "../../hooks/useAuth";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const { data: product, isLoading: productLoading, isError: productError } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const { data: stockItems = [], isLoading: stockLoading } = useStock();
  const { toggleProductStatus } = useProductMutations();

  if (productLoading || stockLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (productError || !product) {
    return (
      <ErrorState
        title="Product Not Found"
        message="The product you are looking for does not exist or has been removed."
        onRetry={() => navigate("/products")}
      />
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const stockInfo = stockItems.find((s) => s.id === product.id);
  const currentStock = stockInfo ? Number(stockInfo.currentStock) : 0;
  const minimumStock = Number(product.minimumStock) || 0;

  const stockStatus =
    currentStock <= 0
      ? "OUT OF STOCK"
      : currentStock <= minimumStock
      ? "LOW STOCK"
      : "HEALTHY";

  const cost = Number(product.costPrice) || 0;
  const selling = Number(product.sellingPrice) || 0;
  const margin = selling > 0 ? (((selling - cost) / selling) * 100).toFixed(1) : 0;

  const handleToggleStatus = async () => {
    try {
      await toggleProductStatus.mutateAsync(product.id);
      success(
        `Product marked as ${product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}`
      );
      setIsDeactivateOpen(false);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/products" className="hover:text-emerald-700">Products</Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{product.name}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/products">
            <Button variant="outline" size="sm">
              ← Back to List
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link to={`/products/${product.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit Product
                </Button>
              </Link>
              <Button
                variant={product.status === "ACTIVE" ? "danger" : "primary"}
                size="sm"
                onClick={() => setIsDeactivateOpen(true)}
              >
                {product.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Banner Top */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {product.name}
              </h1>
              <Badge value={product.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span>SKU: <code className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{product.sku}</code></span>
              <span>•</span>
              <span>Category: <strong className="text-slate-700">{category?.name || "Unassigned"}</strong></span>
              <span>•</span>
              <span>Unit: <strong className="text-slate-700">{product.unit}</strong></span>
              <span>•</span>
              <span>Created: {formatDate(product.createdAt)}</span>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stock Status
            </span>
            <Badge value={stockStatus} size="md" className="mt-1" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/50">
          <div className="p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Current Stock
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {currentStock}
            </span>
            <span className="text-xs text-slate-500 block mt-1">{product.unit} on hand</span>
          </div>

          <div className="p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Minimum Threshold
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-700">
              {minimumStock}
            </span>
            <span className="text-xs text-slate-500 block mt-1">Alert trigger</span>
          </div>

          <div className="p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Cost Price
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-700">
              {formatCurrency(cost)}
            </span>
            <span className="text-xs text-slate-500 block mt-1">Acquisition cost</span>
          </div>

          <div className="p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Selling Price
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(selling)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">
              {margin}% Profit Margin
            </span>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Stock levels are derived append-only from purchase, sale, and adjustment transactions.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/purchases/new">
              <Button variant="outline" size="sm">
                + Restock (Purchase)
              </Button>
            </Link>
            <Link to="/sales/new">
              <Button variant="primary" size="sm">
                + Sell Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isDeactivateOpen && (
        <Modal
          isOpen={isDeactivateOpen}
          onClose={() => setIsDeactivateOpen(false)}
          title={`${product.status === "ACTIVE" ? "Deactivate" : "Activate"} Product?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to {product.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-900">{product.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsDeactivateOpen(false)}
                disabled={toggleProductStatus.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={product.status === "ACTIVE" ? "danger" : "primary"}
                onClick={handleToggleStatus}
                isLoading={toggleProductStatus.isPending}
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

export default ProductDetails;
