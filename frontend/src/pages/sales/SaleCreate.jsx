import React, { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import customerApi from "../../services/customer.api";
import productApi from "../../services/product.api";
import stockApi from "../../services/stock.api";
import { useSaleMutations } from "../../hooks/useSales";
import SaleForm from "../../components/forms/SaleForm";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const SaleCreate = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

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

  const { createSale } = useSaleMutations();

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
    customersQuery.isLoading || productsQuery.isLoading || stockQuery.isLoading;

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  const handleSubmit = async (payload) => {
    try {
      const created = await createSale.mutateAsync(payload);
      success("Sale draft created successfully!");
      navigate(`/sales/${created.id}`);
    } catch (err) {
      error(apiError(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/sales" className="hover:text-emerald-700">Sales</Link>
        <span>/</span>
        <span className="text-slate-800">New Sale</span>
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Sale Draft</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Select customer (optional for walk-ins), add products, and configure selling unit prices.
        </p>
      </div>

      <SaleForm
        customers={customersQuery.data || []}
        products={productsQuery.data || []}
        stockMap={stockMap}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/sales")}
        isLoading={createSale.isPending}
      />
    </div>
  );
};

export default SaleCreate;
