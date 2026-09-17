import React, { useState } from "react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import { stockAdjustmentSchema } from "../../schemas/stockAdjustment.schema";

export const StockAdjustmentForm = ({
  products = [],
  stockMap = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    productId: "",
    type: "INCREASE",
    quantity: "1",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedStock =
    formData.productId && stockMap[formData.productId] !== undefined
      ? Number(stockMap[formData.productId])
      : null;

  const currentQty = Number(formData.quantity) || 0;
  const resultingStock =
    selectedStock !== null
      ? formData.type === "INCREASE"
        ? selectedStock + currentQty
        : selectedStock - currentQty
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      productId: formData.productId,
      type: formData.type,
      quantity: formData.quantity === "" ? NaN : Number(formData.quantity),
      reason: formData.reason.trim(),
    };

    const result = stockAdjustmentSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(payload);
  };

  const activeProducts = products.filter((p) => p.status === "ACTIVE");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Select Product"
        required
        placeholder="Choose product to adjust"
        value={formData.productId}
        onChange={(e) => handleChange("productId", e.target.value)}
        error={errors.productId}
      >
        {activeProducts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.sku}) — {p.unit}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Adjustment Type"
          required
          placeholder={null}
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
          error={errors.type}
        >
          <option value="INCREASE">INCREASE (Add Stock)</option>
          <option value="DECREASE">DECREASE (Reduce Stock)</option>
        </Select>

        <Input
          label="Adjustment Quantity"
          required
          type="number"
          min="1"
          placeholder="1"
          value={formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
          error={errors.quantity}
        />
      </div>

      {/* Stock Impact Visualizer */}
      {selectedStock !== null && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Stock Impact Projection
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Current</span>
              <span className="text-base font-bold text-slate-700">{selectedStock}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">
                {formData.type === "INCREASE" ? "+ Added" : "- Subtracted"}
              </span>
              <span
                className={`text-base font-bold ${
                  formData.type === "INCREASE" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formData.type === "INCREASE" ? `+${currentQty}` : `-${currentQty}`}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Resulting</span>
              <span
                className={`text-base font-bold ${
                  resultingStock < 0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {resultingStock}
              </span>
            </div>
          </div>
          {formData.type === "DECREASE" && resultingStock < 0 && (
            <p className="text-xs text-rose-600 font-semibold text-center mt-1">
              Warning: Decrease exceeds available inventory. Server will reject negative stock.
            </p>
          )}
        </div>
      )}

      <Textarea
        label="Reason for Adjustment"
        required
        placeholder="e.g. Broken packaging, found misplaced inventory, cycle count discrepancy..."
        rows={3}
        value={formData.reason}
        onChange={(e) => handleChange("reason", e.target.value)}
        error={errors.reason}
        helperText="Required by audit policy"
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Submit Adjustment
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;
