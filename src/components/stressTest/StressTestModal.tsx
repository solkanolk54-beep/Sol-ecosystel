import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  HardDrive, 
  Layers, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  Download, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Camera, 
  Server, 
  Activity,
  Check,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { 
  Language, 
  StressTestStage, 
  StressTestScorecardMetric, 
  EmergencyStressTestState 
} from '../../types/ecosystem';
import { STRESS_TEST_DEFAULT_SCORECARD, STRESS_TEST_CRISIS_PIVOTS } from '../../data/mockData';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApplyCrisisToConsole: (stage: StressTestStage) => void;
  onResetCrisis: () => void;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyCrisisToConsole,
  onResetCrisis
}) => {
  const isAr = language === 'ar';

  const [currentStage, setCurrentStage] = useState<StressTestStage>('STAGE_0_BASELINE');
  const [isPlaying, setIsPlaying] = useState(false);
  const [reconciliationProgress, setReconciliationProgress] = useState(0);
  const [offlineCachedCount, setOfflineCachedCount] = useState(0);
  const [networkOnline, setNetworkOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'architecture' | 'scorecard'>('timeline');

  // Stages definition
  const STAGES: { id: StressTestStage; time: string; titleAr: string; titleEn: string; descAr: string; descEn: string; iconColor: string }[] = [
    {
      id: 'STAGE_0_BASELINE',
      time: '09:00 AM',
      titleAr: 'الإطلاق والتشغيل الطبيعي (Baseline)',
      titleEn: 'Baseline Normal Operations',
      descAr: 'المنظومة تعمل بكامل طاقتها، مؤشرات NDVI طبيعية (0.65 - 0.76)، استجابة الشبكة 14ms، وحالة التشفير AES-256-GCM ممتازة.',
      descEn: 'Full capacity baseline, NDVI optimal (0.65 - 0.76), latency 14ms, AES-256-GCM enforced.',
      iconColor: 'emerald'
    },
    {
      id: 'STAGE_1_MULTI_DROUGHT',
      time: '09:15 AM',
      titleAr: 'المرحلة 1: التفشي الطيفي لبيانات الإجهاد (12 تنبيه P1)',
      titleEn: 'Phase 1: Multi-Point Stress Outbreak',
      descAr: 'إطلاق مفاجئ لـ 12 تنبيه P1 متزامن من SolVision عبر المحاور Pivot 01 و 02 و 04 بمساحة 45 هكتاراً (NDVI = 0.28). توليد 12 أمر عمل فوري مع إرسال إشعارات بريدية آلية فورية للفنيين الميدانيين (SLA < 15 دقيقة).',
      descEn: 'SolVision detects sudden 12 simultaneous P1 stress events across Pivots 01, 02, 04 on 45ha (NDVI = 0.28). 12 work orders dispatched with automated real-time email alerts transmitted to field technicians (SLA < 15 min).',
      iconColor: 'rose'
    },
    {
      id: 'STAGE_2_BLACKOUT',
      time: '09:18 AM',
      titleAr: 'المرحلة 2: الصدمة والانقطاع الشبكي التام (Total Blackout)',
      titleEn: 'Phase 2: Total Network Blackout',
      descAr: 'انقطاع كامل للاتصالات وسحابة الإنترنت. تحول فوري لتطبيق Kareema إلى وضع SQLite / PWA Cache خلال 1.4s، وتفعيل مخزن الطوارئ المحلي في AtlasCloud.',
      descEn: 'Total cellular & internet severance. Kareema mobile auto-switches to encrypted SQLite / PWA Cache in 1.4s. Local Edge Buffer engaged.',
      iconColor: 'amber'
    },
    {
      id: 'STAGE_3_OFFLINE_EXECUTION',
      time: '09:35 AM',
      titleAr: 'المرحلة 3: التنفيذ الميداني المعزول (Offline Execution)',
      titleEn: 'Phase 3: Offline Field Execution',
      descAr: 'الفنيون ينفذون أوامر العمل معتمدين على الخرائط المتجهية والـ GPS المحلي. التقاط الصور الإثباتية وحفظ 12/12 مهمة بحالة Pending_Sync محلياً.',
      descEn: 'Crews execute manual repairs using cached vector tiles and offline GPS. 12/12 photo reports signed and stored locally as Pending_Sync.',
      iconColor: 'cyan'
    },
    {
      id: 'STAGE_4_RESTORATION',
      time: '10:30 AM',
      titleAr: 'المرحلة 4: استعادة الاتصال والمزامنة التراكمية (Reconciliation)',
      titleEn: 'Phase 4: Network Restoration & Reconciliation',
      descAr: 'استعادة شبكة الاتصالات، وبدء المزامنة التلقائية لـ 12 تقريراً خلال 18.2s وتثبيتها في PostGIS مع الختم التشفيري SHA-256 وسجل Merkle.',
      descEn: 'Network restored, 12 reports batch-reconciled into PostGIS in 18.2s, sealed with SHA-256 and Merkle proof with 0% data loss.',
      iconColor: 'indigo'
    },
    {
      id: 'STAGE_5_SCORECARD',
      time: '10:35 AM',
      titleAr: 'المرحلة 5: مصفوفة تقييم نتائج اختبار الضغط (Final Scorecard)',
      titleEn: 'Phase 5: Evaluation Scorecard',
      descAr: 'اعتماد نجاح الاختبار بنسبة 100% لكافة المؤشرات: سرعة التحول (<2s)، وانعدام فقدان البيانات (0%)، وسرعة المزامنة (18.2s)، وزمن MTTR (16.5m).',
      descEn: 'Formal 100% pass across all 5 KPIs: Offline fallback (<2s), 0% data loss, 18.2s sync, and 16.5m MTTR.',
      iconColor: 'emerald'
    }
  ];

  // Auto-playback simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev === 'STAGE_0_BASELINE') return 'STAGE_1_MULTI_DROUGHT';
        if (prev === 'STAGE_1_MULTI_DROUGHT') return 'STAGE_2_BLACKOUT';
        if (prev === 'STAGE_2_BLACKOUT') return 'STAGE_3_OFFLINE_EXECUTION';
        if (prev === 'STAGE_3_OFFLINE_EXECUTION') return 'STAGE_4_RESTORATION';
        if (prev === 'STAGE_4_RESTORATION') {
          setIsPlaying(false);
          return 'STAGE_5_SCORECARD';
        }
        setIsPlaying(false);
        return prev;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Stage side effects
  useEffect(() => {
    if (!isOpen) return;

    if (currentStage === 'STAGE_0_BASELINE') {
      setNetworkOnline(true);
      setOfflineCachedCount(0);
      setReconciliationProgress(0);
      onApplyCrisisToConsole('STAGE_0_BASELINE');
    } else if (currentStage === 'STAGE_1_MULTI_DROUGHT') {
      setNetworkOnline(true);
      setOfflineCachedCount(0);
      setReconciliationProgress(0);
      onApplyCrisisToConsole('STAGE_1_MULTI_DROUGHT');
    } else if (currentStage === 'STAGE_2_BLACKOUT') {
      setNetworkOnline(false);
      setOfflineCachedCount(12);
      setReconciliationProgress(0);
      onApplyCrisisToConsole('STAGE_2_BLACKOUT');
    } else if (currentStage === 'STAGE_3_OFFLINE_EXECUTION') {
      setNetworkOnline(false);
      setOfflineCachedCount(12);
      setReconciliationProgress(0);
      onApplyCrisisToConsole('STAGE_3_OFFLINE_EXECUTION');
    } else if (currentStage === 'STAGE_4_RESTORATION') {
      setNetworkOnline(true);
      // animate progress
      let p = 0;
      const progInt = setInterval(() => {
        p += 20;
        setReconciliationProgress(Math.min(100, p));
        if (p >= 100) {
          clearInterval(progInt);
          setOfflineCachedCount(0);
        }
      }, 400);
      onApplyCrisisToConsole('STAGE_4_RESTORATION');
    } else if (currentStage === 'STAGE_5_SCORECARD') {
      setNetworkOnline(true);
      setOfflineCachedCount(0);
      setReconciliationProgress(100);
      setActiveTab('scorecard');
      onApplyCrisisToConsole('STAGE_5_SCORECARD');
    }
  }, [currentStage, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border-t-4 border-t-rose-600"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  {isAr ? 'بروتوكول اختبار الضغط وخطط الطوارئ (Stress Test)' : 'Emergency Stress Test Protocol'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-bold">
                  EXERCISE-DARK-DROUGHT-2026
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                  SOP-2026-V1 Sec 5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'محاكاة أزمة مجمعة: تفشي إجهاد مائي حاد لـ 12 موقعاً + انقطاع شامل لشبكة الاتصالات والإنترنت'
                  : 'Combined Crisis Simulation: 12-point acute water stress + Total Network Blackout'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Network Simulator Toggle */}
            <button
              onClick={() => {
                const nextOnline = !networkOnline;
                setNetworkOnline(nextOnline);
                if (!nextOnline) {
                  setCurrentStage('STAGE_2_BLACKOUT');
                } else {
                  setCurrentStage('STAGE_4_RESTORATION');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                networkOnline 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                  : 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
              }`}
              title="Manual Network Cut / Restore Switch"
            >
              {networkOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{networkOnline ? (isAr ? 'الشبكة: متصلة' : 'Network: ONLINE') : (isAr ? 'الشبكة: منقطعة (Blackout)' : 'Network: OFFLINE')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Playback Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'timeline' ? 'bg-rose-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'جدول ومسار الأزمة (Timeline)' : 'Crisis Timeline'}
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'architecture' ? 'bg-rose-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'معمارية الـ Offline Cache' : 'Offline Architecture'}
            </button>
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'scorecard' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isAr ? 'مصفوفة التقييم والنتائج (Scorecard)' : 'Scorecard (100% Pass)'}</span>
            </button>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? (isAr ? 'إيقاف مؤقت' : 'Pause Simulation') : (isAr ? 'تشغيل المحاكاة الآلية' : 'Auto-Run Timeline')}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStage('STAGE_0_BASELINE');
                onResetCrisis();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              title="Reset Test to Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* TAB 1: Crisis Timeline & Step Progression */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Crisis HUD Status Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? 'حالة التغطية الشبكية' : 'Cellular / Satellite Link'}
                  </span>
                  <span className={`text-base font-bold flex items-center gap-1.5 ${networkOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {networkOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 animate-pulse" />}
                    <span>{networkOnline ? 'ONLINE (14ms)' : 'BLACKOUT (0ms)'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? 'تنبيهات P1 المتزامنة' : 'Simultaneous P1 Alerts'}
                  </span>
                  <span className="text-base font-bold text-rose-400">
                    {currentStage === 'STAGE_0_BASELINE' ? '0 Alerts' : '12 P1 Critical'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">45 Hectares Affected</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? 'طابور الأوفلاين (Pending_Sync)' : 'Offline Queue Buffer'}
                  </span>
                  <span className="text-base font-bold text-amber-400">
                    {offlineCachedCount} / 12 Reports
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">SQLite / PWA Cache</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? 'المزامنة السيادية (Reconciliation)' : 'Vault Reconciliation'}
                  </span>
                  <span className="text-base font-bold text-cyan-400">
                    {reconciliationProgress}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">SHA-256 Validated</span>
                </div>
              </div>

              {/* Interactive Timeline Stepper */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'مراحل سيناريو الأزمة (Timeline & Execution Milestones)' : 'Crisis Scenario Timeline'}</span>
                </h3>

                <div className="space-y-3">
                  {STAGES.map((stg, idx) => {
                    const isSelected = currentStage === stg.id;

                    return (
                      <div
                        key={stg.id}
                        onClick={() => setCurrentStage(stg.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-950 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {stg.time}
                            </span>
                            <h4 className="text-xs font-bold text-white">
                              {isAr ? stg.titleAr : stg.titleEn}
                            </h4>
                          </div>

                          {isSelected && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold self-start sm:self-auto">
                              CURRENT STAGE
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {isAr ? stg.descAr : stg.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stress Affected Agricultural Pivots */}
              {(currentStage !== 'STAGE_0_BASELINE') && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'المحاور والقطاعات المتضررة بالتفشي الطيفي المفاجئ (45 هكتاراً):' : 'Pivots Affected in Crisis Outbreak (45 Hectares):'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
                    {STRESS_TEST_CRISIS_PIVOTS.map((p, pIdx) => (
                      <div key={pIdx} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-rose-300 font-bold">
                          <span>{p.code}</span>
                          <span className="text-[10px] bg-rose-900/80 px-1.5 py-0.2 rounded">NDVI {p.ndvi}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{p.sector}</p>
                        <span className="text-[10px] text-slate-500 block">Area: {p.hectares} ha</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Offline Contingency Architecture (SOP Section 5) */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>OFFLINE CONTINGENCY WORKFLOW (SOP-SOL-OPS-2026-V1)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-rose-300">[1] Detection of Network Loss</div>
                    <p className="text-slate-400 text-[10px]">Auto-Switch to SQLite / PWA Offline Cache (&lt; 2s)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300">[2] Cached Work Orders</div>
                    <p className="text-slate-400 text-[10px]">Preloaded Vector Maps &amp; Offline GPS Navigation</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-cyan-300">[3] Local Execution</div>
                    <p className="text-slate-400 text-[10px]">Photo Evidence + RSA / ECDSA Signatures in Pending_Sync</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-emerald-300">[4] Auto-Reconciliation</div>
                    <p className="text-slate-400 text-[10px]">PostGIS Ingest + SHA-256 Sovereign Vault Commit (&lt; 20s)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'أ. تطبيق Kareema الميداني (Offline Mobile Store)' : 'A. Kareema Mobile Offline Store'}</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-400 list-disc pl-4 leading-relaxed">
                    <li>{isAr ? 'التحول الآلي إلى التخزين الآمن Encrypted SQLite خلال أقل من ثانيتين.' : 'Instant auto-fallback to encrypted SQLite in < 2 seconds.'}</li>
                    <li>{isAr ? 'استمرار عمل الـ GPS والملاحة المكانية باستخدام طبقات Vector Tiles المحملة مسبقاً.' : 'GPS and navigation continue uninterrupted via pre-cached Vector Tiles.'}</li>
                    <li>{isAr ? 'التقاط صور الإثبات وتوثيق التوقيعات وحفظ 12/12 أمر عمل بحالة Pending_Sync.' : 'Field evidence, photo logs, and signatures saved as Pending_Sync.'}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'ب. سحابة AtlasCloud (Local On-Premises Edge Node)' : 'B. AtlasCloud Local Edge Node'}</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-400 list-disc pl-4 leading-relaxed">
                    <li>{isAr ? 'تنشيط خادم الطوارئ المحلي لحفظ تدفق رسائل Kafka مؤقتاً في Message Queue Buffer.' : 'Edge node acts as temporary broker for Kafka pub/sub queue.'}</li>
                    <li>{isAr ? 'عند عودة الاتصال، يتم تنفيذ Auto-Reconciliation Batch دون أي تعارض زمني.' : 'Zero-conflict auto-reconciliation batch upon network link restoration.'}</li>
                    <li>{isAr ? 'توقيع الختم التشفيري SHA-256 وربطه بشجرة Merkle Root في الخزينة السيادية.' : 'SHA-256 sealing and Merkle Root commit ensure immutable audit trail.'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Stress Test Evaluation Scorecard (5/5 Metrics) */}
          {activeTab === 'scorecard' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? 'نتيجة الاختبار المعتمدة: نجاح كامل 100% (CERTIFIED PASS)' : 'Official Test Result: 100% PASS'}
                    </h3>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      {isAr ? 'تم استيفاء كافة مؤشرات الصلابة وانعدام فقدان البيانات وفق وثيقة SOP-2026-V1.' : 'All resilience, SLA, and data preservation targets fully achieved.'}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold">
                  GRADE: A+
                </span>
              </div>

              {/* Evaluation Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="px-4 py-3">{isAr ? 'المؤشر المعياري' : 'Benchmark Indicator'}</th>
                      <th className="px-4 py-3">{isAr ? 'الهدف المطلوب (Target)' : 'Target Metric'}</th>
                      <th className="px-4 py-3">{isAr ? 'النتيجة في الاختبار' : 'Actual Result'}</th>
                      <th className="px-4 py-3">{isAr ? 'حالة التقييم' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {STRESS_TEST_DEFAULT_SCORECARD.map((metric) => (
                      <tr key={metric.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-white block">
                            {isAr ? metric.nameAr : metric.nameEn}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {isAr ? metric.detailsAr : metric.detailsEn}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {metric.targetMetric}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                          {metric.actualResult}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded font-mono text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1 w-fit">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isAr ? 'نجاح' : 'PASS'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Protocol: EXERCISE-DARK-DROUGHT-2026</span>
            <span>·</span>
            <span>Ref: SOP-SOL-OPS-2026-V1</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onApplyCrisisToConsole(currentStage);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
            >
              {isAr ? 'تطبيق المرحلة الحالية على لوحة التحكم' : 'Apply Stage to Console'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
