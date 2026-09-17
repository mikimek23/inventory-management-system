import React, { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import formatCurrency from "../../utils/formatCurrency";
import { purchaseSchema } from "../../schemas/purchase.schema";

export const PurchaseForm = ({
  suppliers = [],
  products = [],
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!initialData?.id;

  const [supplierId, setSupplierId] = useState(initialData?.supplierId || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [items, setItems] = useState(() => {
    if (initialData?.purchaseItems?.length) {
      return initialData.purchaseItems.map((item) => ({
        productId: item.productId,
        quantity: String(item.quantity),
        unitCost: String(item.unitCost),
      }));
    }
    return [{ productId: "", quantity: "1", unitCost: "" }];
  });

  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p.id === prodId);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          productId: prodId,
          unitCost: selectedProd ? String(selectedProd.costPrice) : item.unitCost,
        };
      })
    );
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: "1", unitCost: "" }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, item) => {
    const q = Number(item.quantity) || 0;
    const c = Number(item.unitCost) || 0;
    return acc + q * c;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const formattedItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity === "" ? NaN : Number(item.quantity),
      unitCost: item.unitCost === "" ? NaN : Number(item.unitCost),
    }));

    const payload = {
      supplierId: supplierId || "",
      notes: notes.trim() || undefined,
      items: formattedItems,
    };

    const result = purchaseSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = {};
      let generalMsg = "";

      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "items" && typeof issue.path[1] === "number") {
          const index = issue.path[1];
          const subField = issue.path[2] || "general";
          fieldErrors[`item_${index}_${subField}`] = issue.message;
        } else if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        } else {
          generalMsg = issue.message;
        }
      });

      setErrors(fieldErrors);
      if (generalMsg) setFormError(generalMsg);
      return;
    }

    onSubmit(payload);
  };

  const supplierOptions = suppliers
    .filter((s) => s.status === "ACTIVE" || s.id === initialData?.supplierId)
    .map((s) => ({
      value: s.id,
      label: s.name,
    }));

  const activeProducts = products.filter((p) => p.status === "ACTIVE");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg font-medium">
          {formError}
        </div>
      )}

      {/* Top Details */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Transaction Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Supplier"
            required
            placeholder="Select a supplier"
            options={supplierOptions}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            error={errors.supplierId}
          />

          <Textarea
            label="Transaction Notes (Optional)"
            placeholder="PO Number, invoice notes, delivery notes..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            error={errors.notes}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Purchase Line Items
            </h4>
            <p className="text-xs text-slate-500">
              Each product must be unique. Completing this purchase will increase inventory.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            + Add Line Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineTotal =
              (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);

            return (
              <div
                key={index}
                className="p-4 bg-slate-50/75 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-5">
                  <Select
                    label={`Item #${index + 1} Product`}
                    required
                    placeholder="Choose product"
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    error={errors[`item_${index}_productId`]}
                  >
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {p.unit}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Quantity"
                    required
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    error={errors[`item_${index}_quantity`]}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Unit Cost"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.unitCost}
                    onChange={(e) =>
                      handleItemChange(index, "unitCost", e.target.value)
                    }
                    error={errors[`item_${index}_unitCost`]}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col justify-end">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Line Total
                  </span>
                  <span className="text-sm font-bold text-slate-800 py-2">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    disabled={items.length <= 1}
                    onClick={() => removeItem(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-4">
          <div className="text-sm text-slate-500">
            Total items: <span className="font-semibold text-slate-800">{items.length}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Estimated Total
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalAmount)}
            </span>
            <p className="text-[10px] text-slate-400">
              * Official total calculated by backend upon save
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEdit ? "Update Purchase Draft" : "Save Purchase Draft"}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseForm;
