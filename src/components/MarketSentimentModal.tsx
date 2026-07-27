import React, { useState, useMemo } from 'react';
import { Currency, SpotPrices, ComputedProductMetrics, RetailerId } from '../types';
import { RETAILERS } from '../data/bullionData';
import { openRetailerListing } from '../utils/urlUtils';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Compass,
  AlertTriangle,
  Zap,
  ShieldCheck,
  BarChart3,
  Globe,
  DollarSign,
  ArrowRight,
  Layers,
  Sparkles,
  ShoppingCart,
  ExternalLink,
  Radio,
  Scale
} from 'lucide-react';

interface MarketSentimentModalProps {
  currency: Currency;
  spotPrices: SpotPrices;
  computedProducts: ComputedProductMetrics[];
  onClose: () => void;
}

type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

interface TargetHorizon {
  label: string;
  timeframe: string;
  targetUsd: number;
  targetSgd: number;
  keyDriver: string;
}

interface MetalSentimentData {
  id: MetalType;
  name: string;
  symbol: string;
  color: string;
  badgeBg: string;
  iconBg: string;
  currentSpotSgd: number;
  currentSpotUsd: number;
  forecastRangeSgd: [number, number];
  forecastRangeUsd: [number, number];
  overallBias: 'Bullish' | 'Moderately Bullish' | 'Neutral' | 'Bearish';
  biasScore: number; // 0 to 100
  sentimentBreakdown: {
    bullishPct: number;
    neutralPct: number;
    bearishPct: number;
  };
  targetTimeframes: {
    shortTerm: TargetHorizon;
    midTerm: TargetHorizon;
    longTerm: TargetHorizon;
  };
  keyDrivers: { title: string; desc: string; impact: 'High' | 'Medium' | 'Positive' | 'Neutral' }[];
  technicalLevels: {
    support1: string;
    support2: string;
    resistance1: string;
    resistance2: string;
    pivot: string;
  };
  weeklySchedule: {
    day: string;
    dateLabel: string;
    event: string;
    expectedImpact: string;
    trendBias: 'Bullish' | 'Moderately Bullish' | 'Neutral' | 'Volatile' | 'Bearish';
  }[];
  physicalRetailOutlook: {
    sgHkDemand: string;
    retailPremiumTrend: string;
    recommendedStrategy: string;
  };
}

