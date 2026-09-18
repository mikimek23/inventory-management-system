import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import supplierApi from "../../services/supplier.api";
import productApi from "../../services/product.api";
import { usePurchaseMutations } from "../../hooks/usePurchases";
import PurchaseForm from "../../components/forms/PurchaseForm";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const PurchaseCreate = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierApi.getAll(),
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getAll(),
  });

  const { createPurchase } = usePurchaseMutations();

  const isLoading = suppliersQuery.isLoading || productsQuery.isLoading;

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  const handleSubmit = async (payload) => {
    try {
      const created = await createPurchase.mutateAsync(payload);
      success("Purchase draft saved successfully!");
      navigate(`/purchases/${created.id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/purchases" className="hover:text-emerald-700">Purchases</Link>
        <span>/</span>
        <span className="text-slate-800">New Purchase</span>
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Purchase Draft</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Select supplier, add products, set quantities and acquisition unit costs.
        </p>
      </div>

      <PurchaseForm
        suppliers={suppliersQuery.data || []}
        products={productsQuery.data || []}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/purchases")}
        isLoading={createPurchase.isPending}
      />
    </div>
  );
};

export default PurchaseCreate;
