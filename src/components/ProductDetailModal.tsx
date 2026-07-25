import React from 'react';
import { ComputedProductMetrics, Currency, RetailerId, Product, SpecialOffer } from '../types';
import { RETAILERS } from '../data/bullionData';
import { X, Trophy, ExternalLink, ShieldCheck, Scale, PlusCircle, Flame, Clock, Tag, BellRing, Store, Building2, CheckCircle2, Layers, BarChart2, ShoppingCart } from 'lucide-react';
import { openRetailerListing } from '../utils/urlUtils';

interface ProductDetailModalProps {
  productMetrics: ComputedProductMetrics | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (productId: string, retailerId: RetailerId) => void;
  onSelectSpecialOffer?: (product: Product, retailerId: RetailerId, offer: SpecialOffer) => void;
  onSetPriceAlert?: (product: ComputedProductMetrics) => void;
  onComparePremiums?: (product: ComputedProductMetrics) => void;
  activeAlertProductIds?: Set<string>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productMetrics,
  currency,
  onClose,
  onAddToCart,
  onSelectSpecialOffer,
  onSetPriceAlert,
  onComparePremiums,
  activeAlertProductIds,
}) => {
  if (!productMetrics) return null;

  const { product, spotValueSgd, spotValueUsd, retailerMetrics, bestBuyRetailerId } = productMetrics;
  const retailerKeys: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatMoney = (valSgd: number, valUsd: number) => {
    if (currency === 'SGD') return `S$${valSgd.toFixed(2)}`;
    if (currency === 'USD') return `$${valUsd.toFixed(2)}`;
    return `S$${valSgd.toFixed(2)} ($${valUsd.toFixed(2)} USD)`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in cursor-pointer"
      id="product-detail-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6 cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Spec Header */}
        <div className="flex items-start space-x-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 object-cover rounded-2xl border border-slate-700 bg-slate-800 flex-shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  product.metal === 'Gold' ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-950'
                }`}
              >
                {product.metal} {product.formFactor}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {product.weightOz} oz ({product.weightGrams}g)
              </span>
              {product.formFactor === 'Bar' && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  (product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast'
                    ? 'bg-amber-950 text-amber-300 border-amber-600/40'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-600/40'
                }`}>
                  {(product.barType || (product.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted')) === 'Cast' ? 'Cast Bar (Poured)' : 'Minted Bar (Pressed)'}
                </span>
              )}
              {product.isLbmaGoodDelivery ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                  <span>LBMA Good Delivery</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700">
                  Non-LBMA
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{product.name}</h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Manufacturer: <strong className="text-amber-300">{product.manufacturer || product.mint}</strong></span>
              </span>
              <span className="text-slate-500">•</span>
              <span>Mint: <strong className="text-slate-200">{product.mint}</strong></span>
              <span className="text-slate-500">•</span>
              <span>Purity: <strong className="text-slate-200">{product.purity}</strong></span>
            </p>
          </div>
        </div>

        {/* Spot Melt Value Box & Price Alert Button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-semibold">Pure Metal Spot Value:</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-base">
              {formatMoney(spotValueSgd, spotValueUsd)}
            </span>
          </div>

          {onSetPriceAlert && (
            <button
              onClick={() => onSetPriceAlert(productMetrics)}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
                activeAlertProductIds?.has(product.id)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-md font-extrabold'
              }`}
            >
              <BellRing className={`w-4 h-4 ${activeAlertProductIds?.has(product.id) ? 'fill-amber-400 text-amber-400' : 'fill-slate-950'}`} />
              <span>{activeAlertProductIds?.has(product.id) ? 'Price Alert Active' : 'Set Price Alert'}</span>
            </button>
          )}
        </div>

        {/* Retailer Comparison Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
            Retailer Price Comparison (SilverBullion vs BullionStar vs LPM)
          </h3>

          <div className="space-y-3">
            {retailerKeys.map((rid) => {
              const ret = RETAILERS[rid];
              const metrics = retailerMetrics[rid];
              const offer = product.prices[rid].specialOffer;
              const isBest = rid === bestBuyRetailerId;

              return (
                <div
                  key={rid}
                  className={`p-4 rounded-xl border transition-all ${
                    offer
                      ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                      : isBest
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-slate-800/50 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${ret.badgeBg}`}>
                        {ret.name}
                      </span>
                      {offer ? (
                        <span className="flex items-center space-x-1 text-[11px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          <Flame className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                          <span>{offer.badgeText}</span>
                        </span>
                      ) : isBest ? (
                        <span className="flex items-center space-x-1 text-[11px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                          <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Cheapest Buy Price</span>
                        </span>
                      ) : null}
                    </div>

                    <a
                      href={ret.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Special Offer Banner inside modal */}
                  {offer && (
                    <div
                      onClick={() => {
                        if (onSelectSpecialOffer) {
                          onClose();
                          onSelectSpecialOffer(product, rid, offer);
                        }
                      }}
                      className="mb-3 p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs space-y-1 cursor-pointer transition-colors group"
                    >
                      <div className="font-bold text-rose-200 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-rose-400" />
                          {offer.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {offer.expiresIn && (
                            <span className="text-amber-300 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" />
                              {offer.expiresIn}
                            </span>
                          )}
                          <span className="text-[10px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded font-bold group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            View Special Deal ↗
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between text-[11px] pt-1 border-t border-rose-500/20">
                        <span>Total Offer Savings: <strong className="text-emerald-300 font-mono">S${offer.savingsSgd.toFixed(2)}</strong></span>
                        {offer.code && <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-amber-500/40">Promo Code: {offer.code}</span>}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1 border-t border-slate-700/60 mt-2">
                    {/* Retail Shop Price Box (ON TOP OF Ask Price) */}
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg col-span-2 sm:col-span-1">
                      <span className="text-amber-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                        <Store className="w-3 h-3 text-amber-400" />
                        Retail Shop:
                      </span>
                      <span className="font-mono font-bold text-amber-300 text-sm block">
                        {formatMoney(metrics.retailShopPriceSgd, metrics.retailShopPriceUsd)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        (+{metrics.retailShopPremiumPct}% prem)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Online Ask:</span>
                      {offer && (
                        <span className="text-xs text-slate-400 line-through font-mono block">
                          {formatMoney(offer.originalBuyPriceSgd, offer.originalBuyPriceUsd)}
                        </span>
                      )}
                      <span className={`font-mono font-bold text-sm ${offer ? 'text-rose-300' : 'text-white'}`}>
                        {formatMoney(metrics.buyPriceSgd, metrics.buyPriceUsd)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sell-back (Bid):</span>
                      <span className="font-mono text-slate-300 font-medium">
                        {formatMoney(metrics.sellPriceSgd, metrics.sellPriceUsd)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Premium Above Spot:</span>
                      {offer ? (
                        <span className="font-mono font-bold text-rose-300">
                          <span className="line-through text-slate-500 mr-1 text-xs">+{offer.originalPremiumPct}%</span>
                          +{metrics.premiumPct}%
                        </span>
                      ) : (
                        <span className="font-mono text-emerald-400 font-bold">
                          +{metrics.premiumPct}%
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Buy-Sell Spread:</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {metrics.spreadPct}%
                      </span>
                    </div>
                  </div>

                  {/* Bulk Quantity Discount Schedule */}
                  {product.prices[rid].bulkTiers && product.prices[rid].bulkTiers!.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 mb-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bulk Volume Discount Schedule</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl overflow-hidden text-xs">
                        <div className="grid grid-cols-3 bg-slate-800/80 px-3 py-1.5 font-bold text-slate-300 border-b border-slate-700/80 text-[11px]">
                          <span>Volume Tier</span>
                          <span>Unit Price</span>
                          <span className="text-right">Unit Savings</span>
                        </div>
                        {product.prices[rid].bulkTiers!.map((tier, idx) => (
                          <div
                            key={idx}
                            className={`grid grid-cols-3 px-3 py-1.5 font-mono text-[11px] items-center ${
                              idx % 2 === 1 ? 'bg-slate-800/30' : ''
                            }`}
                          >
                            <span className="text-slate-200 font-sans font-medium">{tier.label} ({tier.minQty}+ units)</span>
                            <span className="text-amber-300 font-bold">
                              {formatMoney(tier.bulkBuyPriceSgd, tier.bulkBuyPriceUsd)}
                            </span>
                            <span className="text-right text-emerald-400 font-bold">
                              -{currency === 'USD' ? `$${tier.discountPerUnitUsd.toFixed(2)}` : `S$${tier.discountPerUnitSgd.toFixed(2)}`}/unit
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => openRetailerListing(rid, product, e)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm ${
                        offer
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 border border-rose-400'
                          : isBest
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Order at {ret.name}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </button>

                    <button
                      onClick={() => {
                        onAddToCart(product.id, rid);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to Calc</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & explicit close button */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="bg-slate-800/60 p-2.5 rounded-xl text-xs text-slate-400 flex items-center space-x-2 flex-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Qualifies for 0% GST (Investment Precious Metals IPM) tax exemption in Singapore.</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onComparePremiums && (
              <button
                onClick={() => {
                  const pm = productMetrics;
                  onClose();
                  onComparePremiums(pm);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center space-x-1.5"
              >
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>Compare Chart</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
