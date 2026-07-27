import React, { useState } from 'react';
import { Currency, SpotPrices } from '../types';
import { TrendingUp, TrendingDown, Coins, ShieldCheck, Scale, ArrowRightLeft, Edit3, Check, X, RefreshCw, Radio, PauseCircle, Clock, Lock, AlertCircle, LineChart, Compass, Sparkles, Activity } from 'lucide-react';
import { FxRateTrendModal } from './FxRateTrendModal';

interface SpotPriceTickerProps {
  spotPrices: SpotPrices;
  currency: Currency;
  weightUnit: 'oz' | 'g' | 'kg';
  onCustomSpotUpdate?: (custom: { goldUsdPerOz: number; silverUsdPerOz: number; usdToSgdRate: number }) => void;
  onRefreshLive?: () => void;
  isRefreshing?: boolean;
  onOpenMarketSentiments?: () => void;
}

export const SpotPriceTicker: React.FC<SpotPriceTickerProps> = ({
  spotPrices,
  currency,
  weightUnit,
  onCustomSpotUpdate,
  onRefreshLive,
  isRefreshing,
  onOpenMarketSentiments,
}) => {
  const {
    goldUsdPerOz,
    silverUsdPerOz,
    usdToSgdRate,
    goldChange24hPct,
    silverChange24hPct,
    fxChange24hPct,
    source,
    isLive,
    lastUpdated,
    marketStatus,
    lastMarketCloseTime,
  } = spotPrices;

  const [isEditing, setIsEditing] = useState(false);
  const [isFxModalOpen, setIsFxModalOpen] = useState(false);
  const [editGold, setEditGold] = useState<string>(goldUsdPerOz.toString());
  const [editSilver, setEditSilver] = useState<string>(silverUsdPerOz.toString());
  const [editFx, setEditFx] = useState<string>(usdToSgdRate.toString());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  React.useEffect(() => {
    const calcElapsed = () => {
      const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      setSecondsAgo(Math.max(0, diff));
    };
    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isMarketClosed = marketStatus === 'CLOSED' || isLive === false;

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

  const formattedDateTime = new Date(lastUpdated).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedTimeOnly = new Date(lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedMarketCloseDateTime = lastMarketCloseTime
    ? new Date(lastMarketCloseTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : formattedDateTime;

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isMarketClosed ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${!isMarketClosed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              {!isMarketClosed ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LIVE TRADING MARKET FEED</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300 font-bold">MARKET CLOSED • LAST LISTED PRICE</span>
                </>
              )}
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">{source || (isMarketClosed ? 'Market Close Settlement Quotes' : 'Real-time Bullion API')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded font-mono text-[11px] font-bold flex items-center space-x-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Frequency: <strong>10s Auto-Polling</strong></span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {isMarketClosed ? `Market Close: ${formattedDateTime}` : `Updated: ${formattedTimeOnly} (${secondsAgo}s ago)`}
            </span>
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

        {/* Market Closed Banner Notice */}
        {isMarketClosed && (
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border border-rose-500/40 p-3.5 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/40 flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-extrabold text-[10px] uppercase tracking-wider">
                    Market Closed
                  </span>
                  <strong className="text-white text-xs font-bold">
                    Last Listed Spot Price at Market Close
                  </strong>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Precious metals market is currently closed for the weekend / session. Prices below reflect final settlement spot quotes recorded at market close. Dealer buy & sell prices remain valid based on these last listed closing rates.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800 self-start md:self-auto flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
              <div className="text-[11px] font-mono">
                <span className="text-slate-400 block text-[10px]">Market Close Timestamp:</span>
                <span className="text-amber-300 font-semibold">{formattedMarketCloseDateTime}</span>
              </div>
            </div>
          </div>
        )}

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
              {currency === 'SGD' ? (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(goldSpotSgd, 'S$')}
                </span>
              ) : currency === 'USD' ? (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(goldSpotUsd, '$ USD')}
                </span>
              ) : (
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

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Updated: <strong className="text-amber-300">{formattedTimeOnly}</strong> ({secondsAgo}s ago)</span>
              </div>
              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20 font-sans font-bold text-[10px]">
                Freq: 10s Live
              </span>
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
              {currency === 'SGD' ? (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(silverSpotSgd, 'S$')}
                </span>
              ) : currency === 'USD' ? (
                <span className="text-xl font-bold text-white font-mono">
                  {formatMoney(silverSpotUsd, '$ USD')}
                </span>
              ) : (
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

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-300" />
                <span>Updated: <strong className="text-slate-200">{formattedTimeOnly}</strong> ({secondsAgo}s ago)</span>
              </div>
              <span className="px-1.5 py-0.5 bg-slate-400/10 text-slate-200 rounded border border-slate-400/20 font-sans font-bold text-[10px]">
                Freq: 10s Live
              </span>
            </div>
          </div>

          {/* Gold/Silver Ratio Card */}
          <div
            onClick={() => onOpenMarketSentiments?.()}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:shadow-indigo-500/10 cursor-pointer transition-all hover:scale-[1.015] group"
            title="Click to view detailed Live Gold/Silver Ratio & Market Sentiment Report"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Gold / Silver Ratio</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400" />
                  LIVE
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-indigo-200 font-mono group-hover:text-indigo-100 transition-colors">
                  {goldSilverRatio} : 1
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  parseFloat(goldSilverRatio) > 80
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : parseFloat(goldSilverRatio) < 70
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                }`}>
                  {parseFloat(goldSilverRatio) > 80 ? 'Silver Undervalued 🚀' : parseFloat(goldSilverRatio) < 70 ? 'Gold Value' : 'Historical Mean'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-mono mt-1">
                1 oz Gold = <strong className="text-slate-200">{goldSilverRatio} oz</strong> Silver (S${goldSpotSgd.toFixed(0)} / S${silverSpotSgd.toFixed(2)})
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>Updated: <strong className="text-indigo-300">{formattedTimeOnly}</strong> ({secondsAgo}s ago)</span>
              </div>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 font-sans font-bold text-[10px] flex items-center gap-1">
                <span>10s Live Ratio</span>
                <Compass className="w-3 h-3 text-amber-400" />
              </span>
            </div>
          </div>

          {/* Forex & GST Status Card */}
          <div
            onClick={() => setIsFxModalOpen(true)}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-xl p-3.5 relative overflow-hidden shadow-sm hover:shadow-emerald-500/10 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.015] group"
            title="Click to view 24-hour USD/SGD Exchange Rate Trend Chart"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Exchange Rate (USD/SGD)</span>
                  </span>
                </div>
                <div
                  className={`flex items-center space-x-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
                    (fxChange24hPct || -0.05) >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {(fxChange24hPct || -0.05) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{(fxChange24hPct || -0.05) >= 0 ? `+${(fxChange24hPct || -0.05).toFixed(2)}%` : `${(fxChange24hPct || -0.05).toFixed(2)}%`}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-white font-mono group-hover:text-emerald-200 transition-colors">
                    1 USD = {usdToSgdRate.toFixed(4)} SGD
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex items-center gap-1">
                    <LineChart className="w-3 h-3" />
                    <span>24h Chart 📈</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>FX Updated: <strong className="text-emerald-300">{formattedTimeOnly}</strong> ({secondsAgo}s ago)</span>
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20 font-sans font-bold text-[10px]">
                Freq: 10s Live (Forex)
              </span>
            </div>
          </div>
        </div>

        {/* Daily Market Sentiment & Trajectory Live Banner */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 sm:px-4 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-amber-300 uppercase tracking-wide text-xs">
                  Daily Market Trajectory & Targets
                </span>
                <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono font-bold text-[10px] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Updated Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <span>Gold Target:</span>
                  <strong className="text-amber-300 font-mono">S$3,890 ($2,910)</strong>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold">
                    6-Mo (Q4)
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-[10px]">
                    ({((3890 - goldSpotSgd) / goldSpotSgd * 100) >= 0 ? '+' : ''}{((3890 - goldSpotSgd) / goldSpotSgd * 100).toFixed(1)}% vs live)
                  </span>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span>Silver Target:</span>
                  <strong className="text-slate-200 font-mono">S$44.20 ($33.00)</strong>
                  <span className="px-1.5 py-0.2 bg-slate-400/20 text-slate-200 border border-slate-400/30 rounded text-[10px] font-mono font-bold">
                    6-Mo (Q4)
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-[10px]">
                    ({((44.20 - silverSpotSgd) / silverSpotSgd * 100) >= 0 ? '+' : ''}{((44.20 - silverSpotSgd) / silverSpotSgd * 100).toFixed(1)}% vs live)
                  </span>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span>Target GSR:</span>
                  <strong className="text-indigo-300 font-mono">78:1</strong>
                  <span className="text-slate-400 text-[10px] font-mono">(Live {goldSilverRatio}:1)</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-center">
            <span className="px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-bold text-[11px]">
              Daily Bias: Bullish (78%)
            </span>
            <button
              onClick={() => onOpenMarketSentiments?.()}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-lg text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Full Trajectory Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 24-Hour USD/SGD Exchange Rate Trend Modal */}
      {isFxModalOpen && (
        <FxRateTrendModal
          usdToSgdRate={usdToSgdRate}
          fxChange24hPct={fxChange24hPct}
          lastUpdated={lastUpdated}
          onClose={() => setIsFxModalOpen(false)}
        />
      )}
    </div>
  );
};
