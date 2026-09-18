import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import supplierApi from "../../services/supplier.api";
import productApi from "../../services/product.api";
import { usePurchase, usePurchaseMutations } from "../../hooks/usePurchases";
import PurchaseForm from "../../components/forms/PurchaseForm";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const PurchaseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const purchaseQuery = usePurchase(id);

  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierApi.getAll(),
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getAll(),
  });

  const { updatePurchase } = usePurchaseMutations();

  const isLoading =
    purchaseQuery.isLoading || suppliersQuery.isLoading || productsQuery.isLoading;

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (purchaseQuery.isError || !purchaseQuery.data) {
    return (
      <ErrorState
        title="Purchase Not Found"
        message="The purchase you are trying to edit does not exist or could not be loaded."
        onRetry={() => purchaseQuery.refetch()}
      />
    );
  }

  const purchase = purchaseQuery.data;

  if (purchase.status !== "DRAFT") {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <strong>Cannot Edit Completed/Cancelled Purchase:</strong> Only purchases in <strong>DRAFT</strong> status can be edited.
        </div>
        <div>
          <Link
            to={`/purchases/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all"
          >
            ← View Purchase Details
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (payload) => {
    try {
      await updatePurchase.mutateAsync({ id, data: payload });
      success("Purchase draft updated successfully!");
      navigate(`/purchases/${id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/purchases" className="hover:text-blue-700">Purchases</Link>
        <span>/</span>
        <Link to={`/purchases/${id}`} className="hover:text-blue-700 font-mono">
          {purchase.referenceNumber}
        </Link>
        <span>/</span>
        <span className="text-slate-800">Edit Draft</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Purchase Draft
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Modify supplier, adjust item quantities and cost prices before completing the transaction.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold w-fit">
          DRAFT
        </span>
      </div>

      <PurchaseForm
        suppliers={suppliersQuery.data || []}
        products={productsQuery.data || []}
        initialData={purchase}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/purchases/${id}`)}
        isLoading={updatePurchase.isPending}
      />
    </div>
  );
};

export default PurchaseEdit;
