import React, { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "../../services/auth.api";
import { apiError } from "../../services/api";
import { useToast } from "../../components/ui/Toast";
import formatDate from "../../utils/formatDate";

const profileSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters long"),
  email: z.string().trim().email("Please enter a valid email address"),
});

export const Profile = () => {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
      });
      setErrors({});
      setServerError("");
    }
    setIsEditing(!isEditing);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await authApi.updateProfile(result.data);
      const mergedUser = { ...user, ...updated };
      setUser(mergedUser);
      localStorage.setItem("inventory_user", JSON.stringify(mergedUser));
      success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      const msg = apiError(err);
      setServerError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/dashboard" className="hover:text-blue-700">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-800">My Profile</span>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-700/20 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user?.name || "User Profile"}
                </h2>
                <Badge value={user?.role} size="md" />
                <Badge value={user?.status || "ACTIVE"} size="md" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant={isEditing ? "secondary" : "primary"}
            size="md"
            onClick={handleEditToggle}
          >
            {isEditing ? "Cancel Editing" : "✎ Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Profile Form (when editing) */}
      {isEditing && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              ACCOUNT SETTINGS
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Edit Your Profile Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your display name and email address.
            </p>
          </div>

          {serverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleEditToggle}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Informational Cards (Modeled after Reference Image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="text-blue-700 text-lg">👤</span>
            <h3 className="text-base font-bold text-slate-800">
              Personal Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900">
                {user?.name || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                {user?.email || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Account Status
              </span>
              <div className="mt-1">
                <Badge value={user?.status || "ACTIVE"} />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Member Since
              </span>
              <p className="text-sm font-bold text-slate-800">
                {user?.createdAt ? formatDate(user.createdAt) : "Active User"}
              </p>
            </div>
          </div>
        </div>

        {/* Roles & System Access (Modeled after Placement/Result Box in Reference) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="text-blue-700 text-lg">🎓</span>
            <h3 className="text-base font-bold text-slate-800">
              System Role & Placement
            </h3>
          </div>

          <div className="space-y-4">
            {/* Box styled like Bahir Dar University in reference image */}
            <div className="p-4 rounded-xl border border-blue-200/80 bg-slate-50/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Assigned Role
              </span>
              <h4 className="text-base font-black text-blue-900 tracking-tight">
                {user?.role === "ADMIN" ? "SYSTEM ADMINISTRATOR" : "STAFF OPERATOR"}
              </h4>
              <p className="text-xs text-slate-500">
                {user?.role === "ADMIN"
                  ? "Full read and write privileges across products, stock adjustments, and users."
                  : "Standard operational permissions for purchases, sales, and catalog view."}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Access Identifier
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 break-all">
                {user?.id || "N/A"}
              </p>
              <p className="text-[11px] text-slate-400">
                Unique identifier for ledger auditing and transaction traceability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
