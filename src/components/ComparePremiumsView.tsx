import React, { useState, useMemo } from 'react';
import { ComputedProductMetrics, Currency, RetailerId, Product } from '../types';
import { RETAILERS } from '../data/bullionData';
import { getRetailerListingUrl } from '../utils/urlUtils';
import {
  BarChart2,
  Trophy,
  Coins,
  Box,
  Scale,
  PlusCircle,
  BellRing,
  ExternalLink,
  ShieldCheck,
  Building2,
  Percent,
  DollarSign,
  ArrowDownRight,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  X,
  TrendingDown,
  Info,
  ShoppingCart,
} from 'lucide-react';

interface ComparePremiumsViewProps {
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  onAddToCart?: (productId: string, retailerId: RetailerId) => void;
  onSetPriceAlert?: (product: ComputedProductMetrics) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
  initialProductId?: string;
}

export const ComparePremiumsView: React.FC<ComparePremiumsViewProps> = ({
  computedProducts,
  currency,
  onAddToCart,
  onSetPriceAlert,
  onCloseModal,
  isModal = false,
  initialProductId,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || computedProducts[0]?.product.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Gold' | 'Silver' | 'Coin' | 'Bar'>('ALL');
  const [chartMetric, setChartMetric] = useState<'buyPremium' | 'bulkPremium' | 'spread'>('buyPremium');

  // Filter available products for selector
  const filteredProductOptions = useMemo(() => {
    return computedProducts.filter((item) => {
      const p = item.product;
      if (categoryFilter === 'Gold' && p.metal !== 'Gold') return false;
      if (categoryFilter === 'Silver' && p.metal !== 'Silver') return false;
      if (categoryFilter === 'Coin' && p.formFactor !== 'Coin') return false;
      if (categoryFilter === 'Bar' && p.formFactor !== 'Bar') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.mint.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [computedProducts, categoryFilter, searchQuery]);

  // Selected product metrics
  const selectedMetrics = useMemo(() => {
    return (
      computedProducts.find((item) => item.product.id === selectedProductId) ||
      computedProducts[0] ||
      null
    );
  }, [computedProducts, selectedProductId]);

  if (!selectedMetrics) {
    return (
      <div className="p-8 text-center text-slate-400">
        No product available for comparison.
      </div>
    );
  }

  const { product, spotValueSgd, spotValueUsd, retailerMetrics, bestPremiumRetailerId } =
    selectedMetrics;

  const retailerIds: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];

  const formatMoney = (sgd: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    if (currency === 'SGD') return `S$${sgd.toFixed(2)}`;
    return `S$${sgd.toFixed(2)} ($${usd.toFixed(2)})`;
  };

  const currentSpotMelt = currency === 'USD' ? spotValueUsd : spotValueSgd;
  const currencySymbol = currency === 'USD' ? '$' : 'S$';

  // Calculate highest & lowest premiums among available prices to compute maximum potential savings
  const validPremiums = retailerIds
    .map((rid) => retailerMetrics[rid]?.premiumPct)
    .filter((p): p is number => p !== undefined && p !== null);

  const lowestPremium = Math.min(...validPremiums);
  const highestPremium = Math.max(...validPremiums);
  const premiumSpreadDiff = highestPremium - lowestPremium;

  const validBuyPrices = retailerIds
    .map((rid) => (currency === 'USD' ? retailerMetrics[rid]?.buyPriceUsd : retailerMetrics[rid]?.buyPriceSgd))
    .filter((p): p is number => p !== undefined && p !== null);

  const maxPriceSavings = Math.max(...validBuyPrices) - Math.min(...validBuyPrices);

  // Maximum value for chart scaling
  const maxChartValue = Math.max(
    ...retailerIds.map((rid) => {
      const rm = retailerMetrics[rid];
      if (!rm) return 10;
      if (chartMetric === 'buyPremium') return rm.premiumPct || 0;
      if (chartMetric === 'bulkPremium') {
        const bulkTier = product.prices[rid]?.bulkTiers?.[0];
        return bulkTier ? bulkTier.bulkPremiumPct : rm.premiumPct || 0;
      }
      if (chartMetric === 'spread') return rm.spreadPct || 0;
      return 10;
    }),
    2
  );

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${isModal ? 'max-w-4xl w-full mx-auto my-6' : 'w-full'}`}>
      {/* Top Title & Modal Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/40 text-amber-400 flex-shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Retailer Premium Comparison Chart
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                3 Retailers Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side markup over spot price for Silver Bullion, BullionStar & LPM
            </p>
          </div>
        </div>

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="self-end md:self-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Comparison Modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-6">
        {/* Product Selector Bar */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Product to Compare:</span>
            </label>

            {/* Quick Filter Buttons */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('Gold')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'Gold' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gold
              </button>
              <button
                onClick={() => setCategoryFilter('Silver')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'Silver' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Silver
              </button>
              <button
                onClick={() => setCategoryFilter('Coin')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'Coin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Coins
              </button>
              <button
                onClick={() => setCategoryFilter('Bar')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'Bar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bars
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                {filteredProductOptions.map((item) => (
                  <option key={item.product.id} value={item.product.id} className="bg-slate-900 text-slate-100">
                    {item.product.name} ({item.product.metal} {item.product.formFactor} - {item.product.weightOz} oz)
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Selected Product Summary Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-2xl border border-slate-700/80 bg-slate-800 flex-shrink-0 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  product.metal === 'Gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-700 text-slate-200'
                }`}>
                  {product.metal} {product.formFactor}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {product.weightOz} oz ({product.weightGrams}g) • Purity {product.purity}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">
                {product.name}
              </h3>

              <div className="text-xs text-slate-400 flex items-center space-x-3 mt-1 font-mono">
                <span>Mint: <strong className="text-slate-200">{product.mint}</strong></span>
                <span>Melt Spot Value: <strong className="text-emerald-400">{formatMoney(spotValueSgd, spotValueUsd)}</strong></span>
              </div>
            </div>
          </div>

          {/* Key Savings Callout Banner */}
          <div className="bg-amber-950/30 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-right self-stretch md:self-auto flex md:flex-col items-center md:items-end justify-between">
            <div className="text-xs text-amber-300/80 font-semibold flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Max Retailer Savings:</span>
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              {currencySymbol}{maxPriceSavings.toFixed(2)}
              <span className="text-xs text-amber-300/90 font-sans font-medium ml-1">
                ({premiumSpreadDiff.toFixed(2)}% markup diff)
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart Metric Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <Percent className="w-4 h-4 text-amber-400" />
            <span>Bar Chart Comparison Metric:</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setChartMetric('buyPremium')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                chartMetric === 'buyPremium'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Standard Premium (%)</span>
            </button>

            <button
              onClick={() => setChartMetric('bulkPremium')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                chartMetric === 'bulkPremium'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bulk Tier Premium (%)</span>
            </button>

            <button
              onClick={() => setChartMetric('spread')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                chartMetric === 'spread'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Buy-Sell Spread (%)</span>
            </button>
          </div>
        </div>

        {/* Visual Bar Chart Section */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-5">
          <div className="space-y-4">
            {retailerIds.map((rid) => {
              const ret = RETAILERS[rid];
              const rm = retailerMetrics[rid];
              if (!rm) return null;

              const isBest = rid === bestPremiumRetailerId;

              // Determine metric value
              let displayPct = rm.premiumPct;
              let displayLabel = 'Standard Buy Premium';

              const bulkTier = product.prices[rid]?.bulkTiers?.[0];

              if (chartMetric === 'bulkPremium') {
                if (bulkTier) {
                  displayPct = bulkTier.bulkPremiumPct;
                  displayLabel = `Bulk (${bulkTier.label})`;
                } else {
                  displayPct = rm.premiumPct;
                  displayLabel = 'Standard (No Bulk Tier)';
                }
              } else if (chartMetric === 'spread') {
                displayPct = rm.spreadPct;
                displayLabel = 'Buy-Sell Spread';
              }

              // Calculate bar width percentage relative to max Chart Value
              const barWidthPct = Math.min(100, Math.max(8, (displayPct / (maxChartValue * 1.15)) * 100));

              // Price values
              const buyPrice = currency === 'USD' ? rm.buyPriceUsd : rm.buyPriceSgd;
              const dollarPremium = buyPrice - currentSpotMelt;

              return (
                <div
                  key={rid}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBest
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${ret.badgeBg}`}>
                        {ret.name}
                      </span>

                      {isBest && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center space-x-1">
                          <Trophy className="w-3 h-3 text-emerald-400" />
                          <span>LOWEST PREMIUM</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400 font-mono">
                        {displayLabel}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-3 text-xs font-mono">
                      <span className="text-slate-400">
                        Buy: <strong className="text-slate-100 font-bold">{currencySymbol}{buyPrice.toFixed(2)}</strong>
                      </span>
                      <span className="text-slate-400">
                        Markup: <strong className="text-amber-300 font-bold">+{currencySymbol}{dollarPremium.toFixed(2)}</strong>
                      </span>
                      <span className={`text-sm font-black ${isBest ? 'text-emerald-400' : 'text-amber-300'}`}>
                        +{displayPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="relative w-full h-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-0.5">
                    <div
                      style={{ width: `${barWidthPct}%` }}
                      className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 ${
                        isBest
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm'
                          : 'bg-gradient-to-r from-amber-600 to-amber-400'
                      }`}
                    >
                      <span className="text-[10px] font-black text-slate-950 font-mono">
                        +{displayPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Bulk tier badge if available */}
                  {bulkTier && chartMetric === 'buyPremium' && (
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 bg-amber-950/20 px-2.5 py-1 rounded-xl border border-amber-500/20">
                      <span className="text-amber-300 font-bold flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-amber-400" />
                        <span>Bulk Discount Available: {bulkTier.label} ({bulkTier.minQty}+ units)</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Bulk Premium: +{bulkTier.bulkPremiumPct.toFixed(2)}% ({currencySymbol}{currency === 'USD' ? bulkTier.discountPerUnitUsd.toFixed(2) : bulkTier.discountPerUnitSgd.toFixed(2)}/u savings)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Complete Retailer Pricing Breakdown</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Prices updated live against current spot
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Retailer</th>
                  <th className="px-4 py-3">Buy Price</th>
                  <th className="px-4 py-3">Dollar Premium</th>
                  <th className="px-4 py-3">Premium %</th>
                  <th className="px-4 py-3">Bulk Tier Price</th>
                  <th className="px-4 py-3">Sell-Back (Bid)</th>
                  <th className="px-4 py-3">Spread</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {retailerIds.map((rid) => {
                  const ret = RETAILERS[rid];
                  const rm = retailerMetrics[rid];
                  if (!rm) return null;

                  const isBest = rid === bestPremiumRetailerId;
                  const buyPrice = currency === 'USD' ? rm.buyPriceUsd : rm.buyPriceSgd;
                  const sellPrice = currency === 'USD' ? rm.sellPriceUsd : rm.sellPriceSgd;
                  const dollarPremium = buyPrice - currentSpotMelt;
                  const bulkTier = product.prices[rid]?.bulkTiers?.[0];

                  return (
                    <tr key={rid} className={`hover:bg-slate-900/60 transition-colors ${isBest ? 'bg-emerald-950/10' : ''}`}>
                      <td className="px-4 py-3 font-sans font-bold">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${ret.badgeBg}`}>
                            {ret.shortName}
                          </span>
                          <span className="text-slate-200">{ret.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-100">
                        {currencySymbol}{buyPrice.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-amber-300 font-semibold">
                        +{currencySymbol}{dollarPremium.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          isBest ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-amber-300'
                        }`}>
                          +{rm.premiumPct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {bulkTier ? (
                          <div>
                            <span className="text-amber-300 font-bold">
                              {currencySymbol}{currency === 'USD' ? bulkTier.bulkBuyPriceUsd.toFixed(2) : bulkTier.bulkBuyPriceSgd.toFixed(2)}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-sans">
                              {bulkTier.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-sans text-[11px]">Standard</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {currencySymbol}{sellPrice.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {rm.spreadPct.toFixed(2)}%
                      </td>

                      <td className="px-4 py-3 text-right font-sans">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={getRetailerListingUrl(rid, product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 shadow-sm"
                            title={`Order ${product.name} on ${ret.name}`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Order</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>

                          {onAddToCart && (
                            <button
                              onClick={() => onAddToCart(product.id, rid)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                              title="Add to Calculator"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden lg:inline">Calc</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
