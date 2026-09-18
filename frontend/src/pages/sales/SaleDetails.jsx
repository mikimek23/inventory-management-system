import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSale, useSaleMutations } from "../../hooks/useSales";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [confirmAction, setConfirmAction] = useState(null); // 'complete' | 'cancel' | null
  const [errorMessage, setErrorMessage] = useState("");

  const { data: sale, isLoading, isError } = useSale(id);
  const { completeSale, cancelSale } = useSaleMutations();

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (isError || !sale) {
    return (
      <ErrorState
        title="Sale Not Found"
        message="The sale record you are looking for could not be found."
        onRetry={() => navigate("/sales")}
      />
    );
  }

  const isDraft = sale.status === "DRAFT";
  const items = sale.saleItems || [];

  const handleAction = async () => {
    if (!confirmAction) return;
    setErrorMessage("");

    try {
      if (confirmAction === "complete") {
        await completeSale.mutateAsync(id);
        success("Sale completed successfully! Inventory deducted.");
        setConfirmAction(null);
      } else if (confirmAction === "cancel") {
        await cancelSale.mutateAsync(id);
        success("Sale draft cancelled.");
        setConfirmAction(null);
      }
    } catch (err) {
      const msg = apiError(err);
      setErrorMessage(msg);
      error(msg);
    }
  };

  const isPending = completeSale.isPending || cancelSale.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/sales" className="hover:text-emerald-700">Sales</Link>
          <span>/</span>
          <span className="text-slate-800 font-mono font-bold">{sale.referenceNumber}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/sales">
            <Button variant="outline" size="sm">
              ← Back to List
            </Button>
          </Link>
          {isDraft && (
            <>
              <Link to={`/sales/${sale.id}/edit`}>
                <Button variant="outline" size="sm">
                  ✎ Edit Draft
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setErrorMessage("");
                  setConfirmAction("cancel");
                }}
              >
                Cancel Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setErrorMessage("");
                  setConfirmAction("complete");
                }}
              >
                Complete Sale
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                {sale.referenceNumber}
              </span>
              <Badge value={sale.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span>Customer: <strong className="text-slate-800">{sale.customer?.name || "Walk-in / Anonymous"}</strong></span>
              <span>•</span>
              <span>Date: {formatDate(sale.transactionDate || sale.createdAt)}</span>
              <span>•</span>
              <span>Cashier: <strong className="text-slate-700">{sale.createdBy?.name || "System"}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Sale Revenue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>

        {/* Customer & Notes Details */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Information
            </span>
            {sale.customer ? (
              <>
                <p className="font-semibold text-slate-800">{sale.customer.name}</p>
                <p className="text-slate-500 text-xs font-mono">{sale.customer.phone}</p>
                {sale.customer.email && (
                  <p className="text-slate-500 text-xs">{sale.customer.email}</p>
                )}
                {sale.customer.address && (
                  <p className="text-slate-500 text-xs mt-1">{sale.customer.address}</p>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-xs italic">
                Walk-in customer (no contact profile linked)
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sale Notes & Terms
            </span>
            <p className="text-slate-600 text-xs leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
              {sale.notes || "No notes provided for this transaction."}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Sold Line Items
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.product?.name}
                      <span className="text-xs text-slate-400 block font-normal">
                        Unit: {item.product?.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {item.product?.sku}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.lineTotal || item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 border-t border-slate-200">
                  <td colSpan={5} className="py-3 px-4 text-right font-bold text-slate-700">
                    Official Total:
                  </td>
                  <td className="py-3 px-4 text-right text-base font-black text-emerald-800">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* State Notice Banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Status: <strong>{sale.status}</strong> •{" "}
            {sale.status === "COMPLETED"
              ? "This transaction has decreased warehouse inventory and is read-only."
              : sale.status === "CANCELLED"
              ? "This transaction was cancelled and had no stock impact."
              : "This draft transaction has not deducted inventory yet."}
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction === "complete"
              ? "Complete Sale Transaction?"
              : "Cancel Sale Draft?"
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {confirmAction === "complete"
                ? "This operation will finalize the sale and decrease warehouse inventory. If any product has insufficient stock, the operation will be rejected."
                : "Are you sure you want to cancel this draft? Cancelled sales will not modify inventory and remain permanently read-only."}
            </p>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <p className="font-bold">Unable to complete sale.</p>
                <p>{errorMessage}</p>
                <p className="text-[11px] text-rose-600 italic">No inventory was changed.</p>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
              Reference: {sale.referenceNumber} • Total: {formatCurrency(sale.total)}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setConfirmAction(null)}
                disabled={isPending}
              >
                Go Back
              </Button>
              <Button
                variant={confirmAction === "complete" ? "primary" : "danger"}
                onClick={handleAction}
                isLoading={isPending}
              >
                Yes, {confirmAction === "complete" ? "Complete Sale" : "Cancel Draft"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SaleDetails;
