import { Product, RetailerDetails, RetailerId, SpotPrices, ComputedProductMetrics, BulkTier } from '../types';

function calculateBulkTiers(
  seed: Omit<Product, 'prices'>,
  baseSpotSgd: number,
  baseSpotUsd: number,
  regMarkup: number
): {
  bulkTiers: BulkTier[];
  minQtyDiscountThreshold: number;
  bulkBuyPriceSgd: number;
  bulkBuyPriceUsd: number;
  bulkPremiumPct: number;
  bulkSavingsPerUnitSgd: number;
} {
  const roundTwoDecimals = (val: number) => Math.round(val * 100) / 100;
  const singleBuySgd = roundTwoDecimals(baseSpotSgd * (1 + regMarkup));
  const singleBuyUsd = roundTwoDecimals(baseSpotUsd * (1 + regMarkup));

  let tierSpecs: { minQty: number; label: string; markupDiscount: number }[] = [];

  if (seed.formFactor === 'Coin') {
    if (seed.weightOz < 0.5) {
      tierSpecs = [
        { minQty: 10, label: 'Small Bulk (10+ Coins)', markupDiscount: 0.012 },
        { minQty: 50, label: 'Collector Roll (50+ Coins)', markupDiscount: 0.025 },
        { minQty: 250, label: 'Master Box (250+ Coins)', markupDiscount: 0.038 },
      ];
    } else if (seed.weightOz <= 1.0) {
      tierSpecs = [
        { minQty: 10, label: 'Half Tube (10+ Coins)', markupDiscount: 0.008 },
        { minQty: seed.metal === 'Gold' ? 20 : 25, label: seed.metal === 'Gold' ? 'Mint Tube (20 Gold Coins)' : 'Mint Tube (25 Silver Coins)', markupDiscount: 0.015 },
        { minQty: 500, label: 'Mint Monster Box (500 Coins)', markupDiscount: seed.metal === 'Gold' ? 0.022 : 0.035 },
      ];
    } else {
      tierSpecs = [
        { minQty: 5, label: 'Mini Pack (5+ Coins)', markupDiscount: 0.010 },
        { minQty: 20, label: 'Bulk Roll (20+ Coins)', markupDiscount: 0.020 },
      ];
    }
  } else {
    if (seed.weightOz < 0.5) {
      tierSpecs = [
        { minQty: 10, label: 'Small Pack (10+ Bars)', markupDiscount: 0.015 },
        { minQty: 25, label: 'Assay Sheet (25+ Bars)', markupDiscount: 0.028 },
        { minQty: 100, label: 'Master Box (100+ Bars)', markupDiscount: 0.045 },
      ];
    } else if (seed.weightOz <= 3.25) {
      tierSpecs = [
        { minQty: 5, label: 'Multi-Bar Pack (5+ Bars)', markupDiscount: 0.010 },
        { minQty: 25, label: 'Vault Box (25+ Bars)', markupDiscount: 0.020 },
        { minQty: 100, label: 'Master Crate (100+ Bars)', markupDiscount: 0.032 },
      ];
    } else if (seed.weightOz <= 35.0) {
      tierSpecs = [
        { minQty: 3, label: '3+ Bar Stack', markupDiscount: 0.008 },
        { minQty: 10, label: 'Master Pack (10+ Kilobars)', markupDiscount: 0.018 },
        { minQty: 50, label: 'Vault Pallet (50+ Kilobars)', markupDiscount: 0.025 },
      ];
    } else {
      tierSpecs = [
        { minQty: 2, label: 'Dual Bar Tier (2+ Heavy Bars)', markupDiscount: 0.005 },
        { minQty: 5, label: 'COMEX/LBMA Pallet (5+ Heavy Bars)', markupDiscount: 0.012 },
      ];
    }
  }

  const bulkTiers: BulkTier[] = tierSpecs.map((spec) => {
    const tierMarkup = Math.max(0.001, regMarkup - spec.markupDiscount);
    const bulkBuySgd = roundTwoDecimals(baseSpotSgd * (1 + tierMarkup));
    const bulkBuyUsd = roundTwoDecimals(baseSpotUsd * (1 + tierMarkup));
    const discountPerUnitSgd = roundTwoDecimals(singleBuySgd - bulkBuySgd);
    const discountPerUnitUsd = roundTwoDecimals(singleBuyUsd - bulkBuyUsd);

    return {
      minQty: spec.minQty,
      label: spec.label,
      bulkBuyPriceSgd: bulkBuySgd,
      bulkBuyPriceUsd: bulkBuyUsd,
      bulkPremiumPct: roundTwoDecimals(tierMarkup * 100),
      discountPerUnitSgd: Math.max(0, discountPerUnitSgd),
      discountPerUnitUsd: Math.max(0, discountPerUnitUsd),
    };
  });

  const bestBulkTier = bulkTiers[0];

  return {
    bulkTiers,
    minQtyDiscountThreshold: bestBulkTier.minQty,
    bulkBuyPriceSgd: bestBulkTier.bulkBuyPriceSgd,
    bulkBuyPriceUsd: bestBulkTier.bulkBuyPriceUsd,
    bulkPremiumPct: bestBulkTier.bulkPremiumPct,
    bulkSavingsPerUnitSgd: bestBulkTier.discountPerUnitSgd,
  };
}

