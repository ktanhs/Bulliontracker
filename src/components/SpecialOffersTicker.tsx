import React, { useState } from 'react';
import { ComputedProductMetrics, Product, RetailerId, SpecialOffer, Currency, BulkTier } from '../types';
import { RETAILERS } from '../data/bullionData';
import { Flame, Tag, ArrowRight, Layers, Coins, Box, ChevronRight, ChevronUp, ChevronDown, Filter, RotateCcw, Scale, Maximize2, Minimize2 } from 'lucide-react';

interface SpecialOffersTickerProps {
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  onSelectSpecialOffer: (product: Product, retailerId: RetailerId, offer: SpecialOffer) => void;
  onSelectProduct?: (productMetrics: ComputedProductMetrics) => void;
}

export const SpecialOffersTicker: React.FC<SpecialOffersTickerProps> = ({
  computedProducts,
  currency,
  onSelectSpecialOffer,
  onSelectProduct,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'promos' | 'coinBulk' | 'barBulk'>('promos');

  // Filter selections inside promos/bulk window
  const [formFactorFilter, setFormFactorFilter] = useState<'ALL' | 'Coin' | 'Bar'>('ALL');
  const [metalFilter, setMetalFilter] = useState<'ALL' | 'Gold' | 'Silver'>('ALL');
  const [weightFilter, setWeightFilter] = useState<'ALL' | 'fractional' | '1oz' | 'heavy'>('ALL');

  const retailerKeys: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];

  // Extract all active promo codes / special deals
  const specialDeals: {
    product: Product;
    retailerId: RetailerId;
    offer: SpecialOffer;
    spotValueSgd: number;
    spotValueUsd: number;
    itemMetrics: ComputedProductMetrics;
  }[] = [];

  // Extract bulk tier deals for coins and bars
  const coinBulkDeals: {
    product: Product;
    retailerId: RetailerId;
    tier: BulkTier;
    itemMetrics: ComputedProductMetrics;
  }[] = [];

  const barBulkDeals: {
    product: Product;
    retailerId: RetailerId;
    tier: BulkTier;
    itemMetrics: ComputedProductMetrics;
  }[] = [];

  computedProducts.forEach((item) => {
    retailerKeys.forEach((rid) => {
      const price = item.product.prices[rid];
      if (!price) return;

      if (price.specialOffer) {
        specialDeals.push({
          product: item.product,
          retailerId: rid,
          offer: price.specialOffer,
          spotValueSgd: item.spotValueSgd,
          spotValueUsd: item.spotValueUsd,
          itemMetrics: item,
        });
      }

      if (price.bulkTiers && price.bulkTiers.length > 0) {
        const bestTier = price.bulkTiers[price.bulkTiers.length - 1] || price.bulkTiers[0];
        if (item.product.formFactor === 'Coin') {
          coinBulkDeals.push({
            product: item.product,
            retailerId: rid,
            tier: bestTier,
            itemMetrics: item,
          });
        } else {
          barBulkDeals.push({
            product: item.product,
            retailerId: rid,
            tier: bestTier,
            itemMetrics: item,
          });
        }
      }
    });
  });

  // Filter helper logic
  const filterItem = (item: { product: Product }) => {
    if (formFactorFilter !== 'ALL' && item.product.formFactor !== formFactorFilter) return false;
    if (metalFilter !== 'ALL' && item.product.metal !== metalFilter) return false;
    if (weightFilter === 'fractional' && item.product.weightOz >= 0.95) return false;
    if (weightFilter === '1oz' && (item.product.weightOz < 0.95 || item.product.weightOz > 1.05)) return false;
    if (weightFilter === 'heavy' && item.product.weightOz <= 1.05) return false;
    return true;
  };

  const filteredSpecialDeals = specialDeals.filter(filterItem);
  const filteredCoinBulkDeals = coinBulkDeals.filter(filterItem);
  const filteredBarBulkDeals = barBulkDeals.filter(filterItem);

  const totalActiveDeals = specialDeals.length + coinBulkDeals.length + barBulkDeals.length;
  const isAnySubFilterActive = formFactorFilter !== 'ALL' || metalFilter !== 'ALL' || weightFilter !== 'ALL';

  const resetSubFilters = () => {
    setFormFactorFilter('ALL');
    setMetalFilter('ALL');
    setWeightFilter('ALL');
  };

  const formatPrice = (sgd: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    return `S$${sgd.toFixed(2)}`;
  };

  // Minimized state compact bar
  if (isMinimized) {
    return (
      <div className="mb-6 bg-slate-900 border border-rose-500/40 rounded-2xl px-5 py-3 shadow-lg flex items-center justify-between transition-all hover:border-rose-400">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-3 cursor-pointer group flex-1"
        >
          <div className="bg-rose-500/20 p-2 rounded-xl border border-rose-500/40 animate-pulse">
            <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide">
              Retailer Promos & Bulk Volume Specials Window
            </h3>
            <div className="flex items-center space-x-2 mt-0.5 sm:mt-0">
              <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border border-rose-500/30">
                {totalActiveDeals} DEALS AVAILABLE
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                (Click to expand & filter promo codes, coin tubes & bar volume tiers)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(false)}
          className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          title="Expand Deals Window"
        >
          <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Expand Window</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all">
      {/* Glow highlight background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-500/20 p-2.5 rounded-2xl border border-rose-500/40 animate-pulse flex-shrink-0">
            <Flame className="w-5 h-5 text-rose-400 fill-rose-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-rose-200 uppercase tracking-wide">
                Retailer Promos & Bulk Volume Specials
              </h3>
              <span className="bg-rose-500/30 text-rose-300 text-[11px] px-2.5 py-0.5 rounded-full font-extrabold border border-rose-500/30">
                {totalActiveDeals} DEALS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live discount codes, flash sales, and bulk tube/box tiers for coins and bars across Singapore retailers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          {/* Main Category Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('promos')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'promos'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-300" />
              <span>Active Promos ({filteredSpecialDeals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('coinBulk')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'coinBulk'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>Coin Bulk ({filteredCoinBulkDeals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('barBulk')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'barBulk'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-300" />
              <span>Bar Bulk ({filteredBarBulkDeals.length})</span>
            </button>
          </div>

          {/* Minimize Window Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl transition-colors flex items-center space-x-1 text-xs font-bold"
            title="Minimize window when not in use"
          >
            <Minimize2 className="w-4 h-4 text-rose-400" />
            <span className="hidden lg:inline text-slate-300 text-[11px]">Minimize</span>
          </button>
        </div>
      </div>

      {/* Secondary Selection Filters (Coins/Bars, Metal, Weight) inside window */}
      <div className="mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>Filter Window Deals:</span>
          </div>

          {/* Form Factor Dropdown Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={formFactorFilter}
              onChange={(e) => setFormFactorFilter(e.target.value as 'ALL' | 'Coin' | 'Bar')}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Coins & Bars</option>
              <option value="Coin" className="bg-slate-900 text-amber-300">Coins Only</option>
              <option value="Bar" className="bg-slate-900 text-cyan-300">Bars Only</option>
            </select>
          </div>

          {/* Metal Dropdown Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 font-medium">Metal:</span>
            <select
              value={metalFilter}
              onChange={(e) => setMetalFilter(e.target.value as 'ALL' | 'Gold' | 'Silver')}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Metals (Gold & Silver)</option>
              <option value="Gold" className="bg-slate-900 text-amber-300">Gold Only</option>
              <option value="Silver" className="bg-slate-900 text-slate-300">Silver Only</option>
            </select>
          </div>

          {/* Weight Dropdown Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700/80">
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400 font-medium">Weight:</span>
            <select
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value as 'ALL' | 'fractional' | '1oz' | 'heavy')}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Weights</option>
              <option value="fractional" className="bg-slate-900 text-amber-200">Fractional (&lt; 1 oz)</option>
              <option value="1oz" className="bg-slate-900 text-amber-300">1 oz Standard</option>
              <option value="heavy" className="bg-slate-900 text-cyan-300">Heavy (&gt; 1 oz / Kilobars)</option>
            </select>
          </div>
        </div>

        {isAnySubFilterActive && (
          <button
            onClick={resetSubFilters}
            className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 transition-colors font-semibold"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span>Reset Window Filters</span>
          </button>
        )}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {filteredSpecialDeals.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No active promo codes match your selected window filters. Try selecting "All Metals" or "All Weights".
            </div>
          ) : (
            filteredSpecialDeals.map(({ product, retailerId, offer, itemMetrics }) => {
              const ret = RETAILERS[retailerId];

              return (
                <div
                  key={`promo-${product.id}-${retailerId}`}
                  onClick={() => onSelectSpecialOffer(product, retailerId, offer)}
                  className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-950/40 p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ret.badgeBg}`}>
                        {ret.shortName}
                      </span>
                      <div className="flex items-center space-x-1 text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                        <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>{offer.badgeText}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Code: <strong className="text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">{offer.code || 'DEAL'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                        {formatPrice(offer.originalBuyPriceSgd, offer.originalBuyPriceUsd)}
                      </span>
                      <span className="font-extrabold font-mono text-rose-300 text-sm">
                        {formatPrice(offer.promoBuyPriceSgd, offer.promoBuyPriceUsd)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-xl border border-rose-500/30 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                      <span>Claim Promo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'coinBulk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {filteredCoinBulkDeals.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No coin bulk volume deals match your selected filters. Try selecting "All Types" or "Coins Only".
            </div>
          ) : (
            filteredCoinBulkDeals.map(({ product, retailerId, tier, itemMetrics }) => {
              const ret = RETAILERS[retailerId];
              const price = product.prices[retailerId];

              return (
                <div
                  key={`coinbulk-${product.id}-${retailerId}`}
                  onClick={() => onSelectProduct ? onSelectProduct(itemMetrics) : null}
                  className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-950/40 p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ret.badgeBg}`}>
                        {ret.shortName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{tier.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-amber-300/90 font-mono mt-0.5">
                          Save {formatPrice(tier.discountPerUnitSgd, tier.discountPerUnitUsd)} / unit
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                        Single: {formatPrice(price.buyPriceSgd, price.buyPriceUsd)}
                      </span>
                      <span className="font-extrabold font-mono text-amber-300 text-sm">
                        Bulk: {formatPrice(tier.bulkBuyPriceSgd, tier.bulkBuyPriceUsd)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <span>View Tiers</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'barBulk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {filteredBarBulkDeals.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No bar bulk volume deals match your selected filters. Try adjusting window filters.
            </div>
          ) : (
            filteredBarBulkDeals.map(({ product, retailerId, tier, itemMetrics }) => {
              const ret = RETAILERS[retailerId];
              const price = product.prices[retailerId];

              return (
                <div
                  key={`barbulk-${product.id}-${retailerId}`}
                  onClick={() => onSelectProduct ? onSelectProduct(itemMetrics) : null}
                  className="bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-950/40 p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ret.badgeBg}`}>
                        {ret.shortName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                        <Box className="w-3 h-3 text-cyan-400" />
                        <span>{tier.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-cyan-300/90 font-mono mt-0.5">
                          Save {formatPrice(tier.discountPerUnitSgd, tier.discountPerUnitUsd)} / unit
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                        Single: {formatPrice(price.buyPriceSgd, price.buyPriceUsd)}
                      </span>
                      <span className="font-extrabold font-mono text-cyan-300 text-sm">
                        Bulk: {formatPrice(tier.bulkBuyPriceSgd, tier.bulkBuyPriceUsd)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-xl border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      <span>View Tiers</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
