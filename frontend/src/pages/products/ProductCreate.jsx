import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCategories, useProductMutations } from "../../hooks/useProducts";
import ProductForm from "../../components/forms/ProductForm";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const ProductCreate = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { data: categories = [] } = useCategories();
  const { createProduct } = useProductMutations();

  const handleSubmit = async (data) => {
    try {
      const created = await createProduct.mutateAsync(data);
      success("Product created successfully!");
      navigate(`/products/${created.id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/products" className="hover:text-emerald-700">Products</Link>
        <span>/</span>
        <span className="text-slate-700">New Product</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Add New Product</h2>
        <p className="text-sm text-slate-500 mb-6">
          Provide product identifiers, category, pricing, and optional opening inventory.
        </p>

        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/products")}
          isLoading={createProduct.isPending}
        />
      </div>
    </div>
  );
};

export default ProductCreate;
