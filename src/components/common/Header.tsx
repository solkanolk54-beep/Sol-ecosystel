import React from 'react';
import { 
  Globe2, 
  Satellite, 
  Radio, 
  Database, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
  Code2,
  BookOpen
} from 'lucide-react';
import { Language, SovereignCloudStatus, UserRole } from '../../types/ecosystem';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: 'gis' | 'passports' | 'sovereign' | 'api';
  setActiveTab: (tab: 'gis' | 'passports' | 'sovereign' | 'api') => void;
  cloudStatus: SovereignCloudStatus;
  currentRole?: UserRole;
  onSimulateStress: () => void;
  onSimulateGrazing: () => void;
  onResetSimulation: () => void;
  onOpenSopManual?: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  activeTab,
  setActiveTab,
  cloudStatus,
  currentRole = 'ALL',
  onSimulateStress,
  onSimulateGrazing,
  onResetSimulation,
  onOpenSopManual,
  activeAlertCount
}) => {
  const isAr = language === 'ar';

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Sovereign Status Bar */}
      <div className="border-b border-slate-900 bg-slate-900/40 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isAr ? 'الناقل السيادي: متصل' : 'Sovereign Bus: ONLINE'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono">{cloudStatus.eventBusThroughputMsgSec} msg/s</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostGIS / GeoServer: 14ms</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'تشفير سيادي: AES-256-GCM' : 'Sovereign Encryption: AES-256-GCM'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Globe2 className="w-3 h-3 text-slate-500" />
            <span>KSA-Central-1 (Riyadh Node)</span>
          </div>

          <button
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Switch Language"
          >
            {isAr ? 'English (EN)' : 'العربية (AR)'}
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Systems Integration */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>{isAr ? 'منظومة SOL-Ecosystem' : 'SOL-Ecosystem Platform'}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v3.4 Sovereign
                </span>
              </h1>
              {onOpenSopManual && (
                <button
                  onClick={onOpenSopManual}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title="Open Standard Operating Procedure Manual"
                >
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  <span>SOP-2026-V1</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span className="text-teal-400 font-medium">SolVision</span>
              <span className="text-slate-600">×</span>
              <span className="text-cyan-400 font-medium">Kareema</span>
              <span className="text-slate-600">×</span>
              <span className="text-indigo-400 font-medium">AtlasCloud</span>
              <span className="text-slate-600">·</span>
              <span>{isAr ? 'الاستشعار الفضائي والعمليات الميدانية والسحابة الجغرافية' : 'Earth Observation, Field Ops & Sovereign GIS'}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gis')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'gis'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخريطة والعمليات اللحظية' : 'GIS & Operations'}</span>
            {activeAlertCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('passports')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'passports'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'بطاقات الجودة الرقمية' : 'Quality Passports'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sovereign')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'sovereign'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isAr ? 'الحوكمة وسحابة AtlasCloud' : 'Sovereign Cloud'}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'معمارية REST & OpenAPI' : 'OpenAPI Specs'}</span>
          </button>
        </div>

        {/* Live Simulation Trigger Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSimulateStress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="SolVision -> AtlasCloud -> Kareema workflow test"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'محاكاة إجهاد محصول (SolVision)' : 'Simulate Crop Stress'}</span>
          </button>

          <button
            onClick={onSimulateGrazing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            title="Kareema -> SolVision Rotational Grazing Alert test"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'محاكاة رعي جائر (Kareema)' : 'Simulate Overgrazing'}</span>
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1.5 rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={isAr ? 'إعادة ضبط المحاكاة' : 'Reset Simulation'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
