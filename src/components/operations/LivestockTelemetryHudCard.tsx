import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Thermometer, 
  Heart, 
  Dna, 
  Play, 
  Pause, 
  AlertTriangle, 
  Crosshair,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Language, LivestockTelemetryPacket, LivestockAlertDeepLink } from '../../types/ecosystem';
import { rfidStreamer } from '../../services/rfidStreamer';

interface LivestockTelemetryHudCardProps {
  language: Language;
  onFocusAnimalOnMap: (target: LivestockAlertDeepLink) => void;
  activeBreachCount?: number;
}

export const LivestockTelemetryHudCard: React.FC<LivestockTelemetryHudCardProps> = ({
  language,
  onFocusAnimalOnMap,
  activeBreachCount
}) => {
  const isAr = language === 'ar';

  const [latestPacket, setLatestPacket] = useState<LivestockTelemetryPacket | null>(() => {
    const recents = rfidStreamer.getRecentPackets();
    return recents[0] || null;
  });
  const [isStreaming, setIsStreaming] = useState<boolean>(() => rfidStreamer.isStreamingActive());
  const [activeAlerts, setActiveAlerts] = useState<LivestockAlertDeepLink[]>([
    {
      tagId: 'DZ-SHP-44210-14',
      rfidChipId: 'RFID-DZ-SHP-44210-14',
      breed: 'نعاج أولاد جلال المحسنة (Ouled Djellal)',
      temperatureCelsius: 39.5,
      heartRateBpm: 84,
      heatToleranceScore: 89.2,
      coordinates: [24.171, 47.363],
      boundaryStatus: 'BOUNDARY_WARNING',
      locationName: 'شعيب السهوب وتلال المرعى (المنطقة B)',
      alertReason: 'تحذير اقتراب من السياج الرعوي ونفاد الكتلة الحيوية النباتية'
    }
  ]);

  // Subscribe to live streamer packets
  useEffect(() => {
    const unsubscribe = rfidStreamer.subscribe((packet) => {
      setLatestPacket(packet);

      if (packet.alertTriggered) {
        setActiveAlerts((prev) => {
          const filtered = prev.filter(a => a.tagId !== packet.tagId);
          return [
            {
              tagId: packet.tagId,
              rfidChipId: packet.rfidChipId,
              breed: packet.breed,
              temperatureCelsius: packet.temperatureCelsius,
              heartRateBpm: packet.heartRateBpm,
              heatToleranceScore: packet.heatToleranceScore,
              coordinates: packet.coordinates,
              boundaryStatus: packet.boundaryStatus,
              locationName: packet.locationName,
              alertReason: packet.alertReason
            },
            ...filtered
          ].slice(0, 4);
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleStream = () => {
    const newState = rfidStreamer.toggleStreaming();
    setIsStreaming(newState);
  };

  const handleTriggerBreach = () => {
    const packet = rfidStreamer.triggerSimulatedBoundaryBreach();
    setLatestPacket(packet);
  };

  const handleTriggerHyperthermia = () => {
    const packet = rfidStreamer.triggerSimulatedHyperthermia();
    setLatestPacket(packet);
  };

  const activeHerdCount = rfidStreamer.getActiveHerdCount();
  const averageHti = latestPacket ? latestPacket.heatToleranceScore : rfidStreamer.getAverageHti();
  const warningCount = activeBreachCount !== undefined ? activeBreachCount : rfidStreamer.getBoundaryWarningCount();

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur-sm space-y-3">
      {/* Top Header & Sovereign Bus Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Radio className={`w-4 h-4 ${isStreaming ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isAr ? 'الثروة الحيوانية والتتبع الجيني اللحظي' : 'Livestock & Genetic Health HUD'}</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>sol.telemetry.livestock.v3</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAr 
                ? 'ربط قياسات RFID وشرائح الاستشعار الحيوية مباشرة مع خريطة SolVision وغرفة عمليات Kareema'
                : 'Direct Sovereign Bus stream linking bio-sensors with SolVision map & Kareema dispatch'}
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStream}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isStreaming 
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isStreaming ? 'Pause RFID Stream' : 'Resume RFID Stream'}
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isStreaming ? (isAr ? 'البث نشط' : 'Stream Live') : (isAr ? 'البث متوقف' : 'Paused')}</span>
          </button>

          <button
            onClick={handleTriggerBreach}
            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            title="Simulate Perimeter Warning & Breach"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">{isAr ? 'اختبار اختراق سياج' : 'Simulate Breach'}</span>
          </button>

          <button
            onClick={handleTriggerHyperthermia}
            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
            title="Simulate Hyperthermia Spike"
          >
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'إجهاد حراري' : 'Heat Spike'}</span>
          </button>
        </div>
      </div>

      {/* 3 Core Metric Tiles (Requirement 2: Active Herd Count, Avg HTI, Boundary Warnings) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Active Herd Count */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'إجمالي رؤوس الماشية المراقبة' : 'Active Herd Count (RFID)'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-white">{activeHerdCount}</span>
              <span className="text-[11px] text-emerald-400 font-mono">{isAr ? 'رأس متصل' : 'Monitored Heads'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isAr ? '145 إبل · 380 غنم · 220 أبقار عشار' : '145 Camels · 380 Sheep · 220 Cattle'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Average HTI (Heat Tolerance Index) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'متوسط مؤشر التحمل الحراري (HTI)' : 'Avg. Heat Tolerance Index (HTI)'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-cyan-300">{averageHti}%</span>
              <span className="text-[10px] text-cyan-400 font-semibold px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/60">
                {averageHti >= 88 ? (isAr ? 'ممتاز' : 'Optimal') : (isAr ? 'تحت المراقبة' : 'Monitored')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isAr ? 'سلالات متأقلمة مع المناخ الصحراوي' : 'Desert Climate Acclimatized'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Boundary Warning Counter */}
        <div className={`bg-slate-950/80 border rounded-lg p-2.5 flex items-center justify-between transition-colors ${
          warningCount > 0 ? 'border-rose-700/80 bg-rose-950/20' : 'border-slate-800'
        }`}>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'تنبيهات تجاوز السياج الجغرافي' : 'Boundary Warnings (Geofence)'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold font-mono ${warningCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {warningCount}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {warningCount > 0 ? (isAr ? 'إنذار نشط' : 'Active Alerts') : (isAr ? 'ضمن السياج' : 'All Nominal')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isAr ? 'مراقبة سياج المرعى الافتراضي' : 'Virtual Geofenced Sanctuary'}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            warningCount > 0 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Live Stream Telemetry Ticker (Latest RFID Packet) */}
      {latestPacket && (
        <div className="bg-slate-950/90 border border-slate-850 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'آخر حزمة بيانات:' : 'Live Stream:'}</span>
            </span>
            <span className="font-bold text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
              {latestPacket.tagId}
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline font-mono">
              ({latestPacket.rfidChipId})
            </span>
            <span className="text-emerald-300 text-[11px] font-medium hidden sm:inline">
              · {latestPacket.breed}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-slate-300" title="Body Temperature">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <strong className={latestPacket.temperatureCelsius >= 39.4 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {latestPacket.temperatureCelsius}°C
              </strong>
            </span>

            <span className="flex items-center gap-1 text-slate-300" title="Heart Rate">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <strong>{latestPacket.heartRateBpm} BPM</strong>
            </span>

            <span className="flex items-center gap-1 text-slate-300" title="Individual HTI">
              <Dna className="w-3.5 h-3.5 text-teal-400" />
              <span>HTI: <strong className="text-teal-300">{latestPacket.heatToleranceScore}%</strong></span>
            </span>

            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              latestPacket.boundaryStatus === 'NOMINAL' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
            }`}>
              {latestPacket.boundaryStatus}
            </span>

            {/* Quick Deep Link Button to Animal Position */}
            <button
              onClick={() => onFocusAnimalOnMap({
                tagId: latestPacket.tagId,
                rfidChipId: latestPacket.rfidChipId,
                breed: latestPacket.breed,
                temperatureCelsius: latestPacket.temperatureCelsius,
                heartRateBpm: latestPacket.heartRateBpm,
                heatToleranceScore: latestPacket.heatToleranceScore,
                coordinates: latestPacket.coordinates,
                boundaryStatus: latestPacket.boundaryStatus,
                locationName: latestPacket.locationName,
                alertReason: latestPacket.alertReason
              })}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              title="Focus exact animal coordinates on GIS map with radar ping"
            >
              <Crosshair className="w-3 h-3 text-cyan-300" />
              <span>{isAr ? 'تتبع على الخريطة' : 'Radar Ping'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Kareema Alerts Strip & Deep Linking Callout */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border border-rose-800/60 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-rose-500/20 text-rose-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-200">
                  {isAr ? 'إنذار Kareema العملياتي للثروة الحيوانية:' : 'Kareema Operational Livestock Alert:'}
                </span>
                <span className="font-mono text-[11px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                  {activeAlerts[0].tagId}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900 text-white font-bold">
                  {activeAlerts[0].boundaryStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {activeAlerts[0].alertReason || (isAr ? 'رصد اقتراب من حد السياج وتجاوز النطاق الآمن' : 'Perimeter boundary alert detected in rangeland corridor')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400">
              [{activeAlerts[0].coordinates[0]}N, {activeAlerts[0].coordinates[1]}E]
            </span>
            <button
              onClick={() => onFocusAnimalOnMap(activeAlerts[0])}
              className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Crosshair className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '3s' }} />
              <span>{isAr ? 'فتح الخريطة وتفعيل رادار الرصد' : 'Deep Link to Spatial Map (Radar)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
