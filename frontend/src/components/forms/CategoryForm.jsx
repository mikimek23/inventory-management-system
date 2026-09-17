import React, { useState } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import { categorySchema } from "../../schemas/category.schema";

export const CategoryForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
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
      description: formData.description.trim() || undefined,
    };

    const result = categorySchema.safeParse(payload);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEdit && initialData?.code && (
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Category Code
          </label>
          <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 font-mono">
            {initialData.code}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Category prefix used to generate product SKUs.
          </p>
        </div>
      )}

      <Input
        label="Category Name"
        required
        placeholder="e.g. Beverages, Bakery, Electronics"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
        helperText="Unique category name (at least 3 characters)"
      />

      <Textarea
        label="Description (Optional)"
        placeholder="Brief description of this category..."
        rows={3}
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEdit ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
