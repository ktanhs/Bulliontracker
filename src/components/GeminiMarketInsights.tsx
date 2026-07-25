import React, { useState, useEffect } from 'react';
import { SpotPrices } from '../types';
import { fetchMarketInsights } from '../services/api';
import { Sparkles, Send, Bot, RefreshCw, HelpCircle, Lightbulb } from 'lucide-react';

interface GeminiMarketInsightsProps {
  spotPrices: SpotPrices;
}

export const GeminiMarketInsights: React.FC<GeminiMarketInsightsProps> = ({ spotPrices }) => {
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');

  const loadInitialInsight = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMarketInsights({});
      setAnalysisText(res);
    } catch (e) {
      setAnalysisText('Unable to retrieve market analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialInsight();
  }, []);

  const handleCustomQuery = async (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetchMarketInsights({ userQuery: q });
      setAnalysisText(res);
    } catch (e) {
      setAnalysisText('Error generating answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Which retailer has the lowest premium on 1 oz Gold Maple Leaf?',
    'Is Silver Bullion, BullionStar, or LPM cheaper for 1kg silver bars?',
    'Explain how Singapore 0% GST (IPM) applies to Gold & Silver coins',
    'What is the current Gold/Silver Ratio telling physical investors?',
  ];

  return (
    <div className="space-y-6" id="gemini-insights-wrapper">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Gemini AI Bullion Market Intelligence</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full uppercase tracking-wider font-extrabold">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time premium analysis & retailer buying strategy powered by server-side Gemini AI
              </p>
            </div>
          </div>

          <button
            onClick={loadInitialInsight}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Market Brief</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserQuery(q);
                  handleCustomQuery(q);
                }}
                disabled={isLoading}
                className="text-xs bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* User Query Input Box */}
        <div className="mt-4 flex gap-2">
          <input
            id="ai-user-query-input"
            type="text"
            placeholder="Ask anything about precious metals pricing, premiums, or vaulting in SG/Asia..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            id="ai-submit-query-btn"
            onClick={() => handleCustomQuery()}
            disabled={isLoading || !userQuery.trim()}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm rounded-xl flex items-center space-x-2 transition-all shadow"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Analysis Output Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg min-h-[220px] relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-sm font-medium">Gemini AI analyzing live market spot prices & dealer quotes...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
            {analysisText}
          </div>
        )}
      </div>
    </div>
  );
};
