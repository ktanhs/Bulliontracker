import React from 'react';
import { ProductFilter, MetalType, FormFactor } from '../types';
import { MANUFACTURERS } from '../data/bullionData';
import { Search, LayoutGrid, Table, ArrowUpDown, Scale, Tag, X, RefreshCw, Flame, Store, Building2, ShieldCheck, Layers, ShoppingCart, DollarSign } from 'lucide-react';

interface FilterControlsProps {
  filter: ProductFilter;
  setFilter: React.Dispatch<React.SetStateAction<ProductFilter>>;
  viewMode: 'table' | 'grid';
  setViewMode: (v: 'table' | 'grid') => void;
  totalProductsCount: number;
  priceDisplayMode?: 'BUY' | 'SELL_BACK' | 'BOTH';
  setPriceDisplayMode?: (mode: 'BUY' | 'SELL_BACK' | 'BOTH') => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  totalProductsCount,
  priceDisplayMode = 'BUY',
  setPriceDisplayMode,
}) => {
  const isAnyFilterActive =
    filter.metal !== 'ALL' ||
    filter.formFactor !== 'ALL' ||
    filter.weightRange !== 'ALL' ||
    (filter.manufacturer && filter.manufacturer !== 'ALL') ||
    (filter.barType && filter.barType !== 'ALL') ||
    Boolean(filter.lbmaOnly) ||
    Boolean(filter.specialOffersOnly) ||
    Boolean(filter.bulkDealsOnly) ||
    filter.searchQuery.trim() !== '' ||
    filter.nameQuery.trim() !== '' ||
    filter.weightQuery.trim() !== '';

  const handleClearAll = () => {
    setFilter((prev) => ({
      ...prev,
      metal: 'ALL',
      formFactor: 'ALL',
      weightRange: 'ALL',
      manufacturer: 'ALL',
      barType: 'ALL',
      lbmaOnly: false,
      specialOffersOnly: false,
      bulkDealsOnly: false,
      searchQuery: '',
      nameQuery: '',
      weightQuery: '',
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm space-y-4 overflow-hidden max-w-full">
      {/* Search Bar Row: Separate fields for Product Name & Specific Weight */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Product Name Search */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Search by Product Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="name-search-input"
              type="text"
              placeholder="e.g. Maple Leaf, Eagle, PAMP, Sovereign, Dragon..."
              value={filter.nameQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, nameQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
            {filter.nameQuery && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, nameQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Weight / Size Search */}
        <div className="md:col-span-4 relative">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Scale className="w-3 h-3 text-indigo-400" />
            Search by Weight / Size
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="weight-search-input"
              type="text"
              placeholder="e.g. 1oz, 1kg, 100g, 10oz, 1/10oz, 30g, 1000oz..."
              value={filter.weightQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, weightQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 font-mono"
            />
            {filter.weightQuery && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, weightQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Keyword Search */}
        <div className="md:col-span-3 relative">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            General Keyword / Mint
          </label>
          <div className="relative">
            <input
              id="general-search-input"
              type="text"
              placeholder="e.g. Perth, Valcambi, .9999..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {filter.searchQuery && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Search Chips for Popular Coin Brands */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-400">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <span>🪙</span> Coins:
        </span>
        {[
          { label: 'Lunar Snake (2025)', query: 'Snake', formFactor: 'Coin' as FormFactor },
          { label: 'Lunar Dragon (2024)', query: 'Dragon', formFactor: 'Coin' as FormFactor },
          { label: 'All Lunar Coins', query: 'Lunar', formFactor: 'Coin' as FormFactor },
          { label: 'Perth Mint Coins', query: 'Perth Mint', formFactor: 'Coin' as FormFactor },
          { label: 'RCM Coins', query: 'Royal Canadian Mint', formFactor: 'Coin' as FormFactor },
          { label: 'Maple Leaf', query: 'Maple Leaf', formFactor: 'Coin' as FormFactor },
          { label: 'American Eagle', query: 'American Eagle', formFactor: 'Coin' as FormFactor },
          { label: 'Britannia', query: 'Britannia', formFactor: 'Coin' as FormFactor },
          { label: 'Krugerrand', query: 'Krugerrand', formFactor: 'Coin' as FormFactor },
          { label: 'Sovereign', query: 'Sovereign', formFactor: 'Coin' as FormFactor },
          { label: 'Kangaroo', query: 'Kangaroo', formFactor: 'Coin' as FormFactor },
          { label: 'Philharmonic', query: 'Philharmonic', formFactor: 'Coin' as FormFactor },
          { label: 'Panda', query: 'Panda', formFactor: 'Coin' as FormFactor },
          { label: 'Libertad', query: 'Libertad', formFactor: 'Coin' as FormFactor },
          { label: 'Tudor Beasts', query: 'Tudor', formFactor: 'Coin' as FormFactor },
        ].map((tag) => {
          const isActive =
            (filter.nameQuery.toLowerCase() === tag.query.toLowerCase() || filter.searchQuery.toLowerCase() === tag.query.toLowerCase()) &&
            (filter.formFactor === 'ALL' || filter.formFactor === tag.formFactor);
          return (
            <button
              key={tag.label}
              onClick={() => {
                if (isActive) {
                  setFilter((prev) => ({ ...prev, nameQuery: '', searchQuery: '', formFactor: 'ALL' }));
                } else {
                  setFilter((prev) => ({ ...prev, nameQuery: tag.query, searchQuery: '', formFactor: tag.formFactor }));
                }
              }}
              className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all font-medium ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Quick Search Chips for Popular Bar Brands & Refinement */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-slate-400">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <span>🧱</span> Bars:
        </span>
        {[
          { label: 'Perth Mint Bars', query: 'Perth Mint', formFactor: 'Bar' as FormFactor },
          { label: 'Royal Canadian Mint (RCM) Bars', query: 'Royal Canadian Mint', formFactor: 'Bar' as FormFactor },
          { label: 'PAMP Fortuna', query: 'PAMP', formFactor: 'Bar' as FormFactor },
          { label: 'ABC Bullion', query: 'ABC', formFactor: 'Bar' as FormFactor },
          { label: 'Southern Cross', query: 'Southern Cross', formFactor: 'Bar' as FormFactor },
          { label: 'Valcambi', query: 'Valcambi', formFactor: 'Bar' as FormFactor },
          { label: 'CombiBar', query: 'CombiBar', formFactor: 'Bar' as FormFactor },
          { label: 'Argor-Heraeus', query: 'Argor', formFactor: 'Bar' as FormFactor },
          { label: 'Kinebar', query: 'Kinebar', formFactor: 'Bar' as FormFactor },
          { label: 'Heraeus', query: 'Heraeus', formFactor: 'Bar' as FormFactor },
          { label: 'Metalor', query: 'Metalor', formFactor: 'Bar' as FormFactor },
          { label: 'Nadir', query: 'Nadir', formFactor: 'Bar' as FormFactor },
          { label: 'Credit Suisse', query: 'Credit Suisse', formFactor: 'Bar' as FormFactor },
          { label: 'Asahi', query: 'Asahi', formFactor: 'Bar' as FormFactor },
          { label: 'Geiger', query: 'Geiger', formFactor: 'Bar' as FormFactor },
          { label: 'Scottsdale', query: 'Scottsdale', formFactor: 'Bar' as FormFactor },
          { label: 'Cast Bars', query: 'Cast', formFactor: 'Bar' as FormFactor },
          { label: 'Minted Bars', query: 'Minted', formFactor: 'Bar' as FormFactor },
        ].map((tag) => {
          const isActive =
            (filter.nameQuery.toLowerCase() === tag.query.toLowerCase() || filter.searchQuery.toLowerCase() === tag.query.toLowerCase()) &&
            (filter.formFactor === 'ALL' || filter.formFactor === tag.formFactor);
          return (
            <button
              key={tag.label}
              onClick={() => {
                if (isActive) {
                  setFilter((prev) => ({ ...prev, nameQuery: '', searchQuery: '', formFactor: 'ALL' }));
                } else {
                  setFilter((prev) => ({ ...prev, nameQuery: tag.query, searchQuery: '', formFactor: tag.formFactor }));
                }
              }}
              className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all font-medium ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-800/70">
        <div className="flex flex-wrap items-center gap-2">
          {/* Metal Filter */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-medium">
            {(['ALL', 'Gold', 'Silver'] as const).map((m) => (
              <button
                key={m}
                id={`filter-metal-${m.toLowerCase()}`}
                onClick={() => setFilter((prev) => ({ ...prev, metal: m }))}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter.metal === m
                    ? m === 'Gold'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : m === 'Silver'
                      ? 'bg-slate-300 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-700 text-amber-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'ALL' ? 'All Metals' : m}
              </button>
            ))}
          </div>

          {/* Form Factor & Bar Type Filter Tabs */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-medium flex-wrap gap-0.5">
            <button
              id="filter-form-all"
              onClick={() => setFilter((prev) => ({ ...prev, formFactor: 'ALL', barType: 'ALL' }))}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter.formFactor === 'ALL' && (filter.barType === 'ALL' || !filter.barType)
                  ? 'bg-slate-700 text-amber-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              id="filter-form-coin"
              onClick={() => setFilter((prev) => ({ ...prev, formFactor: 'Coin', barType: 'ALL' }))}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter.formFactor === 'Coin'
                  ? 'bg-slate-700 text-amber-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Coins
            </button>
            <button
              id="filter-form-cast-bar"
              onClick={() => setFilter((prev) => ({ ...prev, formFactor: 'Bar', barType: 'Cast' }))}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filter.formFactor === 'Bar' && filter.barType === 'Cast'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm ring-1 ring-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-amber-400">🧱</span> Cast Bars
            </button>
            <button
              id="filter-form-minted-bar"
              onClick={() => setFilter((prev) => ({ ...prev, formFactor: 'Bar', barType: 'Minted' }))}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filter.formFactor === 'Bar' && filter.barType === 'Minted'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm ring-1 ring-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-cyan-400">🪙</span> Minted Bars
            </button>
          </div>

          {/* Weight Range Pills */}
          <div className="flex flex-wrap bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-medium gap-0.5">
            {[
              { id: 'ALL', label: 'All Weights' },
              { id: 'fractional', label: '< 1 oz' },
              { id: '1oz', label: '1 oz' },
              { id: 'grams', label: '100g - 500g' },
              { id: '5to10oz', label: '2 oz - 10 oz' },
              { id: '1kg', label: '1 kg' },
              { id: 'heavy', label: '100 oz+' },
            ].map((w) => (
              <button
                key={w.id}
                id={`filter-weight-${w.id}`}
                onClick={() => setFilter((prev) => ({ ...prev, weightRange: w.id as any }))}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  filter.weightRange === w.id
                    ? 'bg-slate-700 text-amber-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Manufacturer / Mint Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Manufacturer:</span>
            <select
              id="filter-manufacturer-select"
              value={filter.manufacturer || 'ALL'}
              onChange={(e) => setFilter((prev) => ({ ...prev, manufacturer: e.target.value }))}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL" className="bg-slate-800 text-white">All Manufacturers / Mints</option>
              {MANUFACTURERS.map((mfg) => (
                <option key={mfg} value={mfg} className="bg-slate-800 text-white">
                  {mfg}
                </option>
              ))}
            </select>
          </div>

          {/* Bar Type (Cast vs Minted) Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Bar Type:</span>
            <select
              id="filter-bartype-select"
              value={filter.barType || 'ALL'}
              onChange={(e) => setFilter((prev) => ({ ...prev, barType: e.target.value as 'ALL' | 'Cast' | 'Minted' }))}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-800 text-white">All Bar Types</option>
              <option value="Cast" className="bg-slate-800 text-amber-300">Cast / Poured Bars</option>
              <option value="Minted" className="bg-slate-800 text-cyan-300">Minted / Pressed Bars</option>
            </select>
          </div>

          {/* LBMA Good Delivery Status Filter Pill */}
          <button
            id="filter-lbma-btn"
            onClick={() => setFilter((prev) => ({ ...prev, lbmaOnly: !prev.lbmaOnly }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filter.lbmaOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm ring-2 ring-emerald-500/30'
                : 'bg-slate-800/90 text-emerald-400 border-slate-700/80 hover:bg-slate-800 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${filter.lbmaOnly ? 'text-emerald-400 fill-emerald-500/20' : 'text-emerald-400'}`} />
            <span>LBMA Good Delivery</span>
          </button>

          {/* Special Offers / Strike-Off Discounts Toggle Pill */}
          <button
            id="filter-special-offers-btn"
            onClick={() => setFilter((prev) => ({ ...prev, specialOffersOnly: !prev.specialOffersOnly }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filter.specialOffersOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm ring-2 ring-rose-500/30'
                : 'bg-slate-800/90 text-rose-400 border-slate-700/80 hover:bg-slate-800 hover:text-rose-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${filter.specialOffersOnly ? 'text-rose-400 fill-rose-400 animate-pulse' : 'text-rose-400'}`} />
            <span>🏷️ Strike-Off Discounts</span>
          </button>

          {/* Bulk Tier Specials Toggle Pill */}
          <button
            id="filter-bulk-deals-btn"
            onClick={() => setFilter((prev) => ({ ...prev, bulkDealsOnly: !prev.bulkDealsOnly }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filter.bulkDealsOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm ring-2 ring-amber-500/30'
                : 'bg-slate-800/90 text-amber-400 border-slate-700/80 hover:bg-slate-800 hover:text-amber-300'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${filter.bulkDealsOnly ? 'text-amber-400' : 'text-amber-400'}`} />
            <span>Bulk Volume Specials</span>
          </button>

          {isAnyFilterActive && (
            <button
              id="clear-all-filters-btn"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort & View Mode Switcher + Sell-Back Comparison Toggle Tab */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full lg:w-auto">
          {/* Price & Sell-Back Comparison Toggle Tab */}
          {setPriceDisplayMode && (
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-700/80 shadow-inner overflow-x-auto scrollbar-none">
              <button
                id="mode-toggle-buy-btn"
                onClick={() => setPriceDisplayMode('BUY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  priceDisplayMode === 'BUY'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="View customer online buy prices and retail shop counter prices"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>🛒 Buy Prices & Premiums</span>
              </button>

              <button
                id="mode-toggle-sell-btn"
                onClick={() => setPriceDisplayMode('SELL_BACK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  priceDisplayMode === 'SELL_BACK'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="View retailer buyback payout prices and sell-back premiums over spot"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>💰 Sell-Back Prices & Premiums</span>
              </button>

              <button
                id="mode-toggle-both-btn"
                onClick={() => setPriceDisplayMode('BOTH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  priceDisplayMode === 'BOTH'
                    ? 'bg-indigo-500 text-white shadow-md ring-1 ring-indigo-400 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="View side-by-side Buy Ask Price vs Sell Bid Price and net spread"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>⚖️ Buy vs Sell Spread</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2.5 justify-between sm:justify-end">
            <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                id="sort-by-select"
                value={filter.sortBy}
                onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
              >
                <option value="weightDesc" className="bg-slate-800 text-amber-300 font-bold">Weight (Heavy to Light ⚖️)</option>
                <option value="weightAsc" className="bg-slate-800 text-amber-300 font-bold">Weight (Light to Heavy ⚖️)</option>
                <option value="lowestPremium" className="bg-slate-800 text-white">Lowest Buy Premium %</option>
                <option value="lowestSpread" className="bg-slate-800 text-white">Lowest Buy-Sell Spread</option>
                <option value="lowestBuyPrice" className="bg-slate-800 text-white">Lowest Buy Price</option>
                <option value="name" className="bg-slate-800 text-white">Product Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <button
                id="view-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Table Matrix View"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1">
        <span>
          Showing <strong className="text-amber-400">{totalProductsCount}</strong> bullion products across Silver Bullion, BullionStar, & LPM
        </span>
        <span className="text-amber-300 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span>Retail Shop Walk-In Prices shown on top of Online Ask Prices</span>
        </span>
      </div>
    </div>
  );
};

