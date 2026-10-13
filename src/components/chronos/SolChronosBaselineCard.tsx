import React from 'react';
import { 
  History, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Download, 
  Clock, 
  ExternalLink,
  Satellite,
  Compass
} from 'lucide-react';
import { Language } from '../../types/ecosystem';
import { HISTORICAL_EPOCHS, CHRONOS_REGIONAL_CLUSTERS } from '../../data/chronosData';
import { generateChronosSovereignReport } from '../../utils/chronosPdfGenerator';

interface SolChronosBaselineCardProps {
  language: Language;
  onLaunchChronos: () => void;
}

export const SolChronosBaselineCard: React.FC<SolChronosBaselineCardProps> = ({
  language,
  onLaunchChronos
}) => {
  const isAr = language === 'ar';
  const baseline1988 = HISTORICAL_EPOCHS[0];
  const live2026 = HISTORICAL_EPOCHS[HISTORICAL_EPOCHS.length - 1];

  const handleQuickDownloadPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateChronosSovereignReport({
      cluster: CHRONOS_REGIONAL_CLUSTERS[0],
      epochs: HISTORICAL_EPOCHS,
      baselineYear: 1988,
      comparisonYear: 2026,
      language
    });
  };

  return (
    <div 
      onClick={onLaunchChronos}
      className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3 sm:p-4 shadow-lg transition-all cursor-pointer group hover:shadow-emerald-950/20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info & Badges */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/15 to-teal-500/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
            <History className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isAr ? 'خط الأساس التاريخي والتحليل العقدي (Sol-Chronos 1988-2026)' : 'Sol-Chronos Historical Baseline & Decadal Analytics'}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>PostGIS Multi-Decadal</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr
                ? 'مقارنة تفاعلية (Split-Swipe) لتحول الصحراء البكر إلى واحات قمح دائرية خضراء عبر 38 عاماً من رصد الأقمار الصناعية'
                : 'Interactive split-swipe comparison of multi-decadal desert-to-oasis reclamation across 38 years of satellite records'}
            </p>
          </div>
        </div>

        {/* Right: Metrics & Action Buttons */}
        <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
          {/* Quick Metrics Pills */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
            <div className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
              <span className="text-slate-500 text-[10px] block">1988 Baseline</span>
              <span className="font-bold text-amber-400">0 ha · NDVI 0.08</span>
            </div>

            <span className="text-slate-600">➔</span>

            <div className="px-2 py-1 rounded-md bg-slate-950 border border-emerald-900/60 text-emerald-300">
              <span className="text-emerald-500/80 text-[10px] block">2026 Oasis Twin</span>
              <span className="font-bold text-emerald-400">+4,850 ha · NDVI 0.74</span>
            </div>
          </div>

          {/* PDF Download Shortcut */}
          <button
            onClick={handleQuickDownloadPdf}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Export Sovereign Historical Audit PDF"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Launch Sol-Chronos Engine Button */}
          <button
            onClick={onLaunchChronos}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md group-hover:bg-emerald-500"
          >
            <span>{isAr ? 'فتح محرك المقارنة التفاعلي' : 'Launch Sol-Chronos'}</span>
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
