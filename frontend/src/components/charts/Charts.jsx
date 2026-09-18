import React, { useState } from "react";
import formatCurrency from "../../utils/formatCurrency";

/**
 * AreaTrendChart
 * Smooth interactive SVG Area & Line chart with dual series and hover tooltip.
 */
export const AreaTrendChart = ({
  data = [], // [{ label: "Jan", sales: 1200, purchases: 800, margin: 400 }]
  height = 240,
  showPurchases = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-slate-400 font-medium"
      >
        No transaction trend data available yet
      </div>
    );
  }

  const paddingX = 45;
  const paddingY = 30;
  const width = 600; // viewBox width

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.sales || 0, d.purchases || 0)),
    100
  );
  // Add 15% headroom
  const upperLimit = Math.ceil((maxVal * 1.15) / 100) * 100;

  const pointsCount = data.length;
  const stepX = (width - paddingX * 2) / Math.max(pointsCount - 1, 1);

  const getCoordinates = (val, index) => {
    const x = paddingX + index * stepX;
    const y =
      height - paddingY - (val / upperLimit) * (height - paddingY * 2);
    return { x, y };
  };

  // Build SVG paths
  const salesCoords = data.map((d, i) => getCoordinates(d.sales || 0, i));
  const purchasesCoords = data.map((d, i) =>
    getCoordinates(d.purchases || 0, i)
  );

  const buildSmoothPath = (coords) => {
    if (coords.length === 0) return "";
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = i > 0 ? coords[i - 1] : coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = i != coords.length - 2 ? coords[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const salesLine = buildSmoothPath(salesCoords);
  const purchasesLine = buildSmoothPath(purchasesCoords);

  const salesArea = `${salesLine} L ${salesCoords[salesCoords.length - 1].x} ${
    height - paddingY
  } L ${salesCoords[0].x} ${height - paddingY} Z`;

  const purchasesArea = `${purchasesLine} L ${
    purchasesCoords[purchasesCoords.length - 1].x
  } ${height - paddingY} L ${purchasesCoords[0].x} ${height - paddingY} Z`;

  // Grid levels (3 levels)
  const gridLevels = [0, upperLimit / 2, upperLimit];

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {gridLevels.map((lvl, idx) => {
          const y =
            height - paddingY - (lvl / upperLimit) * (height - paddingY * 2);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={idx === 0 ? "none" : "3 3"}
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                {formatCurrency(lvl).replace(".00", "")}
              </text>
            </g>
          );
        })}

        {/* Purchases Area & Line */}
        {showPurchases && (
          <>
            <path d={purchasesArea} fill="url(#purchasesGrad)" />
            <path
              d={purchasesLine}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          </>
        )}

        {/* Sales Area & Line */}
        <path d={salesArea} fill="url(#salesGrad)" />
        <path
          d={salesLine}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Points and Interaction Areas */}
        {data.map((d, i) => {
          const sc = salesCoords[i];
          const pc = purchasesCoords[i];
          const isHovered = hoveredIndex === i;

          return (
            <g key={i}>
              {/* Invisible touch/hover column */}
              <rect
                x={sc.x - stepX / 2}
                y={0}
                width={stepX}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Hover vertical indicator */}
              {isHovered && (
                <line
                  x1={sc.x}
                  y1={paddingY}
                  x2={sc.x}
                  y2={height - paddingY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Purchases point */}
              {showPurchases && (
                <circle
                  cx={pc.x}
                  cy={pc.y}
                  r={isHovered ? 4.5 : 3}
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2"
                  className="transition-all pointer-events-none"
                />
              )}

              {/* Sales point */}
              <circle
                cx={sc.x}
                cy={sc.y}
                r={isHovered ? 5.5 : 3.5}
                fill="#ffffff"
                stroke="#1d4ed8"
                strokeWidth="2.5"
                className="transition-all pointer-events-none"
              />

              {/* X Axis Label */}
              <text
                x={sc.x}
                y={height - 10}
                fill={isHovered ? "#0f172a" : "#64748b"}
                fontSize="10"
                fontWeight={isHovered ? "700" : "500"}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-700/60 -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${
              (salesCoords[hoveredIndex].x / width) * 100
            }%`,
            top: `${(salesCoords[hoveredIndex].y / height) * 100}%`,
          }}
        >
          <p className="font-bold text-slate-300 pb-1 border-b border-slate-700 mb-1">
            {data[hoveredIndex].label}
          </p>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-blue-400 font-semibold">Sales:</span>
              <span className="font-mono font-bold">
                {formatCurrency(data[hoveredIndex].sales || 0)}
              </span>
            </div>
            {showPurchases && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold">Purchases:</span>
                <span className="font-mono">
                  {formatCurrency(data[hoveredIndex].purchases || 0)}
                </span>
              </div>
            )}
            {data[hoveredIndex].margin !== undefined && (
              <div className="flex items-center justify-between gap-3 pt-0.5 text-[11px] text-emerald-400 font-semibold">
                <span>Net:</span>
                <span>{formatCurrency(data[hoveredIndex].margin)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * BarComparisonChart
 * Horizontal or Vertical bar chart with rounded bars and smooth hover states.
 */
export const BarComparisonChart = ({
  data = [], // [{ label: "Beverages", value: 14500, count: 42, color: "#1d4ed8" }]
  valueFormatter = formatCurrency,
  maxItems = 6,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const items = data.slice(0, maxItems);
  const maxValue = Math.max(...items.map((d) => d.value || 0), 1);

  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-slate-400">
        No category or product breakdown data available.
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      {items.map((item, idx) => {
        const percentage = Math.round((item.value / maxValue) * 100);
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            className="space-y-1.5 cursor-pointer p-1.5 rounded-lg transition-colors hover:bg-slate-50"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between text-xs gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || "#1d4ed8" }}
                />
                <span
                  className={`font-semibold truncate ${
                    isHovered ? "text-blue-700" : "text-slate-800"
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({item.count} items{item.units !== undefined ? ` · ${item.units} units` : ""})
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">
                {valueFormatter(item.value)}
              </span>
            </div>

            {/* Bar Track */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || "#1d4ed8",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * DonutBreakdown
 * Multi-segment ring chart with center label and legend.
 */
export const DonutBreakdown = ({
  data = [], // [{ label: "Completed", value: 34, color: "#1d4ed8" }]
  totalLabel = "Transactions",
}) => {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const size = 150;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-4 sm:gap-6 select-none min-w-0 w-full">
      {/* SVG Ring */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {total > 0 &&
            data.map((item, idx) => {
              const fraction = item.value / total;
              const strokeDasharray = `${
                fraction * circumference
              } ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += fraction * circumference;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color || "#1d4ed8"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 hover:opacity-90"
                />
              );
            })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-black text-slate-900 leading-none">
            {total}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 text-xs min-w-0 w-full max-w-[200px] shrink">
        {data.map((item, idx) => {
          const percent =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-md shrink-0"
                  style={{ backgroundColor: item.color || "#1d4ed8" }}
                />
                <span className="text-slate-600 font-medium truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono">
                <span className="font-bold text-slate-900">
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-400">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * StockHealthBar
 * Visual distribution of Healthy, Low Stock, and Out of Stock inventory.
 */
export const StockHealthBar = ({ healthy = 0, low = 0, outOfStock = 0 }) => {
  const total = healthy + low + outOfStock;
  const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;
  const outPct = total > 0 ? Math.round((outOfStock / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
        {healthyPct > 0 && (
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${healthyPct}%` }}
            title={`Healthy Stock: ${healthy}`}
          />
        )}
        {lowPct > 0 && (
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${lowPct}%` }}
            title={`Low Stock: ${low}`}
          />
        )}
        {outPct > 0 && (
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${outPct}%` }}
            title={`Out of Stock: ${outOfStock}`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Healthy
          </span>
          <span className="text-base font-black text-blue-950">{healthy}</span>
          <p className="text-[10px] text-blue-600 font-semibold">
            {healthyPct}%
          </p>
        </div>

        <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Low Stock
          </span>
          <span className="text-base font-black text-amber-950">{low}</span>
          <p className="text-[10px] text-amber-600 font-semibold">{lowPct}%</p>
        </div>

        <div className="p-2 bg-rose-50/60 rounded-xl border border-rose-100">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Out of Stock
          </span>
          <span className="text-base font-black text-rose-950">
            {outOfStock}
          </span>
          <p className="text-[10px] text-rose-600 font-semibold">{outPct}%</p>
        </div>
      </div>
    </div>
  );
};
