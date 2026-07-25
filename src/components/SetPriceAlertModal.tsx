import React, { useState, useEffect } from 'react';
import { Product, ComputedProductMetrics, RetailerId, PriceAlert, Currency } from '../types';
import { RETAILERS } from '../data/bullionData';
import { X, BellRing, ArrowDown, ArrowUp, DollarSign, Percent, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface SetPriceAlertModalProps {
  productMetrics: ComputedProductMetrics | null;
  currency: Currency;
  onClose: () => void;
  onSaveAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggeredCount'>) => void;
}

export const SetPriceAlertModal: React.FC<SetPriceAlertModalProps> = ({
  productMetrics,
  currency,
  onClose,
  onSaveAlert,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!productMetrics) return null;

  const { product, retailerMetrics, bestBuyRetailerId } = productMetrics;
  const bestMetric = retailerMetrics[bestBuyRetailerId];

  const defaultPriceSgd = Math.floor(bestMetric.buyPriceSgd * 0.97); // 3% discount default
  const defaultPriceUsd = Math.floor(bestMetric.buyPriceUsd * 0.97);

  const [alertType, setAlertType] = useState<'BUY_PRICE' | 'PREMIUM_PCT'>('BUY_PRICE');
  const [selectedCurrency, setSelectedCurrency] = useState<'SGD' | 'USD'>(currency === 'USD' ? 'USD' : 'SGD');
  const [targetValue, setTargetValue] = useState<number>(selectedCurrency === 'USD' ? defaultPriceUsd : defaultPriceSgd);
  const [condition, setCondition] = useState<'BELOW' | 'ABOVE'>('BELOW');
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerId | 'ANY'>('ANY');
  const [note, setNote] = useState<string>('');

  const currentPrice = selectedCurrency === 'USD' ? bestMetric.buyPriceUsd : bestMetric.buyPriceSgd;
  const currentPremium = bestMetric.premiumPct;

  // Handle preset discounts (-2%, -5%, -10%, +5%)
  const applyPresetPrice = (percentageChange: number) => {
    if (alertType === 'BUY_PRICE') {
      const newTarget = currentPrice * (1 + percentageChange / 100);
      setTargetValue(Math.round(newTarget * 100) / 100);
      setCondition(percentageChange < 0 ? 'BELOW' : 'ABOVE');
    } else {
      const newTarget = Math.max(0, currentPremium + percentageChange);
      setTargetValue(Math.round(newTarget * 10) / 10);
      setCondition(percentageChange < 0 ? 'BELOW' : 'ABOVE');
    }
  };

  const handleCurrencySwitch = (c: 'SGD' | 'USD') => {
    setSelectedCurrency(c);
    if (alertType === 'BUY_PRICE') {
      const price = c === 'USD' ? bestMetric.buyPriceUsd : bestMetric.buyPriceSgd;
      setTargetValue(Math.floor(price * 0.97));
    }
  };

  const handleTypeSwitch = (type: 'BUY_PRICE' | 'PREMIUM_PCT') => {
    setAlertType(type);
    if (type === 'PREMIUM_PCT') {
      setTargetValue(Math.max(1.0, Math.floor(currentPremium - 1.5)));
    } else {
      setTargetValue(Math.floor(currentPrice * 0.97));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue || targetValue <= 0) return;

    onSaveAlert({
      productId: product.id,
      retailerId: selectedRetailer,
      targetValue,
      targetCurrency: selectedCurrency,
      alertType,
      condition,
      active: true,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-950/20 rounded-xl">
              <BellRing className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Create Target Price Alert</h2>
              <p className="text-xs font-semibold text-slate-900/80">
                Get visually notified when price reaches target
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selected Product Summary Card */}
          <div className="flex items-center space-x-3.5 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                {product.metal} • {product.weightOz} oz
              </div>
              <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Current Best Ask: <strong className="text-emerald-400">S${bestMetric.buyPriceSgd.toFixed(2)}</strong> / <strong className="text-emerald-400">${bestMetric.buyPriceUsd.toFixed(2)}</strong> (+{bestMetric.premiumPct}%)
              </div>
            </div>
          </div>

          {/* Alert Type Switcher: Buy Price vs Premium % */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Alert Trigger Basis
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleTypeSwitch('BUY_PRICE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  alertType === 'BUY_PRICE'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Target Buy Price</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch('PREMIUM_PCT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  alertType === 'PREMIUM_PCT'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>Premium % Over Spot</span>
              </button>
            </div>
          </div>

          {/* Trigger Condition: BELOW or ABOVE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'BELOW' | 'ABOVE')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="BELOW">Price drops to / below (≤)</option>
                <option value="ABOVE">Price rises to / above (≥)</option>
              </select>
            </div>

            {alertType === 'BUY_PRICE' ? (
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Currency
                </label>
                <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleCurrencySwitch('SGD')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedCurrency === 'SGD'
                        ? 'bg-slate-700 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SGD (S$)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencySwitch('USD')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedCurrency === 'USD'
                        ? 'bg-slate-700 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Target Premium
                </label>
                <div className="text-xs text-slate-400 font-mono py-2">
                  Current lowest: <strong className="text-amber-300">+{currentPremium}%</strong>
                </div>
              </div>
            )}
          </div>

          {/* Target Value Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {alertType === 'BUY_PRICE'
                  ? `Target Price (${selectedCurrency === 'USD' ? '$ USD' : 'S$ SGD'})`
                  : 'Target Premium Percentage (%)'}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Current: {alertType === 'BUY_PRICE' ? `${selectedCurrency === 'USD' ? '$' : 'S$'}${currentPrice.toFixed(2)}` : `+${currentPremium}%`}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step={alertType === 'BUY_PRICE' ? '0.01' : '0.1'}
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 pr-12"
                placeholder="Enter target value..."
                required
              />
              <div className="absolute right-3 top-3 text-slate-400 text-xs font-mono font-bold">
                {alertType === 'BUY_PRICE' ? selectedCurrency : '%'}
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Target Presets
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPresetPrice(-2)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors"
              >
                -2% Dip
              </button>
              <button
                type="button"
                onClick={() => applyPresetPrice(-5)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors"
              >
                -5% Dip
              </button>
              <button
                type="button"
                onClick={() => applyPresetPrice(-10)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors"
              >
                -10% Dip
              </button>
              <button
                type="button"
                onClick={() => applyPresetPrice(5)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors"
              >
                +5% Rise
              </button>
            </div>
          </div>

          {/* Preferred Retailer Option */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Monitor Specific Retailer
            </label>
            <select
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value as RetailerId | 'ANY')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ANY">Any Retailer (Best / Lowest Market Price)</option>
              <option value="silverbullion">Silver Bullion (Singapore)</option>
              <option value="bullionstar">BullionStar (Singapore)</option>
              <option value="lpm">LPM Group (Hong Kong)</option>
            </select>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Personal Memo / Order Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Buy 5 coins if price drops below S$3,800..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <BellRing className="w-4 h-4 fill-slate-950" />
              <span>Save & Activate Price Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
