import React, { forwardRef } from "react";

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      rows = 3,
      className = "",
      containerClassName = "",
      id,
      name,
      ...props
    },
    ref
  ) => {
    const textareaId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed resize-y ${
            error
              ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500"
              : "border-slate-300 bg-white hover:border-slate-400"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
