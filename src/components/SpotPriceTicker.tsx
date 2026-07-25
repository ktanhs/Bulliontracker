import React, { useState } from 'react';
import { Currency, SpotPrices } from '../types';
import { TrendingUp, TrendingDown, Coins, ShieldCheck, Scale, ArrowRightLeft, Edit3, Check, X, RefreshCw, Radio } from 'lucide-react';

interface SpotPriceTickerProps {
  spotPrices: SpotPrices;
  currency: Currency;
  weightUnit: 'oz' | 'g' | 'kg';
  onCustomSpotUpdate?: (custom: { goldUsdPerOz: number; silverUsdPerOz: number; usdToSgdRate: number }) => void;
  onRefreshLive?: () => void;
  isRefreshing?: boolean;
}

export const SpotPriceTicker: React.FC<SpotPriceTickerProps> = ({
  spotPrices,
  currency,
  weightUnit,
  onCustomSpotUpdate,
  onRefreshLive,
  isRefreshing,
}) => {
  const {
    goldUsdPerOz,
    silverUsdPerOz,
    usdToSgdRate,
    goldChange24hPct,
    silverChange24hPct,
    source,
    isLive,
    lastUpdated,
  } = spotPrices;

  const [isEditing, setIsEditing] = useState(false);
  const [editGold, setEditGold] = useState<string>(goldUsdPerOz.toString());
  const [editSilver, setEditSilver] = useState<string>(silverUsdPerOz.toString());
  const [editFx, setEditFx] = useState<string>(usdToSgdRate.toString());

  // Weight multipliers relative to troy oz
  const unitMultiplier =
    weightUnit === 'oz' ? 1 : weightUnit === 'g' ? 1 / 31.1034768 : 1 / 0.0311034768;

  const unitLabel = weightUnit === 'oz' ? '/ oz' : weightUnit === 'g' ? '/ g' : '/ kg';

  // Spot prices in USD & SGD according to weight unit
  const goldSpotUsd = goldUsdPerOz * unitMultiplier;
  const goldSpotSgd = goldSpotUsd * usdToSgdRate;

  const silverSpotUsd = silverUsdPerOz * unitMultiplier;
  const silverSpotSgd = silverSpotUsd * usdToSgdRate;

  const goldSilverRatio = (goldUsdPerOz / silverUsdPerOz).toFixed(1);

  const formatMoney = (val: number, currSymbol: string) => {
    return `${currSymbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(editGold);
    const s = parseFloat(editSilver);
    const fx = parseFloat(editFx);

    if (!isNaN(g) && !isNaN(s) && !isNaN(fx) && g > 0 && s > 0 && fx > 0) {
      onCustomSpotUpdate?.({
        goldUsdPerOz: g,
        silverUsdPerOz: s,
        usdToSgdRate: fx,
      });
      setIsEditing(false);
    }
  };

  const formattedTime = new Date(lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive !== false ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive !== false ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              {isLive !== false ? 'LIVE MARKET FEED' : 'CUSTOM OVERRIDE SPOT'}
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">{source || 'Real-time Bullion API'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-mono text-[11px]">Updated {formattedTime}</span>
            <button
              id="edit-custom-spot-btn"
              onClick={() => {
                setEditGold(goldUsdPerOz.toString());
                setEditSilver(silverUsdPerOz.toString());
                setEditFx(usdToSgdRate.toString());
                setIsEditing(!isEditing);
              }}
              className="flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Close Editor' : 'Custom Spot Price'}</span>
            </button>
          </div>
        </div>

        {/* Custom Edit Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveCustom} className="bg-slate-800/90 border border-amber-500/40 rounded-xl p-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Override Live Spot Benchmark</h3>
              </div>
              <p className="text-xs text-slate-400">Recalculate all 15+ product retailer premiums immediately</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-300 uppercase mb-1">
                  Gold Spot (USD / oz)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editGold}
                    onChange={(e) => setEditGold(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="2785.40"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Silver Spot (USD / oz)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editSilver}
                    onChange={(e) => setEditSilver(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="31.85"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-300 uppercase mb-1">
                  USD / SGD Forex Rate
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">1 USD =</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={editFx}
                    onChange={(e) => setEditFx(e.target.value)}
                    className="w-full pl-16 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                    placeholder="1.3480"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              {onRefreshLive && (
                <button
                  type="button"
                  onClick={() => {
                    onRefreshLive();
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Fetch Live Market API</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Benchmark</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gold Spot Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-amber-500/30 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
            <div className="absolute -right-3 -bottom-3 text-amber-500/10 pointer-events-none">
              <Coins className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Gold Spot ({weightUnit})
                </span>
              </div>
              <div
                className={`flex items-center space-x-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
                  goldChange24hPct >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {goldChange24hPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{goldChange24hPct >= 0 ? `+${goldChange24hPct}%` : `${goldChange24hPct}%`}</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-2 mt-1">
              {currency === 'SGD' && (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(goldSpotSgd, 'S$')}
                </span>
              )}
              {currency === 'USD' && (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(goldSpotUsd, '$')}
                </span>
              )}
              {currency === 'DUAL' && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white font-mono">
                    {formatMoney(goldSpotSgd, 'S$')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatMoney(goldSpotUsd, '$ USD')}
                  </span>
                </div>
              )}
              <span className="text-xs text-slate-400">{unitLabel}</span>
            </div>
          </div>

          {/* Silver Spot Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-400/30 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
            <div className="absolute -right-3 -bottom-3 text-slate-400/10 pointer-events-none">
              <Coins className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Silver Spot ({weightUnit})
                </span>
              </div>
              <div
                className={`flex items-center space-x-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
                  silverChange24hPct >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {silverChange24hPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{silverChange24hPct >= 0 ? `+${silverChange24hPct}%` : `${silverChange24hPct}%`}</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-2 mt-1">
              {currency === 'SGD' && (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(silverSpotSgd, 'S$')}
                </span>
              )}
              {currency === 'USD' && (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(silverSpotUsd, '$')}
                </span>
              )}
              {currency === 'DUAL' && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white font-mono">
                    {formatMoney(silverSpotSgd, 'S$')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatMoney(silverSpotUsd, '$ USD')}
                  </span>
                </div>
              )}
              <span className="text-xs text-slate-400">{unitLabel}</span>
            </div>
          </div>

          {/* Gold/Silver Ratio Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gold / Silver Ratio</span>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded">
                Au/Ag
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-indigo-300 font-mono">
                {goldSilverRatio}:1
              </span>
              <span className="text-[11px] text-slate-400">
                {parseFloat(goldSilverRatio) > 80 ? 'Silver undervalued' : 'Balanced'}
              </span>
            </div>
          </div>

          {/* Forex & GST Status Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exchange Rate (USD/SGD)</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                <span>0% GST IPM</span>
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-white font-mono">
                1 USD = {usdToSgdRate.toFixed(4)} SGD
              </span>
              <span className="text-[11px] text-slate-400">Singapore IPM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
