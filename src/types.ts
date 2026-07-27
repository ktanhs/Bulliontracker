export type MetalType = 'Gold' | 'Silver';
export type FormFactor = 'Coin' | 'Bar';
export type Currency = 'SGD' | 'USD' | 'DUAL';

export interface SpotPrices {
  goldUsdPerOz: number;
  silverUsdPerOz: number;
  usdToSgdRate: number;
  goldChange24hPct: number;
  silverChange24hPct: number;
  fxChange24hPct?: number;
  lastUpdated: string;
  source?: string;
  isLive?: boolean;
  marketStatus?: 'OPEN' | 'CLOSED';
  lastMarketCloseTime?: string;
}

export type RetailerId = 'silverbullion' | 'bullionstar' | 'lpm';

export interface RetailerDetails {
  id: RetailerId;
  name: string;
  shortName: string;
  logoColor: string;
  badgeBg: string;
  badgeText: string;
  location: string;
  website: string;
  paymentMethods: string[];
  vatGstInfo: string;
  vaultStorage: boolean;
  buybackRating: number; // out of 5
}

export interface BulkTier {
  minQty: number;               // e.g. 5, 10, 20, 100, 500
  label: string;                // e.g. "Tube (20 Coins)", "Box (10 Bars)", "Monster Box (500 Coins)"
  bulkBuyPriceSgd: number;      // Unit price at this tier in SGD
  bulkBuyPriceUsd: number;      // Unit price at this tier in USD
  bulkPremiumPct: number;       // Premium % at this tier
  discountPerUnitSgd: number;   // SGD savings per unit vs single item price
  discountPerUnitUsd: number;   // USD savings per unit vs single item price
}

export interface SpecialOffer {
  title: string;                 // e.g. "Vault Clearance Deal", "Mint Promo"
  originalBuyPriceSgd: number;   // Original regular price before promo
  originalBuyPriceUsd: number;
  originalPremiumPct: number;    // Regular premium %
  promoBuyPriceSgd: number;      // Special offer price
  promoBuyPriceUsd: number;
  promoPremiumPct: number;       // Discounted premium %
  savingsSgd: number;            // Total savings in SGD
  badgeText: string;             // e.g. "SAVE 1.5% PREMIUM", "FLASH DEAL"
  code?: string;                 // Promo code
  expiresIn?: string;            // Expiry countdown
  dealUrl?: string;              // Direct link to retailer offer page
  description?: string;          // Special offer details
  isStrikeOffDiscount?: boolean; // Indicates a strike-through discount on retailer sale page
  salePageAnalysis?: string;     // Verified note on retailer sale page listing image / tag
  discountPct?: number;          // % discount relative to official listed price
}

export interface RetailerPrice {
  retailerId: RetailerId;
  buyPriceSgd: number;           // Online retailer ask (what customer pays online via bank transfer/wire)
  retailShopPriceSgd: number;    // Physical retail shop walk-in / counter tag price
  sellPriceSgd: number;          // Retailer bid (what customer gets when selling back)
  buyPriceUsd: number;
  retailShopPriceUsd: number;
  sellPriceUsd: number;
  inStock: boolean;
  minQtyDiscountThreshold?: number;
  bulkBuyPriceSgd?: number;
  bulkBuyPriceUsd?: number;
  bulkPremiumPct?: number;
  bulkSavingsPerUnitSgd?: number;
  bulkTiers?: BulkTier[];
  specialOffer?: SpecialOffer;
}

export interface Product {
  id: string;
  name: string;
  metal: MetalType;
  formFactor: FormFactor;
  weightOz: number;          // Weight in troy oz
  weightGrams: number;       // Weight in grams
  purity: string;            // e.g. ".9999" or "99.99%"
  mint: string;              // e.g. "US Mint", "Royal Canadian Mint", "PAMP Suisse"
  manufacturer: string;      // Standard manufacturer / mint name
  isLbmaGoodDelivery: boolean; // LBMA Good Delivery accredited status
  barType?: 'Cast' | 'Minted'; // 'Cast' (poured) vs 'Minted' (pressed/assay) for bar form factor
  imageUrl: string;
  popular?: boolean;
  availableRetailers?: RetailerId[]; // Retailers that stock/sell this item (supports items available from only 1 retailer)
  prices: Record<RetailerId, RetailerPrice>;
}

