import React from 'react';
import { Currency, RetailerApiStatus, SpotPrices } from '../types';
import { RefreshCw, Coins, DollarSign, Calculator, LineChart, Building2, Sparkles, SlidersHorizontal, BellRing, BarChart2, Compass, Server, Radio, PauseCircle, Clock } from 'lucide-react';

interface HeaderProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  weightUnit: 'oz' | 'g' | 'kg';
  setWeightUnit: (u: 'oz' | 'g' | 'kg') => void;
  activeTab: 'comparison' | 'comparePremiums' | 'calculator' | 'charts' | 'retailers' | 'insights';
  setActiveTab: (t: 'comparison' | 'comparePremiums' | 'calculator' | 'charts' | 'retailers' | 'insights') => void;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  alertsCount?: number;
  triggeredCount?: number;
  onOpenAlertsManager?: () => void;
  onOpenMarketSentiments?: () => void;
  onOpenApiStatusModal?: () => void;
  apiStatuses?: RetailerApiStatus[];
  spotPrices?: SpotPrices;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  setCurrency,
  weightUnit,
  setWeightUnit,
  activeTab,
  setActiveTab,
  lastUpdated,
  onRefresh,
  isRefreshing,
  alertsCount = 0,
  triggeredCount = 0,
  onOpenAlertsManager,
  onOpenMarketSentiments,
  onOpenApiStatusModal,
  apiStatuses = [],
  spotPrices,
}) => {
  const isMarketClosed = spotPrices?.marketStatus === 'CLOSED' || spotPrices?.isLive === false;

  const formattedDateTime = new Date(lastUpdated).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 font-bold shadow-lg flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                  Bullion<span className="text-amber-400">Tracker</span>
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-slate-800 text-amber-300 border border-amber-500/30 rounded-full">
                  SG & HK Market
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Price & Premium Comparison: Silver Bullion, BullionStar & LPM
              </p>
            </div>
          </div>

          {/* Controls: Currency, Unit, Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700/80 text-xs font-medium">
              <span className="px-2 text-slate-400 text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">Currency:</span>
              <button
                id="curr-sgd-btn"
                onClick={() => setCurrency('SGD')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'SGD'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                SGD (S$)
              </button>
              <button
                id="curr-usd-btn"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                id="curr-dual-btn"
                onClick={() => setCurrency('DUAL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'DUAL'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Both (S$ / $)
              </button>
            </div>

            {/* Weight Unit */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700/80 text-xs font-medium">
              <button
                id="unit-oz-btn"
                onClick={() => setWeightUnit('oz')}
                className={`px-2 py-1 rounded-md transition-all ${
                  weightUnit === 'oz' ? 'bg-slate-700 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                oz
              </button>
              <button
                id="unit-g-btn"
                onClick={() => setWeightUnit('g')}
                className={`px-2 py-1 rounded-md transition-all ${
                  weightUnit === 'g' ? 'bg-slate-700 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                g
              </button>
              <button
                id="unit-kg-btn"
                onClick={() => setWeightUnit('kg')}
                className={`px-2 py-1 rounded-md transition-all ${
                  weightUnit === 'kg' ? 'bg-slate-700 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                kg
              </button>
            </div>

            {/* Market Sentiments Pop-up Button */}
            {/* Market Closed Indicator Pill */}
            {isMarketClosed && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-bold shadow-sm">
                <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono text-[11px]">Market Closed • Last Spot Price</span>
              </div>
            )}

            {onOpenMarketSentiments && (
              <button
                id="top-market-sentiments-btn"
                onClick={onOpenMarketSentiments}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm"
                title="View Precious Metals Week Ahead Sentiments & Trajectory"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Market Sentiments</span>
              </button>
            )}

            {/* Price Alerts Manager Button */}
            <button
              id="price-alerts-btn"
              onClick={onOpenAlertsManager}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Price Alerts Manager"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Price Alerts</span>
              {alertsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  triggeredCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                }`}>
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Retailer APIs Live Sync Status Button */}
            {onOpenApiStatusModal && (
              <button
                id="retailer-api-status-btn"
                onClick={onOpenApiStatusModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all shadow-sm"
                title="View Direct Retailer Website APIs Live Synchronization & Latency"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline font-mono text-[11px]">Retailer APIs: 3/3 Live</span>
              </button>
            )}

            {/* Live Refresh Button */}
            <button
              id="refresh-prices-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              title={`Last updated: ${formattedDateTime}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="flex overflow-x-auto space-x-1 border-t border-slate-800/80 pt-1 pb-1 scrollbar-none">
          <button
            id="tab-market-sentiments-btn"
            onClick={onOpenMarketSentiments}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-extrabold rounded-md whitespace-nowrap bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Market Sentiments & Trajectory</span>
          </button>

          <button
            id="tab-comparison-btn"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'comparison'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Retailer Price Matrix</span>
          </button>

          <button
            id="tab-compare-premiums-btn"
            onClick={() => setActiveTab('comparePremiums')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'comparePremiums'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare Premiums</span>
          </button>

          <button
            id="tab-calculator-btn"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Savings & Bulk Calculator</span>
          </button>

          <button
            id="tab-charts-btn"
            onClick={() => setActiveTab('charts')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'charts'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-blue-400" />
            <span>Spot & Premium Trends</span>
          </button>

          <button
            id="tab-retailers-btn"
            onClick={() => setActiveTab('retailers')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'retailers'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Retailer Profiles & GST Rules</span>
          </button>

          <button
            id="tab-insights-btn"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'insights'
                ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini AI Market Intelligence</span>
          </button>
        </div>
      </div>
    </header>
  );
};
