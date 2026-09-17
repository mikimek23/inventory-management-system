import React, { useState } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import { customerSchema } from "../../schemas/customer.schema";

export const CustomerForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    notes: initialData?.notes || "",
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
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    const result = customerSchema.safeParse(payload);

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
      <Input
        label="Customer Name"
        required
        placeholder="e.g. Jane Doe or Retail Store"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          required
          placeholder="0712345678"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          helperText="Must start with 07 or 09 (10 digits)"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="customer@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
      </div>

      <Textarea
        label="Address"
        placeholder="Customer location / delivery address..."
        rows={2}
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
        error={errors.address}
      />

      <Textarea
        label="Notes"
        placeholder="Preferences, credit terms, special instructions..."
        rows={2}
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        error={errors.notes}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEdit ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
