import React from "react";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records found",
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden p-8">
        <Spinner size="md" />
        <p className="text-xs text-center text-slate-400 mt-2 font-medium">
          Loading data...
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="No matching records were found."
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-slate-50/80" : "hover:bg-slate-50/40"
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3 px-4 text-sm text-slate-700 align-middle ${
                      col.className || ""
                    }`}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
