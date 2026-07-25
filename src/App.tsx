import React, { useState, useEffect, useMemo } from 'react';
import {
  Currency,
  ProductFilter,
  SpotPrices,
  Product,
  ComputedProductMetrics,
  PortfolioCalculatorItem,
  RetailerId,
  PriceAlert,
  TriggeredAlertNotification,
  SpecialOffer,
  RetailerPrice,
  RetailerApiStatus,
} from './types';
import { DEFAULT_SPOT_PRICES, generateProductsWithPrices, computeProductMetrics, RETAILERS } from './data/bullionData';
import { fetchLivePrices, updateCustomSpotPrices } from './services/api';
import { Header } from './components/Header';
import { SpotPriceTicker } from './components/SpotPriceTicker';
import { FilterControls } from './components/FilterControls';
import { ProductComparisonTable } from './components/ProductComparisonTable';
import { ProductCardGrid } from './components/ProductCardGrid';
import { PriceCalculator } from './components/PriceCalculator';
import { SpotChartSection } from './components/SpotChartSection';
import { RetailerInfoSection } from './components/RetailerInfoSection';
import { GeminiMarketInsights } from './components/GeminiMarketInsights';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SpecialOfferModal } from './components/SpecialOfferModal';
import { SpecialOffersTicker } from './components/SpecialOffersTicker';
import { SetPriceAlertModal } from './components/SetPriceAlertModal';
import { PriceAlertsManagerModal } from './components/PriceAlertsManagerModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { ComparePremiumsView } from './components/ComparePremiumsView';
import { MarketSentimentModal } from './components/MarketSentimentModal';
import { RetailerApiStatusModal } from './components/RetailerApiStatusModal';


