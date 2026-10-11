import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Radio, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  FileCheck, 
  Truck, 
  Warehouse, 
  QrCode, 
  RefreshCw, 
  Play, 
  Pause, 
  Clock, 
  MapPin, 
  Compass, 
  Layers, 
  Heart, 
  Search, 
  ExternalLink,
  ChevronRight,
  Database,
  Building2,
  Share2
} from 'lucide-react';
import { 
  AirliftMission, 
  CowIndividualPedigree, 
  Language, 
  AirliftFlightStatus 
} from '../../types/ecosystem';
import { US_DZ_AIRLIFT_MISSIONS } from '../../data/mockData';

interface UsDzAirliftTraceHubProps {
  language: Language;
  onDispatchConvoyWorkOrder?: (orderTitle: string, airportHub: string, coords: [number, number]) => void;
  onOpenQualityPassport?: (tagId: string) => void;
}

export const UsDzAirliftTraceHub: React.FC<UsDzAirliftTraceHubProps> = ({
  language,
  onDispatchConvoyWorkOrder,
  onOpenQualityPassport
}) => {
  const isAr = language === 'ar';

  const [missions, setMissions] = useState<AirliftMission[]>(US_DZ_AIRLIFT_MISSIONS);
  const [selectedFlightId, setSelectedFlightId] = useState<string>(US_DZ_AIRLIFT_MISSIONS[0].flightId);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const [isSimulatingLiveTelemetry, setIsSimulatingLiveTelemetry] = useState<boolean>(true);
  const [telemetryHeartbeat, setTelemetryHeartbeat] = useState<number>(1);
  const [selectedPedigree, setSelectedPedigree] = useState<CowIndividualPedigree | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'TELEMETRY' | 'QUARANTINE' | 'GENOMICS' | 'CONVOY'>('TELEMETRY');
  const [pedigreeSearch, setPedigreeSearch] = useState<string>('');
  const [simulatedGpsEventMsg, setSimulatedGpsEventMsg] = useState<string | null>(null);

  const selectedMission = missions.find(m => m.flightId === selectedFlightId) || missions[0];

  // Live Telemetry Simulation: update altitude, coordinates, ground speed & ping
  useEffect(() => {
    if (!isSimulatingLiveTelemetry || !isServerOnline) return;

    const interval = setInterval(() => {
      setTelemetryHeartbeat(prev => prev + 1);

      setMissions(prevMissions => 
        prevMissions.map(m => {
          if (m.flightId === selectedFlightId && m.status === 'AIRBORNE') {
            const nextProgress = Math.min(99, m.telemetry.routeProgressPercent + 0.2);
            // Slight coordinate drift towards destination
            const [curLat, curLng] = m.telemetry.currentCoordinates;
            const newLat = curLat - 0.008;
            const newLng = curLng + 0.035;
            
            // Vital fluctuations
            const tempVariation = +(16.5 + (Math.sin(Date.now() / 4000) * 0.4)).toFixed(1);
            const humidityVariation = Math.round(52 + Math.cos(Date.now() / 5000) * 3);

            return {
              ...m,
              lastTelemetryPingSec: (m.lastTelemetryPingSec % 5) + 1,
              telemetry: {
                ...m.telemetry,
                routeProgressPercent: +nextProgress.toFixed(1),
                currentCoordinates: [newLat, newLng],
                cabinTemperatureCelsius: tempVariation,
                cabinHumidityPercent: humidityVariation,
                groundSpeedKnots: Math.round(510 + (Math.sin(Date.now() / 2000) * 12))
              }
            };
          } else if (m.flightId === selectedFlightId && m.status === 'APPROACHING') {
            return {
              ...m,
              lastTelemetryPingSec: 1,
              telemetry: {
                ...m.telemetry,
                cabinTemperatureCelsius: +(17.1 + Math.random() * 0.2).toFixed(1),
                groundSpeedKnots: Math.round(335 + (Math.random() * 8))
              }
            };
          }
          return {
            ...m,
            lastTelemetryPingSec: (m.lastTelemetryPingSec + 1) % 6
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingLiveTelemetry, isServerOnline, selectedFlightId]);

  // Aggregate stats across strategic air bridge
  const totalCowsInTransit = missions.reduce((acc, m) => acc + m.cargo.headCount, 0);
  const airborneMissionsCount = missions.filter(m => m.status === 'AIRBORNE' || m.status === 'APPROACHING').length;
  const landedQuarantineCount = missions.filter(m => m.status === 'LANDED_QUARANTINE' || m.status === 'DISPATCHED_TO_DAIRY').length;

  const handleSimulateDisembarkation = () => {
    setMissions(prev => 
      prev.map(m => {
        if (m.flightId === selectedMission.flightId) {
          const nextStatus: AirliftFlightStatus = m.status === 'AIRBORNE' 
            ? 'APPROACHING' 
            : m.status === 'APPROACHING'
            ? 'LANDED_QUARANTINE'
            : 'DISPATCHED_TO_DAIRY';
          return {
            ...m,
            status: nextStatus
          };
        }
        return m;
      })
    );

    const msg = isAr
      ? `تم تحديث حالة الفوج الجوي [${selectedMission.flightId}] ➔ المحطة البيطرية السيادية بمطار ${selectedMission.receptionHub.stationNameAr}`
      : `Flight status updated for [${selectedMission.flightId}] ➔ Sovereign Veterinary Quarantine at ${selectedMission.receptionHub.stationNameEn}`;
    setSimulatedGpsEventMsg(msg);
    setTimeout(() => setSimulatedGpsEventMsg(null), 6000);
  };

  // Filter pedigree cows
  const displayedPedigrees = selectedMission.sampledPedigreeList.filter(p => {
    if (!pedigreeSearch.trim()) return true;
    const q = pedigreeSearch.toLowerCase();
    return (
      p.tagId.toLowerCase().includes(q) ||
      p.rfidChipId.toLowerCase().includes(q) ||
      p.sireName.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Strategic Airlift Bridge Header */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                SOL GLOBAL • US-DZ AIRLIFT TRACE
              </span>

              {/* Online Server Status Pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                isServerOnline 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              }`}>
                {isServerOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{isAr ? 'متصل بالمخدم (ONLINE)' : 'SERVER ONLINE (LIVE)'}</span>
                    <span className="text-slate-400 font-normal">| 14ms UTC</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>{isAr ? 'غير متصل (OFFLINE)' : 'OFFLINE BUFFER'}</span>
                  </>
                )}
              </div>

              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono">
                RELAY: {selectedMission.satelliteDataRelay}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{isAr ? 'منظومة الجسر الجوي الاستراتيجي وتتبع الأبقار الحلوب الأمريكية' : 'Strategic US-DZ Cattle Airlift & Genomic Traceability Bridge'}</span>
              <span className="text-base font-normal text-indigo-400 font-mono">(Texas / AZ / NM ➔ الجزائر)</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
              {isAr 
                ? 'تتبع حي ومباشر للشحنات الجوية عبر المحيط الأطلسي (طائرات شحن بيطرية متخصصة Boeing 747/777F)، مراقبة بيئة الحظائر الجوية (الحرارة، الرطوبة، ثنائي أكسيد الكربون، التهوية المستمرة)، الحجر البيطري السيادي بمطارات أدرار والمنيعة وبسكرة والعاصمة، وسجلات الأنساب الوراثية عالية الإدرار.'
                : 'Live transatlantic air-bridge telemetry for specialized livestock cargo aircraft (Boeing 747/777F), monitoring in-flight cabin environment (temperature, humidity, CO2, continuous ventilation), Sovereign airport quarantine facilities (Adrar, El Menia, Biskra, Algiers), and high-yield genomic pedigree records.'}
            </p>
          </div>

          {/* Quick Command Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsServerOnline(!isServerOnline)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                isServerOnline 
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40'
              }`}
              title={isAr ? 'تبديل الاتصال بالمخدم' : 'Toggle Server Link'}
            >
              {isServerOnline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isServerOnline ? (isAr ? 'محاكاة انقطاع المخدم' : 'Simulate Offline') : (isAr ? 'إعادة الاتصال' : 'Reconnect')}</span>
            </button>

            <button
              onClick={() => setIsSimulatingLiveTelemetry(!isSimulatingLiveTelemetry)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                isSimulatingLiveTelemetry
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isSimulatingLiveTelemetry ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulatingLiveTelemetry ? (isAr ? 'إيقاف التيليميتري' : 'Pause Telemetry') : (isAr ? 'استئناف التيليميتري' : 'Resume Telemetry')}</span>
            </button>

            <button
              onClick={handleSimulateDisembarkation}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحديث مرحلة الفوج الحالي' : 'Advance Flight Phase'}</span>
            </button>
          </div>
        </div>

        {/* Global Air Bridge Strategic KPI Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الرؤوس بالجسر الجوي' : 'Total Livestock in Bridge'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-white">{totalCowsInTransit.toLocaleString()}</span>
                <span className="text-[10px] text-indigo-300">{isAr ? 'بقرة عشار' : 'heifers'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{isAr ? 'أفواج في الجو / اقتراب' : 'Airborne / Approaching'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-400">{airborneMissionsCount}</span>
                <span className="text-[10px] text-slate-400">{isAr ? 'رحلات شحن نشطة' : 'flights active'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{isAr ? 'أفواج بالحجر البيطري والمزارع' : 'In Quarantine / Parlors'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-amber-400">{landedQuarantineCount}</span>
                <span className="text-[10px] text-slate-400">{isAr ? 'أفواج واصلة' : 'batches received'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{isAr ? 'شهادات USDA & مطابقة MADR' : 'USDA & MADR Clearances'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-teal-400">100%</span>
                <span className="text-[10px] text-teal-300 font-mono">100% Clean Bio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Notification Bar if fired */}
        {simulatedGpsEventMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{simulatedGpsEventMsg}</span>
          </div>
        )}
      </div>

      {/* Flight Selection Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {missions.map((mission) => {
          const isSelected = mission.flightId === selectedFlightId;
          const statusBadge = {
            AIRBORNE: { labelAr: 'في الجو عبر الأطلسي', labelEn: 'Airborne (Transatlantic)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
            APPROACHING: { labelAr: 'اقتراب من المجال الجزائري', labelEn: 'Approaching DZ Airspace', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            LANDED_QUARANTINE: { labelAr: 'هبطت - بالحجر البيطري', labelEn: 'Landed - Quarantine', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
            DISPATCHED_TO_DAIRY: { labelAr: 'قافلة نحو مجمع الحليب', labelEn: 'Dispatched to Dairy', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            SCHEDULED_DEPARTURE: { labelAr: 'مجدولة للإقلاع', labelEn: 'Scheduled Departure', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' }
          }[mission.status];

          return (
            <button
              key={mission.flightId}
              onClick={() => setSelectedFlightId(mission.flightId)}
              className={`text-right p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400"></div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5" />
                    {mission.telemetry.callsign}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadge.color}`}>
                    {isAr ? statusBadge.labelAr : statusBadge.labelEn}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {isAr ? mission.missionNameAr : mission.missionNameEn}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-1">
                  {mission.cargo.originRanch} ➔ {isAr ? mission.telemetry.destNameAr : mission.telemetry.destNameEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  {mission.cargo.headCount} {isAr ? 'رأس' : 'heads'}
                </span>
                <span className="text-slate-400">
                  {mission.telemetry.aircraftType}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Flight Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Telemetry & Mission Overview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Flight Radar & Flight Path HUD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedMission.telemetry.callsign}</span>
                    <span className="text-slate-400 text-xs font-normal">({selectedMission.telemetry.aircraftType})</span>
                  </h2>
                  <span className="text-xs text-indigo-300 font-mono">
                    {selectedMission.telemetry.originName} ➔ {isAr ? selectedMission.telemetry.destNameAr : selectedMission.telemetry.destNameEn}
                  </span>
                </div>
              </div>

              {/* Progress and Estimated Arrival */}
              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'الوصول المتوقع / الحالة' : 'ETA / Status'}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {selectedMission.telemetry.estimatedArrivalUtc}
                </span>
              </div>
            </div>

            {/* Flight Path Visualizer Progress */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1 font-mono text-indigo-300">
                  <MapPin className="w-3.5 h-3.5" /> {selectedMission.telemetry.originIcao} ({selectedMission.cargo.originState})
                </span>
                <span className="font-mono text-white font-bold">
                  {selectedMission.telemetry.routeProgressPercent}% {isAr ? 'مكتمل' : 'Completed'}
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-300">
                  <MapPin className="w-3.5 h-3.5" /> {selectedMission.telemetry.destIcao} (الجزائر - W.{selectedMission.telemetry.destWilayaNumber})
                </span>
              </div>

              {/* Progress Bar with Airplane Icon */}
              <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-visible border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${selectedMission.telemetry.routeProgressPercent}%` }}
                ></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -ml-2 text-white bg-indigo-600 rounded-full p-1 border border-white shadow-lg transition-all duration-700"
                  style={{ left: `${Math.min(98, Math.max(2, selectedMission.telemetry.routeProgressPercent))}%` }}
                >
                  <Plane className="w-3 h-3 transform rotate-45" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-850 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'الارتفاع الحالي' : 'Altitude'}</span>
                  <span className="font-mono text-slate-200 font-bold">{selectedMission.telemetry.altitudeFeet.toLocaleString()} FT</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'السرعة الأرضية' : 'Ground Speed'}</span>
                  <span className="font-mono text-slate-200 font-bold">{selectedMission.telemetry.groundSpeedKnots} KTS</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'إحداثيات GPS' : 'Current GPS'}</span>
                  <span className="font-mono text-cyan-300 font-bold text-[11px]">
                    {selectedMission.telemetry.currentCoordinates[0].toFixed(2)}°N, {selectedMission.telemetry.currentCoordinates[1].toFixed(2)}°W
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'آخر تحديث نبض' : 'Ping Latency'}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedMission.lastTelemetryPingSec}s ({selectedMission.serverConnectionStatus})
                  </span>
                </div>
              </div>
            </div>

            {/* In-Flight Livestock Cabin Climate HUD (Vital signs for cows during transatlantic flight) */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'بيئة عنابر الشحن الجوي الحية (Livestock Cargo Bay Climate)' : 'Livestock Cargo Bay Telemetry'}</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedMission.telemetry.ventilationStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Thermometer className="w-3 h-3 text-cyan-400" />
                    {isAr ? 'حرارة العنابر' : 'Temperature'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-cyan-300">
                      {selectedMission.telemetry.cabinTemperatureCelsius}°C
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">({isAr ? 'مثالي 15-18°' : 'Optimal'})</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    {isAr ? 'الرطوبة النسبية' : 'Humidity'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-blue-300">
                      {selectedMission.telemetry.cabinHumidityPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">RH</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Wind className="w-3 h-3 text-teal-400" />
                    {isAr ? 'تركيز CO2' : 'Cabin CO2'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-teal-300">
                      {selectedMission.telemetry.cabinCo2Ppm}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">PPM</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-amber-400" />
                    {isAr ? 'مخزون مياه الشرب' : 'Feed & Water Buffer'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-amber-300">
                      {selectedMission.telemetry.feedWaterSupplyRemainingHours}h
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">SAFE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Detail Explorer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTabSub('TELEMETRY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTabSub === 'TELEMETRY'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{isAr ? 'مواصفات الشحنة الجوية' : 'Cargo Specifications'}</span>
              </button>

              <button
                onClick={() => setActiveTabSub('QUARANTINE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTabSub === 'QUARANTINE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>{isAr ? 'الحجر البيطري السيادي بالمطار' : 'Airport Quarantine Terminal'}</span>
              </button>

              <button
                onClick={() => setActiveTabSub('GENOMICS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTabSub === 'GENOMICS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'سجلات الأنساب الوراثية وRFID' : 'Genomic Pedigrees & RFID'}</span>
              </button>

              <button
                onClick={() => setActiveTabSub('CONVOY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTabSub === 'CONVOY'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isAr ? 'قوافل النقل المكيفة للمزارع' : 'Desert Climate Convoy'}</span>
              </button>
            </div>

            {/* SUB-VIEW 1: Cargo Specs */}
            {activeTabSub === 'TELEMETRY' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'بيانات الشحنة والشهادات البيطرية الدولية' : 'Consignment & Sanitary Certifications'}</span>
                  </h3>
                  <span className="font-mono text-xs text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {selectedMission.cargo.usdaHealthCertNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'السلالة المستوردة' : 'Imported Breed'}:</span>
                      <span className="font-bold text-white">{isAr ? selectedMission.cargo.breedLabelAr : selectedMission.cargo.breedLabelEn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'عدد الرؤوس العشار' : 'Pregnant Heifers Count'}:</span>
                      <span className="font-mono font-bold text-emerald-400">{selectedMission.cargo.headCount} {isAr ? 'بقرة' : 'heads'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'متوسط وزن البقرة' : 'Average Live Weight'}:</span>
                      <span className="font-mono text-slate-200">{selectedMission.cargo.avgWeightKg} KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'عمر الحمل' : 'Gestation Age'}:</span>
                      <span className="font-mono text-amber-300">{selectedMission.cargo.gestationStageWeeks} {isAr ? 'أسبوع' : 'weeks'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'مزرعة المنشأ الأمريكية' : 'Origin Ranch'}:</span>
                      <span className="font-semibold text-white">{selectedMission.cargo.originRanch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'نطاق شرائح RFID' : 'RFID Serial Range'}:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">{selectedMission.cargo.rfidRangeStart} ...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'مؤشر الجدارة الوراثية (TPI)' : 'Genomic Merit TPI'}:</span>
                      <span className="font-mono font-bold text-teal-300">+{selectedMission.cargo.averageGenomicMeritIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isAr ? 'معدل استهلاك المياه/ساعة' : 'Water Intake Rate'}:</span>
                      <span className="font-mono text-blue-300">{selectedMission.cargo.waterConsumptionRateLitersPerHour} L/hr</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {isAr
                        ? 'موافقة الاستيراد السيادية صادرة وموثقة برقم وزارة الفلاحة والتنمية الريفية الجزائرية (MADR) ومطابقة للمعايير الصحية الدولية OIE.'
                        : 'Sovereign Import Authorization verified under Algerian Ministry of Agriculture (MADR) and in full conformity with WOAH/OIE sanitary protocols.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: Quarantine Terminal */}
            {activeTabSub === 'QUARANTINE' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? selectedMission.receptionHub.stationNameAr : selectedMission.receptionHub.stationNameEn}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedMission.receptionHub.biosecurityLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'طاقة استيعاب المحطة' : 'Quarantine Capacity'}</span>
                    <span className="text-base font-bold font-mono text-white">{selectedMission.receptionHub.quarantineCapacityHeads} {isAr ? 'رأس' : 'Heads'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'الرؤوس المتواجدة حالياً' : 'Current Occupancy'}</span>
                    <span className="text-base font-bold font-mono text-amber-400">{selectedMission.receptionHub.activeOccupancyHeads} {isAr ? 'رأس' : 'Heads'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'مدة العزل الإلزامية' : 'Isolation Period'}</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{selectedMission.receptionHub.isolationProtocolDays} {isAr ? 'يوماً بيطرياً' : 'Days'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
                  <span className="text-slate-400 font-semibold block">{isAr ? 'فريق الأطباء البيطريين المشرفين:' : 'Supervising Veterinary Officers:'}</span>
                  <ul className="space-y-1">
                    {selectedMission.receptionHub.veterinarySupervisors.map((vet, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{vet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'المجمع الحليبي الصحراوي النهائي' : 'Target Desert Mega-Dairy'}</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {isAr ? selectedMission.receptionHub.targetMegaDairyAr : selectedMission.receptionHub.targetMegaDairyEn}
                    </span>
                  </div>

                  {onDispatchConvoyWorkOrder && (
                    <button
                      onClick={() => onDispatchConvoyWorkOrder(
                        `تجهيز حظائر العزل والحجر البيطري بمطار ${selectedMission.receptionHub.stationNameAr}`,
                        selectedMission.receptionHub.stationNameAr,
                        selectedMission.telemetry.currentCoordinates
                      )}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all self-start md:self-auto"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إصدار أمر مهمة للفرق البيطرية' : 'Issue Veterinary Work Order'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: Genomics & Pedigree List */}
            {activeTabSub === 'GENOMICS' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-400" />
                      <span>{isAr ? 'بطاقات الأنساب الوراثية والشرائح الرقمية (RFID Passport)' : 'Genomic Pedigrees & Digital RFID Records'}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'عينات من القطيع المستورد مع شهادات التلقيح، الأب، الأم، والإنتاج المتوقع' : 'Sampled genomic cattle with certified sire/dam genetics and milk yield'}
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder={isAr ? 'بحث برقم الشريحة أو البقرة...' : 'Search RFID or Tag...'}
                      value={pedigreeSearch}
                      onChange={(e) => setPedigreeSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'رقم البقرة (Ear-Tag)' : 'Ear Tag'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'الشريحة الرقمية RFID' : 'RFID Chip'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'الأصل الوراثي (الأب / Sire)' : 'Sire Genetics'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'الإدرار المتوقع (لتر/سنة)' : 'Est. Milk Yield'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'تحمل الحرارة الصحراوية' : 'Heat Tolerance'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isAr ? 'حالة الحمل' : 'Gestation'}</th>
                        <th className="py-2.5 px-3 font-semibold text-center">{isAr ? 'التدقيق' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {displayedPedigrees.map((pedigree) => (
                        <tr key={pedigree.tagId} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            {pedigree.tagId}
                          </td>
                          <td className="py-2.5 px-3 text-cyan-300 text-[11px]">{pedigree.rfidChipId}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans">{pedigree.sireName}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{pedigree.expectedAnnualMilkYieldLiters.toLocaleString()} L</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                              {pedigree.heatToleranceScore}/100
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{pedigree.pregnancyStatus}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setSelectedPedigree(pedigree)}
                              className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all text-[11px]"
                            >
                              {isAr ? 'بطاقة النسب' : 'Pedigree'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: Convoy Fleet */}
            {activeTabSub === 'CONVOY' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'أسطول شاحنات النقل المبردة والمكيفة المخصصة للمناطق الصحراوية' : 'Desert Climate-Controlled Convoy Logistics'}</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {selectedMission.receptionHub.transportFleetAssignedCount} {isAr ? 'شاحنات نقل مبردة مخصصة' : 'Trailers Assigned'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr 
                    ? `تجهيز قوافل نقل مجهزة بأنظمة تكييف متطورة، أحواض ترطيب أوتوماتيكية، ومراقبة حرارية بالفيديو عبر الأقمار الصناعية لنقل الأبقار من مطار ${selectedMission.receptionHub.stationNameAr} مباشرة إلى الحظائر الصحراوية ذات التبريد التبخيري في ${selectedMission.receptionHub.targetMegaDairyAr}.`
                    : `Dispatched specialized livestock trailers equipped with evaporative climate controls, automatic hydration drinkers, and continuous GPS/satellite tracking, transporting arriving cattle from ${selectedMission.receptionHub.stationNameEn} to ${selectedMission.receptionHub.targetMegaDairyEn}.`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'مسار القافلة' : 'Convoy Route'}</span>
                    <span className="font-semibold text-white">RN1 / الطريق الوطني العابر للصحراء</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'حرارة المقصورة المستهدفة' : 'Target Trailer Temp'}</span>
                    <span className="font-mono font-bold text-cyan-400">18°C - 20°C</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-400 block mb-1">{isAr ? 'زمن النقل التقديري' : 'Estimated Transit Time'}</span>
                    <span className="font-mono font-bold text-amber-400">1h 45m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Flight Log & Sovereign Node Verification (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sovereign DZ Node Sync Card */}
          <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SOVEREIGN NODE INTEGRATION
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isAr ? 'العقدة الوطنية المصدقة' : 'Signer Node'}:</span>
                <span className="font-mono font-bold text-emerald-400">DZ-North-1 (Algiers)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isAr ? 'تشفير التيليميتري' : 'Telemetry Security'}:</span>
                <span className="font-mono text-cyan-400">TLS 1.3 / AES-256</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isAr ? 'المصادقة البيطرية' : 'Sanitary Seal'}:</span>
                <span className="font-mono text-teal-300">MADR-DZ-APHIS-2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isAr ? 'حالة التزامن' : 'Live State'}:</span>
                <span className="font-mono text-emerald-400 font-bold">100% SYNCHRONIZED</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'يتم توثيق كل قراءة تيليميتري ودرجة حرارة عنبر الشحن الجوي وتوقيعها مشفرة في سجل التدقيق السيادي لحماية الأمن الغذائي الوطني.'
                : 'Each in-flight telemetry packet and animal welfare metric is cryptographically signed and archived on the sovereign audit registry.'}
            </p>
          </div>

          {/* Individual Cow Pedigree Inspector Modal / Card */}
          {selectedPedigree ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-5 shadow-xl space-y-3 relative">
              <button
                onClick={() => setSelectedPedigree(null)}
                className="absolute top-3 left-3 text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedPedigree.tagId}</h4>
                  <span className="text-[11px] font-mono text-cyan-300">{selectedPedigree.rfidChipId}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'الأب (Sire)' : 'Sire'}:</span>
                  <span className="font-bold text-white">{selectedPedigree.sireName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'الأم (Dam)' : 'Dam'}:</span>
                  <span className="font-bold text-slate-200">{selectedPedigree.damName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'الإنتاج السنوي المتوقع' : 'Milk Yield'}:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedPedigree.expectedAnnualMilkYieldLiters.toLocaleString()} L/Year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'مؤشر مقاومة الحرارة' : 'Heat Score'}:</span>
                  <span className="font-mono font-bold text-amber-300">{selectedPedigree.heatToleranceScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'نبض القلب اللحظي' : 'Heart Rate'}:</span>
                  <span className="font-mono text-rose-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 animate-pulse" /> {selectedPedigree.currentHeartRateBpm} BPM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'حرارة الجسم' : 'Body Temp'}:</span>
                  <span className="font-mono text-cyan-300">{selectedPedigree.temperatureCelsius}°C</span>
                </div>
              </div>

              <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300">
                <span className="font-bold block mb-0.5">{isAr ? 'الختم الصحي الأمريكي والفلاحي الجزائري:' : 'Official Health Approval:'}</span>
                <span className="font-mono text-[10px] block">{selectedPedigree.dzMinistryHealthApproval}</span>
                <span className="font-mono text-[10px] block text-slate-400">{selectedPedigree.usdaExportSeal}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isAr ? 'حدد أي بقرة من تبويب سجلات الأنساب للاطلاع على شجرتها الوراثية وتيليميتري صحتها الحية.' : 'Select any cow from the Genomics tab to inspect her certified pedigree & live vital telemetry.'}
              </p>
            </div>
          )}

          {/* Quick Mission Operations Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'إجراءات العمليات السريعة' : 'Tactical Operations'}</span>
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const newPedigree: CowIndividualPedigree = {
                    tagId: `US-DZ-NEW-${Date.now().toString().slice(-4)}`,
                    rfidChipId: `RFID-840-003-999-${Date.now().toString().slice(-3)}`,
                    breed: selectedMission.cargo.breed,
                    sireName: "PEAK ALTATOP-FLIGHT-ET",
                    damName: "ALGERIAN-AMERICAN SELECT HEIFER",
                    expectedAnnualMilkYieldLiters: 12600,
                    heatToleranceScore: 95,
                    pregnancyStatus: "عشار 18 أسبوع (فحص بيطري رقمي جديد)",
                    genomicProfileScore: 96.0,
                    usdaExportSeal: "USDA-APHIS-EXP-2026-LIVE",
                    dzMinistryHealthApproval: "DZ-MADR-SANTE-NEW-CERT",
                    assignedAirBridgeFlight: selectedMission.flightId,
                    currentLocationStage: "IN_TRANSIT_AIR",
                    currentHeartRateBpm: 71,
                    temperatureCelsius: 38.5
                  };

                  setMissions(prev => 
                    prev.map(m => m.flightId === selectedMission.flightId 
                      ? { ...m, sampledPedigreeList: [newPedigree, ...m.sampledPedigreeList] }
                      : m
                    )
                  );
                  setSelectedPedigree(newPedigree);
                  setActiveTabSub('GENOMICS');
                }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'مسح شريحة RFID جديدة للبقرة' : 'Scan New Cow RFID Pedigree'}</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedGpsEventMsg(
                    isAr 
                      ? `تم إرسال إشعار فوري لمدير المحطة البيطرية بمطار ${selectedMission.receptionHub.stationNameAr}: جاهزية ممرات الاستقبال والعزل`
                      : `Immediate alert dispatched to Quarantine Station Master at ${selectedMission.receptionHub.stationNameEn}: reception corridors confirmed`
                  );
                  setTimeout(() => setSimulatedGpsEventMsg(null), 5000);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'تأكيد جاهزية الحجر البيطري L4' : 'Verify L4 Quarantine Readiness'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
