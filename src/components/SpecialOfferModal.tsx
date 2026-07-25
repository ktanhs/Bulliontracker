import React, { useState, useEffect } from 'react';
import { Product, RetailerId, SpecialOffer, Currency } from '../types';
import { RETAILERS } from '../data/bullionData';
import {
  X,
  ExternalLink,
  Flame,
  Clock,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  PlusCircle,
  ShoppingBag,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

interface SpecialOfferModalProps {
  deal: {
    product: Product;
    retailerId: RetailerId;
    offer: SpecialOffer;
  } | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (productId: string, retailerId: RetailerId) => void;
}

export const SpecialOfferModal: React.FC<SpecialOfferModalProps> = ({
  deal,
  currency,
  onClose,
  onAddToCart,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showDirectCheckout, setShowDirectCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!deal) return null;

  const { product, retailerId, offer } = deal;
  const retailer = RETAILERS[retailerId];

  const handleCopyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleOpenRetailerSite = () => {
    const url = offer.dealUrl || retailer.website;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const unitPriceSgd = offer.promoBuyPriceSgd;
  const unitPriceUsd = offer.promoBuyPriceUsd;
  const totalPriceSgd = unitPriceSgd * orderQuantity;
  const totalPriceUsd = unitPriceUsd * orderQuantity;
  const totalSavingsSgd = offer.savingsSgd * orderQuantity;

  const formatPrice = (sgd: number, usd: number) => {
    if (currency === 'USD') {
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `S$${sgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${usd.toFixed(2)})`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/50 rounded-3xl shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-amber-600 to-rose-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 fill-white animate-pulse" />
            <span>Verified Special Dealer Deal</span>
            {offer.expiresIn && (
              <span className="bg-black/30 text-amber-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {offer.expiresIn}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {offer.title}
          </h2>

          <div className="mt-2 flex items-center space-x-2 text-xs">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg font-semibold text-white border border-white/20">
              Retailer: {retailer.name}
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded-lg font-mono font-bold text-emerald-300">
              {offer.badgeText}
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">
          {/* Product Overview Card */}
          <div className="flex items-center space-x-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {product.metal} {product.formFactor}
                </span>
                <span className="text-slate-400 text-xs font-medium">{product.mint}</span>
              </div>
              <h3 className="text-lg font-bold text-white truncate">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Weight: {product.weightOz} oz ({product.weightGrams}g) • Purity: {product.purity} fine
              </p>
            </div>
          </div>

          {/* Pricing & Savings Spotlight */}
          <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/40 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
                  Regular Dealer Ask Price
                </span>
                <div className="text-base text-slate-400 line-through font-mono">
                  {formatPrice(offer.originalBuyPriceSgd, offer.originalBuyPriceUsd)}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Regular Premium: +{offer.originalPremiumPct}%
                </span>
              </div>

              <div>
                <span className="text-xs text-amber-400 font-bold uppercase block mb-1 flex items-center justify-center sm:justify-start gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Special Deal Price
                </span>
                <div className="text-2xl font-black text-rose-300 font-mono">
                  {formatPrice(offer.promoBuyPriceSgd, offer.promoBuyPriceUsd)}
                </div>
                <span className="text-xs text-rose-300 font-bold font-mono">
                  Discounted Premium: +{offer.promoPremiumPct}%
                </span>
              </div>
            </div>

            {/* Total Savings Highlight Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase">Instant Customer Savings</div>
                  <div className="text-xs text-slate-300">
                    S${offer.savingsSgd.toFixed(2)} cheaper than standard retail price
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-lg font-black text-emerald-400">
                SAVE S${offer.savingsSgd.toFixed(2)}
              </div>
            </div>

            {/* Promo Code Copy Row */}
            {offer.code && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">Dealer Promo Code:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {offer.code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {offer.description && (
              <p className="text-xs text-slate-300 italic border-t border-slate-800 pt-3">
                "{offer.description}"
              </p>
            )}
          </div>

          {/* Retailer Info & Compliance */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-400">Location:</span>
              <span>{retailer.location}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-400">Tax Status:</span>
              <span className="text-emerald-300 font-medium">{retailer.vatGstInfo}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-400">Payment Accepted:</span>
              <span className="text-slate-200">{retailer.paymentMethods.join(', ')}</span>
            </div>
          </div>

          {/* Embedded Direct Order Simulator Option */}
          {showDirectCheckout ? (
            <div className="bg-slate-800/90 border border-amber-500/50 p-4 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                Direct Retailer Purchase Portal ({retailer.name})
              </h4>

              {orderConfirmed ? (
                <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-base font-bold text-emerald-300">Special Offer Order Locked!</div>
                  <p className="text-xs text-slate-300">
                    Order for <strong>{orderQuantity}x {product.name}</strong> at <strong>{formatPrice(totalPriceSgd, totalPriceUsd)}</strong> has been reserved with code <span className="font-mono text-amber-300">{offer.code || 'SPECIAL'}</span>.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleOpenRetailerSite}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 mx-auto"
                    >
                      <span>Complete Checkout at {retailer.shortName} Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Select Order Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-amber-300 px-2">{orderQuantity}</span>
                      <button
                        onClick={() => setOrderQuantity((q) => q + 1)}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Promo Price per Item:</span>
                      <span>{formatPrice(unitPriceSgd, unitPriceUsd)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Total Savings:</span>
                      <span>S${totalSavingsSgd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                      <span>Total Purchase Amount:</span>
                      <span>{formatPrice(totalPriceSgd, totalPriceUsd)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderConfirmed(true)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-colors"
                    >
                      Lock In Special Deal & Purchase
                    </button>
                    <button
                      onClick={() => setShowDirectCheckout(false)}
                      className="px-3 py-2.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleOpenRetailerSite}
              className="w-full sm:flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Visit {retailer.name} Deal Page</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {!showDirectCheckout && (
              <button
                onClick={() => setShowDirectCheckout(true)}
                className="w-full sm:w-auto py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Quick Buy Simulator</span>
              </button>
            )}

            <button
              onClick={() => {
                onAddToCart(product.id, retailerId);
                onClose();
              }}
              className="w-full sm:w-auto py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Add to Savings Calc</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>

          <div className="text-[11px] text-center text-slate-500">
            Clicking "Visit {retailer.name} Deal Page" opens the official retailer portal in a new tab with promo code pre-filled.
          </div>
        </div>
      </div>
    </div>
  );
};
