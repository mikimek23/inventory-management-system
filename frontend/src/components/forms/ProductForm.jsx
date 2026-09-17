import React, { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { createProductSchema, updateProductSchema } from "../../schemas/product.schema";

export const ProductForm = ({
  initialData = null,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    categoryId: initialData?.categoryId || "",
    unit: initialData?.unit || "pcs",
    costPrice: initialData?.costPrice !== undefined ? String(initialData.costPrice) : "",
    sellingPrice: initialData?.sellingPrice !== undefined ? String(initialData.sellingPrice) : "",
    minimumStock: initialData?.minimumStock !== undefined ? String(initialData.minimumStock) : "5",
    quantity: initialData?.quantity !== undefined ? String(initialData.quantity) : "0",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      unit: formData.unit.trim(),
      costPrice: formData.costPrice === "" ? NaN : Number(formData.costPrice),
      sellingPrice: formData.sellingPrice === "" ? NaN : Number(formData.sellingPrice),
      minimumStock: formData.minimumStock === "" ? NaN : Number(formData.minimumStock),
      ...(!isEdit && {
        quantity: formData.quantity === "" ? 0 : Number(formData.quantity),
      }),
    };

    const schema = isEdit ? updateProductSchema : createProductSchema;
    const result = schema.safeParse(payload);

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

    onSubmit(result.data);
  };

  const categoryOptions = categories
    .filter((c) => c.status === "ACTIVE" || c.id === initialData?.categoryId)
    .map((c) => ({
      value: c.id,
      label: `${c.name} (${c.code})`,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        required
        placeholder="e.g. Arabica Coffee Beans"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          required
          placeholder="Select a category"
          options={categoryOptions}
          value={formData.categoryId}
          onChange={(e) => handleChange("categoryId", e.target.value)}
          error={errors.categoryId}
        />

        <Input
          label="Unit of Measurement"
          required
          placeholder="e.g. pcs, kg, box, pack"
          value={formData.unit}
          onChange={(e) => handleChange("unit", e.target.value)}
          error={errors.unit}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Cost Price"
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.costPrice}
          onChange={(e) => handleChange("costPrice", e.target.value)}
          error={errors.costPrice}
          helperText="Unit purchase or manufacturing cost"
        />

        <Input
          label="Selling Price"
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.sellingPrice}
          onChange={(e) => handleChange("sellingPrice", e.target.value)}
          error={errors.sellingPrice}
          helperText="Must be greater than or equal to cost price"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Minimum Stock Threshold"
          required
          type="number"
          min="0"
          placeholder="5"
          value={formData.minimumStock}
          onChange={(e) => handleChange("minimumStock", e.target.value)}
          error={errors.minimumStock}
          helperText="Triggers low-stock warning when reached"
        />

        {!isEdit ? (
          <Input
            label="Opening Stock Quantity"
            required
            type="number"
            min="0"
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            error={errors.quantity}
            helperText="Initial inventory on hand. 0 for none."
          />
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Product SKU (Immutable)
            </label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 font-mono">
              {initialData?.sku}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              SKU is generated automatically by system.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
