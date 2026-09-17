import React, { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import formatCurrency from "../../utils/formatCurrency";
import { saleSchema } from "../../schemas/sale.schema";

export const SaleForm = ({
  customers = [],
  products = [],
  stockMap = {},
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!initialData?.id;

  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [items, setItems] = useState(() => {
    if (initialData?.saleItems?.length) {
      return initialData.saleItems.map((item) => ({
        productId: item.productId,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      }));
    }
    return [{ productId: "", quantity: "1", unitPrice: "" }];
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
          unitPrice: selectedProd ? String(selectedProd.sellingPrice) : item.unitPrice,
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
    setItems((prev) => [...prev, { productId: "", quantity: "1", unitPrice: "" }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return acc + q * p;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const formattedItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity === "" ? NaN : Number(item.quantity),
      unitPrice: item.unitPrice === "" ? NaN : Number(item.unitPrice),
    }));

    const payload = {
      customerId: customerId || undefined,
      notes: notes.trim() || undefined,
      items: formattedItems,
    };

    const result = saleSchema.safeParse(payload);

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

  const customerOptions = customers
    .filter((c) => c.status === "ACTIVE" || c.id === initialData?.customerId)
    .map((c) => ({
      value: c.id,
      label: `${c.name} (${c.phone})`,
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
          Sale Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Customer (Optional)"
            placeholder="Walk-in / Anonymous Customer"
            options={customerOptions}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            error={errors.customerId}
            helperText="Leave empty for walk-in retail sales"
          />

          <Textarea
            label="Transaction Notes (Optional)"
            placeholder="Delivery address, payment method, invoice notes..."
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
              Sale Line Items
            </h4>
            <p className="text-xs text-slate-500">
              Each product line must be unique. Completing this sale will deduct items from live inventory.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            + Add Line Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const currentStock =
              item.productId && stockMap[item.productId] !== undefined
                ? Number(stockMap[item.productId])
                : null;

            const requestedQty = Number(item.quantity) || 0;
            const isInsufficient =
              currentStock !== null && requestedQty > currentStock;

            const lineTotal = requestedQty * (Number(item.unitPrice) || 0);

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
                  {currentStock !== null && (
                    <p
                      className={`text-[11px] font-medium mt-1 ${
                        currentStock <= 0
                          ? "text-rose-600 font-bold"
                          : currentStock < 5
                          ? "text-amber-600 font-semibold"
                          : "text-slate-500"
                      }`}
                    >
                      Available in stock:{" "}
                      <span className="font-bold">{currentStock}</span>
                    </p>
                  )}
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
                    error={
                      errors[`item_${index}_quantity`] ||
                      (isInsufficient
                        ? `Warning: Exceeds current stock (${currentStock})`
                        : undefined)
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Unit Price"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    error={errors[`item_${index}_unitPrice`]}
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
          {isEdit ? "Update Sale Draft" : "Save Sale Draft"}
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;
