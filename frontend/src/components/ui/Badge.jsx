import React from "react";

export const Badge = ({ value, variant, size = "md", className = "" }) => {
  const normalized = String(value || "").toUpperCase().replace(/_/g, " ");

  const getVariantClasses = (val) => {
    if (variant) {
      return {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        danger: "bg-rose-50 text-rose-700 border-rose-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        info: "bg-sky-50 text-sky-700 border-sky-200",
        neutral: "bg-slate-100 text-slate-700 border-slate-200",
      }[variant];
    }

    switch (val) {
      case "ACTIVE":
      case "COMPLETED":
      case "INCREASE":
      case "HEALTHY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "INACTIVE":
      case "CANCELLED":
      case "DECREASE":
      case "OUT OF STOCK":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DRAFT":
      case "LOW STOCK":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "STAFF":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  }[size] || "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${getVariantClasses(
        normalized
      )} ${sizeClasses} ${className}`}
    >
      {normalized}
    </span>
  );
};

export default Badge;
