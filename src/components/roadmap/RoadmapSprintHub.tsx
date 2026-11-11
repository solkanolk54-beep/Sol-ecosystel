import React, { useState, useEffect } from 'react';
import { 
  Language, 
  PiezometerTelemetryRecord, 
  OfflineSyncFormRecord, 
  MlYieldForecastModel, 
  CustomsExportDossier,
  AgriGisWilayaPole,
  OdasConcession
} from '../../types/ecosystem';
import { 
  BENI_HAROUN_PIEZOMETERS, 
  INITIAL_OFFLINE_SYNC_QUEUE, 
  INITIAL_ML_YIELD_MODELS, 
  INITIAL_CUSTOMS_DOSSIERS,
  ALGERIA_AGRIGIS_POLES,
  ODAS_CONCESSIONS
} from '../../data/mockData';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Database, 
  Layers, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  TrendingUp, 
  FileCheck2, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Send, 
  QrCode, 
  Download, 
  Activity, 
  Zap, 
  Eye, 
  Gauge, 
  Compass, 
  Sparkles,
  Play,
  ArrowRight,
  Terminal,
  Clock,
  HardDrive,
  FileCode2,
  Lock,
  Globe2,
  Smartphone,
  MessageSquare
} from 'lucide-react';

interface RoadmapSprintHubProps {
  language: Language;
  onNavigateToTab?: (tab: any) => void;
  onTriggerAlert?: (title: string, message: string) => void;
}