export default function App() {
  const [spotPrices, setSpotPrices] = useState<SpotPrices>(DEFAULT_SPOT_PRICES);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User preferences
  const [currency, setCurrency] = useState<Currency>('BOTH');
  const [weightUnit, setWeightUnit] = useState<'oz' | 'g' | 'kg'>('oz');
  const [activeTab, setActiveTab] = useState<'comparison' | 'comparePremiums' | 'calculator' | 'charts' | 'retailers' | 'insights'>(
    'comparison'
  );
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Compare premiums product modal / view selection
  const [compareModalProduct, setCompareModalProduct] = useState<ComputedProductMetrics | null>(null);
  const [selectedCompareProductId, setSelectedCompareProductId] = useState<string>('');

  // Filter state
  const [filter, setFilter] = useState<ProductFilter>({
    metal: 'ALL',
    formFactor: 'ALL',
    weightRange: 'ALL',
    manufacturer: 'ALL',
    barType: 'ALL',
    lbmaOnly: false,
    searchQuery: '',
    nameQuery: '',
    weightQuery: '',
    sortBy: 'lowestPremium',
    sortOrder: 'asc',
  });

  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<ComputedProductMetrics | null>(null);

  // Market Sentiment pop-up modal
  const [isMarketSentimentOpen, setIsMarketSentimentOpen] = useState<boolean>(false);

  // Retailer Website API status state & modal
  const [apiStatuses, setApiStatuses] = useState<RetailerApiStatus[]>([]);
  const [isApiStatusModalOpen, setIsApiStatusModalOpen] = useState<boolean>(false);

  // Selected special offer deal modal

  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<{
    product: Product;
    retailerId: RetailerId;
    offer: SpecialOffer;
  } | null>(null);

  const handleSelectSpecialOffer = (product: Product, retailerId: RetailerId, offer: SpecialOffer) => {
    setSelectedSpecialOffer({ product, retailerId, offer });
  };

  // Order calculator items
  const [cartItems, setCartItems] = useState<PortfolioCalculatorItem[]>([
    { productId: 'gold-maple-1oz', quantity: 1, retailerId: 'silverbullion' },
    { productId: 'silver-bar-1kg', quantity: 2, retailerId: 'silverbullion' },
  ]);

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('bullion_price_alerts_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse price alerts', e);
      }
    }
    return [
      {
        id: 'alert-default-1',
        productId: 'gold-maple-1oz',
        targetValue: 3850,
        targetCurrency: 'SGD',
        alertType: 'BUY_PRICE',
        condition: 'BELOW',
        active: true,
        createdAt: new Date().toISOString(),
        triggeredCount: 0,
        note: 'Target buy price for 1oz Gold Maple',
      },
      {
        id: 'alert-default-2',
        productId: 'silver-eagle-1oz',
        targetValue: 18.0,
        targetCurrency: 'SGD',
        alertType: 'PREMIUM_PCT',
        condition: 'BELOW',
        active: true,
        createdAt: new Date().toISOString(),
        triggeredCount: 0,
        note: 'Alert when Silver Eagle premium drops below 18%',
      },
    ];
  });

  const [triggeredNotifications, setTriggeredNotifications] = useState<TriggeredAlertNotification[]>([]);
  const [triggeredHistory, setTriggeredHistory] = useState<TriggeredAlertNotification[]>([]);
  const [createAlertProduct, setCreateAlertProduct] = useState<ComputedProductMetrics | null>(null);
  const [isAlertsManagerOpen, setIsAlertsManagerOpen] = useState<boolean>(false);

  // Save alerts to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('bullion_price_alerts_v1', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Load initial prices on mount
  const loadPrices = async (isManualRefresh: boolean = false) => {
    setIsRefreshing(true);
    try {
      const data = await fetchLivePrices(isManualRefresh);
      setSpotPrices(data.spotPrices);
      setRawProducts(data.products);
      if (data.retailerApiStatus) {
        setApiStatuses(data.retailerApiStatus);
      }
    } catch (e) {
      // Fallback generator
      const fallbackProds = generateProductsWithPrices(DEFAULT_SPOT_PRICES);
      setRawProducts(fallbackProds);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrices(false);
  }, []);

  const handleCustomSpotUpdate = async (custom: {
    goldUsdPerOz: number;
    silverUsdPerOz: number;
    usdToSgdRate: number;
  }) => {
    setIsRefreshing(true);
    try {
      const data = await updateCustomSpotPrices(custom);
      setSpotPrices(data.spotPrices);
      setRawProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compute metrics for raw products
  const allComputedProducts = useMemo(() => {
    if (rawProducts.length === 0) {
      const defaultProds = generateProductsWithPrices(spotPrices);
      return computeProductMetrics(defaultProds, spotPrices);
    }
    return computeProductMetrics(rawProducts, spotPrices);
  }, [rawProducts, spotPrices]);

  // Set of product IDs with active alerts for quick badge highlighting
  const activeAlertProductIds = useMemo(() => {
    const set = new Set<string>();
    priceAlerts.forEach((a) => {
      if (a.active) set.add(a.productId);
    });
    return set;
  }, [priceAlerts]);

  // Evaluate Price Alerts whenever allComputedProducts or spotPrices change
  useEffect(() => {
    if (allComputedProducts.length === 0) return;

    const newlyTriggered: TriggeredAlertNotification[] = [];

    priceAlerts.forEach((alert) => {
      if (!alert.active) return;

      const item = allComputedProducts.find((p) => p.product.id === alert.productId);
      if (!item) return;

      const bestRid = item.bestBuyRetailerId;
      const targetRid = (alert.retailerId && alert.retailerId !== 'ANY') ? alert.retailerId : bestRid;
      const metric = item.retailerMetrics[targetRid];
      if (!metric) return;

      let currentValue = 0;
      if (alert.alertType === 'BUY_PRICE') {
        currentValue = alert.targetCurrency === 'USD' ? metric.buyPriceUsd : metric.buyPriceSgd;
      } else {
        currentValue = metric.premiumPct;
      }

      const isConditionMet =
        alert.condition === 'BELOW' ? currentValue <= alert.targetValue : currentValue >= alert.targetValue;

      if (isConditionMet) {
        const notifId = `${alert.id}-${Date.now()}`;
        const newNotif: TriggeredAlertNotification = {
          id: notifId,
          alert,
          productName: item.product.name,
          productImageUrl: item.product.imageUrl,
          retailerName: targetRid === 'silverbullion' ? 'Silver Bullion' : targetRid === 'bullionstar' ? 'BullionStar' : 'LPM Group',
          currentValue,
          targetValue: alert.targetValue,
          triggeredAt: new Date().toISOString(),
        };

        newlyTriggered.push(newNotif);
      }
    });

    if (newlyTriggered.length > 0) {
      setTriggeredNotifications((prev) => {
        const existingAlertIds = new Set(prev.map((n) => n.alert.id));
        const filteredNew = newlyTriggered.filter((n) => !existingAlertIds.has(n.alert.id));
        return [...filteredNew, ...prev];
      });

      setTriggeredHistory((prev) => [...newlyTriggered, ...prev]);
    }
  }, [allComputedProducts, priceAlerts]);

  const handleSaveAlert = (newAlertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggeredCount'>) => {
    const newAlert: PriceAlert = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggeredCount: 0,
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
  };

  const handleToggleAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDismissNotification = (id: string) => {
    setTriggeredNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSimulatePriceDip = () => {
    const newGold = Math.round(spotPrices.goldUsdPerOz * 0.97 * 100) / 100;
    const newSilver = Math.round(spotPrices.silverUsdPerOz * 0.97 * 100) / 100;
    handleCustomSpotUpdate({
      goldUsdPerOz: newGold,
      silverUsdPerOz: newSilver,
      usdToSgdRate: spotPrices.usdToSgdRate,
    });
  };

  const handleSelectProductById = (productId: string) => {
    const found = allComputedProducts.find((p) => p.product.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  // Search text normalizer for forgiving search (handles common spellings like heraus -> heraeus)
  const normalizeSearchText = (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/heraus/g, 'heraeus')
      .replace(/herause/g, 'heraeus')
      .replace(/heraous/g, 'heraeus')
      .replace(/[\-\_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Apply search & filters
  const filteredProducts = useMemo(() => {
    return allComputedProducts
      .filter((item) => {
        const p = item.product;

        // Metal filter
        if (filter.metal !== 'ALL' && p.metal !== filter.metal) return false;

        // Form factor filter
        if (filter.formFactor !== 'ALL' && p.formFactor !== filter.formFactor) return false;

        // Special offers filter
        if (filter.specialOffersOnly && !item.hasSpecialOffer) return false;

        // Bulk volume specials filter
        if (filter.bulkDealsOnly) {
          const hasBulk = Object.values(p.prices).some((price: RetailerPrice) => price.bulkSavingsPerUnitSgd && price.bulkSavingsPerUnitSgd > 0);
          if (!hasBulk) return false;
        }

        // Manufacturer filter
        if (filter.manufacturer && filter.manufacturer !== 'ALL') {
          const normFilterMfg = normalizeSearchText(filter.manufacturer);
          const normMfg = normalizeSearchText(p.manufacturer || '');
          const normMint = normalizeSearchText(p.mint);
          const normName = normalizeSearchText(p.name);

          const matchMfg =
            normMfg.includes(normFilterMfg) ||
            normMint.includes(normFilterMfg) ||
            normName.includes(normFilterMfg);

          if (!matchMfg) return false;
        }

        // LBMA Good Delivery filter
        if (filter.lbmaOnly && !p.isLbmaGoodDelivery) return false;

        // Cast vs Minted Bar Type filter
        if (filter.barType && filter.barType !== 'ALL') {
          if (p.formFactor !== 'Bar') return false;
          const actualBarType = p.barType || (p.name.toLowerCase().includes('cast') ? 'Cast' : 'Minted');
          if (actualBarType !== filter.barType) return false;
        }

        // Weight filter
        if (filter.weightRange === 'fractional' && p.weightOz >= 0.95) return false;
        if (filter.weightRange === '1oz' && Math.abs(p.weightOz - 1.0) > 0.05) return false;
        if (filter.weightRange === 'grams' && (p.weightGrams < 50 || p.weightGrams > 500)) return false;
        if (filter.weightRange === '5to10oz' && (p.weightOz < 2.0 || p.weightOz > 10.0)) return false;
        if (filter.weightRange === '1kg' && Math.abs(p.weightOz - 32.1507) > 1.0) return false;
        if (filter.weightRange === 'heavy' && p.weightOz < 90.0) return false;

        // Name filter (search specifically by product name, manufacturer, mint, or bar type)
        if (filter.nameQuery && filter.nameQuery.trim() !== '') {
          const normQ = normalizeSearchText(filter.nameQuery);
          const normName = normalizeSearchText(p.name);
          const normMint = normalizeSearchText(p.mint);
          const normMfg = normalizeSearchText(p.manufacturer || '');
          const tokens = normQ.split(' ').filter(Boolean);

          const matchTokens = tokens.every((token) => {
            return (
              normName.includes(token) ||
              normMint.includes(token) ||
              normMfg.includes(token) ||
              (token === 'cast' && (p.barType === 'Cast' || normName.includes('cast'))) ||
              (token === 'minted' && (p.barType === 'Minted' || normName.includes('minted')))
            );
          });

          if (!matchTokens) return false;
        }

        // Weight search filter (search specifically by weight string or numeric oz/g)
        if (filter.weightQuery && filter.weightQuery.trim() !== '') {
          const wq = filter.weightQuery.toLowerCase().trim();
          const ozStr = `${p.weightOz}`.toLowerCase();
          const ozWithUnit = `${p.weightOz}oz`;
          const ozWithSpace = `${p.weightOz} oz`;
          const gramStr = `${p.weightGrams}`.toLowerCase();
          const gramWithUnit = `${p.weightGrams}g`;
          const gramWithSpace = `${p.weightGrams} g`;

          const matchOz = ozStr.includes(wq) || ozWithUnit.includes(wq) || ozWithSpace.includes(wq);
          const matchGram = gramStr.includes(wq) || gramWithUnit.includes(wq) || gramWithSpace.includes(wq);

          // Common terms like "kg", "kilo", "gram", "gramme", "fractional", "oz", "ounce", "sovereign", "1000"
          let matchLabel = false;
          if (wq.includes('kg') || wq.includes('kilo')) matchLabel = Math.abs(p.weightOz - 32.1507) < 1.0;
          if (wq.includes('1000') || wq.includes('1000oz')) matchLabel = p.weightOz >= 900;
          if (wq.includes('sovereign')) matchLabel = p.name.toLowerCase().includes('sovereign');
          if (wq.includes('fractional')) matchLabel = p.weightOz < 0.95;

          if (!matchOz && !matchGram && !matchLabel) return false;
        }

        // General search query across product attributes, manufacturer & dealers
        if (filter.searchQuery && filter.searchQuery.trim() !== '') {
          const normQ = normalizeSearchText(filter.searchQuery);
          const normName = normalizeSearchText(p.name);
          const normMint = normalizeSearchText(p.mint);
          const normMfg = normalizeSearchText(p.manufacturer || '');
          const normPurity = normalizeSearchText(p.purity);
          const normForm = normalizeSearchText(p.formFactor);
          const normBarType = p.barType ? normalizeSearchText(p.barType) : '';
          const weightOzStr = `${p.weightOz}oz ${p.weightOz} oz`;
          const weightGramStr = `${p.weightGrams}g ${p.weightGrams} g`;

          const tokens = normQ.split(' ').filter(Boolean);

          const matchTokens = tokens.every((token) => {
            if (token === 'cast' || token === 'poured') return p.barType === 'Cast' || normName.includes('cast') || normName.includes('poured');
            if (token === 'minted' || token === 'pressed' || token === 'kinebar') return p.barType === 'Minted' || normName.includes('minted') || normName.includes('kinebar');
            if (token === 'gold') return p.metal === 'Gold';
            if (token === 'silver') return p.metal === 'Silver';
            if (token === 'bar' || token === 'bars') return p.formFactor === 'Bar';
            if (token === 'coin' || token === 'coins') return p.formFactor === 'Coin';
            if (token === 'lbma') return p.isLbmaGoodDelivery;

            const matchRetailer = (['silverbullion', 'bullionstar', 'lpm'] as RetailerId[]).some((rid) => {
              const ret = RETAILERS[rid];
              const isStocked = item.retailerMetrics[rid]?.inStock && item.retailerMetrics[rid]?.buyPriceSgd > 0;
              if (!isStocked) return false;
              return ret.name.toLowerCase().includes(token) || ret.shortName.toLowerCase().includes(token) || ret.id.toLowerCase().includes(token);
            });

            return (
              normName.includes(token) ||
              normMint.includes(token) ||
              normMfg.includes(token) ||
              normPurity.includes(token) ||
              normForm.includes(token) ||
              normBarType.includes(token) ||
              weightOzStr.includes(token) ||
              weightGramStr.includes(token) ||
              matchRetailer
            );
          });

          if (!matchTokens) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'lowestPremium') {
          return a.lowestPremiumPct - b.lowestPremiumPct;
        }
        if (filter.sortBy === 'lowestSpread') {
          return a.lowestSpreadPct - b.lowestSpreadPct;
        }
        if (filter.sortBy === 'lowestBuyPrice') {
          return a.retailerMetrics[a.bestBuyRetailerId].buyPriceSgd - b.retailerMetrics[b.bestBuyRetailerId].buyPriceSgd;
        }
        if (filter.sortBy === 'weight' || filter.sortBy === 'weightDesc') {
          return filter.sortOrder === 'asc'
            ? a.product.weightOz - b.product.weightOz
            : b.product.weightOz - a.product.weightOz;
        }
        if (filter.sortBy === 'weightAsc') {
          return a.product.weightOz - b.product.weightOz;
        }
        if (filter.sortBy === 'name') {
          return a.product.name.localeCompare(b.product.name);
        }
        return 0;
      });
  }, [allComputedProducts, filter]);

  const handleAddToCart = (productId: string, retailerId: RetailerId) => {
    const existingIndex = cartItems.findIndex((item) => item.productId === productId);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { productId, quantity: 1, retailerId }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* Top Header & Navigation */}
      <Header
        currency={currency}
        setCurrency={setCurrency}
        weightUnit={weightUnit}
        setWeightUnit={setWeightUnit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastUpdated={spotPrices.lastUpdated}
        onRefresh={() => loadPrices(true)}
        isRefreshing={isRefreshing}
        alertsCount={priceAlerts.length}
        triggeredCount={triggeredNotifications.length}
        onOpenAlertsManager={() => setIsAlertsManagerOpen(true)}
        onOpenMarketSentiments={() => setIsMarketSentimentOpen(true)}
        onOpenApiStatusModal={() => setIsApiStatusModalOpen(true)}
        apiStatuses={apiStatuses}
        spotPrices={spotPrices}
      />


      {/* Spot Price Ticker Bar */}
      <SpotPriceTicker
        spotPrices={spotPrices}
        currency={currency}
        weightUnit={weightUnit}
        onCustomSpotUpdate={handleCustomSpotUpdate}
        onRefreshLive={() => loadPrices(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Price Comparison Matrix / Cards */}
        {activeTab === 'comparison' && (
          <div>
            <SpecialOffersTicker
              computedProducts={allComputedProducts}
              currency={currency}
              onSelectSpecialOffer={handleSelectSpecialOffer}
            />

            <FilterControls
              filter={filter}
              setFilter={setFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalProductsCount={filteredProducts.length}
            />

            {viewMode === 'table' ? (
              <ProductComparisonTable
                computedProducts={filteredProducts}
                currency={currency}
                spotPrices={spotPrices}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onSelectSpecialOffer={handleSelectSpecialOffer}
                onSetPriceAlert={(p) => setCreateAlertProduct(p)}
                onComparePremiums={(p) => setCompareModalProduct(p)}
                onSortByWeight={(dir) => setFilter((prev) => ({ ...prev, sortBy: dir === 'asc' ? 'weightAsc' : 'weightDesc' }))}
                activeAlertProductIds={activeAlertProductIds}
                isMarketClosed={spotPrices.marketStatus === 'CLOSED' || spotPrices.isLive === false}
              />
            ) : (
              <ProductCardGrid
                computedProducts={filteredProducts}
                currency={currency}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onSelectSpecialOffer={handleSelectSpecialOffer}
                onSetPriceAlert={(p) => setCreateAlertProduct(p)}
                onComparePremiums={(p) => setCompareModalProduct(p)}
                activeAlertProductIds={activeAlertProductIds}
                isMarketClosed={spotPrices.marketStatus === 'CLOSED' || spotPrices.isLive === false}
              />
            )}
          </div>
        )}

        {/* Tab 2: Compare Premiums Bar Chart View */}
        {activeTab === 'comparePremiums' && (
          <ComparePremiumsView
            computedProducts={allComputedProducts}
            currency={currency}
            spotPrices={spotPrices}
            onAddToCart={handleAddToCart}
            onSetPriceAlert={(p) => setCreateAlertProduct(p)}
            initialProductId={selectedCompareProductId}
            isMarketClosed={spotPrices.marketStatus === 'CLOSED' || spotPrices.isLive === false}
          />
        )}

        {/* Tab 3: Order Savings & Portfolio Calculator */}
        {activeTab === 'calculator' && (
          <PriceCalculator
            computedProducts={allComputedProducts}
            currency={currency}
            spotPrices={spotPrices}
            cartItems={cartItems}
            setCartItems={setCartItems}
          />
        )}

        {/* Tab 4: Spot Price & Premium Trends */}
        {activeTab === 'charts' && (
          <SpotChartSection spotPrices={spotPrices} currency={currency} />
        )}

        {/* Tab 5: Retailer Profiles & Singapore GST Guide */}
        {activeTab === 'retailers' && (
          <RetailerInfoSection
            apiStatuses={apiStatuses}
            onOpenApiStatusModal={() => setIsApiStatusModalOpen(true)}
          />
        )}


        {/* Tab 6: Gemini AI Market Analyst */}
        {activeTab === 'insights' && <GeminiMarketInsights spotPrices={spotPrices} />}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        productMetrics={selectedProduct}
        currency={currency}
        spotPrices={spotPrices}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectSpecialOffer={handleSelectSpecialOffer}
        onSetPriceAlert={(p) => setCreateAlertProduct(p)}
        onComparePremiums={(p) => setCompareModalProduct(p)}
        activeAlertProductIds={activeAlertProductIds}
      />

      {/* Compare Premiums Modal View */}
      {compareModalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in cursor-pointer overflow-y-auto"
          onClick={() => setCompareModalProduct(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <ComparePremiumsView
              computedProducts={allComputedProducts}
              currency={currency}
              spotPrices={spotPrices}
              onAddToCart={handleAddToCart}
              onSetPriceAlert={(p) => setCreateAlertProduct(p)}
              onCloseModal={() => setCompareModalProduct(null)}
              isModal={true}
              initialProductId={compareModalProduct.product.id}
            />
          </div>
        </div>
      )}

      {/* Special Offer Retailer Pop-up Modal */}
      {selectedSpecialOffer && (
        <SpecialOfferModal
          deal={selectedSpecialOffer}
          currency={currency}
          onClose={() => setSelectedSpecialOffer(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Set Price Alert Modal */}
      {createAlertProduct && (
        <SetPriceAlertModal
          productMetrics={createAlertProduct}
          currency={currency}
          spotPrices={spotPrices}
          onClose={() => setCreateAlertProduct(null)}
          onSaveAlert={handleSaveAlert}
        />
      )}

      {/* Price Alerts Manager Modal */}
      {isAlertsManagerOpen && (
        <PriceAlertsManagerModal
          alerts={priceAlerts}
          computedProducts={allComputedProducts}
          currency={currency}
          spotPrices={spotPrices}
          onClose={() => setIsAlertsManagerOpen(null)}
          onToggleAlert={handleToggleAlert}
          onDeleteAlert={handleDeleteAlert}
          onOpenCreateAlert={() => {
            if (allComputedProducts.length > 0) {
              setCreateAlertProduct(allComputedProducts[0]);
            }
          }}
          onSimulatePriceDip={handleSimulatePriceDip}
          triggeredHistory={triggeredHistory}
          onSelectProductById={handleSelectProductById}
        />
      )}

      {/* Market Sentiment & Week Ahead Forecast Modal */}
      {isMarketSentimentOpen && (
        <MarketSentimentModal
          currency={currency}
          spotPrices={spotPrices}
          computedProducts={allComputedProducts}
          onClose={() => setIsMarketSentimentOpen(false)}
        />
      )}

      {/* Retailer Website API Status Integration Modal */}
      {isApiStatusModalOpen && (
        <RetailerApiStatusModal
          apiStatuses={apiStatuses}
          spotPrices={spotPrices}
          onClose={() => setIsApiStatusModalOpen(false)}
          onRefresh={() => loadPrices(true)}
          isRefreshing={isRefreshing}
        />
      )}


      {/* Triggered Price Alert Toast Notifications */}
      <PriceAlertToast
        notifications={triggeredNotifications}
        currency={currency}
        onDismiss={handleDismissNotification}
        onSelectProductById={handleSelectProductById}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} BullionTracker • Silver & Gold Retailer Comparison (Silver Bullion, BullionStar, LPM)</p>
          <div className="flex items-center space-x-4">
            <span>SGD (S$) & USD ($) Live Conversion</span>
            <span>0% GST IPM Exemption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