const METAL_DATA: Record<MetalType, MetalSentimentData> = {
  gold: {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    currentSpotSgd: 3862.50,
    currentSpotUsd: 2882.40,
    forecastRangeSgd: [3830, 3925],
    forecastRangeUsd: [2850, 2920],
    overallBias: 'Bullish',
    biasScore: 78,
    sentimentBreakdown: {
      bullishPct: 72,
      neutralPct: 18,
      bearishPct: 10,
    },
    targetTimeframes: {
      shortTerm: {
        label: 'Near-Term Target',
        timeframe: '1 - 3 Months (Q3 2026)',
        targetUsd: 2820,
        targetSgd: 3780,
        keyDriver: 'Central bank accumulation & interest rate cut expectations',
      },
      midTerm: {
        label: 'Mid-Term Target',
        timeframe: '3 - 6 Months (Q4 2026)',
        targetUsd: 2910,
        targetSgd: 3890,
        keyDriver: 'Institutional hedging & seasonal Q4 physical retail demand',
      },
      longTerm: {
        label: 'Long-Term Target',
        timeframe: '12 Months (2027)',
        targetUsd: 3100,
        targetSgd: 4150,
        keyDriver: 'Global monetary expansion & structural reserve diversification',
      },
    },
    keyDrivers: [
      {
        title: 'Central Bank Accumulation & Asian Physical Buying',
        desc: 'Sustained institutional reserve diversification in SG/HK vaults & steady Singapore IPM tax-free physical bar demand.',
        impact: 'High',
      },
      {
        title: 'Fed Interest Rate Cut Expectations',
        desc: 'Market pricing in 85% probability of upcoming rate cuts, reducing opportunity holding cost for non-yielding bullion.',
        impact: 'Positive',
      },
      {
        title: 'Geopolitical Safe-Haven Inflows',
        desc: 'Ongoing Middle East & Eastern European uncertainties maintaining robust baseline hedging demand.',
        impact: 'High',
      },
    ],
    technicalLevels: {
      support1: 'S$3,820 ($2,850)',
      support2: 'S$3,780 ($2,820)',
      resistance1: 'S$3,900 ($2,910)',
      resistance2: 'S$3,950 ($2,950)',
      pivot: 'S$3,850 ($2,875)',
    },
    weeklySchedule: [
      { day: 'Monday', dateLabel: 'Day 1', event: 'Global Manufacturing PMI & Asian Vault Deposit Flows', expectedImpact: 'Moderate consolidation around S$3,850', trendBias: 'Neutral' },
      { day: 'Tuesday', dateLabel: 'Day 2', event: 'US Core PPI Inflation Release & Fed Speeches', expectedImpact: 'Potential breakout test towards resistance 1', trendBias: 'Bullish' },
      { day: 'Wednesday', dateLabel: 'Day 3', event: 'US CPI Data & FOMC Rate Outlook Speeches', expectedImpact: 'High volatility; primary weekly catalyst', trendBias: 'Volatile' },
      { day: 'Thursday', dateLabel: 'Day 4', event: 'Weekly Jobless Claims & Precious Metals Options Expiry', expectedImpact: 'DCA accumulation pullbacks welcomed', trendBias: 'Bullish' },
      { day: 'Friday', dateLabel: 'Day 5', event: 'Weekly Position Close & Institutional Hedge Adjustment', expectedImpact: 'Targeting higher weekly close above S$3,890', trendBias: 'Bullish' },
    ],
    physicalRetailOutlook: {
      sgHkDemand: 'Very Strong. 1oz Cast/Minted bars experiencing elevated re-stocking velocity across Silver Bullion & BullionStar.',
      retailPremiumTrend: 'Stable to slightly tightening (+2.2% to +2.7% over spot). Low premium bars highly recommended.',
      recommendedStrategy: 'DCA & Steady Accumulation. Target dips near S$3,830 ($2,850) for 100g or 1oz gold bars.',
    },
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    symbol: 'XAG',
    color: 'text-slate-200',
    badgeBg: 'bg-slate-300/20 border-slate-400/40 text-slate-200',
    iconBg: 'bg-slate-300/20 text-slate-200 border-slate-400/30',
    currentSpotSgd: 42.80,
    currentSpotUsd: 31.95,
    forecastRangeSgd: [41.50, 45.20],
    forecastRangeUsd: [31.00, 33.80],
    overallBias: 'Bullish',
    biasScore: 84,
    sentimentBreakdown: {
      bullishPct: 80,
      neutralPct: 12,
      bearishPct: 8,
    },
    targetTimeframes: {
      shortTerm: {
        label: 'Near-Term Target',
        timeframe: '1 - 3 Months (Q3 2026)',
        targetUsd: 32.10,
        targetSgd: 43.00,
        keyDriver: 'Photovoltaic solar cell production surge & COMEX vault depletion',
      },
      midTerm: {
        label: 'Mid-Term Target',
        timeframe: '3 - 6 Months (Q4 2026)',
        targetUsd: 33.00,
        targetSgd: 44.20,
        keyDriver: 'Gold/Silver ratio compression towards 78:1 historical median',
      },
      longTerm: {
        label: 'Long-Term Target',
        timeframe: '12 Months (2027)',
        targetUsd: 36.00,
        targetSgd: 48.20,
        keyDriver: '5th consecutive global annual physical deficit & industrial shortage',
      },
    },
    keyDrivers: [
      {
        title: 'Industrial Solar & EV Dual-Demand Surplus',
        desc: 'Photovoltaic solar cell production expansion driving 5th consecutive annual global physical silver deficit.',
        impact: 'High',
      },
      {
        title: 'Gold/Silver Ratio Compression',
        desc: 'GSR hovering around 90:1, indicating historical undervaluation of silver relative to gold.',
        impact: 'Positive',
      },
      {
        title: 'Retail Bulk Monster Box Demand in SG/HK',
        desc: 'Increased wholesale volume orders at LPM and BullionStar for 100oz and 1000oz silver bars.',
        impact: 'High',
      },
    ],
    technicalLevels: {
      support1: 'S$41.60 ($31.00)',
      support2: 'S$40.20 ($30.00)',
      resistance1: 'Wait test at S$44.20 ($33.00)',
      resistance2: 'Key breakout level S$45.50 ($34.00)',
      pivot: 'S$42.30 ($31.60)',
    },
    weeklySchedule: [
      { day: 'Monday', dateLabel: 'Day 1', event: 'Industrial Metals Benchmark Index Opening', expectedImpact: 'Rallying support off S$42.00 base', trendBias: 'Bullish' },
      { day: 'Tuesday', dateLabel: 'Day 2', event: 'Solar Sector Supply Chain Shipments Report', expectedImpact: 'Industrial bid boost for 100oz physical bars', trendBias: 'Bullish' },
      { day: 'Wednesday', dateLabel: 'Day 3', event: 'US Inflation CPI & Dollar Index Movement', expectedImpact: 'Silver outperformance expected vs Gold during dips', trendBias: 'Volatile' },
      { day: 'Thursday', dateLabel: 'Day 4', event: 'COMEX Vault Stock Inventory Report', expectedImpact: 'Continued inventory drawdowns in physical vaults', trendBias: 'Bullish' },
      { day: 'Friday', dateLabel: 'Day 5', event: 'Weekly Futures Options Settlement', expectedImpact: 'Strong close target above S$44.00', trendBias: 'Bullish' },
    ],
    physicalRetailOutlook: {
      sgHkDemand: 'Extremely High. 10oz and 100oz cast bars are moving rapidly among Singapore and Hong Kong investors.',
      retailPremiumTrend: 'Moderate (+11.5% to +14.8% over spot). Bulk 1000oz bars offer the lowest premiums (+7.2%).',
      recommendedStrategy: 'High-Conviction Accumulation. Prefer 100oz Cast Bars or 1000oz industrial bars for lowest premiums.',
    },
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    symbol: 'XPT',
    color: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    currentSpotSgd: 1320.00,
    currentSpotUsd: 985.00,
    forecastRangeSgd: [1290, 1370],
    forecastRangeUsd: [960, 1020],
    overallBias: 'Moderately Bullish',
    biasScore: 65,
    sentimentBreakdown: {
      bullishPct: 58,
      neutralPct: 30,
      bearishPct: 12,
    },
    targetTimeframes: {
      shortTerm: {
        label: 'Near-Term Target',
        timeframe: '1 - 3 Months (Q3 2026)',
        targetUsd: 1010,
        targetSgd: 1350,
        keyDriver: 'South African power grid supply tightness & auto substitution',
      },
      midTerm: {
        label: 'Mid-Term Target',
        timeframe: '3 - 6 Months (Q4 2026)',
        targetUsd: 1050,
        targetSgd: 1405,
        keyDriver: 'Hybrid vehicle catalytic converter demand recovery',
      },
      longTerm: {
        label: 'Long-Term Target',
        timeframe: '12 Months (2027)',
        targetUsd: 1150,
        targetSgd: 1540,
        keyDriver: 'Green hydrogen electrolyzer catalyst adoption expansion',
      },
    },
    keyDrivers: [
      {
        title: 'Automotive Catalyst Substitution Shift',
        desc: 'Automakers substituting palladium with cheaper platinum in internal combustion & hybrid catalytic converters.',
        impact: 'Positive',
      },
      {
        title: 'South African Mining Supply Disruptions',
        desc: 'Power grid constraints and operational challenges limiting primary mine output in South Africa.',
        impact: 'High',
      },
      {
        title: 'Hydrogen Economy Long-Term Play',
        desc: 'Growing hydrogen fuel cell catalyst allocation attracting long-term institutional investors.',
        impact: 'Neutral',
      },
    ],
    technicalLevels: {
      support1: 'S$1,280 ($955)',
      support2: 'S$1,240 ($925)',
      resistance1: 'S$1,350 ($1,010)',
      resistance2: 'Psychological $1,050 (S$1,405)',
      pivot: 'S$1,310 ($978)',
    },
    weeklySchedule: [
      { day: 'Monday', dateLabel: 'Day 1', event: 'Global Automotive Production Data', expectedImpact: 'Steady demand baseline', trendBias: 'Neutral' },
      { day: 'Tuesday', dateLabel: 'Day 2', event: 'South Africa Mining Production Index', expectedImpact: 'Supply tightness headline potential', trendBias: 'Bullish' },
      { day: 'Wednesday', dateLabel: 'Day 3', event: 'Macro Dollar Correlation Shift', expectedImpact: 'Range-bound trading between $975 - $995', trendBias: 'Neutral' },
      { day: 'Thursday', dateLabel: 'Day 4', event: 'Industrial Precious Metal Inventory Checks', expectedImpact: 'Gradual upward drift towards resistance 1', trendBias: 'Moderately Bullish' },
      { day: 'Friday', dateLabel: 'Day 5', event: 'Weekly Commodity Index Rebalancing', expectedImpact: 'Support holding around S$1,310', trendBias: 'Neutral' },
    ],
    physicalRetailOutlook: {
      sgHkDemand: 'Steady Niche Growth. 1oz Minted Platinum coins & bars receiving zero-GST interest in SG.',
      retailPremiumTrend: 'Slightly higher premiums (+5.5% to +8.2%) due to smaller physical minting run batches.',
      recommendedStrategy: 'Selective Value Buy. Look for 1oz Valcambi or Credit Suisse Platinum bars when spot dips below S$1,300.',
    },
  },
  palladium: {
    id: 'palladium',
    name: 'Palladium',
    symbol: 'XPD',
    color: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    currentSpotSgd: 1285.00,
    currentSpotUsd: 958.00,
    forecastRangeSgd: [1220, 1340],
    forecastRangeUsd: [910, 1000],
    overallBias: 'Neutral',
    biasScore: 50,
    sentimentBreakdown: {
      bullishPct: 42,
      neutralPct: 38,
      bearishPct: 20,
    },
    targetTimeframes: {
      shortTerm: {
        label: 'Near-Term Target',
        timeframe: '1 - 3 Months (Q3 2026)',
        targetUsd: 980,
        targetSgd: 1310,
        keyDriver: 'Automotive restock cycle & short-covering rallies',
      },
      midTerm: {
        label: 'Mid-Term Target',
        timeframe: '3 - 6 Months (Q4 2026)',
        targetUsd: 1020,
        targetSgd: 1365,
        keyDriver: 'ICE auto production stabilization in emerging markets',
      },
      longTerm: {
        label: 'Long-Term Target',
        timeframe: '12 Months (2027)',
        targetUsd: 1100,
        targetSgd: 1470,
        keyDriver: 'Niche industrial catalyst applications & mine discipline',
      },
    },
    keyDrivers: [
      {
        title: 'EV Market Share Pressure',
        desc: 'Pure Battery Electric Vehicle (BEV) growth reducing long-term ICE exhaust catalyst demand.',
        impact: 'Neutral',
      },
      {
        title: 'Russian Supply Stream Sanctions Stability',
        desc: 'Supply flows from Norilsk Nickel remain operational through alternative Asian trade channels.',
        impact: 'Neutral',
      },
      {
        title: 'Tactical Short Covering Rallies',
        desc: 'Futures positioning remains heavily shorted, creating potential rapid short-squeeze spikes.',
        impact: 'High',
      },
    ],
    technicalLevels: {
      support1: 'S$1,220 ($910)',
      support2: 'S$1,180 ($880)',
      resistance1: 'S$1,340 ($1,000)',
      resistance2: 'S$1,400 ($1,045)',
      pivot: 'S$1,275 ($950)',
    },
    weeklySchedule: [
      { day: 'Monday', dateLabel: 'Day 1', event: 'Global Auto Sales Data Release', expectedImpact: 'Consolidation at $950 support', trendBias: 'Neutral' },
      { day: 'Tuesday', dateLabel: 'Day 2', event: 'NYMEX Futures Commitments of Traders (COT)', expectedImpact: 'Short cover monitoring', trendBias: 'Volatile' },
      { day: 'Wednesday', dateLabel: 'Day 3', event: 'US Industrial Production Report', expectedImpact: 'Swings based on broader macro trends', trendBias: 'Neutral' },
      { day: 'Thursday', dateLabel: 'Day 4', event: 'Asian Physical Trading Activity', expectedImpact: 'Modest retail volume at LPM / BullionStar', trendBias: 'Neutral' },
      { day: 'Friday', dateLabel: 'Day 5', event: 'Weekly Commodity Closing', expectedImpact: 'Testing pivotal $960 level', trendBias: 'Neutral' },
    ],
    physicalRetailOutlook: {
      sgHkDemand: 'Moderate / Collector Focus. Lower physical retail inventory relative to Gold/Silver.',
      retailPremiumTrend: 'Wider spread due to lower liquidity (+7.0% to +10.5%).',
      recommendedStrategy: 'Tactical / Contrarian Trading. Keep allocation small relative to Gold & Silver foundation.',
    },
  },
};