export const RoadmapSprintHub: React.FC<RoadmapSprintHubProps> = ({
  language,
  onNavigateToTab,
  onTriggerAlert
}) => {
  const isAr = language === 'ar';

  // Active Hub View
  const [activeSection, setActiveSection] = useState<'p1_hydraulics_odas' | 'p2_pwa_ml' | 'p3_customs_passports' | 'architecture_directives'>('p1_hydraulics_odas');

  // Task 1.1 State: Piezometer IoT Live Stream
  const [piezometers, setPiezometers] = useState<PiezometerTelemetryRecord[]>(BENI_HAROUN_PIEZOMETERS);
  const [selectedStation, setSelectedStation] = useState<PiezometerTelemetryRecord>(BENI_HAROUN_PIEZOMETERS[0]);
  const [isSimulatingMqttDrop, setIsSimulatingMqttDrop] = useState(false);
  const [mqttPingLatency, setMqttPingLatency] = useState<number>(2420);
  const [retryBufferCount, setRetryBufferCount] = useState<number>(0);
  const [mqttLogMessages, setMqttLogMessages] = useState<string[]>([
    '[2026-10-11 12:45:00] [MQTT-BROKER] CONNECTED to sol.telemetry.piezometer.v1',
    '[2026-10-11 12:45:01] [INGEST-SUB] Ingested packet BH-DAM-CREST-01 | Water Level: 194.8m | Latency: 2420ms (PASS < 5s SLA)',
    '[2026-10-11 12:45:02] [TIMESCALE] Persisted 4 records to hypertable piezometer_timeseries'
  ]);

  // Task 1.2 State: ODAS Great South Perimeters
  const [selectedPoleId, setSelectedPoleId] = useState<string>('el-menia');
  const southernPoles = ALGERIA_AGRIGIS_POLES.filter(p => ['el-menia', 'naama-steppe-cereal', 'el-bayadh-brezina', 'adrar-timimoun'].includes(p.id));
  const activePole = southernPoles.find(p => p.id === selectedPoleId) || southernPoles[0];
  const [selectedOdasConcession, setSelectedOdasConcession] = useState<OdasConcession | null>(ODAS_CONCESSIONS[0]);

  // Task 2.1 State: Mila Field Offline PWA & Sync-on-Reconnect
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncFormRecord[]>(INITIAL_OFFLINE_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [newInspectionForm, setNewInspectionForm] = useState({
    inspectorName: 'د. عبد الرزاق بن يوسف',
    zone: 'MILA-TESSALA-LAMTAI',
    formType: 'VETERINARY_INSPECTION' as const,
    notes: 'فحص دوري لقطيع الأغنام بريف تسالة؛ تم إدخال 85 رأس مسجل بنظام RFID مع تطعيم وقائي.'
  });

  // Task 2.2 State: ML Yield Prediction Studio
  const [mlModels] = useState<MlYieldForecastModel[]>(INITIAL_ML_YIELD_MODELS);
  const [selectedModel, setSelectedModel] = useState<MlYieldForecastModel>(INITIAL_ML_YIELD_MODELS[0]);
  const [isInferencing, setIsInferencing] = useState<boolean>(false);
  const [simulatedNitrogenAdj, setSimulatedNitrogenAdj] = useState<number>(88);
  const [livePredictedYield, setLivePredictedYield] = useState<number>(INITIAL_ML_YIELD_MODELS[0].predictedYieldTonsPerHa);

  // Task 3.1 State: Customs Digital Passports
  const [customsDossiers, setCustomsDossiers] = useState<CustomsExportDossier[]>(INITIAL_CUSTOMS_DOSSIERS);
  const [selectedDossier, setSelectedDossier] = useState<CustomsExportDossier>(INITIAL_CUSTOMS_DOSSIERS[0]);
  const [isVerifyingSignature, setIsVerifyingSignature] = useState<boolean>(false);
  const [signatureVerificationSuccess, setSignatureVerificationSuccess] = useState<boolean>(true);

  // Architecture Directives: Component A, B, C States
  const [activeGeoNode, setActiveGeoNode] = useState<'DZ-North-1' | 'DZ-South-4'>('DZ-North-1');
  const [replicationLagMs, setReplicationLagMs] = useState<number>(18);
  const [isFailoverDrillActive, setIsFailoverDrillActive] = useState<boolean>(false);
  const [valveRulHours, setValveRulHours] = useState<number>(4820);
  const [isInvestorMode, setIsInvestorMode] = useState<boolean>(false);
  const [smsTestDispatched, setSmsTestDispatched] = useState<boolean>(false);

  // Periodic Telemetry Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSimulatingMqttDrop) {
        const jitter = Math.floor(Math.random() * 400) - 200;
        const newLatency = Math.max(1200, Math.min(4800, 2400 + jitter));
        setMqttPingLatency(newLatency);

        setPiezometers(prev => prev.map(p => {
          if (p.id === 'PIEZO-BH-01') {
            const delta = (Math.random() - 0.5) * 0.05;
            return {
              ...p,
              waterLevelMeters: Number((p.waterLevelMeters + delta * 0.01).toFixed(2)),
              piezometricPressureKPa: Number((p.piezometricPressureKPa + (Math.random() - 0.5) * 1.5).toFixed(1)),
              ingestLatencyMs: newLatency,
              timestamp: new Date().toISOString()
            };
          }
          return p;
        }));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulatingMqttDrop]);

  // Handle Offline Form Queuing
  const handleQueueOfflineForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: OfflineSyncFormRecord = {
      id: `SYNC-MILA-${Date.now().toString().slice(-4)}`,
      formType: newInspectionForm.formType,
      inspectorName: newInspectionForm.inspectorName,
      inspectorRole: newInspectionForm.formType === 'VETERINARY_INSPECTION' ? 'VETERINARY_DOCTOR' : 'IRRIGATION_ENGINEER',
      wilaya: 'ميلة (ولاية 43)',
      zoneId: newInspectionForm.zone,
      coordinates: [36.425 + (Math.random() - 0.5) * 0.05, 6.180 + (Math.random() - 0.5) * 0.05],
      capturedAt: new Date().toISOString(),
      syncStatus: isNetworkOnline ? 'RECONCILED' : 'QUEUED_LOCAL',
      syncedAt: isNetworkOnline ? new Date().toISOString() : undefined,
      retryCount: 0,
      payload: {
        notesAr: newInspectionForm.notes,
        status: 'FIELD_VERIFIED',
        deviceBattery: '87%',
        offlineStorageBackend: 'IndexedDB-v3'
      },
      sha256Signature: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    setOfflineQueue(prev => [newRecord, ...prev]);

    if (!isNetworkOnline) {
      setSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] تم تخزين الاستمارة محلياً في IndexedDB (وضع انقطاع الشبكة: ${newRecord.id})`,
        ...prev.slice(0, 5)
      ]);
      if (onTriggerAlert) {
        onTriggerAlert(
          isAr ? 'تم حفظ التقرير محلياً (وضع عدم الاتصال)' : 'Report Cached Locally (Offline Mode)',
          isAr ? `تم حفظ استمارة ${newRecord.id} في ذاكرة التخزين المؤقت للمتصفح بانتظار عودة التغطية.` : `Form ${newRecord.id} queued in IndexedDB buffer.`
        );
      }
    } else {
      setSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] تم الإرسال والمصادقة اللحظية على الخادم السيادي (Online: ${newRecord.id})`,
        ...prev.slice(0, 5)
      ]);
    }
  };

  // Trigger Deterministic Sync-on-Reconnect
  const handleTriggerSyncOnReconnect = () => {
    if (!isNetworkOnline) {
      alert(isAr ? 'لا يمكن المزامنة لأن وضع انقطاع الشبكة لا يزال نشطاً. يرجى تفعيل الاتصال أولاً.' : 'Cannot sync: Network is currently set to Offline.');
      return;
    }
    setIsSyncing(true);
    setSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] بدء تفريغ طابور المزامنة التلقائية (Sync-on-Reconnect Engine)...`,
      ...prev
    ]);

    setTimeout(() => {
      setOfflineQueue(prev => prev.map(item => ({
        ...item,
        syncStatus: 'RECONCILED',
        syncedAt: new Date().toISOString()
      })));
      setIsSyncing(false);
      setSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] اكتملت المزامنة بنجاح: تم التوفيق بين التوقيعات المشفرة SHA-256 وحل أي تعارض تلقائياً (0 Conflicts).`,
        ...prev
      ]);
      if (onTriggerAlert) {
        onTriggerAlert(
          isAr ? 'اكتملت المزامنة السيادية (Sync Reconciled)' : 'Sovereign Sync Reconciled',
          isAr ? 'تم رفع جميع استمارات مهندسي ميلة من الذاكرة المؤقتة وتوثيقها في قاعدة بيانات PostGIS.' : 'All queued offline forms verified and written to PostGIS.'
        );
      }
    }, 1200);
  };

  // ML Inference Simulator
  const handleRunInference = () => {
    setIsInferencing(true);
    setTimeout(() => {
      const deltaFactor = (simulatedNitrogenAdj - 88) * 0.02;
      const calculated = Number((selectedModel.predictedYieldTonsPerHa + deltaFactor).toFixed(2));
      setLivePredictedYield(calculated);
      setIsInferencing(false);
    }, 600);
  };

  // Failover Drill Simulation
  const handleToggleFailover = () => {
    setIsFailoverDrillActive(true);
    setTimeout(() => {
      const nextNode = activeGeoNode === 'DZ-North-1' ? 'DZ-South-4' : 'DZ-North-1';
      setActiveGeoNode(nextNode);
      setIsFailoverDrillActive(false);
      if (onTriggerAlert) {
        onTriggerAlert(
          isAr ? `تم تحويل العقدة السيادية بنجاح إلى ${nextNode}` : `Sovereign Failover Successful to ${nextNode}`,
          isAr ? `زمن التحويل: 34ms | نسبة مطابقة البيانات: 100% بدون فقدان أي حزمة هيدروليكية.` : `Failover complete in 34ms with zero data loss.`
        );
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner & Executive Roadmap Header */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ROADMAP RELEASE V3.4
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                {isAr ? 'إدارة السبرنتات الهندسية الشاملة' : 'Full Engineering Squads Roadmap'}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-xs font-mono">
                {isAr ? 'السيادة الرقمية والمرونة الميدانية' : 'Offline-First & Sovereign PostGIS'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>{isAr ? 'خريطة طريق المنظومة (V3.4) والتوجيهات المعمارية' : 'SOL-Ecosystem V3.4 Roadmap & Engineering Directives'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'توجيه الفرق الهندسية الخمس (الخوادم، نظم المعلومات الجغرافية، الواجهات والتطبيقات، الذكاء الاصطناعي، وعمليات DevOps) لتنفيذ أولويات الربط الهيدروليكي، توسيع محيطات ديوان ODAS، المرونة دون اتصال، والتنبؤ الدقيق بالمحاصيل.'
                : 'Directing Backend, GIS, Mobile/Frontend, AI/ML, and DevOps squads to deliver piezometer telemetry, ODAS grain expansion, offline PWA resilience, and ML yield predictions.'}
            </p>
          </div>

          {/* Quick SLA Badge & Investor Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsInvestorMode(!isInvestorMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isInvestorMode 
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-950/40' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isAr ? (isInvestorMode ? 'عرض المهندسين المفصل' : 'لوحة المستثمرين المبسطة') : (isInvestorMode ? 'Detailed Engineer View' : 'Investor Executive Mode')}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>SLA Ingestion: &lt; 5s (Actual: {(mqttPingLatency / 1000).toFixed(2)}s)</span>
            </div>
          </div>
        </div>

        {/* Milestone Quick Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSection('p1_hydraulics_odas')}
            className={`flex items-center justify-between p-3 rounded-lg border text-start transition-all cursor-pointer ${
              activeSection === 'p1_hydraulics_odas'
                ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/80 text-white shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                <span>P1 (عاجل: 2-3 أسابيع)</span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5">
                {isAr ? 'سد بني هارون وتوسيع ODAS' : 'Beni Haroun & ODAS Perimeters'}
              </div>
            </div>
            <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          <button
            onClick={() => setActiveSection('p2_pwa_ml')}
            className={`flex items-center justify-between p-3 rounded-lg border text-start transition-all cursor-pointer ${
              activeSection === 'p2_pwa_ml'
                ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/80 text-white shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                <span>P2 (متوسط: 3-4 أسابيع)</span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5">
                {isAr ? 'تطبيق PWA دون اتصال + ذكاء التنبؤ' : 'Offline PWA + ML Yield Studio'}
              </div>
            </div>
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>

          <button
            onClick={() => setActiveSection('p3_customs_passports')}
            className={`flex items-center justify-between p-3 rounded-lg border text-start transition-all cursor-pointer ${
              activeSection === 'p3_customs_passports'
                ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/80 text-white shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                <span>P3 (المدى البعيد)</span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5">
                {isAr ? 'جوازات التصدير وبوابة الجمارك' : 'Customs Passports & E-Payment'}
              </div>
            </div>
            <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          <button
            onClick={() => setActiveSection('architecture_directives')}
            className={`flex items-center justify-between p-3 rounded-lg border text-start transition-all cursor-pointer ${
              activeSection === 'architecture_directives'
                ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-500/80 text-white shadow-md'
                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 font-mono">
                <span>معمارية المنظومة (A, B, C)</span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5">
                {isAr ? 'الذكاء الطرفي + التكرار الجغرافي' : 'Edge AI, OGC & Geo-Redundancy'}
              </div>
            </div>
            <Server className="w-4 h-4 text-indigo-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: PRIORITY P1 (BENI HAROUN & ODAS GREAT SOUTH SCALING) */}
      {/* ============================================================== */}
      {activeSection === 'p1_hydraulics_odas' && (
        <div className="space-y-6">
          {/* Task 1.1: Beni Haroun & Ain Tine Piezometer IoT Integration */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    TASK 1.1
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'دمج مستشعرات الضغط الباطني (Piezometers) لسد بني هارون ومحطة عين التين' : 'Beni Haroun & Ain Tine Piezometer IoT Integration'}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr 
                    ? 'تدفق قياسات الضغط المسامي، تشوه تاج السد، ومعدل الرشح لحظياً عبر MQTT Broker وتخزينها في قاعدة TimescaleDB مع استيفاء شرط زمن الوصول < 5 ثوان.'
                    : 'Real-time pore pressure, crest deformation, and seepage flow via MQTT broker to TimescaleDB with latency < 5s SLA.'}
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulatingMqttDrop(!isSimulatingMqttDrop)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    isSimulatingMqttDrop
                      ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {isSimulatingMqttDrop ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>{isAr ? 'محاكاة انقطاع مؤقت (تفعيل التخزين بالطابور)' : 'Network Drop Sim (Queueing)'}</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'الاتصال طبيعي (MQTT Online)' : 'MQTT Online'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Piezometer Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {piezometers.map(station => (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedStation.id === station.id
                      ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                      : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">{station.stationId}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      station.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {station.status}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white truncate" title={station.stationNameAr}>
                    {isAr ? station.stationNameAr : station.stationNameEn}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'منسوب المياه:' : 'Water Level:'}</span>
                      <span className="font-mono text-cyan-300 font-bold">{station.waterLevelMeters} m</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'الضغط المسامي:' : 'Pore Pressure:'}</span>
                      <span className="font-mono text-emerald-300 font-bold">{station.piezometricPressureKPa} kPa</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'معدل الرشح (Seepage):' : 'Seepage Flow:'}</span>
                      <span className="font-mono text-amber-300">{station.seepageFlowLps} L/s</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'زمن الاستجابة (Latency):' : 'Latency:'}</span>
                      <span className="font-mono text-emerald-400 font-bold">{station.ingestLatencyMs} ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Station Deep Telemetry & Live Timescale Ingestion Viewer */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      {isAr ? 'رسم بياني زمني لحظي (TimescaleDB Hypertable Engine)' : 'Live TimescaleDB Ingestion Graph'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Topic: {selectedStation.mqttTopic}
                  </span>
                </div>

                {/* Hydro Visual Metrics Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">{isAr ? 'سعة الحوض المخزنة' : 'Reservoir Storage'}</div>
                    <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                      {selectedStation.reservoirVolumeMCM} <span className="text-xs text-slate-500">MCM</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{isAr ? 'من أصل 1000 مليون م³' : 'out of 1000 MCM'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">{isAr ? 'تشوه التاج الهيكلي' : 'Crest Deformation'}</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                      {selectedStation.crestDeformationMm} <span className="text-xs text-slate-500">mm</span>
                    </div>
                    <div className="text-[10px] text-emerald-500/80 mt-0.5">{isAr ? 'ضمن الحدود الآمنة' : 'Safe Structural Limit'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">{isAr ? 'فقدان الضاغط الهيدروليكي' : 'Head Loss'}</div>
                    <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                      {selectedStation.hydraulicHeadLossM} <span className="text-xs text-slate-500">m</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{isAr ? 'محطة الضخ العائمة' : 'Floating Pumps Feed'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-400">{isAr ? 'مطابقة معيار SLA' : 'SLA Latency'}</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                      {(selectedStation.ingestLatencyMs / 1000).toFixed(2)}s
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">{isAr ? 'أقل من 5 ثوان (معتمد)' : 'Pass (< 5.0s SLA)'}</div>
                  </div>
                </div>

                {/* Synthetic Water Level Bar */}
                <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{isAr ? 'امتلاء بحيرة السد (المنسوب المائي الفعلي)' : 'Reservoir Fill Level (Actual vs Crest)'}</span>
                    <span className="text-cyan-300 font-mono font-bold">{selectedStation.waterLevelMeters}m / 200.0m (تاج السد)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (selectedStation.waterLevelMeters / 200.0) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ingestion Engine & MQTT Terminal Logs */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      MQTT / Timescale Pipeline
                    </span>
                    <span className="text-[10px] text-slate-500">Port: 1883 / TLS 1.3</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                    {mqttLogMessages.map((msg, i) => (
                      <div key={i} className="text-slate-400 border-l border-emerald-500/40 pl-2">
                        {msg}
                      </div>
                    ))}
                    {isSimulatingMqttDrop && (
                      <div className="text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-800">
                        [WARN] Network link dropped. Automatic retry policy active. Buffering payloads in local queue (buffered: {retryBufferCount + 3})...
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Persistence: PostgreSQL 16 + PostGIS</span>
                  <span className="text-emerald-400">Zero Packet Loss</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task 1.2: Great South Grain Perimeters Scaling (ODAS Expansion) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                    TASK 1.2
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'توسيع نطاق محيطات الحبوب الكبرى بالجنوب (امتيازات ديوان ODAS)' : 'Great South Strategic Grain Perimeters Scaling (ODAS Expansion)'}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr 
                    ? 'إدراج المحيطات الاستراتيجية الجديدة بالمنيعة (حاسي القارة وسبسب)، النعامة (المشرية وعين الصفراء)، والبيض (بريزينة والأبيض سيدي الشيخ) ضمن طبقات PostGIS وتدفقات Alsat/Sentinel-2.'
                    : 'Integrating new strategic cereal polygons in El Menia (Hassi Gara & Sebseb), Naama, and El Bayadh into PostGIS and automated satellite pipelines.'}
                </p>
              </div>

              {/* Regional Selector */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {southernPoles.map(pole => (
                  <button
                    key={pole.id}
                    onClick={() => setSelectedPoleId(pole.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedPoleId === pole.id
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isAr ? pole.nameAr.split('لل')[0] : pole.nameEn.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Pole Detailed GIS & ODAS Perimeters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-cyan-400 uppercase font-mono mb-2">
                  {isAr ? 'بيانات القطب الزراعي في PostGIS' : 'PostGIS Region Metadata'}
                </div>
                <h4 className="text-base font-bold text-white">{isAr ? activePole.nameAr : activePole.nameEn}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{isAr ? activePole.descriptionAr : activePole.descriptionEn}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isAr ? 'المساحة الإجمالية المرصودة:' : 'Monitored Area:'}</span>
                    <span className="font-mono text-white font-bold">{activePole.totalAreaHectares.toLocaleString()} Ha</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isAr ? 'عدد المحاور الرشاشة الذكية:' : 'Active Smart Pivots:'}</span>
                    <span className="font-mono text-cyan-300 font-bold">{activePole.activePivotsCount} pivots</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isAr ? 'متوسط مؤشر صحة الغطاء (NDVI):' : 'Mean NDVI Health:'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{activePole.ndviHealthIndex} (Optimal)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isAr ? 'مصدر المياه الجوفية:' : 'Aquifer Layer:'}</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{isAr ? activePole.waterSourceAr : activePole.waterSourceEn}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'قمر الرصد المعين:' : 'Dedicated Satellite:'}</span>
                    <span className="font-mono text-amber-300">{activePole.alsatResolution}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-bold">{isAr ? 'المحاصيل الاستراتيجية المزروعة:' : 'Strategic Crops:'}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(isAr ? activePole.primaryCropsAr : activePole.primaryCropsEn).map((c, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parcels and ODAS Endpoints Simulator */}
              <div className="lg:col-span-2 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center justify-between">
                  <span>{isAr ? 'المحاور الرشاشة الدائرية المرتبطة بالقطب (PostGIS Geometries)' : 'Registered Crop Polygons'}</span>
                  <span className="text-[11px] text-cyan-400 font-mono">ODAS API v3.4 Ready</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePole.parcels.map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800">
                            {p.code}
                          </span>
                          <h5 className="text-sm font-semibold text-white mt-1.5">{isAr ? p.nameAr : p.nameEn}</h5>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'المساحة:' : 'Area:'}</span>
                          <span className="font-mono text-white font-bold">{p.areaHa} Ha</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">NDVI Index:</span>
                          <span className="font-mono text-emerald-400 font-bold">{p.ndvi}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'تدفق المياه:' : 'Water Flow:'}</span>
                          <span className="font-mono text-cyan-300">{p.waterFlowLps} L/s</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'عمق البئر:' : 'Well Depth:'}</span>
                          <span className="font-mono text-slate-300">{p.waterWellDepthM} m</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 truncate">
                        {isAr ? p.cropAr : p.cropEn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ODAS Reporting Endpoint & GeoJSON Export Simulator */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold">GET /api/v1/odas/perimeters/{activePole.id}/geojson</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {isAr ? 'تصدير كامل حدود المحيطات بصيغة GeoJSON متوافقة مع نظم المعلومات الجغرافية الوطنية.' : 'Export OGC GeoJSON polygon layer for national reporting.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(isAr ? `تم تنزيل طبقة GeoJSON لمحاور ${activePole.nameAr} بنجاح.` : `Downloaded GeoJSON layer for ${activePole.nameEn}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download GeoJSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: PRIORITY P2 (OFFLINE PWA & ML YIELD PREDICTIONS)    */}
      {/* ============================================================== */}
      {activeSection === 'p2_pwa_ml' && (
        <div className="space-y-6">
          {/* Task 2.1: Mila Field Engineers Offline-First PWA & Sync-on-Reconnect */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                    TASK 2.1
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'منظومة مهندسي ميلة للعمل دون اتصال بالإنترنت (Offline-First PWA & Sync Engine)' : 'Mila Field Engineers Offline-First PWA & Sync-on-Reconnect'}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr 
                    ? 'تمكين الأطباء البياطرة ومهندسي الري في جبال ميلة (تسالة وباينان) من تعبئة استمارات الفحص دون تغطية 4G، وتخزينها في IndexedDB مع إعادة المزامنة الحتمية عند استعادة الاتصال.'
                    : 'Enables field engineers in mountainous low-connectivity zones to queue inspection logs in IndexedDB, then flush deterministically upon 4G/Wi-Fi reconnection.'}
                </p>
              </div>

              {/* Network Toggle Simulator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNetworkOnline(!isNetworkOnline)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    isNetworkOnline
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
                  }`}
                >
                  {isNetworkOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? 'الشبكة متصلة (Online 4G)' : 'Online (4G Connected)'}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span>{isAr ? 'منطقة جبلية منقطعة (Offline Mode)' : 'Offline (Mountain Dead-Zone)'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerSyncOnReconnect}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'تفريغ طابور المزامنة الآن' : 'Flush Sync Queue'}</span>
                </button>
              </div>
            </div>

            {/* Offline PWA Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Form Input for Field Engineers */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-white uppercase font-mono mb-3 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'استمارة تفتيش ميدانية جديدة (PWA)' : 'New Field Inspection Form'}</span>
                </div>

                <form onSubmit={handleQueueOfflineForm} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">{isAr ? 'اسم المهندس / الطبيب:' : 'Inspector Name:'}</label>
                    <input
                      type="text"
                      value={newInspectionForm.inspectorName}
                      onChange={e => setNewInspectionForm({ ...newInspectionForm, inspectorName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">{isAr ? 'نوع الاستمارة الميدانية:' : 'Form Type:'}</label>
                    <select
                      value={newInspectionForm.formType}
                      onChange={e => setNewInspectionForm({ ...newInspectionForm, formType: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="VETERINARY_INSPECTION">{isAr ? 'فحص بيطري وتطعيم مواشي (RFID)' : 'Veterinary Inspection & RFID'}</option>
                      <option value="IRRIGATION_VALVE_CHECK">{isAr ? 'فحص صمامات شبكة الري والضغط' : 'Irrigation Valve Inspection'}</option>
                      <option value="CROP_SOIL_SAMPLE">{isAr ? 'أخذ عينة تربة وتحليل رطوبة' : 'Crop Soil Sampling'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">{isAr ? 'الموقع الجغرافي / الحوض الميلي:' : 'Zone Location:'}</label>
                    <select
                      value={newInspectionForm.zone}
                      onChange={e => setNewInspectionForm({ ...newInspectionForm, zone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="MILA-TESSALA-LAMTAI">ميلة - مرتفعات تسالة لمطاعي (Tessala)</option>
                      <option value="MILA-BAINAN-BASIN">ميلة - حوض باينان الفلاحي (Bainan)</option>
                      <option value="MILA-ROUACHED-BASIN">ميلة - حوض الرواشد (Rouached)</option>
                      <option value="MILA-OUED-ENDJA">ميلة - حوض واد النجاء (Oued Endja)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">{isAr ? 'ملاحظات المعاينة الميدانية:' : 'Inspection Notes:'}</label>
                    <textarea
                      rows={3}
                      value={newInspectionForm.notes}
                      onChange={e => setNewInspectionForm({ ...newInspectionForm, notes: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isNetworkOnline ? (isAr ? 'إرسال مباشر للخادم' : 'Submit Directly Online') : (isAr ? 'حفظ محلياً في الذاكرة المؤقتة (IndexedDB)' : 'Queue to Local IndexedDB')}</span>
                  </button>
                </form>
              </div>

              {/* IndexedDB Offline Queue Viewer */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'طابور المزامنة الحتمي (Deterministic Offline Buffer Queue)' : 'IndexedDB Buffered Queue'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {offlineQueue.length} records
                    </span>
                  </div>

                  <span className={`text-[11px] font-mono font-bold ${
                    offlineQueue.some(q => q.syncStatus === 'QUEUED_LOCAL') ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {offlineQueue.some(q => q.syncStatus === 'QUEUED_LOCAL') ? (isAr ? 'يوجد سجلات معلقة بالطابور' : 'Pending Sync Items') : (isAr ? 'جميع السجلات متطابقة ومصادقة' : 'All Items Reconciled')}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {offlineQueue.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{item.id}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-white font-medium">{item.inspectorName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {item.zoneId}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 line-clamp-1">{item.payload.notesAr}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-500">
                          <span>SHA-256: {item.sha256Signature.slice(0, 16)}...</span>
                          <span>Time: {new Date(item.capturedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.syncStatus === 'RECONCILED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        }`}>
                          {item.syncStatus === 'RECONCILED' ? (isAr ? 'تمت المصادقة' : 'RECONCILED') : (isAr ? 'محفوظ محلياً' : 'QUEUED_LOCAL')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conflict Resolution Terminal Log */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
                  <div className="text-slate-500 mb-1">{isAr ? 'سجل محرك فض النزاعات والتوافقية:' : 'Conflict Resolution Engine Log:'}</div>
                  {syncLogs.length === 0 ? (
                    <div className="text-slate-600 italic">{isAr ? 'المحرك في وضع الاستعداد...' : 'Engine idle waiting for event...'}</div>
                  ) : (
                    syncLogs.map((log, idx) => (
                      <div key={idx} className="text-slate-300 border-l border-cyan-500/40 pl-2">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task 2.2: Machine Learning Yield Prediction Models */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    TASK 2.2
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'نماذج التعلم الآلي للتنبؤ بمردود المحاصيل (XGBoost / Random Forest Yield Studio)' : 'Machine Learning Yield Prediction Models (>= 94% Accuracy)'}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr 
                    ? 'تدريب ونشر نماذج الانحدار الإحصائي للتنبؤ بإنتاجية القمح الصلب والزيتون قبل 30 يوماً من الحصاد، بالاعتماد على مؤشرات NDVI والحرارة التراكمية ونيتروجين التربة بدقة تتجاوز 94%.'
                    : 'Regression models forecasting wheat and olive yields 30 days prior to harvest combining multi-spectral indices, GDD, and soil composition with >= 94% accuracy.'}
                </p>
              </div>

              {/* Accuracy Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Model Accuracy: {selectedModel.modelAccuracyPercent}% (Target &ge; 94%)</span>
              </div>
            </div>

            {/* Model Selector & Live Inference Playground */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-1 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono mb-2">
                  {isAr ? 'النماذج المدربة والجاهزة:' : 'Available ML Models:'}
                </div>
                {mlModels.map(model => (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setLivePredictedYield(model.predictedYieldTonsPerHa);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedModel.id === model.id
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>{model.algorithm}</span>
                      <span className="text-emerald-400 font-bold">{model.modelAccuracyPercent}% Acc</span>
                    </div>
                    <div className="text-xs font-bold text-white">{isAr ? model.cropTypeAr : model.cropType}</div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">{isAr ? model.zoneNameAr : model.zoneNameEn}</div>
                  </div>
                ))}
              </div>

              {/* Model Feature Weights & Simulation Workbench */}
              <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{isAr ? selectedModel.cropTypeAr : selectedModel.cropType}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {isAr ? 'أفق التنبؤ: 30 يوماً قبل الحصاد' : 'Forecast Window: 30-Day Pre-Harvest'} · {selectedModel.targetHarvestDate}
                    </span>
                  </div>

                  <button
                    onClick={handleRunInference}
                    disabled={isInferencing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${isInferencing ? 'animate-spin' : ''}`} />
                    <span>{isInferencing ? (isAr ? 'جاري الاستدلال...' : 'Inferencing...') : (isAr ? 'إعادة تشغيل نموذج التنبؤ' : 'Run Inference Job')}</span>
                  </button>
                </div>

                {/* Yield Forecast KPI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-xs">{isAr ? 'المردود المتوقع (طن / هكتار):' : 'Predicted Yield (Tons/Ha):'}</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                      {livePredictedYield} <span className="text-xs text-slate-500">t/ha</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      +{selectedModel.gainVsHistoricalPercent}% {isAr ? 'مقارنة بالمعدل التاريخي' : 'vs Historical Avg'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-xs">{isAr ? 'هامش الثقة الإحصائي (95% CI):' : 'Confidence Bounds (95% CI):'}</span>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
                      [{selectedModel.confidenceLowerBound} – {selectedModel.confidenceUpperBound}] <span className="text-xs text-slate-500">t/ha</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{isAr ? 'خطأ قياس منخفض' : 'Low Variance'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-xs">{isAr ? 'الخوارزمية المستخدمة:' : 'Algorithm:'}</span>
                    <div className="text-sm font-bold font-mono text-amber-300 mt-1">
                      {selectedModel.algorithm}
                    </div>
                    <span className="text-[10px] text-slate-400">{isAr ? 'دقة التحقق المتقاطع 96.2%' : 'Validated 5-Fold Cross-Val'}</span>
                  </div>
                </div>

                {/* Features Used & Interactive Sliders */}
                <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-3">
                  {isAr ? 'أوزان المتغيرات المؤثرة في النموذج (Feature Importance):' : 'Feature Importance Breakdown:'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'ذروة مؤشر الخضرة (NDVI Peak):' : 'NDVI Peak:'}</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedModel.featuresUsed.ndviPeak} (Weight: 38%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }}></div>
                    </div>

                    <div className="flex justify-between text-slate-400 mt-2">
                      <span>{isAr ? 'مؤشر الغطاء المعزز (EVI):' : 'EVI Index:'}</span>
                      <span className="font-mono text-cyan-300 font-bold">{selectedModel.featuresUsed.eviIndex} (Weight: 24%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>{isAr ? 'المجموع الحراري المتراكم (GDD):' : 'Growing Degree Days (GDD):'}</span>
                      <span className="font-mono text-amber-300 font-bold">{selectedModel.featuresUsed.gddThermalSum}°C (Weight: 20%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>

                    <div className="flex justify-between text-slate-400 mt-2">
                      <span>{isAr ? 'تركيز نيتروجين التربة (PPM):' : 'Soil Nitrogen (PPM):'}</span>
                      <span className="font-mono text-indigo-300 font-bold">{simulatedNitrogenAdj} ppm (Weight: 18%)</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={120}
                      value={simulatedNitrogenAdj}
                      onChange={e => setSimulatedNitrogenAdj(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400">API Endpoint: GET /api/v1/ml/yield-forecast?crop={selectedModel.cropType}</span>
                  <span className="text-emerald-400 font-mono">Status: 200 OK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: PRIORITY P3 (CUSTOMS DIGITAL PASSPORTS & E-PAYMENT) */}
      {/* ============================================================== */}
      {activeSection === 'p3_customs_passports' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    TASK 3.1
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'ربط جوازات التصدير الرقمية ببوابات الجمارك الوطنية والدفع الإلكتروني' : 'E-Payment & Export Digital Passports Integration'}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr 
                    ? 'إصدار وتوثيق شهادات المنشأ الرقمية المشفرة (SHA-256 Verifiable Credentials) لشحنات تصدير زيت الزيتون البكر من ميلة وتمور دقلة نور من بسكرة للربط مع نظام الجمارك SIGAD.'
                    : 'Cryptographic signing and verifiable credential generation for olive oil and date export batches bridged with national customs clearance workflows.'}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setIsVerifyingSignature(true);
                  setTimeout(() => {
                    setIsVerifyingSignature(false);
                    setSignatureVerificationSuccess(true);
                    if (onTriggerAlert) {
                      onTriggerAlert(
                        isAr ? 'تم التحقق من التوقيع الجمركي بنجاح' : 'Customs Cryptographic Stamp Verified',
                        isAr ? 'تمت مطابقة الشهادة مع دفتر الأستاذ السيادي AtlasCloud وتم فتح مسار التصدير الأخضر.' : 'Certificate matched against AtlasCloud sovereign ledger. Green lane cleared.'
                      );
                    }
                  }, 800);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isVerifyingSignature ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'التحقق من التوقيع المشفر' : 'Verify Merkle Signature')}</span>
              </button>
            </div>

            {/* Dossiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {customsDossiers.map(dossier => (
                <div
                  key={dossier.certificateId}
                  onClick={() => setSelectedDossier(dossier)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    selectedDossier.certificateId === dossier.certificateId
                      ? 'bg-slate-800/90 border-amber-500/80 ring-1 ring-amber-500/40 shadow-xl'
                      : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {dossier.certificateId}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">{isAr ? dossier.commodityTypeAr : dossier.commodityTypeEn}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {dossier.customsGatewayStatus}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">{isAr ? 'رقم الشحنة والمحيط:' : 'Batch & Concession:'}</span>
                      <span className="font-mono text-slate-200">{dossier.batchId} ({dossier.concessionCode})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">{isAr ? 'الجهة المصدرة:' : 'Exporter Entity:'}</span>
                      <span className="text-slate-200">{dossier.exporterEntity}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">{isAr ? 'الكمية المصدرة:' : 'Volume:'}</span>
                      <span className="font-mono text-amber-300 font-bold">{dossier.volumeMetricTons} Metric Tons</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">{isAr ? 'ميناء المقصد الدولي:' : 'Destination Port:'}</span>
                      <span className="text-slate-300">{dossier.destinationPort}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">{isAr ? 'شهادة النقاء والجودة:' : 'Quality Standard:'}</span>
                      <span className="text-emerald-400">{dossier.purityCertification}</span>
                    </div>
                  </div>

                  {/* SHA-256 Fingerprint */}
                  <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400">
                    <div className="text-slate-500 mb-0.5">{isAr ? 'البصمة المشفرة للوثيقة (Verifiable Credential):' : 'SHA-256 Verifiable Credential:'}</div>
                    <div className="text-emerald-400 truncate">{dossier.sha256VerifiableCredential}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customs Gateway Architecture Pipeline */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold mb-2">
                <Lock className="w-4 h-4" />
                <span>Customs Gateway Integration Architecture (SIGAD / MADR E-Clearance)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400 mt-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-white font-bold mb-1">1. Batch Ingestion & QC</div>
                  <p className="text-[11px] leading-relaxed">
                    Inspection logs, lab acidity testing & satellite crop bounds automatically gathered into single payload.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-white font-bold mb-1">2. Cryptographic Merkle Seal</div>
                  <p className="text-[11px] leading-relaxed">
                    AtlasCloud sovereign nodes compute SHA-256 hash and anchor into immutable Merkle tree ledger.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-white font-bold mb-1">3. Automated Customs Gateway</div>
                  <p className="text-[11px] leading-relaxed">
                    SIGAD API receives webhook with cryptographic proof, granting green-channel clearance instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: STRATEGIC ARCHITECTURE DIRECTIVES (COMPONENTS A, B, C) */}
      {/* ============================================================== */}
      {activeSection === 'architecture_directives' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Component A: Computational & Edge AI */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                    COMPONENT A
                  </span>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {isAr ? 'الذكاء الاصطناعي الطرفي (Edge AI & Spatial Inference)' : 'Edge AI & Hydraulic Predictive Maintenance'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr
                    ? 'تنفيذ معالجة الصور والأقمار محلياً داخل المتصفح، مع الصيانة التنبؤية لصمامات سد بني هارون ومضخات الآبار العميقة بالألبي.'
                    : 'In-browser vector/raster tile inference and predictive maintenance for floating pump valves and deep Albian wells.'}
                </p>

                {/* Valve Health Simulator */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-300 font-mono">
                    {isAr ? 'حالة الصمام الهيدروليكي العائم (Beni Haroun VLV-04)' : 'Pump Valve Degradation & RUL'}
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'العمر المتبقي المفيد (RUL):' : 'Remaining Useful Life (RUL):'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{valveRulHours} Hours</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'مؤشر التجويف الهيدروليكي (Cavitation):' : 'Cavitation Index:'}</span>
                    <span className="font-mono text-cyan-300 font-bold">0.14 (Safe &lt; 0.35)</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'طيف الاهتزاز الميكانيكي:' : 'Vibration Spectrum:'}</span>
                    <span className="font-mono text-emerald-300">1.82 mm/s RMS (Normal)</span>
                  </div>

                  <button
                    onClick={() => {
                      setValveRulHours(prev => prev - 24);
                      alert(isAr ? 'تم تشغيل خوارزمية الصيانة التنبؤية على الحافة (Edge AI Inference Passed).' : 'Edge AI inference executed successfully.');
                    }}
                    className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-mono text-xs cursor-pointer"
                  >
                    Run Edge Valve Inference
                  </button>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-500 font-mono">
                Engine: ONNX Runtime Web + WebGL Acceleration
              </div>
            </div>

            {/* Component B: Cyber Sovereignty & Geo-Redundancy */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    COMPONENT B
                  </span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {isAr ? 'السيادة السيبرانية والتكرار الجغرافي (Geo-Redundancy)' : 'Cyber Sovereignty & Geo-Redundancy'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr
                    ? 'توافق تام مع معايير OGC الجغرافية (WMS/WFS/GeoJSON) وتكرار متزامن بين العقدة الشمالية (الجزائر DZ-North-1) والعقدة الجنوبية البديلة (ورقلة DZ-South-4).'
                    : 'Full OGC compliance (WMS/WFS) with active geo-redundant node in Ouargla (DZ-South-4) with async replication & failover.'}
                </p>

                {/* Geo-Redundancy Switcher */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] font-bold font-mono">{isAr ? 'العقدة السيادية النشطة:' : 'Active Sovereign Node:'}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                      {activeGeoNode}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'تأخر التكرار غير المتزامن (Lag):' : 'Replication Lag:'}</span>
                    <span className="font-mono text-cyan-400 font-bold">{replicationLagMs} ms (&lt; 50ms SLA)</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'بروتوكولات OGC المعتمدة:' : 'OGC Protocols:'}</span>
                    <span className="font-mono text-white">WMS 1.3.0 · WFS 2.0 · GeoJSON</span>
                  </div>

                  <button
                    onClick={handleToggleFailover}
                    disabled={isFailoverDrillActive}
                    className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-50 text-white font-mono text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFailoverDrillActive ? 'animate-spin' : ''}`} />
                    <span>{isFailoverDrillActive ? (isAr ? 'جاري التحويل...' : 'Failing Over...') : (isAr ? 'محاكاة تمرين الإخفاق السيادي (Failover Drill)' : 'Simulate Sovereign Failover Drill')}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-500 font-mono">
                Standard: OGC 06-042 / ISO 19128 Certified
              </div>
            </div>

            {/* Component C: Operational Sustainability & Multi-Channel UX */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    COMPONENT C
                  </span>
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {isAr ? 'قنوات الإنذار المتعددة وتجربة المستثمرين' : 'Multi-Channel Alerts & Investor UX'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr
                    ? 'منظومة إرسال التنبيهات عبر الرسائل القصيرة المشفرة SMS وتطبيق Telegram Bot (@SolEcosystemAlertsBot) بالإضافة إلى لوحة مخصصة للمستثمرين.'
                    : 'Encrypted SMS via national telecom SMPP, Telegram Bot API alerts, and Arabic-first simplified investor views.'}
                </p>

                {/* Multi-Channel Test Simulator */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-300 font-mono">
                    {isAr ? 'بوابة التنبيه الفوري (Multi-Channel Dispatcher)' : 'Priority Alert Gateways'}
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'بوابة الرسائل المشفرة SMS:' : 'Encrypted SMS Gateway:'}</span>
                    <span className="font-mono text-emerald-400">SMPP v3.4 (Mobilis/Djezzy)</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'قناة تيليغرام للعمليات:' : 'Telegram Bot API:'}</span>
                    <span className="font-mono text-cyan-400">@SolEcosystemBot (Online)</span>
                  </div>

                  <button
                    onClick={() => {
                      setSmsTestDispatched(true);
                      setTimeout(() => setSmsTestDispatched(false), 3000);
                      if (onTriggerAlert) {
                        onTriggerAlert(
                          isAr ? 'تم إرسال إشعار SMS وتيليغرام فوري' : 'SMS & Telegram Alert Dispatched',
                          isAr ? 'تم توجيه رسالة إنذار مشفرة لمهندس المناوبة بسد بني هارون عبر شبكة الاتصالات الوطنية.' : 'Encrypted dispatch routed to field supervisor.'
                        );
                      }
                    }}
                    className="w-full mt-2 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-mono text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{smsTestDispatched ? (isAr ? 'تم الإرسال بنجاح!' : 'Dispatched!') : (isAr ? 'اختبار إرسال إشعار SMS وتيليغرام' : 'Dispatch Test Alert')}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-500 font-mono">
                Coverage: 100% of Agro-Industrial Concessions
              </div>
            </div>
          </div>

          {/* Investor Simplified Executive Dashboard (When Toggled) */}
          {isInvestorMode && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-xl p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? 'لوحة المستثمرين والقيادة الاستراتيجية (Executive Investor View)' : 'Strategic Investor & Leadership Dashboard'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono">
                  {isAr ? 'بيانات معتمدة من ديوان ODAS ووزارة الفلاحة' : 'Certified ODAS & MADR Figures'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'المساحات الزراعية المروية' : 'Total Irrigated Land'}</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    485,000 <span className="text-xs text-slate-500">Ha</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">+18.4% YoY Expansion</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'الإنتاج القومي المتوقع للحبوب' : 'National Grain Harvest'}</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    1.95M <span className="text-xs text-slate-500">Tons</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">Self-Sufficiency Index: 88%</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'كفاءة توفير المياه السنوية' : 'Water Conservation'}</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                    34.2% <span className="text-xs text-slate-500">Saved</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-1">IoT Pivot Regulation</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'العائد الاستثماري المتوقع' : 'Estimated Concession ROI'}</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    22.6% <span className="text-xs text-slate-500">IRR</span>
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1">3.2 Years Payback Period</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
