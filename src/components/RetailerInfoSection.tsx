import React from 'react';
import { RETAILERS } from '../data/bullionData';
import { Building2, ShieldCheck, CreditCard, Lock, Award, ExternalLink, MapPin } from 'lucide-react';

export const RetailerInfoSection: React.FC = () => {
  const retailers = Object.values(RETAILERS);

  return (
    <div className="space-y-6" id="retailers-info-wrapper">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Dealer Profiles & Singapore GST Guidelines</h2>
            <p className="text-xs text-slate-400">
              Detailed comparison of Silver Bullion, BullionStar, and LPM payment methods, locations, vaulting, and tax status
            </p>
          </div>
        </div>
      </div>

      {/* Retailer Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {retailers.map((ret) => (
          <div
            key={ret.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Badge & Title */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${ret.badgeBg}`}>
                  {ret.shortName}
                </span>
                <a
                  href={ret.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{ret.name}</h3>

              {/* Location */}
              <div className="flex items-start space-x-2 text-xs text-slate-300 mb-4 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{ret.location}</span>
              </div>

              {/* Key Features */}
              <div className="space-y-3 text-xs text-slate-300 mb-6">
                <div>
                  <div className="text-slate-400 font-semibold mb-1 flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accepted Payments:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ret.paymentMethods.map((pm) => (
                      <span key={pm} className="bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-[11px]">
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tax / GST Status:</span>
                  </div>
                  <p className="text-slate-200">{ret.vatGstInfo}</p>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold mb-1 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>High Security Storage:</span>
                  </div>
                  <p className="text-slate-200">
                    {ret.vaultStorage
                      ? 'Fully insured physical vaulting available with serialized ownership certificates.'
                      : 'Physical delivery only.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Advantage */}
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-amber-300 block mb-1">Key Specialization:</span>
              <p>
                {ret.id === 'silverbullion' &&
                  'Famous for low premiums on 1kg / 100oz silver bars and peer-to-peer secured P2P loan backing at The Reserve vault.'}
                {ret.id === 'bullionstar' &&
                  'Exceptional for 1 oz Gold Maple Leaf & Silver Kangaroo coins with instant walk-in over-the-counter retail showroom purchasing.'}
                {ret.id === 'lpm' &&
                  'Leading official distributor for Royal Mint, Perth Mint & US Mint with competitive wholesale international bullion delivery.'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Singapore GST (IPM) Educational Guide Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">Singapore Investment Precious Metals (IPM) 0% GST Exemption</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In Singapore, precious metals that qualify as <strong>Investment Precious Metals (IPM)</strong> are strictly exempt from 9% Goods and Services Tax (GST). Qualifying criteria:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400 list-disc list-inside">
              <li><strong>Gold:</strong> Must be at least 99.5% pure (.995+) in bar or qualifying coin form (e.g., Gold Maple, Krugerrand, Eagle, Britannia).</li>
              <li><strong>Silver:</strong> Must be at least 99.9% pure (.999+) produced by an LBMA accredited refiner.</li>
              <li><strong>Platinum & Palladium:</strong> Must be at least 99.95% pure.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