export interface ComputedProductMetrics {
  product: Product;
  spotValueSgd: number;
  spotValueUsd: number;
  retailerMetrics: Record<RetailerId, {
    buyPriceSgd: number;
    buyPriceUsd: number;
    retailShopPriceSgd: number;
    retailShopPriceUsd: number;
    retailShopPremiumPct: number;
    sellPriceSgd: number;
    sellPriceUsd: number;
    premiumPct: number;        // ((BuyPrice - SpotValue) / SpotValue) * 100
    sellPremiumPct: number;    // ((SellPrice - SpotValue) / SpotValue) * 100
    spreadPct: number;         // ((BuyPrice - SellPrice) / BuyPrice) * 100
    spreadValueSgd: number;    // BuyPrice - SellPrice
    spreadValueUsd: number;
    isLowestBuyPrice: boolean;
    isLowestPremium: boolean;
    isLowestSpread: boolean;
    isHighestSellPrice?: boolean;
  }>;
  bestBuyRetailerId: RetailerId;
  bestSellRetailerId: RetailerId;
  lowestPremiumPct: number;
  lowestSpreadPct: number;
  hasSpecialOffer?: boolean;
}

export interface ProductFilter {
  metal: 'ALL' | MetalType;
  formFactor: 'ALL' | FormFactor;
  weightRange: 'ALL' | 'fractional' | '1oz' | 'grams' | '5to10oz' | '1kg' | 'heavy';
  manufacturer: string;      // 'ALL' or specific manufacturer name
  barType?: 'ALL' | 'Cast' | 'Minted'; // Filter for Cast vs Minted bars
  lbmaOnly?: boolean;        // Show LBMA Good Delivery products only
  searchQuery: string;
  nameQuery: string;
  weightQuery: string;
  specialOffersOnly?: boolean;
  bulkDealsOnly?: boolean;
  sortBy: 'lowestBuyPrice' | 'lowestPremium' | 'lowestSpread' | 'name' | 'weight' | 'weightAsc' | 'weightDesc';
  sortOrder: 'asc' | 'desc';
}

export interface PortfolioCalculatorItem {
  productId: string;
  quantity: number;
  retailerId: RetailerId;
}

export interface PriceAlert {
  id: string;
  productId: string;
  retailerId?: RetailerId | 'ANY';
  targetValue: number;            // Numerical target (Price or Premium %)
  targetCurrency: 'SGD' | 'USD';
  alertType: 'BUY_PRICE' | 'PREMIUM_PCT'; // Trigger on buy price or premium %
  condition: 'BELOW' | 'ABOVE';   // Trigger when <= or >=
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggeredCount: number;
  note?: string;
}

export interface TriggeredAlertNotification {
  id: string;
  alert: PriceAlert;
  productName: string;
  productImageUrl: string;
  retailerName: string;
  currentValue: number;
  targetValue: number;
  triggeredAt: string;
}

export interface HistoricalPricePoint {
  date: string;
  goldSpotUsd: number;
  silverSpotUsd: number;
  goldSpotSgd: number;
  silverSpotSgd: number;
  sbGoldPremiumPct: number;
  bsGoldPremiumPct: number;
  lpmGoldPremiumPct: number;
  sbSilverPremiumPct: number;
  bsSilverPremiumPct: number;
  lpmSilverPremiumPct: number;
}

export interface RetailerApiStatus {
  id: RetailerId;
  name: string;
  shortName: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  endpointUrl: string;
  lastSynced: string;
  directPriceFeed: boolean;
  activeFeeds: string[];
  syncFrequencySec: number;
  ipmGstVerified: boolean;
}
