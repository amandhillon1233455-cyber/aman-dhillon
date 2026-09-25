import React, { useState } from 'react';
import { TimeSeriesPoint, PrinterUtilStats } from '../types/index.ts';

// 1. Time Series Area & Bar Chart for Printing Activity & Pages
interface PrintingActivityChartProps {
  data: TimeSeriesPoint[];
  metric: 'jobs' | 'pages';
}

export const PrintingActivityChart: React.FC<PrintingActivityChartProps> = ({ data, metric }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No printing telemetry data recorded for this time range.
      </div>
    );
  }

  const values = data.map(d => (metric === 'jobs' ? d.completed + d.failed : d.pages));
  const maxVal = Math.max(...values, 10);
  const chartHeight = 180;
  const chartWidth = 560;
  const paddingX = 30;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const val = metric === 'jobs' ? d.completed + d.failed : d.pages;
    const x = paddingX + (i / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, val, item: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-52 overflow-visible"
        >
          <defs>
            <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          <path
            d={areaD}
            fill={metric === 'jobs' ? 'url(#indigoGrad)' : 'url(#cyanGrad)'}
          />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={metric === 'jobs' ? '#818cf8' : '#22d3ee'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? '5' : '3.5'}
                fill={metric === 'jobs' ? '#6366f1' : '#06b6d4'}
                stroke="#0f172a"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={p.x}
                y={chartHeight - 4}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
              >
                {p.item.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute -top-3 z-20 pointer-events-none transform -translate-x-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 text-xs"
            style={{ left: `${(points[hoveredIdx].x / chartWidth) * 100}%` }}
          >
            <div className="font-semibold text-slate-200">{points[hoveredIdx].item.date}</div>
            <div className="font-mono text-cyan-300">
              {metric === 'jobs' ? (
                <>
                  <span className="text-emerald-400 font-bold">{points[hoveredIdx].item.completed} completed</span>
                  {points[hoveredIdx].item.failed > 0 && (
                    <span className="text-rose-400 ml-2">({points[hoveredIdx].item.failed} failed)</span>
                  )}
                </>
              ) : (
                <span>{points[hoveredIdx].item.pages.toLocaleString()} pages printed</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Jobs Completed vs Failed Donut / Ratio Bar
interface JobsRatioChartProps {
  completed: number;
  failed: number;
  cancelled: number;
  active: number;
}

export const JobsRatioChart: React.FC<JobsRatioChartProps> = ({
  completed,
  failed,
  cancelled,
  active,
}) => {
  const total = completed + failed + cancelled + active || 1;
  const compPct = Math.round((completed / total) * 100);
  const failPct = Math.round((failed / total) * 100);
  const activePct = Math.round((active / total) * 100);
  const cancPct = 100 - compPct - failPct - activePct;

  return (
    <div className="space-y-4">
      {/* Visual Multi-segment Progress Bar */}
      <div className="h-5 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
        <div
          style={{ width: `${Math.max(2, compPct)}%` }}
          className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
          title={`Completed: ${completed} (${compPct}%)`}
        />
        {active > 0 && (
          <div
            style={{ width: `${Math.max(2, activePct)}%` }}
            className="h-full bg-indigo-500 transition-all duration-500"
            title={`In Progress / Queued: ${active} (${activePct}%)`}
          />
        )}
        {failed > 0 && (
          <div
            style={{ width: `${Math.max(2, failPct)}%` }}
            className="h-full bg-rose-500 transition-all duration-500"
            title={`Failed: ${failed} (${failPct}%)`}
          />
        )}
        {cancelled > 0 && (
          <div
            style={{ width: `${Math.max(2, cancPct)}%` }}
            className="h-full bg-slate-600 rounded-r-full transition-all duration-500"
            title={`Cancelled: ${cancelled}`}
          />
        )}
      </div>

      {/* Legend & Exact Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-400">Completed:</span>
          <span className="font-mono font-bold text-white ml-auto">{completed} ({compPct}%)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="text-slate-400">Active Queue:</span>
          <span className="font-mono font-bold text-white ml-auto">{active} ({activePct}%)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="text-slate-400">Failed:</span>
          <span className="font-mono font-bold text-rose-400 ml-auto">{failed} ({failPct}%)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
          <span className="text-slate-400">Cancelled:</span>
          <span className="font-mono font-bold text-slate-300 ml-auto">{cancelled}</span>
        </div>
      </div>
    </div>
  );
};

// 3. Printer Utilization Chart
interface PrinterUtilizationProps {
  printers: PrinterUtilStats[];
}

export const PrinterUtilizationChart: React.FC<PrinterUtilizationProps> = ({ printers }) => {
  if (!printers || printers.length === 0) {
    return <div className="text-xs text-slate-500 py-4">No printer utilization telemetry.</div>;
  }

  const maxPages = Math.max(...printers.map(p => p.pagesPrinted), 1000);

  return (
    <div className="space-y-3.5">
      {printers.slice(0, 5).map(printer => {
        const pct = Math.round((printer.pagesPrinted / maxPages) * 100);

        const statusColor = {
          Online: 'bg-emerald-400',
          Printing: 'bg-indigo-400 animate-pulse',
          Error: 'bg-rose-400',
          Offline: 'bg-slate-500',
          Maintenance: 'bg-amber-400',
        }[printer.status];

        return (
          <div key={printer.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate max-w-[240px]">
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
                <span className="font-semibold text-slate-200 truncate">{printer.name}</span>
              </div>
              <div className="font-mono text-slate-400 text-[11px] shrink-0">
                {printer.pagesPrinted.toLocaleString()} pgs ({printer.jobCount} jobs)
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.max(3, pct)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  printer.status === 'Error'
                    ? 'bg-rose-500'
                    : printer.status === 'Maintenance'
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
