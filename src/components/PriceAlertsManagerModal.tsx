import React, { useState, useEffect } from 'react';
import { PriceAlert, ComputedProductMetrics, Currency, TriggeredAlertNotification, SpotPrices } from '../types';
import { RETAILERS } from '../data/bullionData';
import {
  X,
  BellRing,
  Trash2,
  Power,
  PlusCircle,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  Percent,
  Sparkles,
  ArrowDown,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface PriceAlertsManagerModalProps {
  alerts: PriceAlert[];
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  spotPrices?: SpotPrices;
  onClose: () => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onOpenCreateAlert: () => void;
  onSimulatePriceDip: () => void;
  triggeredHistory: TriggeredAlertNotification[];
  onSelectProductById: (productId: string) => void;
}

export const PriceAlertsManagerModal: React.FC<PriceAlertsManagerModalProps> = ({
  alerts,
  computedProducts,
  currency,
  spotPrices,
  onClose,
  onToggleAlert,
  onDeleteAlert,
  onOpenCreateAlert,
  onSimulatePriceDip,
  triggeredHistory,
  onSelectProductById,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Map products by ID for fast lookup
  const productMap = new Map<string, ComputedProductMetrics>();
  computedProducts.forEach((p) => productMap.set(p.product.id, p));

  const activeAlerts = alerts.filter((a) => a.active);
  const inactiveAlerts = alerts.filter((a) => !a.active);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 shadow-md">
              <BellRing className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">Live Price Alerts Center</h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {alerts.length} Total Saved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated threshold monitoring for Singapore & Hong Kong bullion dealers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
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
                <span className="text-slate-400 font-semibold">Gold Spot:</span>
                <strong className="text-amber-300 font-mono">
                  ${spotPrices.goldUsdPerOz.toFixed(2)} USD/oz
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">
                  (S${(spotPrices.goldUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
                <span className="text-slate-400 font-semibold">Silver Spot:</span>
                <strong className="text-slate-200 font-mono">
                  ${spotPrices.silverUsdPerOz.toFixed(2)} USD/oz
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">
                  (S${(spotPrices.silverUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>1 USD = {spotPrices.usdToSgdRate.toFixed(4)} SGD</span>
            </div>
          </div>
        )}

        {/* Action Controls & Navigation Tabs */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Configured Alerts ({alerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Trigger Logs ({triggeredHistory.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Test / Trigger Simulation Button */}
            <button
              onClick={onSimulatePriceDip}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
              title="Temporarily drop spot price by 3% to test alert triggers live"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span>Simulate Spot Dip (-3%)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCreateAlert();
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Set New Alert</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {activeTab === 'ACTIVE' && (
            <>
              {alerts.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <BellRing className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">No Price Alerts Configured Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Set a target price or premium threshold on any bullion coin or bar to receive instant visual notifications when dealers lower their prices.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateAlert();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all inline-flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Your First Price Alert</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const item = productMap.get(alert.productId);
                    const product = item?.product;
                    const bestBuyRid = item?.bestBuyRetailerId || 'silverbullion';
                    const metric = item?.retailerMetrics[bestBuyRid];

                    const currentVal =
                      alert.alertType === 'BUY_PRICE'
                        ? alert.targetCurrency === 'USD'
                          ? metric?.buyPriceUsd
                          : metric?.buyPriceSgd
                        : metric?.premiumPct;

                    const formattedTarget =
                      alert.alertType === 'BUY_PRICE'
                        ? `${alert.targetCurrency === 'USD' ? '$' : 'S$'}${alert.targetValue.toFixed(2)}`
                        : `+${alert.targetValue}%`;

                    const formattedCurrent =
                      currentVal !== undefined
                        ? alert.alertType === 'BUY_PRICE'
                          ? `${alert.targetCurrency === 'USD' ? '$' : 'S$'}${currentVal.toFixed(2)}`
                          : `+${currentVal.toFixed(1)}%`
                        : 'N/A';

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          alert.active
                            ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50'
                            : 'bg-slate-950/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {product ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400">
                              <BellRing className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-white truncate">
                                {product ? product.name : alert.productId}
                              </h4>
                              {alert.retailerId && alert.retailerId !== 'ANY' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase">
                                  {RETAILERS[alert.retailerId].shortName}
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-mono mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-amber-300 font-bold">
                                Target: {formattedTarget} ({alert.condition === 'BELOW' ? '≤' : '≥'})
                              </span>
                              <span className="text-slate-400">
                                Current: <strong className="text-emerald-400">{formattedCurrent}</strong>
                              </span>
                            </div>

                            {alert.createdAt && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Created: {new Date(alert.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                            {alert.note && (
                              <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                                Note: {alert.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                          <button
                            onClick={() => onToggleAlert(alert.id)}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors ${
                              alert.active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                            title={alert.active ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                          >
                            <Power className="w-4 h-4" />
                            <span className="text-[11px]">{alert.active ? 'Active' : 'Paused'}</span>
                          </button>

                          <button
                            onClick={() => onDeleteAlert(alert.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-slate-400 rounded-xl transition-colors"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'HISTORY' && (
            <div>
              {triggeredHistory.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No price alerts have triggered yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click "Simulate Spot Dip (-3%)" above to trigger a test notification!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {triggeredHistory.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{notif.productName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Hit <strong className="text-emerald-300">S${notif.currentValue.toFixed(2)}</strong> (Target: S${notif.targetValue.toFixed(2)})
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(notif.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectProductById(notif.alert.productId);
                          }}
                          className="text-[11px] text-amber-400 hover:underline font-bold"
                        >
                          View Product ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Alerts stay active in local browser storage across sessions.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
