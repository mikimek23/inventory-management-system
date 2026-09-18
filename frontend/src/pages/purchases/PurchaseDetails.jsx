import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePurchase, usePurchaseMutations } from "../../hooks/usePurchases";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [confirmAction, setConfirmAction] = useState(null); // 'complete' | 'cancel' | null

  const { data: purchase, isLoading, isError } = usePurchase(id);
  const { completePurchase, cancelPurchase } = usePurchaseMutations();

  if (isLoading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (isError || !purchase) {
    return (
      <ErrorState
        title="Purchase Not Found"
        message="The purchase record you are looking for could not be found."
        onRetry={() => navigate("/purchases")}
      />
    );
  }

  const isDraft = purchase.status === "DRAFT";
  const items = purchase.purchaseItems || [];

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction === "complete") {
        await completePurchase.mutateAsync(id);
        success("Purchase completed successfully! Inventory increased.");
      } else if (confirmAction === "cancel") {
        await cancelPurchase.mutateAsync(id);
        success("Purchase draft cancelled.");
      }
      setConfirmAction(null);
    } catch (err) {
      error(apiError(err));
    }
  };

  const isPending = completePurchase.isPending || cancelPurchase.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/purchases" className="hover:text-emerald-700">Purchases</Link>
          <span>/</span>
          <span className="text-slate-800 font-mono font-bold">{purchase.referenceNumber}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/purchases">
            <Button variant="outline" size="sm">
              ← Back to List
            </Button>
          </Link>
          {isDraft && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction("cancel")}
              >
                Cancel Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirmAction("complete")}
              >
                Complete Purchase
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
                {purchase.referenceNumber}
              </span>
              <Badge value={purchase.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span>Supplier: <strong className="text-slate-800">{purchase.supplier?.name}</strong></span>
              <span>•</span>
              <span>Date: {formatDate(purchase.transactionDate || purchase.createdAt)}</span>
              <span>•</span>
              <span>Recorded By: <strong className="text-slate-700">{purchase.createdBy?.name || "System"}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatCurrency(purchase.total)}
            </span>
          </div>
        </div>

        {/* Supplier & Notes Details */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Supplier Contact Details
            </span>
            <p className="font-semibold text-slate-800">{purchase.supplier?.name}</p>
            <p className="text-slate-500 text-xs font-mono">{purchase.supplier?.phone}</p>
            {purchase.supplier?.email && (
              <p className="text-slate-500 text-xs">{purchase.supplier?.email}</p>
            )}
            {purchase.supplier?.address && (
              <p className="text-slate-500 text-xs mt-1">{purchase.supplier?.address}</p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Transaction Notes
            </span>
            <p className="text-slate-600 text-xs leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
              {purchase.notes || "No notes provided for this transaction."}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Purchased Products
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Unit Cost</th>
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
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.lineTotal || item.quantity * item.unitCost)}
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
                    {formatCurrency(purchase.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* State Notice Banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Status: <strong>{purchase.status}</strong> •{" "}
            {purchase.status === "COMPLETED"
              ? "This transaction has increased inventory and is read-only."
              : purchase.status === "CANCELLED"
              ? "This transaction was cancelled and had no stock impact."
              : "This draft transaction has not modified inventory yet."}
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
              ? "Complete Purchase Transaction?"
              : "Cancel Purchase Draft?"
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {confirmAction === "complete"
                ? "Completing this purchase will permanently increase warehouse stock levels for each item in this transaction. This action cannot be reversed silently."
                : "Are you sure you want to cancel this draft? Cancelled transactions remain permanently read-only and will not modify inventory."}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
              Reference: {purchase.referenceNumber} • Total: {formatCurrency(purchase.total)}
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
                Yes, {confirmAction === "complete" ? "Complete Purchase" : "Cancel Draft"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseDetails;
