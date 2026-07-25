import React from 'react';
import { ComputedProductMetrics, Currency, RetailerId, Product, SpecialOffer } from '../types';
import { RETAILERS } from '../data/bullionData';
import { Trophy, PlusCircle, Flame, Tag, Clock, BellRing, Store, ShieldCheck, Building2, Layers, BarChart2, ExternalLink, ShoppingCart } from 'lucide-react';
import { openRetailerListing } from '../utils/urlUtils';

interface ProductCardGridProps {
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  onAddToCart?: (productId: string, retailerId: RetailerId) => void;
  onSelectProduct?: (product: ComputedProductMetrics) => void;
  onSelectSpecialOffer?: (product: Product, retailerId: RetailerId, offer: SpecialOffer) => void;
  onSetPriceAlert?: (product: ComputedProductMetrics) => void;
  onComparePremiums?: (product: ComputedProductMetrics) => void;
  activeAlertProductIds?: Set<string>;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  computedProducts,
  currency,
  onAddToCart,
  onSelectProduct,
  onSelectSpecialOffer,
  onSetPriceAlert,
  onComparePremiums,
  activeAlertProductIds,
}) => {
  const retailerKeys: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];

  const formatMoney = (amountSgd: number, amountUsd: number) => {
    if (currency === 'SGD') {
      return `S$${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'USD') {
      return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `S$${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${amountUsd.toFixed(2)})`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" id="product-card-grid-wrapper">
      {computedProducts.map((item) => {
        const { product, spotValueSgd, spotValueUsd, retailerMetrics, bestBuyRetailerId, hasSpecialOffer } = item;
        const hasActiveAlert = activeAlertProductIds?.has(product.id) || false;

        return (
          <div
            key={product.id}
            onClick={() => onSelectProduct?.(item)}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
              hasSpecialOffer
                ? 'border-rose-500/50 hover:border-rose-400/80 ring-1 ring-rose-500/20'
                : 'border-slate-800 hover:border-amber-500/50'
            }`}
          >
            {/* Top Corner Special Offer Banner */}
            {hasSpecialOffer && (
              <div
                onClick={(e) => {
                  if (onSelectSpecialOffer) {
                    e.stopPropagation();
                    const offerRetailer = retailerKeys.find(r => product.prices[r]?.specialOffer);
                    if (offerRetailer && product.prices[offerRetailer].specialOffer) {
                      onSelectSpecialOffer(product, offerRetailer, product.prices[offerRetailer].specialOffer!);
                    }
                  }
                }}
                className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-amber-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm cursor-pointer hover:from-rose-500 hover:to-amber-500"
              >
                <Flame className="w-3 h-3 fill-white animate-pulse" />
                <span>Special Promo Offer</span>
              </div>
            )}

            <div>
              {/* Card Header */}
              <div className="flex items-start space-x-3 mb-3 pt-1">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        product.metal === 'Gold'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-300 text-slate-950'
                      }`}
                    >
                      {product.metal} {product.formFactor}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {product.weightOz} oz ({product.weightGrams}g)
                    </span>
                    {product.formFactor === 'Bar' && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        (product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-600/40'
                          : 'bg-cyan-950/90 text-cyan-300 border-cyan-600/40'
                      }`}>
                        {(product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast' ? 'Cast Bar' : 'Minted Bar'}
                      </span>
                    )}
                    {product.isLbmaGoodDelivery ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                        <span>LBMA</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700/60">
                        Non-LBMA
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-base line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>Mfg: <strong className="text-slate-300">{product.manufacturer || product.mint}</strong></span>
                  </p>
                </div>
              </div>

              {/* Spot Melt Value */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Spot Melt Value:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {formatMoney(spotValueSgd, spotValueUsd)}
                </span>
              </div>

              {/* Retailer Comparison Section */}
              <div className="space-y-2.5">
                {retailerKeys.map((rid) => {
                  const ret = RETAILERS[rid];
                  const metrics = retailerMetrics[rid];
                  const offer = product.prices[rid].specialOffer;
                  const isBest = rid === bestBuyRetailerId;

                  return (
                    <div
                      key={rid}
                      onClick={(e) => openRetailerListing(rid, product, e)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group/cardrow ${
                        offer
                          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400/80 shadow-sm hover:shadow-rose-900/20'
                          : isBest
                          ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                          : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                      }`}
                      title={`Click to open ${ret.name} listing page`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ret.badgeBg} flex items-center gap-1 group-hover/cardrow:border-amber-400/60 transition-colors`}>
                            <span>{ret.shortName}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/cardrow:opacity-100" />
                          </span>
                          {offer ? (
                            <span className="flex items-center space-x-1 text-[10px] text-rose-300 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                              <Flame className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                              <span>{offer.badgeText}</span>
                            </span>
                          ) : isBest ? (
                            <span className="flex items-center space-x-1 text-[10px] text-amber-300 font-bold bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                              <Trophy className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>Cheapest</span>
                            </span>
                          ) : null}
                        </div>

                        {/* Price display: Retail Shop Walk-In Price ON TOP OF Online Ask Price */}
                        <div className="text-right flex flex-col items-end">
                          {/* Retail Shop Walk-In Tag Price */}
                          <div className="flex items-center space-x-1 text-[11px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mb-0.5">
                            <Store className="w-2.5 h-2.5 text-amber-400" />
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight">Retail Shop:</span>
                            <span className="font-mono">
                              {formatMoney(metrics.retailShopPriceSgd, metrics.retailShopPriceUsd)}
                            </span>
                          </div>

                          {/* Online Dealer Ask Price */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight">Online Ask:</span>
                            {offer && (
                              <span className="text-[10px] text-slate-400 line-through font-mono mr-0.5">
                                {formatMoney(offer.originalBuyPriceSgd, offer.originalBuyPriceUsd)}
                              </span>
                            )}
                            <span className={`text-xs font-mono font-extrabold ${offer ? 'text-rose-300' : 'text-white'}`}>
                              {formatMoney(metrics.buyPriceSgd, metrics.buyPriceUsd)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Promo Offer Header Details */}
                      {offer && (
                        <div className="mb-2 p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px]">
                          <div className="font-semibold text-rose-200 flex items-center justify-between">
                            <span>{offer.title}</span>
                            {offer.expiresIn && (
                              <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {offer.expiresIn}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300 text-[10px] mt-0.5 flex items-center justify-between">
                            <span>
                              Saved: <strong className="text-emerald-300 font-mono">S${offer.savingsSgd.toFixed(2)}</strong>
                            </span>
                            {offer.code && (
                              <span className="font-mono bg-slate-900/80 px-1 rounded text-amber-300 border border-amber-500/30">
                                Code: {offer.code}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bulk Tier Pricing Banner */}
                      {product.prices[rid].bulkTiers && product.prices[rid].bulkTiers!.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-500/20">
                          <div className="flex items-center space-x-1 font-bold text-amber-300">
                            <Layers className="w-3 h-3 text-amber-400" />
                            <span>Bulk ({product.prices[rid].bulkTiers![0].label}):</span>
                          </div>
                          <div className="font-mono font-bold text-amber-200">
                            {formatMoney(product.prices[rid].bulkTiers![0].bulkBuyPriceSgd, product.prices[rid].bulkTiers![0].bulkBuyPriceUsd)}
                            <span className="text-[9px] text-emerald-400 ml-1 font-semibold">
                              (-{currency === 'USD' ? `$${product.prices[rid].bulkTiers![0].discountPerUnitUsd.toFixed(2)}` : `S$${product.prices[rid].bulkTiers![0].discountPerUnitSgd.toFixed(2)}`}/u)
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                        <span>
                          Prem:{' '}
                          {offer ? (
                            <span className="font-mono">
                              <span className="line-through text-slate-500 mr-1">+{offer.originalPremiumPct}%</span>
                              <strong className="text-rose-300">+{metrics.premiumPct}%</strong>
                            </span>
                          ) : (
                            <strong className="text-emerald-400 font-mono">+{metrics.premiumPct}%</strong>
                          )}
                        </span>
                        <span>
                          Spread: <strong className="text-slate-300 font-mono">{metrics.spreadPct}%</strong>
                        </span>
                        <span>
                          Sell: <strong className="text-slate-300 font-mono">{currency === 'USD' ? `$${metrics.sellPriceUsd}` : `S$${metrics.sellPriceSgd}`}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                Lowest Prem: <strong className="text-emerald-400 font-mono">+{item.lowestPremiumPct}%</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={(e) => openRetailerListing(bestBuyRetailerId, product, e)}
                  className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-sm transition-all"
                  title={`Order at ${RETAILERS[bestBuyRetailerId].name}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Order</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </button>

                {onComparePremiums && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComparePremiums(item);
                    }}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold flex items-center space-x-1 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all"
                    title="Compare premiums across 3 retailers"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Compare</span>
                  </button>
                )}

                {onSetPriceAlert && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPriceAlert(item);
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all ${
                      hasActiveAlert
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title={hasActiveAlert ? 'Price alert active for this product' : 'Set target price alert'}
                  >
                    <BellRing className={`w-3.5 h-3.5 ${hasActiveAlert ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">{hasActiveAlert ? 'Alert On' : 'Alert'}</span>
                  </button>
                )}

                {onAddToCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product.id, bestBuyRetailerId);
                    }}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Calc</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
