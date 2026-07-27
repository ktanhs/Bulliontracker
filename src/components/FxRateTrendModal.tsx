import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Calculator,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from 'recharts';
import { generateFxTrendData } from '../data/bullionData';

interface FxRateTrendModalProps {
  usdToSgdRate: number;
  fxChange24hPct?: number;
  lastUpdated?: string;
  onClose: () => void;
}

export const FxRateTrendModal: React.FC<FxRateTrendModalProps> = ({
  usdToSgdRate,
  fxChange24hPct = -0.05,
  lastUpdated,
  onClose,
}) => {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '1M'>('24H');
  const [zoomStartIndex, setZoomStartIndex] = useState<number | null>(null);
  const [zoomEndIndex, setZoomEndIndex] = useState<number | null>(null);

  const [calcUsd, setCalcUsd] = useState<string>('1000');
  const [calcSgd, setCalcSgd] = useState<string>(
    (1000 * usdToSgdRate).toFixed(2)
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset zoom window when switching timeframes
  useEffect(() => {
    setZoomStartIndex(null);
    setZoomEndIndex(null);
  }, [timeframe]);

  const fxTrend = useMemo(() => {
    return generateFxTrendData(usdToSgdRate, timeframe, fxChange24hPct);
  }, [usdToSgdRate, timeframe, fxChange24hPct]);

  const isPositive = fxTrend.changePct >= 0;

  const rawData = fxTrend.data;
  const startIndex = zoomStartIndex !== null ? Math.max(0, zoomStartIndex) : 0;
  const endIndex =
    zoomEndIndex !== null ? Math.min(rawData.length - 1, zoomEndIndex) : rawData.length - 1;
  const isZoomed = startIndex > 0 || endIndex < rawData.length - 1;

  const handleZoomIn = () => {
    const span = endIndex - startIndex;
    if (span > 3) {
      const step = Math.max(1, Math.floor(span * 0.2));
      setZoomStartIndex(startIndex + step);
      setZoomEndIndex(endIndex - step);
    }
  };

  const handleZoomOut = () => {
    const span = endIndex - startIndex;
    const step = Math.max(1, Math.floor(span * 0.25));
    setZoomStartIndex(Math.max(0, startIndex - step));
    setZoomEndIndex(Math.min(rawData.length - 1, endIndex + step));
  };

  const handleResetZoom = () => {
    setZoomStartIndex(null);
    setZoomEndIndex(null);
  };

  const handleUsdChange = (val: string) => {
    setCalcUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCalcSgd((num * usdToSgdRate).toFixed(2));
    } else {
      setCalcSgd('');
    }
  };

  const handleSgdChange = (val: string) => {
    setCalcSgd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && usdToSgdRate > 0) {
      setCalcUsd((num / usdToSgdRate).toFixed(2));
    } else {
      setCalcUsd('');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl text-slate-950 shadow-md">
              <ArrowRightLeft className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">
                  USD / SGD Exchange Rate Trend
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE FX</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Interbank Forex Spot Rate & Monetary Authority Benchmark
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeframe Tabs & Stats Summary Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3">
          {/* Top Row: Timeframe Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTimeframe('24H')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  timeframe === '24H'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>24 Hours</span>
              </button>

              <button
                onClick={() => setTimeframe('7D')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  timeframe === '7D'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>7 Days</span>
              </button>

              <button
                onClick={() => setTimeframe('1M')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  timeframe === '1M'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>1 Month (30D)</span>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Period Open: <strong className="text-slate-200">{fxTrend.openRate.toFixed(4)} SGD</strong>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">Current Rate</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {usdToSgdRate.toFixed(4)} <span className="text-xs text-slate-400">SGD</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">{timeframe} Change</div>
              <div
                className={`text-base font-extrabold font-mono mt-0.5 flex items-center justify-center space-x-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? `+${fxTrend.changePct.toFixed(2)}%` : `${fxTrend.changePct.toFixed(2)}%`}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">{timeframe} High</div>
              <div className="text-base font-extrabold text-amber-300 font-mono mt-0.5">
                {fxTrend.highRate.toFixed(4)}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">{timeframe} Low</div>
              <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">
                {fxTrend.lowRate.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Graphical Trend Chart with Zoom Controls */}
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>
                {timeframe === '24H'
                  ? 'Intraday 24-Hour Exchange Trend'
                  : timeframe === '7D'
                  ? '7-Day Forex Rate Trajectory'
                  : '30-Day (1 Month) Historical FX Trend'}
              </span>
              {isZoomed && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Zoomed: {endIndex - startIndex + 1} of {rawData.length} points
                </span>
              )}
            </div>

            {/* Interactive Zoom Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Zoom:</span>
              <button
                onClick={handleZoomIn}
                disabled={endIndex - startIndex <= 3}
                className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleZoomOut}
                disabled={startIndex === 0 && endIndex === rawData.length - 1}
                className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {isZoomed && (
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-extrabold transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Reset Zoom View"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-[280px] w-full bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fxGradModal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? '#10b981' : '#f43f5e'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? '#10b981' : '#f43f5e'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  tickFormatter={(val) => val.toFixed(4)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`1 USD = ${Number(val).toFixed(4)} SGD`, 'Rate']}
                  labelFormatter={(lbl, items) => {
                    const point = items && items[0]?.payload;
                    return point?.fullDate ? `${lbl} (${point.fullDate})` : `Time: ${lbl}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fxGradModal)"
                />
                <Brush
                  dataKey="time"
                  height={22}
                  stroke="#10b981"
                  fill="#020617"
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onChange={(e: any) => {
                    if (e && typeof e.startIndex === 'number' && typeof e.endIndex === 'number') {
                      setZoomStartIndex(e.startIndex);
                      setZoomEndIndex(e.endIndex);
                    }
                  }}
                  tickFormatter={() => ''}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-500 text-center italic mt-1">
              💡 Tip: Drag the bottom green slider handles or click Zoom (+/-) to zoom into specific time windows
            </p>
          </div>
        </div>

        {/* Quick USD <-> SGD Currency Converter Widget */}
        <div className="mx-5 mb-5 p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 mb-3">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Instant USD ↔ SGD Currency Converter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Amount in USD ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={calcUsd}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Equivalent in SGD (S$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">S$</span>
                <input
                  type="number"
                  value={calcSgd}
                  onChange={(e) => handleSgdChange(e.target.value)}
                  placeholder="1348.00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Impact Note on Bullion Trading */}
        <div className="mx-5 mb-5 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start space-x-3 text-xs text-emerald-200/90">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Impact on Singapore Precious Metals:</span>
            <p className="text-[11px] leading-relaxed text-emerald-100/80">
              Gold and silver spot prices are natively quoted in USD per troy ounce globally. Dealers calculate Singapore Dollar (SGD) buy prices using this live interbank rate. Under Singapore IRAS Investment Precious Metals (IPM) regulations, qualifying bullion is exempt from 9% GST.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Updated live via Singapore Interbank FX Feed</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Close Chart
          </button>
        </div>
      </div>
    </div>
  );
};