export const RETAILERS: Record<RetailerId, RetailerDetails> = {
  silverbullion: {
    id: 'silverbullion',
    name: 'Silver Bullion',
    shortName: 'SilverBullion',
    logoColor: '#1e3a8a', // Deep navy
    badgeBg: 'bg-blue-900/10 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    badgeText: 'Silver Bullion SG',
    location: 'Singapore (The Reserve Vault)',
    website: 'https://www.silverbullion.com.sg',
    paymentMethods: ['PayNow', 'Bank Transfer', 'Crypto (BTC/ETH)', 'Wise', 'Cheque'],
    vatGstInfo: '0% GST on IPM (Investment Precious Metals)',
    vaultStorage: true,
    buybackRating: 4.9,
  },
  bullionstar: {
    id: 'bullionstar',
    name: 'BullionStar',
    shortName: 'BullionStar',
    logoColor: '#b45309', // Warm amber / gold
    badgeBg: 'bg-amber-900/10 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    badgeText: 'BullionStar SG',
    location: 'Singapore (New Bridge Rd Store & Vault)',
    website: 'https://www.bullionstar.com',
    paymentMethods: ['PayNow', 'Bank Transfer', 'Crypto', 'Credit Card', 'Cash'],
    vatGstInfo: '0% GST on IPM in Singapore',
    vaultStorage: true,
    buybackRating: 4.8,
  },
  lpm: {
    id: 'lpm',
    name: 'LPM Precious Metals',
    shortName: 'LPM',
    logoColor: '#047857', // Emerald green
    badgeBg: 'bg-emerald-900/10 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    badgeText: 'LPM Metals HK/SG',
    location: 'Hong Kong & Singapore Insured Shipping',
    website: 'https://www.lpm.hk',
    paymentMethods: ['Bank Wire', 'Credit Card', 'PayPal', 'Crypto'],
    vatGstInfo: '0% Tax Free Export / IPM Certified',
    vaultStorage: true,
    buybackRating: 4.7,
  },
};

// Default spot price baseline (updated live from API if available)
export const DEFAULT_SPOT_PRICES: SpotPrices = {
  goldUsdPerOz: 2785.40,
  silverUsdPerOz: 31.85,
  usdToSgdRate: 1.3480,
  goldChange24hPct: +0.65,
  silverChange24hPct: +1.24,
  lastUpdated: new Date().toISOString(),
};

export const MANUFACTURERS = [
  'Royal Canadian Mint',
  'US Mint',
  'Perth Mint',
  'PAMP Suisse',
  'Valcambi',
  'Argor-Heraeus',
  'Metalor',
  'The Royal Mint',
  'Rand Refinery',
  'Austrian Mint',
  'Nadir Gold',
  'China Gold Coin Corp',
] as const;

