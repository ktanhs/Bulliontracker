import React from 'react';
import { TriggeredAlertNotification, Currency } from '../types';
import { RETAILERS } from '../data/bullionData';
import { BellRing, Check, ExternalLink, X, Zap, ArrowDownRight, Sparkles } from 'lucide-react';

interface PriceAlertToastProps {
  notifications: TriggeredAlertNotification[];
  currency: Currency;
  onDismiss: (id: string) => void;
  onSelectProductById: (productId: string) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  notifications,
  currency,
  onDismiss,
  onSelectProductById,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {notifications.map((notif) => {
        const isBelow = notif.alert.condition === 'BELOW';
        const formattedTarget = notif.alert.alertType === 'BUY_PRICE'
          ? `${notif.alert.targetCurrency === 'USD' ? '$' : 'S$'}${notif.targetValue.toFixed(2)}`
          : `+${notif.targetValue}%`;

        const formattedCurrent = notif.alert.alertType === 'BUY_PRICE'
          ? `${notif.alert.targetCurrency === 'USD' ? '$' : 'S$'}${notif.currentValue.toFixed(2)}`
          : `+${notif.currentValue.toFixed(1)}%`;

        return (
          <div
            key={notif.id}
            className="pointer-events-auto bg-slate-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-4 transform transition-all animate-bounce-short text-white flex flex-col space-y-3 relative overflow-hidden"
          >
            {/* Top glowing bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse" />

            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40 animate-pulse">
                  <BellRing className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                      PRICE ALERT HIT!
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{notif.productName}</h4>
                </div>
              </div>

              <button
                onClick={() => onDismiss(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product & Price details */}
            <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <img
                src={notif.productImageUrl}
                alt={notif.productName}
                className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-slate-900 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-medium">
                  Retailer: <strong className="text-slate-200">{notif.retailerName}</strong>
                </div>
                <div className="text-xs font-mono font-bold mt-0.5 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-extrabold text-sm">{formattedCurrent}</span>
                  <span className="text-[10px] text-slate-400 line-through">Target: {formattedTarget}</span>
                </div>
                {notif.alert.note && (
                  <p className="text-[10px] text-amber-300 italic truncate mt-0.5">
                    "{notif.alert.note}"
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  onSelectProductById(notif.alert.productId);
                  onDismiss(notif.id);
                }}
                className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Deal Details</span>
              </button>
              <button
                onClick={() => onDismiss(notif.id)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
