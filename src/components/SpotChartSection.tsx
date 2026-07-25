import React, { useState } from 'react';
import { Currency, SpotPrices } from '../types';
import { generateHistoricalData } from '../data/bullionData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { LineChart as LineChartIcon, TrendingUp, Layers } from 'lucide-react';

interface SpotChartSectionProps {
  spotPrices: SpotPrices;
  currency: Currency;
}

export const SpotChartSection: React.FC<SpotChartSectionProps> = ({
  spotPrices,
  currency,
}) => {
  const [selectedMetalChart, setSelectedMetalChart] = useState<'Gold' | 'Silver'>('Gold');
  const historicalData = React.useMemo(() => generateHistoricalData(spotPrices), [spotPrices]);

  const isUsd = currency === 'USD';
  const currPrefix = isUsd ? '$' : 'S$';

  return (
    <div className="space-y-6" id="spot-chart-wrapper">
      {/* Chart 1: Spot Price History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <LineChartIcon className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-slate-100">30-Day Spot Price History</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical spot benchmark price per troy ounce ({currency})
            </p>
          </div>

          {/* Toggle Gold / Silver */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
            <button
              id="chart-metal-gold-btn"
              onClick={() => setSelectedMetalChart('Gold')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                selectedMetalChart === 'Gold'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gold Spot
            </button>
            <button
              id="chart-metal-silver-btn"
              onClick={() => setSelectedMetalChart('Silver')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                selectedMetalChart === 'Silver'
                  ? 'bg-slate-300 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Silver Spot
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                domain={['dataMin - 10', 'dataMax + 10']}
                tickFormatter={(val) => `${currPrefix}${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [`${currPrefix}${val}`, 'Spot Price']}
              />
              <Line
                type="monotone"
                dataKey={
                  selectedMetalChart === 'Gold'
                    ? isUsd
                      ? 'goldSpotUsd'
                      : 'goldSpotSgd'
                    : isUsd
                    ? 'silverSpotUsd'
                    : 'silverSpotSgd'
                }
                stroke={selectedMetalChart === 'Gold' ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={3}
                dot={{ r: 3, fill: selectedMetalChart === 'Gold' ? '#f59e0b' : '#cbd5e1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Retailer Premium % Comparison Over Time */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-100">Retailer Premium % Comparison Over Time</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Comparing typical premium markup above spot for Silver Bullion, BullionStar, and LPM
        </p>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `+${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(val: any, name: any) => [`+${val}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <Line
                name="Silver Bullion Premium"
                type="monotone"
                dataKey={selectedMetalChart === 'Gold' ? 'sbGoldPremiumPct' : 'sbSilverPremiumPct'}
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                name="BullionStar Premium"
                type="monotone"
                dataKey={selectedMetalChart === 'Gold' ? 'bsGoldPremiumPct' : 'bsSilverPremiumPct'}
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                name="LPM Metals Premium"
                type="monotone"
                dataKey={selectedMetalChart === 'Gold' ? 'lpmGoldPremiumPct' : 'lpmSilverPremiumPct'}
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