// Seed dataset of precious metal items covering ALL weight categories
export const SEED_PRODUCTS: Omit<Product, 'prices'>[] = [
  // --- GOLD FRACTIONAL & COINS ---
  {
    id: 'gold-coin-1-10oz',
    name: '1/10 oz Gold Coin (American Eagle / Maple Leaf / Kangaroo)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 0.1,
    weightGrams: 3.11035,
    purity: '.9999 Fine Gold',
    mint: 'Sovereign Mints (US Mint, RCM, Perth Mint)',
    manufacturer: 'US Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-coin-1-4oz',
    name: '1/4 oz Gold Coin (American Eagle / Krugerrand / Maple Leaf)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 0.25,
    weightGrams: 7.77587,
    purity: '.9999 Fine Gold',
    mint: 'US Mint / Royal Canadian Mint / Rand Refinery',
    manufacturer: 'Royal Canadian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-coin-1-2oz',
    name: '1/2 oz Gold Coin (American Eagle / Maple Leaf)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 0.5,
    weightGrams: 15.5517,
    purity: '.9999 Fine Gold',
    mint: 'US Mint / Royal Canadian Mint',
    manufacturer: 'Royal Canadian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-sovereign',
    name: 'Full Gold Sovereign (King Charles III / Victoria)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 0.2354,
    weightGrams: 7.3224,
    purity: '22k (.9167 Fine Gold)',
    mint: 'The Royal Mint UK',
    manufacturer: 'The Royal Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-maple-1oz',
    name: '1 oz Gold Canadian Maple Leaf (.9999 Pure)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Gold',
    mint: 'Royal Canadian Mint',
    manufacturer: 'Royal Canadian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-eagle-1oz',
    name: '1 oz Gold American Eagle',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '22k (.9167 Gold)',
    mint: 'US Mint',
    manufacturer: 'US Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-kangaroo-1oz',
    name: '1 oz Gold Australian Kangaroo',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Gold',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-britannia-1oz',
    name: '1 oz Gold British Britannia (King Charles III)',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Gold',
    mint: 'The Royal Mint UK',
    manufacturer: 'The Royal Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-krugerrand-1oz',
    name: '1 oz Gold South African Krugerrand',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '22k (.9167 Fine Gold)',
    mint: 'Rand Refinery',
    manufacturer: 'Rand Refinery',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-philharmonic-1oz',
    name: '1 oz Gold Austrian Philharmonic',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Gold',
    mint: 'Austrian Mint',
    manufacturer: 'Austrian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-panda-30g',
    name: '30 Gram Gold Chinese Panda',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 0.96452,
    weightGrams: 30.0,
    purity: '.999 Fine Gold',
    mint: 'China Gold Coin Corp',
    manufacturer: 'China Gold Coin Corp',
    isLbmaGoodDelivery: false,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-coin-2oz',
    name: '2 oz Gold Australian Lunar Series III / Dragon',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 2.0,
    weightGrams: 62.207,
    purity: '.9999 Fine Gold',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },

  // --- GOLD GRAM BARS & SMALL BARS ---
  {
    id: 'gold-bar-1g',
    name: '1 Gram Gold Bar (PAMP Fortuna / Valcambi)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 0.03215,
    weightGrams: 1.0,
    purity: '.9999 Fine Gold',
    mint: 'PAMP Suisse / Valcambi',
    manufacturer: 'PAMP Suisse',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-bar-2-5g',
    name: '2.5 Gram Gold Bar PAMP Fortuna (In Assay)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 0.08038,
    weightGrams: 2.5,
    purity: '.9999 Fine Gold',
    mint: 'PAMP Suisse',
    manufacturer: 'PAMP Suisse',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-5g',
    name: '5 Gram Gold Bar (Valcambi / PAMP / Heraeus)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 0.16075,
    weightGrams: 5.0,
    purity: '.9999 Fine Gold',
    mint: 'LBMA Accredited Refiners',
    manufacturer: 'Valcambi',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-bar-10g',
    name: '10 Gram Gold Bar (Valcambi / Argor-Heraeus)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 0.32151,
    weightGrams: 10.0,
    purity: '.9999 Fine Gold',
    mint: 'Argor-Heraeus / Valcambi',
    manufacturer: 'Argor-Heraeus',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-20g',
    name: '20 Gram Gold Bar Minted (PAMP / Valcambi)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 0.64301,
    weightGrams: 20.0,
    purity: '.9999 Fine Gold',
    mint: 'PAMP Suisse / Valcambi',
    manufacturer: 'PAMP Suisse',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-pamp-1oz',
    name: '1 oz Gold Bar PAMP Suisse Fortuna (In Assay)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Gold',
    mint: 'PAMP Suisse',
    manufacturer: 'PAMP Suisse',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-bar-50g',
    name: '50 Gram Gold Bar (Cast or Minted)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 1.60754,
    weightGrams: 50.0,
    purity: '.9999 Fine Gold',
    mint: 'Metalor / Valcambi',
    manufacturer: 'Metalor',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-100g',
    name: '100 Gram Gold Bar (Cast or Minted)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 3.21507,
    weightGrams: 100.0,
    purity: '.9999 Fine Gold',
    mint: 'Metalor / Valcambi / Heraeus',
    manufacturer: 'Valcambi',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'gold-bar-250g',
    name: '250 Gram Cast Gold Bar (.9999 Pure)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 8.03768,
    weightGrams: 250.0,
    purity: '.9999 Fine Gold',
    mint: 'Metalor / Heraeus',
    manufacturer: 'Metalor',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-500g',
    name: '500 Gram Cast Gold Bar (.9999 Pure)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 16.0754,
    weightGrams: 500.0,
    purity: '.9999 Fine Gold',
    mint: 'Valcambi / Argor-Heraeus',
    manufacturer: 'Argor-Heraeus',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'gold-bar-1kg',
    name: '1 kg Cast Gold Bar (.9999 Pure)',
    metal: 'Gold',
    formFactor: 'Bar',
    weightOz: 32.1507,
    weightGrams: 1000.0,
    purity: '.9999 Fine Gold',
    mint: 'Argor-Heraeus / Metalor / SilverBullion',
    manufacturer: 'Argor-Heraeus',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },

  // --- SILVER FRACTIONAL & COINS ---
  {
    id: 'silver-coin-1-2oz',
    name: '1/2 oz Silver Coin (Perth Mint Lunar / Wildlife)',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 0.5,
    weightGrams: 15.5517,
    purity: '.9999 Fine Silver',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-eagle-1oz',
    name: '1 oz Silver American Eagle',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.999 Fine Silver',
    mint: 'US Mint',
    manufacturer: 'US Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-maple-1oz',
    name: '1 oz Silver Canadian Maple Leaf (.9999 Pure)',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Silver',
    mint: 'Royal Canadian Mint',
    manufacturer: 'Royal Canadian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-britannia-1oz',
    name: '1 oz Silver British Britannia',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.999 Fine Silver',
    mint: 'The Royal Mint UK',
    manufacturer: 'The Royal Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-kangaroo-1oz',
    name: '1 oz Silver Australian Kangaroo',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.9999 Fine Silver',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-philharmonic-1oz',
    name: '1 oz Silver Austrian Philharmonic',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    weightGrams: 31.1035,
    purity: '.999 Fine Silver',
    mint: 'Austrian Mint',
    manufacturer: 'Austrian Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-panda-30g',
    name: '30 Gram Silver Chinese Panda',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 0.96452,
    weightGrams: 30.0,
    purity: '.999 Fine Silver',
    mint: 'China Gold Coin Corp',
    manufacturer: 'China Gold Coin Corp',
    isLbmaGoodDelivery: false,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-coin-2oz',
    name: '2 oz Silver Perth Mint Mother & Baby / Next Gen',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 2.0,
    weightGrams: 62.207,
    purity: '.9999 Fine Silver',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-coin-5oz',
    name: '5 oz Silver America the Beautiful / Lunar Coin',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 5.0,
    weightGrams: 155.518,
    purity: '.999 Fine Silver',
    mint: 'US Mint / Perth Mint',
    manufacturer: 'US Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-coin-10oz',
    name: '10 oz Silver Perth Mint Kookaburra / Koala Coin',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 10.0,
    weightGrams: 311.035,
    purity: '.9999 Fine Silver',
    mint: 'Perth Mint',
    manufacturer: 'Perth Mint',
    isLbmaGoodDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },

  // --- SILVER GRAM BARS, KILOGRAMS & HEAVY BARS ---
  {
    id: 'silver-bar-100g',
    name: '100 Gram Cast Silver Bar (.999 Fine)',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 3.21507,
    weightGrams: 100.0,
    purity: '.999 Fine Silver',
    mint: 'Valcambi / Nadir Gold',
    manufacturer: 'Nadir Gold',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-bar-250g',
    name: '250 Gram Cast Silver Bar (.999 Fine)',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 8.03768,
    weightGrams: 250.0,
    purity: '.999 Fine Silver',
    mint: 'Metalor / Valcambi',
    manufacturer: 'Metalor',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-bar-500g',
    name: '500 Gram Cast Silver Bar (.999 Fine)',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 16.0754,
    weightGrams: 500.0,
    purity: '.999 Fine Silver',
    mint: 'PAMP / Nadir Gold',
    manufacturer: 'Nadir Gold',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: 'silver-bar-10oz',
    name: '10 oz Silver Bar (PAMP / Sunshine / Nadir)',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 10.0,
    weightGrams: 311.035,
    purity: '.999 Fine Silver',
    mint: 'LBMA Good Delivery Refiner',
    manufacturer: 'PAMP Suisse',
    isLbmaGoodDelivery: true,
    barType: 'Minted',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-bar-1kg',
    name: '1 kg Cast Silver Bar (.999 Fine)',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 32.1507,
    weightGrams: 1000.0,
    purity: '.999 Fine Silver',
    mint: 'Valcambi / Heraeus / SilverBullion',
    manufacturer: 'Valcambi',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-bar-100oz',
    name: '100 oz Silver Cast Bar',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 100.0,
    weightGrams: 3110.35,
    purity: '.999 Fine Silver',
    mint: 'Royal Canadian Mint / Metalor / SilverBullion',
    manufacturer: 'Royal Canadian Mint',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'silver-bar-1000oz',
    name: '1000 oz / 15kg Institutional Silver Good Delivery Bar',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 1000.0,
    weightGrams: 31103.5,
    purity: '.999 Fine Silver',
    mint: 'LBMA Good Delivery Certified Refiners',
    manufacturer: 'Metalor',
    isLbmaGoodDelivery: true,
    barType: 'Cast',
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
];

// Retailer markup profile relative to base spot price
const RETAILER_MARKUP_FACTORS: Record<string, Record<RetailerId, { buyMarkup: number; sellDiscount: number }>> = {
  'gold-maple-1oz': {
    silverbullion: { buyMarkup: 0.038, sellDiscount: 0.008 },
    bullionstar:    { buyMarkup: 0.034, sellDiscount: 0.007 },
    lpm:            { buyMarkup: 0.031, sellDiscount: 0.010 },
  },
  'gold-eagle-1oz': {
    silverbullion: { buyMarkup: 0.052, sellDiscount: 0.012 },
    bullionstar:    { buyMarkup: 0.048, sellDiscount: 0.010 },
    lpm:            { buyMarkup: 0.045, sellDiscount: 0.014 },
  },
  'gold-bar-pamp-1oz': {
    silverbullion: { buyMarkup: 0.028, sellDiscount: 0.005 },
    bullionstar:    { buyMarkup: 0.026, sellDiscount: 0.005 },
    lpm:            { buyMarkup: 0.027, sellDiscount: 0.007 },
  },
  'gold-bar-1kg': {
    silverbullion: { buyMarkup: 0.009, sellDiscount: 0.002 },
    bullionstar:    { buyMarkup: 0.011, sellDiscount: 0.002 },
    lpm:            { buyMarkup: 0.012, sellDiscount: 0.003 },
  },
  'silver-maple-1oz': {
    silverbullion: { buyMarkup: 0.185, sellDiscount: 0.030 },
    bullionstar:    { buyMarkup: 0.170, sellDiscount: 0.025 },
    lpm:            { buyMarkup: 0.160, sellDiscount: 0.030 },
  },
  'silver-bar-1kg': {
    silverbullion: { buyMarkup: 0.082, sellDiscount: 0.012 },
    bullionstar:    { buyMarkup: 0.091, sellDiscount: 0.015 },
    lpm:            { buyMarkup: 0.089, sellDiscount: 0.016 },
  },
  'silver-bar-100oz': {
    silverbullion: { buyMarkup: 0.062, sellDiscount: 0.010 },
    bullionstar:    { buyMarkup: 0.070, sellDiscount: 0.012 },
    lpm:            { buyMarkup: 0.068, sellDiscount: 0.014 },
  },
  'silver-bar-1000oz': {
    silverbullion: { buyMarkup: 0.038, sellDiscount: 0.008 },
    bullionstar:    { buyMarkup: 0.045, sellDiscount: 0.010 },
    lpm:            { buyMarkup: 0.042, sellDiscount: 0.011 },
  },
};

/**
 * Calculates realistic fallback markups for any item based on metal & weight
 */
function getCalculatedMarkup(seed: Omit<Product, 'prices'>): Record<RetailerId, { buyMarkup: number; sellDiscount: number }> {
  if (RETAILER_MARKUP_FACTORS[seed.id]) {
    return RETAILER_MARKUP_FACTORS[seed.id];
  }

  // Base markup based on weightOz
  let baseBuyMarkup = 0.04;
  let baseSellDiscount = 0.01;

  if (seed.metal === 'Gold') {
    if (seed.weightOz < 0.1) {
      baseBuyMarkup = 0.14; // Small 1g gold bars
      baseSellDiscount = 0.025;
    } else if (seed.weightOz < 0.5) {
      baseBuyMarkup = 0.08; // 2.5g - 10g
      baseSellDiscount = 0.018;
    } else if (seed.weightOz < 2.0) {
      baseBuyMarkup = 0.035; // 1oz coins / bars
      baseSellDiscount = 0.008;
    } else if (seed.weightOz < 10.0) {
      baseBuyMarkup = 0.022; // 100g - 250g
      baseSellDiscount = 0.005;
    } else {
      baseBuyMarkup = 0.010; // 500g - 1kg
      baseSellDiscount = 0.003;
    }
  } else {
    // Silver
    if (seed.weightOz < 1.0) {
      baseBuyMarkup = 0.28;
      baseSellDiscount = 0.04;
    } else if (seed.weightOz <= 2.0) {
      baseBuyMarkup = 0.18; // 1oz - 2oz silver coins
      baseSellDiscount = 0.03;
    } else if (seed.weightOz <= 10.0) {
      baseBuyMarkup = 0.13; // 5oz - 10oz silver bars
      baseSellDiscount = 0.022;
    } else if (seed.weightOz <= 35.0) {
      baseBuyMarkup = 0.085; // 1kg silver bars
      baseSellDiscount = 0.015;
    } else {
      baseBuyMarkup = 0.055; // 100oz - 1000oz
      baseSellDiscount = 0.010;
    }
  }

  return {
    silverbullion: {
      buyMarkup: Math.round((baseBuyMarkup * (seed.formFactor === 'Bar' && seed.weightOz >= 10 ? 0.94 : 1.02)) * 1000) / 1000,
      sellDiscount: Math.round(baseSellDiscount * 1000) / 1000,
    },
    bullionstar: {
      buyMarkup: Math.round((baseBuyMarkup * (seed.weightOz <= 1.0 ? 0.96 : 1.01)) * 1000) / 1000,
      sellDiscount: Math.round(baseSellDiscount * 1000) / 1000,
    },
    lpm: {
      buyMarkup: Math.round((baseBuyMarkup * (seed.formFactor === 'Coin' ? 0.95 : 1.02)) * 1000) / 1000,
      sellDiscount: Math.round(baseSellDiscount * 1000) / 1000,
    },
  };
}

const SPECIAL_OFFERS_CONFIG: Record<string, {
  retailerId: RetailerId;
  title: string;
  discountMarkupDelta: number;
  badgeText: string;
  code?: string;
  expiresIn?: string;
  dealUrl?: string;
  description?: string;
}> = {
  'gold-maple-1oz': {
    retailerId: 'bullionstar',
    title: 'Weekly Royal Canadian Mint Flash Sale',
    discountMarkupDelta: 0.016, // Reduces markup by 1.6%
    badgeText: 'FLASH SALE -1.6% PREM',
    code: 'MAPLE2026',
    expiresIn: 'Ends in 2 days',
    dealUrl: 'https://www.bullionstar.com/buy/product/gold_maple_leaf_1oz?promo=MAPLE2026',
    description: 'Direct mint allocation sale on 1 oz Gold Maple Leaf 2026. Includes free Singapore vault storage trial for 1 year.',
  },
  'silver-maple-1oz': {
    retailerId: 'silverbullion',
    title: 'Reserve Vault Spotlight Promo',
    discountMarkupDelta: 0.035, // Reduces markup by 3.5%
    badgeText: 'SPECIAL OFFER -3.5% PREM',
    code: 'VAULTMAPLE',
    expiresIn: 'Ends in 12 hours',
    dealUrl: 'https://www.silverbullion.com.sg/Product/1-oz-Silver-Canadian-Maple-Leaf-2026?promo=VAULTMAPLE',
    description: 'Limited quantity offer direct from The Reserve Vault. GST exempt investment precious metal with 0% tax.',
  },
  'silver-bar-1kg': {
    retailerId: 'lpm',
    title: 'Cast Kilobar Export Special',
    discountMarkupDelta: 0.022, // Reduces markup by 2.2%
    badgeText: 'EXPORT SALE -2.2% PREM',
    code: 'LPMKILO2026',
    expiresIn: 'Limited Stock',
    dealUrl: 'https://www.lpm.hk/1kg-silver-cast-bar-999.html?promo=LPMKILO2026',
    description: 'Bulk release of LBMA certified 1 kg fine silver cast bars with insured international or local Singapore delivery.',
  },
  'gold-bar-pamp-1oz': {
    retailerId: 'silverbullion',
    title: 'PAMP Suisse Lady Fortuna Special',
    discountMarkupDelta: 0.011, // Reduces markup by 1.1%
    badgeText: 'PAMP PROMO -1.1% PREM',
    code: 'FORTUNA',
    expiresIn: 'Ends tomorrow',
    dealUrl: 'https://www.silverbullion.com.sg/Product/1-oz-Gold-PAMP-Suisse-Lady-Fortuna-Veriscan?promo=FORTUNA',
    description: 'Iconic Swiss 1 oz Gold Bar with Veriscan security assay card at reduced dealer margin.',
  },
  'gold-bar-100g': {
    retailerId: 'bullionstar',
    title: 'Overstock Cast Gold Bar Sale',
    discountMarkupDelta: 0.009,
    badgeText: 'OVERSTOCK SPECIAL',
    code: 'BSGOLD100',
    expiresIn: 'Ends in 3 days',
    dealUrl: 'https://www.bullionstar.com/buy/product/gold_bar_100g_cast?promo=BSGOLD100',
    description: 'Heavy 100 gram 999.9 pure gold cast bar special pricing with instant buyback guarantee.',
  },
  'silver-bar-1000oz': {
    retailerId: 'silverbullion',
    title: 'Institutional Good Delivery Discount',
    discountMarkupDelta: 0.012,
    badgeText: 'BULK TIER -1.2% PREM',
    code: 'INSTITUTIONAL',
    expiresIn: 'Vault Special',
    dealUrl: 'https://www.silverbullion.com.sg/Product/1000-oz-Silver-Bar-Comex-Good-Delivery?promo=INSTITUTIONAL',
    description: 'Institutional Grade COMEX / LBMA 1,000 oz silver bar stored directly at The Reserve high-security vault.',
  },
  'gold-sovereign': {
    retailerId: 'lpm',
    title: 'Royal Mint Sovereign Clearance',
    discountMarkupDelta: 0.018,
    badgeText: 'SOVEREIGN PROMO',
    code: 'SOV2026',
    expiresIn: 'Ends in 5 days',
    dealUrl: 'https://www.lpm.hk/gold-full-sovereign-coin-royal-mint.html?promo=SOV2026',
    description: 'Historic British Full Sovereign gold coin promo deal. VAT / GST exempt classic 22k investment gold.',
  },
  'silver-eagle-1oz': {
    retailerId: 'bullionstar',
    title: 'US Mint Monster Box Tier Discount',
    discountMarkupDelta: 0.040,
    badgeText: 'MONSTER BOX RATE',
    code: 'EAGLESPECIAL',
    expiresIn: 'Limited allocation',
    dealUrl: 'https://www.bullionstar.com/buy/product/silver_american_eagle_1oz?promo=EAGLESPECIAL',
    description: 'Monster box rate pricing extended to individual 1 oz American Silver Eagles while stock lasts.',
  },
  'silver-britannia-1oz': {
    retailerId: 'silverbullion',
    title: 'Royal Mint Silver Britannia Promo',
    discountMarkupDelta: 0.028,
    badgeText: 'BRITANNIA SALE',
    code: 'BRIT2026',
    expiresIn: 'Ends in 3 days',
    dealUrl: 'https://www.silverbullion.com.sg/Product/1-oz-Silver-Britannia-2026?promo=BRIT2026',
    description: 'Security features hallmark 1 oz Royal Mint Silver Britannia coin promo discount with 0% GST.',
  },
  'gold-kangaroo-1oz': {
    retailerId: 'lpm',
    title: 'Perth Mint Gold Kangaroo Special',
    discountMarkupDelta: 0.014,
    badgeText: 'PERTH MINT PROMO',
    code: 'ROO2026',
    expiresIn: 'Ends in 4 days',
    dealUrl: 'https://www.lpm.hk/1oz-gold-kangaroo-perth-mint.html?promo=ROO2026',
    description: 'Direct Perth Mint allocation 1 oz Australian Gold Kangaroo coin with micro-laser security letter.',
  },
  'gold-bar-valcambi-50g': {
    retailerId: 'bullionstar',
    title: 'Valcambi CombiBar Flash Promo',
    discountMarkupDelta: 0.015,
    badgeText: 'COMBIBAR PROMO',
    code: 'COMBI50',
    expiresIn: 'Flash Deal',
    dealUrl: 'https://www.bullionstar.com/buy/product/gold_bar_50g_valcambi_combibar?promo=COMBI50',
    description: 'Swiss Valcambi 50x1g detachable Gold CombiBar. High flexibility wealth preservation format.',
  },
  'silver-bar-10oz': {
    retailerId: 'silverbullion',
    title: '10 oz Cast Silver Bar Stackers Promo',
    discountMarkupDelta: 0.025,
    badgeText: 'STACKER DEAL',
    code: 'SILVER10OZ',
    expiresIn: 'Vault Clearance',
    dealUrl: 'https://www.silverbullion.com.sg/Product/10-oz-Silver-Bar-Cast?promo=SILVER10OZ',
    description: 'Popular 10 troy oz fine silver cast bar stacker special. High purity .999 silver at low premium.',
  },
};

/**
 * Generates full product pricing catalog based on live spot prices
 */
export function generateProductsWithPrices(spotPrices: SpotPrices): Product[] {
  const { goldUsdPerOz, silverUsdPerOz, usdToSgdRate } = spotPrices;

  return SEED_PRODUCTS.map((seed) => {
    const baseSpotUsd = seed.metal === 'Gold' ? goldUsdPerOz * seed.weightOz : silverUsdPerOz * seed.weightOz;
    const baseSpotSgd = baseSpotUsd * usdToSgdRate;

    const markupInfo = getCalculatedMarkup(seed);
    const offerCfg = SPECIAL_OFFERS_CONFIG[seed.id];

    const buildRetailerPrice = (rid: RetailerId) => {
      const regMarkup = markupInfo[rid].buyMarkup;
      const sellDiscount = markupInfo[rid].sellDiscount;

      const origBuySgd = roundTwoDecimals(baseSpotSgd * (1 + regMarkup));
      const origBuyUsd = roundTwoDecimals(baseSpotUsd * (1 + regMarkup));
      const sellSgd = roundTwoDecimals(baseSpotSgd * (1 - sellDiscount));
      const sellUsd = roundTwoDecimals(baseSpotUsd * (1 - sellDiscount));

      let buySgd = origBuySgd;
      let buyUsd = origBuyUsd;
      let specialOffer: any = undefined;

      if (offerCfg && offerCfg.retailerId === rid) {
        const promoMarkup = Math.max(0.002, regMarkup - offerCfg.discountMarkupDelta);
        buySgd = roundTwoDecimals(baseSpotSgd * (1 + promoMarkup));
        buyUsd = roundTwoDecimals(baseSpotUsd * (1 + promoMarkup));

        specialOffer = {
          title: offerCfg.title,
          originalBuyPriceSgd: origBuySgd,
          originalBuyPriceUsd: origBuyUsd,
          originalPremiumPct: roundTwoDecimals(regMarkup * 100),
          promoBuyPriceSgd: buySgd,
          promoBuyPriceUsd: buyUsd,
          promoPremiumPct: roundTwoDecimals(promoMarkup * 100),
          savingsSgd: roundTwoDecimals(origBuySgd - buySgd),
          badgeText: offerCfg.badgeText,
          code: offerCfg.code,
          expiresIn: offerCfg.expiresIn,
          dealUrl: offerCfg.dealUrl || RETAILERS[rid].website,
          description: offerCfg.description || 'Exclusive special offer available directly through retailer portal.',
        };
      }

      // Calculate bulk pricing discount tiers for this product & retailer
      const bulkTierData = calculateBulkTiers(seed, baseSpotSgd, baseSpotUsd, regMarkup);

      // Physical retail shop walk-in / over-the-counter list price (~2.5% retail counter overhead)
      const retailShopPriceSgd = roundTwoDecimals(buySgd * 1.025);
      const retailShopPriceUsd = roundTwoDecimals(buyUsd * 1.025);

      return {
        retailerId: rid,
        buyPriceSgd: buySgd,
        retailShopPriceSgd,
        sellPriceSgd: sellSgd,
        buyPriceUsd: buyUsd,
        retailShopPriceUsd,
        sellPriceUsd: sellUsd,
        inStock: true,
        minQtyDiscountThreshold: bulkTierData.minQtyDiscountThreshold,
        bulkBuyPriceSgd: bulkTierData.bulkBuyPriceSgd,
        bulkBuyPriceUsd: bulkTierData.bulkBuyPriceUsd,
        bulkPremiumPct: bulkTierData.bulkPremiumPct,
        bulkSavingsPerUnitSgd: bulkTierData.bulkSavingsPerUnitSgd,
        bulkTiers: bulkTierData.bulkTiers,
        specialOffer,
      };
    };

    const prices: Record<RetailerId, any> = {
      silverbullion: buildRetailerPrice('silverbullion'),
      bullionstar: buildRetailerPrice('bullionstar'),
      lpm: buildRetailerPrice('lpm'),
    };

    return {
      ...seed,
      prices,
    };
  });
}

/**
 * Computes all metrics (Premium %, Spread %, Best Deals) for products
 */
export function computeProductMetrics(
  products: Product[],
  spotPrices: SpotPrices
): ComputedProductMetrics[] {
  const { goldUsdPerOz, silverUsdPerOz, usdToSgdRate } = spotPrices;

  return products.map((product) => {
    const spotUsdPerOz = product.metal === 'Gold' ? goldUsdPerOz : silverUsdPerOz;
    const spotValueUsd = spotUsdPerOz * product.weightOz;
    const spotValueSgd = spotValueUsd * usdToSgdRate;

    const retailerIds: RetailerId[] = ['silverbullion', 'bullionstar', 'lpm'];

    let lowestBuySgd = Infinity;
    let lowestPremium = Infinity;
    let lowestSpread = Infinity;

    let bestBuyRetailer: RetailerId = 'silverbullion';
    let bestSellRetailer: RetailerId = 'silverbullion';
    let highestSellSgd = -Infinity;

    const retailerMetrics: Record<RetailerId, any> = {} as any;

    let hasSpecialOffer = false;

    retailerIds.forEach((rid) => {
      const p = product.prices[rid];
      if (p.specialOffer) hasSpecialOffer = true;
      const buyPriceSgd = p.buyPriceSgd;
      const buyPriceUsd = p.buyPriceUsd;
      const retailShopPriceSgd = p.retailShopPriceSgd || roundTwoDecimals(buyPriceSgd * 1.025);
      const retailShopPriceUsd = p.retailShopPriceUsd || roundTwoDecimals(buyPriceUsd * 1.025);
      const sellPriceSgd = p.sellPriceSgd;
      const sellPriceUsd = p.sellPriceUsd;

      const premiumPct = ((buyPriceSgd - spotValueSgd) / spotValueSgd) * 100;
      const retailShopPremiumPct = ((retailShopPriceSgd - spotValueSgd) / spotValueSgd) * 100;
      const spreadValueSgd = buyPriceSgd - sellPriceSgd;
      const spreadValueUsd = buyPriceUsd - sellPriceUsd;
      const spreadPct = (spreadValueSgd / buyPriceSgd) * 100;

      if (buyPriceSgd < lowestBuySgd) {
        lowestBuySgd = buyPriceSgd;
        bestBuyRetailer = rid;
      }

      if (sellPriceSgd > highestSellSgd) {
        highestSellSgd = sellPriceSgd;
        bestSellRetailer = rid;
      }

      if (premiumPct < lowestPremium) lowestPremium = premiumPct;
      if (spreadPct < lowestSpread) lowestSpread = spreadPct;

      retailerMetrics[rid] = {
        buyPriceSgd,
        buyPriceUsd,
        retailShopPriceSgd,
        retailShopPriceUsd,
        retailShopPremiumPct: roundTwoDecimals(retailShopPremiumPct),
        sellPriceSgd,
        sellPriceUsd,
        premiumPct: roundTwoDecimals(premiumPct),
        spreadPct: roundTwoDecimals(spreadPct),
        spreadValueSgd: roundTwoDecimals(spreadValueSgd),
        spreadValueUsd: roundTwoDecimals(spreadValueUsd),
        isLowestBuyPrice: false,
        isLowestPremium: false,
        isLowestSpread: false,
      };
    });

    // Mark best indicators
    retailerIds.forEach((rid) => {
      const rm = retailerMetrics[rid];
      if (Math.abs(rm.buyPriceSgd - lowestBuySgd) < 0.01) rm.isLowestBuyPrice = true;
      if (Math.abs(rm.premiumPct - roundTwoDecimals(lowestPremium)) < 0.02) rm.isLowestPremium = true;
      if (Math.abs(rm.spreadPct - roundTwoDecimals(lowestSpread)) < 0.02) rm.isLowestSpread = true;
    });

    return {
      product,
      spotValueSgd: roundTwoDecimals(spotValueSgd),
      spotValueUsd: roundTwoDecimals(spotValueUsd),
      retailerMetrics,
      bestBuyRetailerId: bestBuyRetailer,
      bestSellRetailerId: bestSellRetailer,
      lowestPremiumPct: roundTwoDecimals(lowestPremium),
      lowestSpreadPct: roundTwoDecimals(lowestSpread),
      hasSpecialOffer,
    };
  });
}

/**
 * Historical spot price data generator for chart visualization
 */
export function generateHistoricalData(currentSpot: SpotPrices): any[] {
  const data = [];
  const days = 30;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Generate random walk backward from current
    const randomGoldOffset = (Math.sin(i * 0.4) * 22 + Math.cos(i * 0.7) * 15 - (i * 1.5));
    const randomSilverOffset = (Math.sin(i * 0.3) * 0.8 + Math.cos(i * 0.5) * 0.4 - (i * 0.05));

    const goldSpotUsd = roundTwoDecimals(currentSpot.goldUsdPerOz + randomGoldOffset);
    const silverSpotUsd = roundTwoDecimals(currentSpot.silverUsdPerOz + randomSilverOffset);
    const goldSpotSgd = roundTwoDecimals(goldSpotUsd * currentSpot.usdToSgdRate);
    const silverSpotSgd = roundTwoDecimals(silverSpotUsd * currentSpot.usdToSgdRate);

    data.push({
      date: dateStr,
      goldSpotUsd,
      silverSpotUsd,
      goldSpotSgd,
      silverSpotSgd,
      sbGoldPremiumPct: roundTwoDecimals(3.8 + Math.sin(i * 0.2) * 0.3),
      bsGoldPremiumPct: roundTwoDecimals(3.4 + Math.sin(i * 0.25) * 0.2),
      lpmGoldPremiumPct: roundTwoDecimals(3.1 + Math.cos(i * 0.2) * 0.3),
      sbSilverPremiumPct: roundTwoDecimals(18.5 + Math.sin(i * 0.15) * 1.2),
      bsSilverPremiumPct: roundTwoDecimals(17.0 + Math.sin(i * 0.2) * 1.0),
      lpmSilverPremiumPct: roundTwoDecimals(16.0 + Math.cos(i * 0.18) * 0.9),
    });
  }

  return data;
}

function roundTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
