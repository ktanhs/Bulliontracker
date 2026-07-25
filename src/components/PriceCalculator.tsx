import React, { useState } from 'react';
import { ComputedProductMetrics, Currency, PortfolioCalculatorItem, RetailerId } from '../types';
import { RETAILERS } from '../data/bullionData';
import { Calculator, Plus, Trash2, PiggyBank, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface PriceCalculatorProps {
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  cartItems: PortfolioCalculatorItem[];
  setCartItems: React.Dispatch<React.SetStateAction<PortfolioCalculatorItem[]>>;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  computedProducts,
  currency,
  cartItems,
  setCartItems,
}) => {
  const [selectedProductForAdd, setSelectedProductForAdd] = useState<string>(
    computedProducts[0]?.product.id || ''
  );
  const [addQty, setAddQty] = useState<number | string>(1);

  const handleAddItem = () => {
    if (!selectedProductForAdd) return;
    const qtyNumber = Math.max(1, parseInt(String(addQty), 10) || 1);
    const existingIndex = cartItems.findIndex((i) => i.productId === selectedProductForAdd);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += qtyNumber;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        { productId: selectedProductForAdd, quantity: qtyNumber, retailerId: 'silverbullion' },
      ]);
    }
    setAddQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index: number, val: string) => {
    const updated = [...cartItems];
    if (val === '') {
      updated[index].quantity = '' as any;
    } else {
      const parsed = parseInt(val, 10);
      updated[index].quantity = isNaN(parsed) ? 1 : Math.max(0, parsed);
    }
    setCartItems(updated);
  };

  const handleQtyBlur = (index: number) => {
    const updated = [...cartItems];
    if (!updated[index].quantity || updated[index].quantity < 1) {
      updated[index].quantity = 1;
    }
    setCartItems(updated);
  };

  // Calculate totals for each retailer across all items in cart
  const retailerTotals: Record<RetailerId, { buySgd: number; buyUsd: number; sellSgd: number; sellUsd: number }> = {
    silverbullion: { buySgd: 0, buyUsd: 0, sellSgd: 0, sellUsd: 0 },
    bullionstar:    { buySgd: 0, buyUsd: 0, sellSgd: 0, sellUsd: 0 },
    lpm:            { buySgd: 0, buyUsd: 0, sellSgd: 0, sellUsd: 0 },
  };

  let totalWeightGoldOz = 0;
  let totalWeightSilverOz = 0;
  let totalMeltSpotSgd = 0;
  let totalMeltSpotUsd = 0;

  cartItems.forEach((ci) => {
    const cp = computedProducts.find((p) => p.product.id === ci.productId);
    if (!cp) return;

    if (cp.product.metal === 'Gold') {
      totalWeightGoldOz += cp.product.weightOz * ci.quantity;
    } else {
      totalWeightSilverOz += cp.product.weightOz * ci.quantity;
    }

    totalMeltSpotSgd += cp.spotValueSgd * ci.quantity;
    totalMeltSpotUsd += cp.spotValueUsd * ci.quantity;

    (['silverbullion', 'bullionstar', 'lpm'] as RetailerId[]).forEach((rid) => {
      const rm = cp.retailerMetrics[rid];
      retailerTotals[rid].buySgd += rm.buyPriceSgd * ci.quantity;
      retailerTotals[rid].buyUsd += rm.buyPriceUsd * ci.quantity;
      retailerTotals[rid].sellSgd += rm.sellPriceSgd * ci.quantity;
      retailerTotals[rid].sellUsd += rm.sellPriceUsd * ci.quantity;
    });
  });

  // Find lowest total buy cost among the 3 retailers
  const retailerIds: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];
  let cheapestRetailerId: RetailerId = 'silverbullion';
  let cheapestCostSgd = Infinity;
  let mostExpensiveCostSgd = -Infinity;

  retailerIds.forEach((rid) => {
    const cost = retailerTotals[rid].buySgd;
    if (cost < cheapestCostSgd) {
      cheapestCostSgd = cost;
      cheapestRetailerId = rid;
    }
    if (cost > mostExpensiveCostSgd) {
      mostExpensiveCostSgd = cost;
    }
  });

  const maxSavingsSgd = mostExpensiveCostSgd - cheapestCostSgd;
  const maxSavingsUsd = (mostExpensiveCostSgd - cheapestCostSgd) / (totalMeltSpotSgd > 0 ? (totalMeltSpotSgd / totalMeltSpotUsd) : 1.348);

  const formatMoney = (valSgd: number, valUsd: number) => {
    if (currency === 'SGD') return `S$${valSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (currency === 'USD') return `$${valUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `S$${valSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${valUsd.toFixed(2)} USD)`;
  };

  return (
    <div className="space-y-6" id="price-calculator-wrapper">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Bullion Order & Savings Calculator</h2>
            <p className="text-xs text-slate-400">
              Build a custom order or portfolio basket and instantly compare total purchase cost & savings across Silver Bullion, BullionStar & LPM
            </p>
          </div>
        </div>

        {/* Add Item Controls */}
        <div className="mt-5 p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Select Bullion Bar / Coin:</label>
            <select
              id="calc-product-select"
              value={selectedProductForAdd}
              onChange={(e) => setSelectedProductForAdd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {computedProducts.map((p) => (
                <option key={p.product.id} value={p.product.id} className="bg-slate-900 text-white">
                  [{p.product.metal}] {p.product.name} - ({p.product.weightOz} oz)
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-28">
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Quantity:</label>
            <input
              id="calc-qty-input"
              type="number"
              min="1"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              onBlur={() => setAddQty((prev) => Math.max(1, parseInt(String(prev), 10) || 1))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="w-full sm:w-auto self-end">
            <button
              id="calc-add-btn"
              onClick={handleAddItem}
              className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basket Items */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-200 text-base mb-3 flex items-center justify-between">
              <span>Your Selected Items</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-amber-400 font-mono">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} pcs
              </span>
            </h3>

            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                No items added yet. Choose a bar or coin above to compare total order cost!
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {cartItems.map((ci, index) => {
                  const cp = computedProducts.find((p) => p.product.id === ci.productId);
                  if (!cp) return null;

                  return (
                    <div
                      key={`${ci.productId}-${index}`}
                      className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {cp.product.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {cp.product.weightOz} oz ({cp.product.metal})
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={ci.quantity}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          onBlur={() => handleQtyBlur(index)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded-lg py-1 px-1 text-center text-xs font-bold text-slate-100 font-mono"
                        />
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Basket Summary Stats */}
          {cartItems.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Gold Weight:</span>
                <strong className="text-amber-400 font-mono">{totalWeightGoldOz.toFixed(2)} oz</strong>
              </div>
              <div className="flex justify-between">
                <span>Silver Weight:</span>
                <strong className="text-slate-300 font-mono">{totalWeightSilverOz.toFixed(2)} oz</strong>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold">
                <span>Pure Melt Spot Value:</span>
                <strong className="text-emerald-400 font-mono">{formatMoney(totalMeltSpotSgd, totalMeltSpotUsd)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3-Retailer Side-by-Side Cost Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length > 0 && maxSavingsSgd > 0 && (
            <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    Max Retailer Savings Identified
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono">
                    Save {formatMoney(maxSavingsSgd, maxSavingsUsd)} on this order
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Best Deal at:</span>
                <div className="text-sm font-bold text-amber-300">
                  {RETAILERS[cheapestRetailerId].name}
                </div>
              </div>
            </div>
          )}

          {/* Retailer Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {retailerIds.map((rid) => {
              const ret = RETAILERS[rid];
              const tot = retailerTotals[rid];
              const isCheapest = rid === cheapestRetailerId && cartItems.length > 0;
              const premiumSgd = tot.buySgd - totalMeltSpotSgd;
              const premiumPct = totalMeltSpotSgd > 0 ? (premiumSgd / totalMeltSpotSgd) * 100 : 0;

              return (
                <div
                  key={rid}
                  className={`bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCheapest
                      ? 'border-emerald-500/80 bg-emerald-950/10 ring-2 ring-emerald-500/20 shadow-xl'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${ret.badgeBg}`}>
                        {ret.shortName}
                      </span>
                      {isCheapest && (
                        <span className="flex items-center space-x-1 text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>LOWEST COST</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mb-1">Total Buy Price:</div>
                    <div className="text-2xl font-extrabold text-white font-mono mb-4">
                      {formatMoney(tot.buySgd, tot.buyUsd)}
                    </div>

                    <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Melt Spot Value:</span>
                        <span className="font-mono text-slate-300">{formatMoney(totalMeltSpotSgd, totalMeltSpotUsd)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Premium Paid:</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          +{premiumPct.toFixed(2)}% ({formatMoney(premiumSgd, premiumSgd / 1.348)})
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2">
                        <span className="text-slate-400">Sell-back Payout:</span>
                        <span className="font-mono text-slate-200 font-semibold">{formatMoney(tot.sellSgd, tot.sellUsd)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ret.vatGstInfo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
