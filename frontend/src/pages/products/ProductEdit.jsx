import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct, useCategories, useProductMutations } from "../../hooks/useProducts";
import ProductForm from "../../components/forms/ProductForm";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const { updateProduct } = useProductMutations();

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (isError || !product) {
    return (
      <ErrorState
        title="Product Not Found"
        message="The requested product does not exist or could not be loaded."
        onRetry={() => navigate("/products")}
      />
    );
  }

  const handleSubmit = async (data) => {
    try {
      await updateProduct.mutateAsync({ id, data });
      success("Product updated successfully!");
      navigate(`/products/${id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/products" className="hover:text-emerald-700">Products</Link>
        <span>/</span>
        <Link to={`/products/${id}`} className="hover:text-emerald-700">{product.name}</Link>
        <span>/</span>
        <span className="text-slate-700">Edit</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Edit Product</h2>
        <p className="text-sm text-slate-500 mb-6">
          Update product metadata, categories, prices, or minimum stock alert levels.
        </p>

        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/products/${id}`)}
          isLoading={updateProduct.isPending}
        />
      </div>
    </div>
  );
};

export default ProductEdit;
