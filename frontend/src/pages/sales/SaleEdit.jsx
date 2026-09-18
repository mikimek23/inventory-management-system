import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import customerApi from "../../services/customer.api";
import productApi from "../../services/product.api";
import stockApi from "../../services/stock.api";
import { useSale, useSaleMutations } from "../../hooks/useSales";
import SaleForm from "../../components/forms/SaleForm";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const SaleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const saleQuery = useSale(id);

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getAll(),
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getAll(),
  });

  const stockQuery = useQuery({
    queryKey: ["stock"],
    queryFn: () => stockApi.getStockList(),
  });

  const { updateSale } = useSaleMutations();

  const stockMap = useMemo(() => {
    const map = {};
    if (stockQuery.data) {
      stockQuery.data.forEach((s) => {
        map[s.id] = Number(s.currentStock || 0);
      });
    }
    return map;
  }, [stockQuery.data]);

  const isLoading =
    saleQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading ||
    stockQuery.isLoading;

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (saleQuery.isError || !saleQuery.data) {
    return (
      <ErrorState
        title="Sale Not Found"
        message="The sale you are trying to edit does not exist or could not be loaded."
        onRetry={() => saleQuery.refetch()}
      />
    );
  }

  const sale = saleQuery.data;

  if (sale.status !== "DRAFT") {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <strong>Cannot Edit Completed/Cancelled Sale:</strong> Only sales in <strong>DRAFT</strong> status can be edited.
        </div>
        <div>
          <Link
            to={`/sales/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all"
          >
            ← View Sale Details
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (payload) => {
    try {
      await updateSale.mutateAsync({ id, data: payload });
      success("Sale draft updated successfully!");
      navigate(`/sales/${id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/sales" className="hover:text-blue-700">Sales</Link>
        <span>/</span>
        <Link to={`/sales/${id}`} className="hover:text-blue-700 font-mono">
          {sale.referenceNumber}
        </Link>
        <span>/</span>
        <span className="text-slate-800">Edit Draft</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Sale Draft
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Update customer assignment, items, quantities or selling prices before final completion.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold w-fit">
          DRAFT
        </span>
      </div>

      <SaleForm
        customers={customersQuery.data || []}
        products={productsQuery.data || []}
        stockMap={stockMap}
        initialData={sale}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/sales/${id}`)}
        isLoading={updateSale.isPending}
      />
    </div>
  );
};

export default SaleEdit;
