import React, { useState, useEffect, useRef } from 'react';
import { ComputedProductMetrics, Currency, RetailerId, Product, SpecialOffer } from '../types';
import { RETAILERS } from '../data/bullionData';
import { PremiumSparkline } from './PremiumSparkline';
import { Trophy, ShoppingBag, ArrowUpRight, PlusCircle, Flame, Clock, ExternalLink, BellRing, Store, ShieldCheck, Building2, Layers, BarChart2, ShoppingCart, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { getRetailerListingUrl, openRetailerListing } from '../utils/urlUtils';

interface ProductComparisonTableProps {
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  onAddToCart?: (productId: string, retailerId: RetailerId) => void;
  onSelectProduct?: (product: ComputedProductMetrics) => void;
  onSelectSpecialOffer?: (product: Product, retailerId: RetailerId, offer: SpecialOffer) => void;
  onSetPriceAlert?: (product: ComputedProductMetrics) => void;
  onComparePremiums?: (product: ComputedProductMetrics) => void;
  activeAlertProductIds?: Set<string>;
}

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
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

  // State to track row flash animation on price refreshes ('up' | 'down')
  const [rowFlashes, setRowFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const newFlashes: Record<string, 'up' | 'down'> = {};
    let hasChanges = false;

    computedProducts.forEach((item) => {
      const pid = item.product.id;
      const currentPrice = item.retailerMetrics[item.bestBuyRetailerId]?.buyPriceSgd;
      const previousPrice = prevPricesRef.current[pid];

      if (previousPrice !== undefined && currentPrice !== undefined && previousPrice !== currentPrice) {
        if (currentPrice < previousPrice) {
          newFlashes[pid] = 'down'; // Green flash for price drop / cheaper
          hasChanges = true;
        } else if (currentPrice > previousPrice) {
          newFlashes[pid] = 'up'; // Red flash for price increase / higher
          hasChanges = true;
        }
      }

      if (currentPrice !== undefined) {
        prevPricesRef.current[pid] = currentPrice;
      }
    });

    if (hasChanges) {
      setRowFlashes((prev) => ({ ...prev, ...newFlashes }));

      // Clear flash animation state after 2.5 seconds
      const timer = setTimeout(() => {
        setRowFlashes((prev) => {
          const next = { ...prev };
          Object.keys(newFlashes).forEach((key) => delete next[key]);
          return next;
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [computedProducts]);

  // Helper function to derive Market Sentiment for each product
  const getMarketSentiment = (product: Product, lowestPremiumPct: number) => {
    if (product.metal === 'Gold') {
      if (lowestPremiumPct <= 2.8) {
        return { label: 'Strong Buy', type: 'bullish', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      }
      if (lowestPremiumPct <= 4.0) {
        return { label: 'Bullish Flow', type: 'bullish', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      }
      return { label: 'Neutral', type: 'neutral', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    } else {
      if (lowestPremiumPct <= 16.0) {
        return { label: 'High Demand', type: 'bullish', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      }
      if (lowestPremiumPct <= 22.0) {
        return { label: 'Moderate Demand', type: 'bullish', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      }
      return { label: 'Stable', type: 'neutral', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  const formatMoney = (amountSgd: number, amountUsd: number) => {
    if (currency === 'SGD') {
      return `S$${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'USD') {
      return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // DUAL Mode
    return (
      <div className="flex flex-col">
        <span className="font-bold text-slate-100">S${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-[11px] text-slate-400">$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
      </div>
    );
  };

  if (computedProducts.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">No bullion products match your filter</h3>
        <p className="text-sm text-slate-400 mt-1">Try resetting search keywords or expanding metal filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="comparison-matrix-wrapper">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="py-4 px-4 w-[28%] font-bold text-slate-300">
                Item & Spot Value
              </th>

              {/* Retailer Headers */}
              {retailerKeys.map((rid) => {
                const ret = RETAILERS[rid];
                return (
                  <th key={rid} className="py-4 px-4 w-[24%] border-l border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${ret.badgeBg}`}>
                          {ret.shortName}
                        </span>
                        <div className="text-[11px] text-slate-400 normal-case font-normal mt-0.5">
                          {ret.location.split('(')[0]}
                        </div>
                      </div>
                      <a
                        href={ret.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                        title={`Visit ${ret.name} website`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-sm">
            {computedProducts.map((item) => {
              const { product, spotValueSgd, spotValueUsd, retailerMetrics, bestBuyRetailerId, hasSpecialOffer, lowestPremiumPct } = item;
              const flash = rowFlashes[product.id];
              const sentiment = getMarketSentiment(product, lowestPremiumPct);

              return (
                <tr
                  key={product.id}
                  className={`transition-all duration-500 group cursor-pointer ${
                    flash === 'down'
                      ? 'bg-emerald-950/50 ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-950/50'
                      : flash === 'up'
                      ? 'bg-rose-950/50 ring-2 ring-rose-500/80 shadow-lg shadow-rose-950/50'
                      : 'hover:bg-slate-800/40'
                  }`}
                  onClick={() => onSelectProduct?.(item)}
                >
                  {/* Product Column */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-800"
                        />
                        <span
                          className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                            product.metal === 'Gold'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-300 text-slate-950'
                          }`}
                        >
                          {product.metal}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
                            {product.name}
                          </h4>

                          {/* Flash price indicator badge when price refreshes */}
                          {flash && (
                            <span
                              className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce border ${
                                flash === 'down'
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-rose-500 text-white border-rose-400'
                              }`}
                            >
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              <span>Price Refreshed {flash === 'down' ? '↓' : '↑'}</span>
                            </span>
                          )}

                          {/* Market Sentiment Badge */}
                          <span
                            className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${sentiment.badge}`}
                            title={`Market Sentiment for ${product.name}: ${sentiment.label} based on current premium (+${lowestPremiumPct}%)`}
                          >
                            <Activity className="w-2.5 h-2.5 text-amber-400" />
                            <span>{sentiment.label}</span>
                          </span>

                          {hasSpecialOffer && (
                            <button
                              onClick={(e) => {
                                if (onSelectSpecialOffer) {
                                  e.stopPropagation();
                                  const offerRid = retailerKeys.find(r => product.prices[r]?.specialOffer);
                                  if (offerRid && product.prices[offerRid].specialOffer) {
                                    onSelectSpecialOffer(product, offerRid, product.prices[offerRid].specialOffer!);
                                  }
                                }
                              }}
                              className="flex-shrink-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer transition-colors"
                            >
                              <Flame className="w-2.5 h-2.5 text-rose-400 fill-rose-400 animate-pulse" />
                              <span>PROMO</span>
                            </button>
                          )}
                          {onSetPriceAlert && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetPriceAlert(item);
                              }}
                              className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border transition-colors ${
                                activeAlertProductIds?.has(product.id)
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
                              }`}
                              title={activeAlertProductIds?.has(product.id) ? 'Active alert set' : 'Set target price alert'}
                            >
                              <BellRing className={`w-2.5 h-2.5 ${activeAlertProductIds?.has(product.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                              <span>{activeAlertProductIds?.has(product.id) ? 'Alert Active' : 'Set Alert'}</span>
                            </button>
                          )}
                          {onComparePremiums && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onComparePremiums(item);
                              }}
                              className="flex-shrink-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                              title="Compare 3 Retailer Premiums"
                            >
                              <BarChart2 className="w-2.5 h-2.5 text-amber-400" />
                              <span>Compare Chart</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400">
                          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80 font-mono">
                            {product.weightOz} oz ({product.weightGrams}g)
                          </span>
                          <span>{product.purity}</span>
                          {product.formFactor === 'Bar' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              (product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast'
                                ? 'bg-amber-950/90 text-amber-300 border-amber-600/40'
                                : 'bg-cyan-950/90 text-cyan-300 border-cyan-600/40'
                            }`}>
                              {(product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast' ? 'Cast Bar' : 'Minted Bar'}
                            </span>
                          )}
                          {product.isLbmaGoodDelivery ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                              <span>LBMA</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800 border border-slate-700">
                              Non-LBMA
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>Mfg: <strong className="text-slate-300">{product.manufacturer || product.mint}</strong></span>
                        </div>

                        {/* Melt Spot Value */}
                        <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
                          <span>Pure Spot Value:</span>
                          <strong className="text-amber-400/90 font-mono">
                            {formatMoney(spotValueSgd, spotValueUsd)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3 Retailer Metric Columns */}
                  {retailerKeys.map((rid) => {
                    const metrics = retailerMetrics[rid];
                    const offer = product.prices[rid].specialOffer;
                    const isBest = rid === bestBuyRetailerId;

                    return (
                      <td
                        key={rid}
                        className={`py-4 px-4 align-top border-l border-slate-800/80 ${
                          offer
                            ? 'bg-rose-950/20'
                            : isBest
                            ? 'bg-amber-500/5 dark:bg-amber-500/10'
                            : ''
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Special Offer or Lowest Price Trophy Badge */}
                          {offer ? (
                            <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[11px] font-bold">
                              <Flame className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                              <span>{offer.badgeText}</span>
                            </div>
                          ) : isBest ? (
                            <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded text-[11px] font-bold">
                              <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>Lowest Buy Price</span>
                            </div>
                          ) : null}

                          {/* Retail Shop Price (ON TOP OF Online Ask Price) */}
                          <div
                            onClick={(e) => openRetailerListing(rid, product, e)}
                            className="bg-slate-800/60 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 hover:border-amber-500/50 space-y-1 cursor-pointer transition-all group/price"
                            title={`Click to open ${RETAILERS[rid].name} store listing page`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-medium flex items-center gap-1 group-hover/price:text-amber-300 transition-colors">
                                <Store className="w-3 h-3 text-amber-400" />
                                Retail Shop:
                              </span>
                              <span className="font-mono font-bold text-amber-300">
                                {formatMoney(metrics.retailShopPriceSgd, metrics.retailShopPriceUsd)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-700/40 pt-1">
                              <span className="text-[11px] text-slate-400 font-medium group-hover/price:text-slate-200 flex items-center gap-1 transition-colors">
                                <span>Online Ask:</span>
                                <ExternalLink className="w-2.5 h-2.5 text-amber-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                              </span>
                              <div className="text-right">
                                {offer && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono mr-1">
                                    {formatMoney(offer.originalBuyPriceSgd, offer.originalBuyPriceUsd)}
                                  </span>
                                )}
                                <span className={`text-sm font-bold font-mono ${offer ? 'text-rose-300' : 'text-white group-hover/price:text-amber-300'} transition-colors`}>
                                  {formatMoney(metrics.buyPriceSgd, metrics.buyPriceUsd)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Offer Savings details */}
                          {offer && (
                            <div
                              onClick={(e) => {
                                if (onSelectSpecialOffer) {
                                  e.stopPropagation();
                                  onSelectSpecialOffer(product, rid, offer);
                                }
                              }}
                              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 p-1.5 rounded-lg text-[10px] space-y-0.5 cursor-pointer transition-colors"
                            >
                              <div className="text-rose-200 font-semibold flex items-center justify-between">
                                <span>{offer.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-rose-300" />
                              </div>
                              <div className="text-slate-300 flex items-center justify-between">
                                <span>Savings: <strong className="text-emerald-300 font-mono">S${offer.savingsSgd.toFixed(2)}</strong></span>
                                {offer.code && <span className="font-mono text-amber-300">Code: {offer.code}</span>}
                              </div>
                            </div>
                          )}

                          {/* Bulk Tier Specials Info */}
                          {product.prices[rid].bulkTiers && product.prices[rid].bulkTiers!.length > 0 && (
                            <div className="bg-amber-950/30 border border-amber-500/30 p-1.5 rounded-lg text-[10px] space-y-0.5">
                              <div className="text-amber-300 font-bold flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-amber-400" />
                                  Bulk ({product.prices[rid].bulkTiers![0].label}):
                                </span>
                                <span className="font-mono text-amber-200">
                                  {formatMoney(product.prices[rid].bulkTiers![0].bulkBuyPriceSgd, product.prices[rid].bulkTiers![0].bulkBuyPriceUsd)}
                                </span>
                              </div>
                              <div className="text-slate-300 flex items-center justify-between font-mono">
                                <span className="text-[9px] text-slate-400">Unit Savings:</span>
                                <span className="text-emerald-400 font-bold">
                                  -{currency === 'USD' ? `$${product.prices[rid].bulkTiers![0].discountPerUnitUsd.toFixed(2)}` : `S$${product.prices[rid].bulkTiers![0].discountPerUnitSgd.toFixed(2)}`} / unit
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Sell Price (Bid) */}
                          <div className="flex justify-between items-baseline text-xs text-slate-400 border-t border-slate-800/80 pt-1">
                            <span>Sell-Back (Bid):</span>
                            <span className="font-mono font-medium text-slate-300">
                              {formatMoney(metrics.sellPriceSgd, metrics.sellPriceUsd)}
                            </span>
                          </div>

                          {/* Premium Above Spot */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Premium:</span>
                            {offer ? (
                              <span className="font-mono font-bold px-1.5 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <span className="line-through text-slate-500 mr-1">+{offer.originalPremiumPct}%</span>
                                +{metrics.premiumPct}%
                              </span>
                            ) : (
                              <span
                                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  metrics.premiumPct <= 3.5
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : metrics.premiumPct <= 10.0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                +{metrics.premiumPct}%
                              </span>
                            )}
                          </div>

                          {/* Buy-Sell Spread */}
                          <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>Spread:</span>
                            <div className="text-right">
                              <span className="font-mono text-slate-300 font-semibold">{metrics.spreadPct}%</span>
                              <span className="text-[10px] text-slate-500 block">
                                ({currency === 'USD' ? `$${metrics.spreadValueUsd}` : `S$${metrics.spreadValueSgd}`})
                              </span>
                            </div>
                          </div>

                          {/* 7-Day Retailer Premium Sparkline Chart */}
                          <div className="pt-1.5 border-t border-slate-800/80">
                            <PremiumSparkline
                              productId={product.id}
                              retailerId={rid}
                              currentPremium={metrics.premiumPct}
                            />
                          </div>

                          {/* Action buttons: Order Online & Add to Calc */}
                          <div className="mt-2 space-y-1.5">
                            <button
                              onClick={(e) => openRetailerListing(rid, product, e)}
                              className={`w-full py-1.5 px-2 text-xs font-bold rounded-lg border flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                                offer
                                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 border-rose-400'
                                  : isBest
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/80'
                              }`}
                              title={`Order directly on ${RETAILERS[rid].name}`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Order at {RETAILERS[rid].shortName}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                            </button>

                            {onAddToCart && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product.id, rid);
                                }}
                                className="w-full py-1 px-2 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center space-x-1 transition-all"
                                title="Add to portfolio calculator"
                              >
                                <PlusCircle className="w-3 h-3 text-amber-400" />
                                <span>Add to Calc</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