export const MarketSentimentModal: React.FC<MarketSentimentModalProps> = ({
  currency,
  spotPrices,
  computedProducts,
  onClose,
}) => {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');

  // Compute live spot prices for selected metal
  const liveSpotUsd = useMemo(() => {
    switch (selectedMetal) {
      case 'gold':
        return spotPrices.goldUsdPerOz;
      case 'silver':
        return spotPrices.silverUsdPerOz;
      case 'platinum':
        return 985.00;
      case 'palladium':
        return 958.00;
    }
  }, [selectedMetal, spotPrices]);

  const liveSpotSgd = useMemo(() => {
    return liveSpotUsd * spotPrices.usdToSgdRate;
  }, [liveSpotUsd, spotPrices.usdToSgdRate]);

  // Compute dynamic forecast range based on live spot price
  const forecastRanges = useMemo(() => {
    let lowerPct = 0.985;
    let upperPct = 1.020;

    if (selectedMetal === 'silver') {
      lowerPct = 0.965;
      upperPct = 1.055;
    } else if (selectedMetal === 'platinum') {
      lowerPct = 0.975;
      upperPct = 1.035;
    } else if (selectedMetal === 'palladium') {
      lowerPct = 0.950;
      upperPct = 1.040;
    }

    const rangeUsd: [number, number] = [
      +(liveSpotUsd * lowerPct).toFixed(2),
      +(liveSpotUsd * upperPct).toFixed(2),
    ];
    const rangeSgd: [number, number] = [
      +(liveSpotSgd * lowerPct).toFixed(2),
      +(liveSpotSgd * upperPct).toFixed(2),
    ];

    return { rangeUsd, rangeSgd };
  }, [selectedMetal, liveSpotUsd, liveSpotSgd]);

  // Dynamic Technical Pivot Levels based on live spot price
  const technicalLevels = useMemo(() => {
    const formatPrice = (usd: number, sgd: number) => {
      if (currency === 'SGD') return `S$${sgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (currency === 'USD') return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return `S$${sgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${usd.toFixed(2)})`;
    };

    return {
      support2: formatPrice(liveSpotUsd * 0.97, liveSpotSgd * 0.97),
      support1: formatPrice(liveSpotUsd * 0.985, liveSpotSgd * 0.985),
      pivot: formatPrice(liveSpotUsd, liveSpotSgd),
      resistance1: formatPrice(liveSpotUsd * 1.015, liveSpotSgd * 1.015),
      resistance2: formatPrice(liveSpotUsd * 1.03, liveSpotSgd * 1.03),
    };
  }, [liveSpotUsd, liveSpotSgd, currency]);

  // Get matching live computed retail products for this metal
  const liveRetailQuotes = useMemo(() => {
    const metalName = selectedMetal === 'gold' ? 'Gold' : selectedMetal === 'silver' ? 'Silver' : null;
    if (!metalName) return [];

    return computedProducts
      .filter((p) => p.product.metal === metalName)
      .slice(0, 4); // Top 4 key benchmark products
  }, [selectedMetal, computedProducts]);

  const baseData = METAL_DATA[selectedMetal];

  const formatMoney = (amountSgd: number, amountUsd: number) => {
    if (currency === 'SGD') {
      return `S$${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'USD') {
      return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `S$${amountSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatRange = (rangeSgd: [number, number], rangeUsd: [number, number]) => {
    if (currency === 'SGD') {
      return `S$${rangeSgd[0].toLocaleString()} - S$${rangeSgd[1].toLocaleString()}`;
    }
    if (currency === 'USD') {
      return `$${rangeUsd[0].toLocaleString()} - $${rangeUsd[1].toLocaleString()}`;
    }
    return `S$${rangeSgd[0].toLocaleString()} - S$${rangeSgd[1].toLocaleString()} ($${rangeUsd[0]} - $${rangeUsd[1]})`;
  };

  // Compute dynamic daily roadmap dates starting from today
  const dynamicSchedule = useMemo(() => {
    const today = new Date();
    return baseData.weeklySchedule.map((item, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = idx === 0;
      return {
        ...item,
        dayLabel: isToday ? `Today (${dayName})` : dayName,
        dateLabel: dateFormatted,
        isToday,
      };
    });
  }, [baseData]);

  // Live Gold/Silver Ratio computations
  const liveGsr = useMemo(() => {
    return (spotPrices.goldUsdPerOz / (spotPrices.silverUsdPerOz || 1)).toFixed(2);
  }, [spotPrices.goldUsdPerOz, spotPrices.silverUsdPerOz]);

  const liveGoldSgd = useMemo(() => spotPrices.goldUsdPerOz * spotPrices.usdToSgdRate, [spotPrices.goldUsdPerOz, spotPrices.usdToSgdRate]);
  const liveSilverSgd = useMemo(() => spotPrices.silverUsdPerOz * spotPrices.usdToSgdRate, [spotPrices.silverUsdPerOz, spotPrices.usdToSgdRate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 shadow-md flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-sans">
                  Live Market Sentiment & Trajectory Report
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Week Ahead Forecast
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live pricing, weekly directional trajectory, technical pivots & SG/HK physical quotes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Market Pulse Indicator Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
              Market Feed
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-mono text-[11px] font-semibold">
              Gold: ${spotPrices.goldUsdPerOz.toFixed(2)}/oz (S${(spotPrices.goldUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200 font-mono text-[11px] font-semibold">
              Silver: ${spotPrices.silverUsdPerOz.toFixed(2)}/oz (S${(spotPrices.silverUsdPerOz * spotPrices.usdToSgdRate).toFixed(2)})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              1 USD = {spotPrices.usdToSgdRate.toFixed(4)} SGD
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-3 h-3 text-amber-400" />
            <span>Updated: {new Date(spotPrices.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* Metal Tabs Bar */}
        <div className="flex items-center space-x-2 px-5 pt-3 pb-2 bg-slate-900/60 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {(['gold', 'silver', 'platinum', 'palladium'] as MetalType[]).map((metalKey) => {
            const metalInfo = METAL_DATA[metalKey];
            const isActive = selectedMetal === metalKey;

            return (
              <button
                key={metalKey}
                onClick={() => setSelectedMetal(metalKey)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${metalKey === 'gold' ? 'bg-amber-400' : metalKey === 'silver' ? 'bg-slate-300' : metalKey === 'platinum' ? 'bg-cyan-300' : 'bg-purple-300'}`} />
                <span>{metalInfo.name} ({metalInfo.symbol})</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {metalInfo.overallBias}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spot & Weekly Expected Range */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Spot Quote
                </span>
                <span className="font-semibold text-slate-300">{baseData.symbol}/oz</span>
              </div>
              <div className="text-xl font-black font-mono text-white flex items-baseline gap-2">
                <span>{formatMoney(liveSpotSgd, liveSpotUsd)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-0.5">Week Ahead Forecast Range:</span>
                <span className="text-xs font-bold font-mono text-amber-300">
                  {formatRange(forecastRanges.rangeSgd, forecastRanges.rangeUsd)}
                </span>
              </div>
            </div>

            {/* Directional Bias Meter */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Weekly Trajectory Bias</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${baseData.badgeBg}`}>
                  {baseData.overallBias}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-amber-400 font-mono">{baseData.biasScore}%</span>
                <span className="text-xs text-slate-400">Bullish Confidence Index</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-700/50">
                <div style={{ width: `${baseData.sentimentBreakdown.bullishPct}%` }} className="bg-emerald-500 h-full" title={`Bullish: ${baseData.sentimentBreakdown.bullishPct}%`} />
                <div style={{ width: `${baseData.sentimentBreakdown.neutralPct}%` }} className="bg-amber-400 h-full" title={`Neutral: ${baseData.sentimentBreakdown.neutralPct}%`} />
                <div style={{ width: `${baseData.sentimentBreakdown.bearishPct}%` }} className="bg-rose-500 h-full" title={`Bearish: ${baseData.sentimentBreakdown.bearishPct}%`} />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                <span className="text-emerald-400">🟢 Bullish {baseData.sentimentBreakdown.bullishPct}%</span>
                <span className="text-amber-300">🟡 Neutral {baseData.sentimentBreakdown.neutralPct}%</span>
                <span className="text-rose-400">🔴 Bearish {baseData.sentimentBreakdown.bearishPct}%</span>
              </div>
            </div>

            {/* Physical SG/HK Retail Outlook */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Physical Retail Buyer Strategy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {baseData.physicalRetailOutlook.recommendedStrategy}
              </p>
              <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                <span>SG/HK Retail Premium Trend: </span>
                <strong className="text-white font-mono">{baseData.physicalRetailOutlook.retailPremiumTrend}</strong>
              </div>
            </div>
          </div>

          {/* Multi-Horizon Price Target & Trajectory Timeframe Matrix */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/40 p-4 rounded-xl space-y-3.5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <span>{baseData.name} ({baseData.symbol}) Multi-Horizon Price Targets & Timeframes</span>
                    <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono font-bold">
                      Live Baseline: {formatMoney(liveSpotSgd, liveSpotUsd)}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Live target price trajectories, expected returns vs. current live spot quote, and underlying catalyst drivers
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'shortTerm', horizon: baseData.targetTimeframes.shortTerm, bg: 'from-amber-500/10 to-slate-900 border-amber-500/30' },
                { key: 'midTerm', horizon: baseData.targetTimeframes.midTerm, bg: 'from-emerald-500/10 to-slate-900 border-emerald-500/40' },
                { key: 'longTerm', horizon: baseData.targetTimeframes.longTerm, bg: 'from-indigo-500/10 to-slate-900 border-indigo-500/30' },
              ].map(({ key, horizon, bg }) => {
                const upsidePct = ((horizon.targetSgd - liveSpotSgd) / liveSpotSgd) * 100;
                const isPositive = upsidePct >= 0;

                return (
                  <div key={key} className={`bg-gradient-to-b ${bg} border p-3.5 rounded-xl space-y-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {horizon.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {horizon.timeframe}
                        </span>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Price</span>
                        <div className="text-xl font-black font-mono text-white flex items-baseline gap-2">
                          <span>S${horizon.targetSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-xs text-slate-400 font-normal">(${horizon.targetUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                        </div>
                      </div>

                      {/* Live Upside / Expected Return Indicator */}
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold">Variance vs Live Spot:</span>
                        <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                          <span>{isPositive ? '+' : ''}{upsidePct.toFixed(1)}%</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2 bg-slate-950/60 p-2 rounded border border-slate-800 leading-snug">
                      <strong className="text-amber-300 text-[10px] uppercase font-bold block mb-0.5">Key Catalyst Driver:</strong>
                      {horizon.keyDriver}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Physical Retail Bullion Quotes Table */}
          {liveRetailQuotes.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  Live Physical Retail Quotations (SG / HK Vaults)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Best Buy Retailer Quotes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveRetailQuotes.map((item) => {
                  const { product, bestBuyRetailerId, retailerMetrics, lowestPremiumPct } = item;
                  const bestMetrics = retailerMetrics[bestBuyRetailerId];
                  const retailer = RETAILERS[bestBuyRetailerId];

                  return (
                    <div
                      key={product.id}
                      onClick={(e) => openRetailerListing(bestBuyRetailerId, product, e)}
                      className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 hover:border-amber-400/60 transition-all cursor-pointer group space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {product.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {product.formFactor} • {product.weightOz} oz ({product.purity})
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${retailer.badgeBg} flex-shrink-0`}>
                          {retailer.shortName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lowest Live Price:</span>
                          <strong className="text-amber-300 font-mono text-sm">
                            {formatMoney(bestMetrics.buyPriceSgd, bestMetrics.buyPriceUsd)}
                          </strong>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Lowest Premium:</span>
                          <strong className="text-emerald-400 font-mono text-xs">
                            +{lowestPremiumPct}%
                          </strong>
                        </div>

                        <button
                          onClick={(e) => openRetailerListing(bestBuyRetailerId, product, e)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Order</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Drivers Section */}
          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Key Catalysts & Market Drivers (Next 7 Days)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {baseData.keyDrivers.map((driver, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{driver.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      driver.impact === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {driver.impact} Impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{driver.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Support & Resistance Grid */}
          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Live Technical Pivot & Price Boundaries
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-rose-400 font-bold block mb-0.5">Support 2 (Floor)</span>
                <span className="font-bold font-mono text-slate-200">{technicalLevels.support2}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-amber-400 font-bold block mb-0.5">Support 1 (Buy Zone)</span>
                <span className="font-bold font-mono text-slate-200">{technicalLevels.support1}</span>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30">
                <span className="text-[10px] text-amber-300 font-extrabold block mb-0.5">Live Pivot Point</span>
                <span className="font-black font-mono text-amber-300">{technicalLevels.pivot}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">Resistance 1</span>
                <span className="font-bold font-mono text-slate-200">{technicalLevels.resistance1}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-teal-400 font-bold block mb-0.5">Resistance 2 (Target)</span>
                <span className="font-bold font-mono text-slate-200">{technicalLevels.resistance2}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Live Gold/Silver Ratio & Arbitrage Trajectory Card */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/50 p-4 rounded-xl space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/40">
                  <Scale className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    Live Gold / Silver Ratio (Au/Ag) Analysis & Daily Trajectory
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Real-time valuation metric & daily physical arbitrage target tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Live Ratio: {liveGsr} : 1
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Physical Ratio Breakdown</span>
                <div className="text-lg font-black font-mono text-indigo-200">
                  1 oz Gold = {liveGsr} oz Silver
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  S${liveGoldSgd.toFixed(2)} / S${liveSilverSgd.toFixed(2)} per oz
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">10-Year Historical Mean Comparison</span>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold font-mono text-white">75.0 : 1 Mean</span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    +{((parseFloat(liveGsr) - 75) / 75 * 100).toFixed(1)}% Elevated
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Current {liveGsr}:1 ratio signals Silver is historically undervalued vs Gold.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Daily Trajectory & Arbitrage Signal</span>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Targeting Compression to 78:1</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Physical Silver accumulation (100oz / 1kg bars) favoured for ratio normalization.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Outlook Timeline (Mon - Fri) */}
          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              Daily Event & Volatility Roadmap (Rolling 5-Day Schedule)
            </h4>

            <div className="space-y-2">
              {dynamicSchedule.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                  item.isToday
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/80 border-slate-700/60'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-28 flex-shrink-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-amber-300 block">{item.dayLabel}</span>
                        {item.isToday && (
                          <span className="px-1 py-0.2 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.dateLabel}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{item.event}</span>
                      <span className="text-[11px] text-slate-400">{item.expectedImpact}</span>
                    </div>
                  </div>

                  <span className={`self-start sm:self-center text-[10px] font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${
                    item.trendBias === 'Bullish'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : item.trendBias === 'Volatile'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {item.trendBias}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Singapore (Silver Bullion, BullionStar) & Hong Kong (LPM) Market Intelligence</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            Close Sentiment Report
          </button>
        </div>
      </div>
    </div>
  );
};
