import React, { useState } from 'react';
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
  BookOpen,
  Flame,
  Mail,
  Pin,
  PinOff,
  Wheat
} from 'lucide-react';
import { Language, SovereignCloudStatus, UserRole } from '../../types/ecosystem';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: 'gis' | 'agrigis' | 'passports' | 'sovereign' | 'api';
  setActiveTab: (tab: 'gis' | 'agrigis' | 'passports' | 'sovereign' | 'api') => void;
  cloudStatus: SovereignCloudStatus;
  currentRole?: UserRole;
  onSimulateStress: () => void;
  onSimulateGrazing: () => void;
  onResetSimulation: () => void;
  onOpenSopManual?: () => void;
  onOpenStressTestModal?: () => void;
  activeAlertCount: number;
  emailAlertCount?: number;
  onOpenEmailModal?: () => void;
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
  onOpenStressTestModal,
  activeAlertCount,
  emailAlertCount = 0,
  onOpenEmailModal
}) => {
  const isAr = language === 'ar';
  const [isPinned, setIsPinned] = useState(false);

  return (
    <header className={`border-b border-slate-800 bg-slate-950/95 transition-all ${
      isPinned 
        ? 'sticky top-0 z-40 backdrop-blur-md shadow-2xl' 
        : 'relative z-20'
    }`}>
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

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Header Pin Toggle (Allows free scroll to prevent large top section from blocking the view) */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-all cursor-pointer ${
              isPinned
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title={
              isPinned
                ? (isAr ? 'إلغاء تثبيت الشريط العلوي (جعله يتحرك مع التمرير)' : 'Unpin Header (Allow free scrolling)')
                : (isAr ? 'تثبيت الشريط العلوي في أعلى الشاشة' : 'Pin Header to top of screen')
            }
          >
            {isPinned ? (
              <>
                <Pin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{isAr ? 'مثبت' : 'Pinned'}</span>
              </>
            ) : (
              <>
                <PinOff className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{isAr ? 'حر (غير مثبت)' : 'Free Scroll'}</span>
              </>
            )}
          </button>

          <div 
            onClick={() => setActiveTab('sovereign')}
            className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer"
            title={isAr ? 'العقدة السيادية الأساسية: الجزائر (قارة إفريقيا)' : 'Primary Sovereign Node: Algeria (Africa)'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Globe2 className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-bold">DZ-North-1</span>
            <span className="text-slate-400">({isAr ? 'الجزائر • إفريقيا' : 'Algiers • Africa'})</span>
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
            onClick={() => setActiveTab('agrigis')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'agrigis'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border border-emerald-400/40'
                : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-800/80'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'منظومة AgriGIS Algérie' : 'AgriGIS Algérie'}</span>
            <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              DZ
            </span>
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'الحوكمة السيادية والتتبع' : 'Sovereign Governance & Traceability'}</span>
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
          {/* Dedicated Emergency Stress Test Protocol Button */}
          {onOpenStressTestModal && (
            <button
              onClick={onOpenStressTestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-950/50 border border-rose-400/40 transition-all cursor-pointer"
              title="Open Emergency Stress Test (EXERCISE-DARK-DROUGHT-2026)"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{isAr ? 'اختبار الضغط: DARK-DROUGHT' : 'Stress Test: DARK-DROUGHT'}</span>
            </button>
          )}

          {/* Automated P1 Email Alerts Center Button */}
          {onOpenEmailModal && (
            <button
              onClick={onOpenEmailModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer shadow-sm"
              title="Automated Email Alerts (P1 Drought Outbreak)"
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'تنبيهات البريد P1' : 'P1 Email Alerts'}</span>
              {emailAlertCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                  {emailAlertCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onSimulateStress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="SolVision -> AtlasCloud -> Kareema workflow test"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'إجهاد محصول (SolVision)' : 'Crop Stress'}</span>
          </button>

          <button
            onClick={onSimulateGrazing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            title="Kareema -> SolVision Rotational Grazing Alert test"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'رعي جائر (Kareema)' : 'Overgrazing'}</span>
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
