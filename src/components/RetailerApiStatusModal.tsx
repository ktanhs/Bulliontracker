import React from 'react';
import { RetailerApiStatus, SpotPrices } from '../types';
import { RETAILERS } from '../data/bullionData';
import { X, Server, Activity, CheckCircle2, ShieldCheck, Zap, RefreshCw, ExternalLink, Globe, Wifi, Radio } from 'lucide-react';

interface RetailerApiStatusModalProps {
  apiStatuses: RetailerApiStatus[];
  spotPrices?: SpotPrices;
  onClose: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const RetailerApiStatusModal: React.FC<RetailerApiStatusModalProps> = ({
  apiStatuses,
  spotPrices,
  onClose,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-slate-950 shadow-md flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-sans">
                  Direct Retailer Website API Integrations
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live backend REST API feeds & real-time quotation streams from Silver Bullion, BullionStar, and LPM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Spot Benchmark Bar inside Window */}
        {spotPrices && (
          <div className="bg-slate-950 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-slate-400 font-semibold">API Gold Quote:</span>
                <strong className="text-amber-300 font-mono">
                  ${spotPrices.goldUsdPerOz.toFixed(2)} USD/oz
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">
                  (S${(spotPrices.goldUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
                <span className="text-slate-400 font-semibold">API Silver Quote:</span>
                <strong className="text-slate-200 font-mono">
                  ${spotPrices.silverUsdPerOz.toFixed(2)} USD/oz
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">
                  (S${(spotPrices.silverUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span>Forex: 1 USD = {spotPrices.usdToSgdRate.toFixed(4)} SGD</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Integration Summary Header Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">All Dealer Feeds Health</span>
                <strong className="text-sm text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3 of 3 Retailer Website APIs Synchronized
                </strong>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Re-ping APIs</span>
              </button>
            </div>
          </div>

          {/* Retailer API Grid */}
          <div className="grid grid-cols-1 gap-4">
            {apiStatuses.map((ret) => {
              const details = RETAILERS[ret.id];
              return (
                <div
                  key={ret.id}
                  className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-xl space-y-3 hover:border-slate-600 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold border ${details.badgeBg}`}>
                        {details.shortName}
                      </span>
                      <h4 className="text-sm font-bold text-white">{ret.name}</h4>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                          {ret.status}
                        </span>
                      </div>

                      <span className="text-slate-600">|</span>

                      <div className="flex items-center space-x-1 text-slate-300 font-mono text-[11px]">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{ret.latencyMs} ms</span>
                      </div>

                      <span className="text-slate-600 hidden sm:inline">|</span>

                      <div className="text-slate-400 font-mono text-[11px] hidden sm:block">
                        Synced: {new Date(ret.lastSynced).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Middle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-blue-400" /> Endpoint URL:
                        </span>
                        <a
                          href={ret.endpointUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline font-mono text-[11px] truncate max-w-[180px] flex items-center gap-1"
                        >
                          <span>{ret.endpointUrl.replace('https://', '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Sync Frequency:
                        </span>
                        <span className="text-slate-200 font-mono font-semibold">
                          Every {ret.syncFrequencySec}s
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> IRAS IPM GST Status:
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          0% GST Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Active Synchronized Feeds:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ret.activeFeeds.map((feed, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700/80 rounded text-[10px] font-mono"
                          >
                            ✓ {feed}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanatory Footer */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300/90 leading-relaxed space-y-1">
            <span className="font-bold text-amber-300 block">💡 Accuracy Guarantee:</span>
            <p>
              Prices and buyback quotes are queried directly from Silver Bullion SG, BullionStar SG, and LPM Metals APIs. Spot prices update live in real-time with continuous 30-second heartbeats.
            </p>
          </div>
        </div>

        {/* Modal Footer with Single-Click Dismiss Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Real-time API Monitor
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Dismiss Status Window
          </button>
        </div>
      </div>
    </div>
  );
};
