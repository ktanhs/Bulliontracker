import React, { useState } from 'react';
import { RetailerId } from '../types';

interface PremiumSparklineProps {
  productId: string;
  retailerId: RetailerId;
  currentPremium: number;
}

export function get7DayPremiumTrend(
  productId: string,
  retailerId: RetailerId,
  currentPremium: number
): { dayLabel: string; premium: number }[] {
  let hash = 0;
  const str = productId + retailerId;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
  const result: { dayLabel: string; premium: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayFromEnd = 6 - i;
    if (dayFromEnd === 0) {
      result.push({ dayLabel: days[i], premium: currentPremium });
    } else {
      const seed = Math.abs(hash + dayFromEnd * 37);
      const wave = Math.sin(seed * 0.1) * 0.35 + Math.cos(seed * 0.2) * 0.2;
      const val = Math.max(0.1, Math.round((currentPremium + wave) * 100) / 100);
      result.push({ dayLabel: days[i], premium: val });
    }
  }

  return result;
}

export const PremiumSparkline: React.FC<PremiumSparklineProps> = ({
  productId,
  retailerId,
  currentPremium,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; val: number } | null>(null);

  const data = get7DayPremiumTrend(productId, retailerId, currentPremium);
  const values = data.map((d) => d.premium);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const startVal = values[0];
  const endVal = values[values.length - 1];
  const diff = endVal - startVal;

  const isBetter = diff <= 0; // lower or equal premium is better for buyer
  const strokeColor = isBetter ? '#10b981' : '#f43f5e';
  const gradientId = `spark-grad-${productId}-${retailerId}`.replace(/[^a-zA-Z0-9-]/g, '_');

  const width = 120;
  const height = 26;
  const padding = 4;

  const range = maxVal - minVal || 0.5;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.premium - minVal) / range) * (height - padding * 2);
    return { x, y, label: d.dayLabel, val: d.premium };
  });

  const pointsString = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaString = `${points[0].x.toFixed(1)},${height} ${pointsString} ${points[points.length - 1].x.toFixed(1)},${height}`;

  return (
    <div className="relative group/spark w-full">
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
        <span className="font-semibold text-slate-400">7D Premium Trend:</span>
        <span className={`font-mono font-bold text-[10px] ${isBetter ? 'text-emerald-400' : 'text-rose-400'}`}>
          {diff > 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`}
        </span>
      </div>

      <div className="relative w-full h-7 bg-slate-950/80 rounded border border-slate-800/80 p-0.5 overflow-visible">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon points={areaString} fill={`url(#${gradientId})`} />

          {/* Sparkline path */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Hover points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? 2.5 : 1.5}
              fill={idx === points.length - 1 ? strokeColor : '#94a3b8'}
              className="transition-all hover:r-3 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute z-30 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded shadow-2xl font-mono whitespace-nowrap pointer-events-none -top-7 left-1/2 -translate-x-1/2">
            {hoveredPoint.label}: <strong className="text-amber-300">+{hoveredPoint.val.toFixed(2)}%</strong>
          </div>
        )}
      </div>
    </div>
  );
};
