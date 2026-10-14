import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Satellite, 
  Layers, 
  Sliders, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Calendar, 
  ChevronRight, 
  MapPin, 
  Database, 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  ArrowLeftRight, 
  ShieldCheck, 
  Compass,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Radio,
  Send,
  Workflow,
  Trees,
  Waves,
  Mountain
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid 
} from 'recharts';
import { Language, ParcelAsset, BoundingBox } from '../../types/ecosystem';
import { ChronosSpectralMode, HistoricalEpoch, ChronosRegionalCluster, DarkDroughtSimulationResult, MilaSubBasinZone } from '../../types/chronos';
import { HISTORICAL_EPOCHS, MILA_OLIVE_HISTORICAL_EPOCHS, CHRONOS_REGIONAL_CLUSTERS, MILA_SUB_BASINS } from '../../data/chronosData';
import { generateChronosSovereignReport } from '../../utils/chronosPdfGenerator';
import { eventBus, generateSha256 } from '../../services/eventBus';

interface SolChronosHubProps {
  language: Language;
  parcels?: ParcelAsset[];
  activeBbox?: BoundingBox;
  onSwitchToGeneralGis?: () => void;
}

export const SolChronosHub: React.FC<SolChronosHubProps> = ({
  language,
  parcels = [],
  activeBbox,
  onSwitchToGeneralGis
}) => {
  const isAr = language === 'ar';

  // Selected Cluster & Epochs
  const [selectedClusterId, setSelectedClusterId] = useState<string>('mila-olive-farm');
  const [selectedMilaSubBasinId, setSelectedMilaSubBasinId] = useState<string>('beni-haroun');
  const [baselineYear, setBaselineYear] = useState<number>(1988);
  const [comparisonYear, setComparisonYear] = useState<number>(2026);

  // Split-Swipe Slider Position (0 to 100%)
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Spectral Layer Mode
  const [spectralMode, setSpectralMode] = useState<ChronosSpectralMode>('ndwi');

  // Autoplay Timelapse
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);

  // PostGIS Query Copy State
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  // Phase 2: Dark-Drought Simulation & Stress-Test State
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [thermalSpikeC, setThermalSpikeC] = useState<number>(3.4); // +2.5°C to +4.0°C
  const [precipDeficitPercent, setPrecipDeficitPercent] = useState<number>(68); // 30% to 90%
  const [kareemaDispatchResult, setKareemaDispatchResult] = useState<{
    dispatched: boolean;
    orderId?: string;
    merkleProof?: string;
    timestamp?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentCluster = CHRONOS_REGIONAL_CLUSTERS.find(c => c.id === selectedClusterId) || CHRONOS_REGIONAL_CLUSTERS[0];
  const isMilaCluster = selectedClusterId.startsWith('mila') || currentCluster.id.startsWith('mila');
  const currentMilaSubBasin: MilaSubBasinZone = MILA_SUB_BASINS.find(b => b.id === selectedMilaSubBasinId) || MILA_SUB_BASINS[0];

  // Sync sub-basin selection when cluster selection changes
  useEffect(() => {
    if (selectedClusterId === 'mila-beni-haroun') setSelectedMilaSubBasinId('beni-haroun');
    else if (selectedClusterId === 'mila-oued-endja') setSelectedMilaSubBasinId('oued-endja');
    else if (selectedClusterId === 'mila-rouached') setSelectedMilaSubBasinId('rouached');
    else if (selectedClusterId === 'mila-tessala') setSelectedMilaSubBasinId('tessala');
    else if (selectedClusterId === 'mila-bainan') setSelectedMilaSubBasinId('bainan');
  }, [selectedClusterId]);

  // Use specialized epochs if Mila, else standard national epochs
  const activeEpochList = isMilaCluster ? MILA_OLIVE_HISTORICAL_EPOCHS : HISTORICAL_EPOCHS;
  const baselineEpoch = activeEpochList.find(e => e.year === baselineYear) || activeEpochList[0];
  const comparisonEpoch = activeEpochList.find(e => e.year === comparisonYear) || activeEpochList[activeEpochList.length - 1];

  // Dynamic Ecological Tipping Point Calculation based on Thermal Spikes and Soil Moisture Depletion
  const tippingPointPercent = Math.min(100, Math.round((thermalSpikeC / 4.0 * 48) + (precipDeficitPercent / 100 * 52)));
  const soilMoistureRemaining = Math.max(12, 100 - tippingPointPercent);
  const isTippingPointBreached = tippingPointPercent >= 65;

  // Dark-Drought Sub-Surface Threshold Analysis
  const meanNdwi = isMilaCluster ? (currentMilaSubBasin.currentNdwi2026 * 0.85) : (currentCluster.historicalMeanNdwi ?? 0.45);
  const stdDevSigma = currentCluster.historicalStdDevNdwi ?? 0.042;
  const subSurfaceThreshold = currentCluster.darkDroughtSubsurfaceThreshold ?? (meanNdwi - 2 * stdDevSigma);
  const currentNdwi = comparisonEpoch.averageNdwi ?? 0.52;
  const simulatedSimNdwi = isSimulationActive ? Math.max(0.18, currentNdwi - (tippingPointPercent / 100 * 0.28)) : currentNdwi;
  const isSubsurfaceDarkDroughtDetected = simulatedSimNdwi < subSurfaceThreshold;

  // Autoplay Timelapse
  useEffect(() => {
    if (!isAutoplay) return;
    const years = activeEpochList.map(e => e.year);
    const interval = setInterval(() => {
      setComparisonYear((prev) => {
        const nextIdx = (years.indexOf(prev) + 1) % years.length;
        return years[nextIdx];
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isAutoplay, activeEpochList]);

  // Handle Split Swipe Dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSplit && e.type !== 'click') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = clientX - rect.left;
    const newPercent = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
    setSplitPercent(Math.round(newPercent));
  };

  // Phase 2: Dispatch Kareema Precision Intervention Workflow upon threshold breach
  const handleTriggerKareemaIntervention = () => {
    const clusterLabel = isMilaCluster 
      ? `${isAr ? currentCluster.nameAr : currentCluster.nameEn} (${isAr ? currentMilaSubBasin.nameAr : currentMilaSubBasin.nameEn})`
      : (isAr ? currentCluster.nameAr : currentCluster.nameEn);

    const { workOrder, stressEvent } = eventBus.triggerDarkDroughtDispatchWorkflow({
      clusterId: isMilaCluster ? `mila-${currentMilaSubBasin.id}` : currentCluster.id,
      clusterName: clusterLabel,
      thermalSpikeC,
      precipDeficitPercent,
      tippingPointPercent,
      coordinates: isMilaCluster ? currentMilaSubBasin.coordinates : currentCluster.centerCoords,
      bbox: isMilaCluster ? currentMilaSubBasin.bbox : currentCluster.bbox
    });

    const proofHash = generateSha256(`${workOrder.order_id}|${stressEvent.event_id}|${tippingPointPercent}|0x992abfc01928471e9842a189fbc0028194`);

    setKareemaDispatchResult({
      dispatched: true,
      orderId: workOrder.order_id,
      merkleProof: proofHash,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    });
  };

  // Phase 3: Sovereign Dossier PDF Export with Merkle Proofs & SHA-256 Signatures
  const handleDownloadPdfReport = () => {
    const simResult: DarkDroughtSimulationResult = {
      tippingPointPercent,
      subsurfaceStressDetected: isSubsurfaceDarkDroughtDetected,
      canopyYellowingRisk: tippingPointPercent > 80 ? 'CRITICAL' : tippingPointPercent > 65 ? 'ELEVATED' : 'LOW',
      soilMoistureRemainingPercent: soilMoistureRemaining,
      kareemaDispatchRequired: isTippingPointBreached,
      sha256Proof: generateSha256(`${currentCluster.odasConcessionRef}|${tippingPointPercent}|${thermalSpikeC}`),
      merkleLeaf: generateSha256(`LEAF-${currentCluster.id}-${Date.now()}`),
      dispatchWorkOrderId: kareemaDispatchResult?.orderId || 'WO-CHRONOS-DD-9142'
    };

    generateChronosSovereignReport({
      cluster: currentCluster,
      epochs: activeEpochList,
      baselineYear,
      comparisonYear,
      language,
      darkDroughtSimulation: simResult,
      thermalSpikeC,
      precipDeficitPercent,
      subBasin: isMilaCluster ? currentMilaSubBasin : null
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(comparisonEpoch.postGisQuerySnippet);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Recharts Chart Data across decades
  const chartData = activeEpochList.map(e => ({
    year: `${e.year}`,
    ndvi: e.averageNdvi,
    ndwi: e.averageNdwi ?? (e.averageNdvi * 0.65 - 0.05),
    areaHa: e.vegetationAreaHa,
    soilMoisture: e.subsurfaceSoilMoisturePercent ?? Math.round(e.averageNdvi * 80),
    cooling: Math.abs(e.surfaceTempDeficitC)
  }));

  // Reclaimed Metrics
  const reclaimedHectares = comparisonEpoch.vegetationAreaHa - baselineEpoch.vegetationAreaHa;
  const ndviGrowthPercent = Math.round(((comparisonEpoch.averageNdvi - baselineEpoch.averageNdvi) / (baselineEpoch.averageNdvi || 0.01)) * 100);
  const ndwiGain = (comparisonEpoch.averageNdwi ?? 0.52) - (baselineEpoch.averageNdwi ?? 0.16);

  const isOliveFarm = currentCluster.cropCategory === 'OLIVE_GROVES' || isMilaCluster;

  return (
    <div className="space-y-4 font-sans select-none animate-in fade-in">
      {/* Top Sol-Chronos Command Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-md">
              <History className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'منظومة Sol-Chronos للتحليل المكاني التاريخي (1988 - 2026)' : 'Sol-Chronos: Historical Spatial Analytics Engine'}</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                  Landsat 4/5/7/8/9 & Sentinel-2 MSI
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  PostGIS Temporal V3.4
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold">
                  Dark-Drought Detection
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'رصد 38 عاماً من السلاسل الزمنية لأحواض ولاية ميلة (بني هارون، واد النجاء، الرواشد، تسالة، باينان)، محاكاة نقاط التحول البيئي، وتصدير التقارير السيادية'
                  : '38-year raster analytics for Mila basins (Beni Haroun, Oued Endja, Rouached, Tessala, Bainan), Dark-Drought stress tests, and Merkle dossiers'}
              </p>
            </div>
          </div>

          {/* Quick Actions & PDF Report */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSimulationActive(!isSimulationActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isSimulationActive
                  ? 'bg-rose-950/90 border-rose-600 text-rose-300 ring-1 ring-rose-500/50'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{isAr ? 'محاكي الإجهاد الحراري (Dark-Drought)' : 'Dark-Drought Simulator'}</span>
            </button>

            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isAutoplay
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              {isAutoplay ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAutoplay ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تسلسل زمني' : 'Play Timelapse')}</span>
            </button>

            <button
              onClick={handleDownloadPdfReport}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              title="Download Sovereign Historical Audit Dossier PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير التقرير والملف السيادي (PDF)' : 'Export Sovereign Dossier (PDF)'}</span>
            </button>

            {onSwitchToGeneralGis && (
              <button
                onClick={onSwitchToGeneralGis}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {isAr ? 'الخريطة الحية' : 'Live GIS'}
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Region Basin Picker + Spectral Mode Buttons + Dark-Drought Standard Deviation Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target Regional Cluster */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'المنطقة الزراعية الكبرى:' : 'Agricultural Target Zone:'}</span>
            </span>
            <select
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[340px] truncate"
            >
              {CHRONOS_REGIONAL_CLUSTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Surface Early Detection Standard Deviation Baseline Badge */}
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px] font-mono">
              {isAr ? 'عتبة الرصد تحت السطحي (38-Year Baseline):' : 'Pre-Yellowing Subsurface Limit:'}
            </span>
            <span className="font-mono text-emerald-300 font-bold text-[11px]">
              μ={meanNdwi.toFixed(2)} | -2.0σ (NDWI &lt; {subSurfaceThreshold.toFixed(3)})
            </span>
          </div>

          {/* Spectral Mode Buttons */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSpectralMode('ndwi')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'ndwi'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'رادار الرطوبة (NDWI)' : 'Canopy Water (NDWI)'}
            </button>
            <button
              onClick={() => setSpectralMode('ndvi')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'ndvi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'طيف الغطاء (NDVI)' : 'Biomass (NDVI)'}
            </button>
            <button
              onClick={() => setSpectralMode('rgb')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'rgb'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'طبيعي (RGB)' : 'True Color'}
            </button>
            <button
              onClick={() => setSpectralMode('thermal')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'thermal'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'حراري (LST)' : 'Thermal (LST)'}
            </button>
          </div>
        </div>

        {/* DEDICATED MILA PROVINCE SUB-BASINS SELECTOR (Beni Haroun, Oued Endja, Rouached, Tessala, Bainan) */}
        {isMilaCluster && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                <Droplets className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{isAr ? 'أحواض ولاية ميلة الفلاحية والمائية (Wilaya 43 - Mila Sub-Basins):' : 'Mila Province Agro-Hydrological Basins (Wilaya 43):'}</span>
              </span>
              <span className="text-[11px] text-cyan-300 font-mono hidden sm:inline">
                {isAr ? currentMilaSubBasin.nameAr : currentMilaSubBasin.nameEn}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MILA_SUB_BASINS.map((basin) => {
                const isSelected = selectedMilaSubBasinId === basin.id;
                return (
                  <button
                    key={basin.id}
                    onClick={() => {
                      setSelectedMilaSubBasinId(basin.id);
                      setSelectedClusterId(`mila-${basin.id}`);
                    }}
                    className={`p-2.5 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs text-white flex items-center gap-1 truncate">
                        {basin.id === 'beni-haroun' && <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        {basin.id === 'oued-endja' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {basin.id === 'rouached' && <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {basin.id === 'tessala' && <Mountain className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                        {basin.id === 'bainan' && <Trees className="w-3.5 h-3.5 text-lime-400 shrink-0" />}
                        <span>{isAr ? basin.shortLabelAr : basin.shortLabelEn}</span>
                      </span>
                      <span className={`text-[9px] font-mono px-1 rounded ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {basin.areaHectares} ha
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {basin.treeCount.toLocaleString()} {isAr ? 'شجرة زيتون' : 'olive trees'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 pt-1 border-t border-slate-850">
                      <span className="text-cyan-300 font-bold">NDWI {basin.currentNdwi2026}</span>
                      <span className="text-emerald-400 font-bold">NDVI {basin.currentNdvi2026}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PHASE 2: DARK-DROUGHT SIMULATION & ECOLOGICAL TIPPING POINT ENGINE PANEL */}
      {isSimulationActive && (
        <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/60 border border-rose-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-rose-500/20 text-rose-400">
                <Flame className="w-4 h-4 animate-bounce" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'محرك محاكاة الإجهاد المناخي (Dark-Drought Stress-Test Engine)' : 'Dark-Drought Simulation & Stress-Test Engine'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-700">
                    {isAr ? 'الحوض المفحوص:' : 'Active Basin:'} {isMilaCluster ? (isAr ? currentMilaSubBasin.nameAr : currentMilaSubBasin.nameEn) : currentCluster.nameEn}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  {isAr
                    ? 'محاكاة موجات الحرارة الاستثنائية (+2.5°C إلى +4.0°C) وانحباس الأمطار لرصد انهيار الإجهاد المائي تحت السطحي قبل ظهور اصفرار أوراق المحاصيل'
                    : 'Simulate extreme heatwave anomalies (+2.5°C to +4.0°C) and precipitation collapse to detect sub-surface tipping points before canopy yellowing'}
                </p>
              </div>
            </div>

            {/* Quick Test Zone Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setSelectedClusterId('mila-olive-farm');
                  setSelectedMilaSubBasinId('beni-haroun');
                }}
                className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-colors ${
                  isMilaCluster ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mila Basins 🫒
              </button>
              <button
                onClick={() => setSelectedClusterId('djelfa-green-dam')}
                className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-colors ${
                  selectedClusterId === 'djelfa-green-dam' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Djelfa Green Dam 🌲
              </button>
              <button
                onClick={() => setSelectedClusterId('adrar-oasis')}
                className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-colors ${
                  selectedClusterId === 'adrar-oasis' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Adrar Oasis 🌴
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Slider 1: Thermal Spike (+2.5°C to +4.0°C) */}
            <div className="md:col-span-3 space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 font-medium">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'موجة الحرارة المضافة:' : 'Thermal Spike:'}</span>
                </span>
                <span className="font-mono text-rose-400 font-bold text-sm">+{thermalSpikeC.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="4.0"
                step="0.1"
                value={thermalSpikeC}
                onChange={(e) => setThermalSpikeC(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>+2.5°C</span>
                <span>+3.2°C (Mila Risk)</span>
                <span>+4.0°C (Extreme)</span>
              </div>
            </div>

            {/* Slider 2: Precipitation Deficit (-30% to -90%) */}
            <div className="md:col-span-3 space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'عجز التساقط المطري:' : 'Precip Deficit:'}</span>
                </span>
                <span className="font-mono text-amber-400 font-bold text-sm">-{precipDeficitPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={precipDeficitPercent}
                onChange={(e) => setPrecipDeficitPercent(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-30%</span>
                <span>-65% (Drought)</span>
                <span>-90% (Blackout)</span>
              </div>
            </div>

            {/* Metric 3: Ecological Tipping Point % & Early Subsurface Detection */}
            <div className="md:col-span-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">
                  {isAr ? 'نقطة التحول البيئي (Tipping Point %):' : 'Ecological Tipping Point:'}
                </span>
                <span className={`font-mono text-base font-bold ${
                  tippingPointPercent >= 75 ? 'text-rose-400 animate-pulse' : tippingPointPercent >= 60 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {tippingPointPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-1">
                <div 
                  className={`h-full transition-all duration-300 ${
                    tippingPointPercent >= 75 ? 'bg-rose-500' : tippingPointPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tippingPointPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={isSubsurfaceDarkDroughtDetected ? 'text-rose-300 font-bold' : 'text-slate-400'}>
                  {isSubsurfaceDarkDroughtDetected 
                    ? (isAr ? '⚠ تم رصد Dark-Drought قبل الاصفرار' : '⚠ Sub-surface Stress Detected!') 
                    : (isAr ? 'رطوبة الجذور ضمن الحدود الآمنة' : 'Subsurface Moisture Nominal')}
                </span>
                <span className="text-slate-400">Moist: {soilMoistureRemaining}%</span>
              </div>
            </div>

            {/* Action 4: Kareema Dispatch Protocol Trigger */}
            <div className="md:col-span-3 flex flex-col justify-center space-y-1.5">
              <button
                onClick={handleTriggerKareemaIntervention}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 hover:from-rose-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'تفعيل أمر طوارئ Kareema للري والرش الوقائي' : 'Dispatch Kareema Precision Alert'}</span>
              </button>

              {kareemaDispatchResult && (
                <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-[10px] font-mono text-emerald-300 flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{kareemaDispatchResult.orderId}</span>
                  </span>
                  <span className="text-slate-400 truncate max-w-[100px]">{kareemaDispatchResult.merkleProof?.slice(0, 16)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Decadal Timeline Slider (1988 - 2026) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">
              {isAr ? 'سلسلة لاندسات 4/5/7/8/9 وسنتينل-2 الزمنية (1988–2026)' : 'Multi-Decadal Landsat & Sentinel-2 Timeline Epochs (1988–2026)'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-amber-400 font-semibold">{isAr ? 'الأساس التاريخي:' : 'Baseline:'} <strong>{baselineYear}</strong></span>
            <span>⇄</span>
            <span className="text-emerald-400 font-semibold">{isAr ? 'المقارن اللحظي:' : 'Target:'} <strong>{comparisonYear}</strong></span>
          </div>
        </div>

        {/* Discrete Decade Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {activeEpochList.map((epoch) => {
            const isBaseline = epoch.year === baselineYear;
            const isTarget = epoch.year === comparisonYear;

            return (
              <div 
                key={epoch.year}
                className={`p-2 rounded-lg border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                  isTarget 
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/50' 
                    : isBaseline 
                      ? 'bg-amber-950/60 border-amber-600 shadow-sm' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setComparisonYear(epoch.year)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-sm text-white">{epoch.year}</span>
                  {isTarget ? (
                    <span className="text-[9px] font-bold px-1 rounded bg-emerald-500 text-slate-950">
                      TARGET
                    </span>
                  ) : isBaseline ? (
                    <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-slate-950">
                      BASE
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-mono truncate">
                  {epoch.satelliteConstellation}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                  <span className="font-mono text-cyan-300 font-bold">NDWI {epoch.averageNdwi ?? 0.35}</span>
                  <span className="font-mono text-emerald-300 font-bold">NDVI {epoch.averageNdvi}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split-Swipe Interactive Comparison Canvas (The Centerpiece) */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseDown={() => setIsDraggingSplit(true)}
        onMouseUp={() => setIsDraggingSplit(false)}
        onTouchStart={() => setIsDraggingSplit(true)}
        onTouchEnd={() => setIsDraggingSplit(false)}
        className="relative w-full h-[520px] sm:h-[620px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none cursor-ew-resize shadow-2xl"
      >
        {/* Layer 1: Left / Baseline Epoch Canvas (1988 Baseline) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: '100%' }}
        >
          <svg viewBox="0 0 1000 620" className="w-full h-full">
            <defs>
              <pattern id="soil-grid-dry" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0,20 Q 20,5 40,20" fill="none" stroke="#78350f" strokeWidth="0.8" opacity="0.3" />
                <path d="M 0,35 Q 20,25 40,35" fill="none" stroke="#92400e" strokeWidth="0.8" opacity="0.25" />
              </pattern>
            </defs>

            {/* Baseline Earth Background */}
            <rect width="1000" height="620" fill={spectralMode === 'rgb' ? '#573010' : spectralMode === 'thermal' ? '#450a0a' : '#1c1917'} />
            <rect width="1000" height="620" fill="url(#soil-grid-dry)" />

            {/* Baseline Topography Contours */}
            <path d="M 0,140 Q 250,90 500,160 T 1000,110" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.4" />
            <path d="M 0,320 Q 300,260 600,340 T 1000,290" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.4" />
            <path d="M 0,460 Q 250,420 500,490 T 1000,450" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.3" />

            {/* Baseline Features: Mila Basins (Sparse 1988 Olive Trees & Wadis) or Desert Dunes */}
            {isOliveFarm ? (
              <g opacity="0.85">
                {/* Traditional Rain-Fed Mila Olive Orchards (sparse planting in 1988) */}
                {[
                  { cx: 160, cy: 180 }, { cx: 240, cy: 190 }, { cx: 320, cy: 170 }, { cx: 400, cy: 200 },
                  { cx: 180, cy: 260 }, { cx: 260, cy: 270 }, { cx: 340, cy: 250 }, { cx: 420, cy: 280 },
                  { cx: 200, cy: 350 }, { cx: 290, cy: 360 }, { cx: 370, cy: 340 }, { cx: 450, cy: 370 }
                ].map((tree, i) => (
                  <g key={i}>
                    <circle cx={tree.cx} cy={tree.cy} r="18" fill="#4d7c0f" opacity="0.6" stroke="#a3e635" strokeWidth="0.8" />
                    <circle cx={tree.cx} cy={tree.cy} r="3" fill="#713f12" />
                  </g>
                ))}
                {/* Pre-Dam Oued Rhumel & Oued El Kebir Natural Confluence */}
                <path d="M 120,40 Q 280,300 480,580" fill="none" stroke="#92400e" strokeWidth="4" opacity="0.5" strokeDasharray="8 4" />
                <text x="360" y="440" fill="#fde68a" fontSize="11" fontFamily="monospace" opacity="0.7">
                  {isAr ? 'مجرى وادي الرمال ووادي النجاء الطبيعي (قبل إنشاء سد بني هارون)' : 'Natural Oued Rhumel & Endja Valley (Pre-Dam 1988)'}
                </text>
              </g>
            ) : (
              <g opacity="0.8">
                {/* Standard Desert early bores */}
                <circle cx="280" cy="220" r="42" fill={spectralMode === 'thermal' ? '#ea580c' : '#15803d'} stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
                <circle cx="380" cy="240" r="42" fill={spectralMode === 'thermal' ? '#ea580c' : '#15803d'} stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
              </g>
            )}

            <text x="50" y="580" fill="#fde68a" fontSize="12" fontFamily="monospace" opacity="0.7">
              Baseline: {baselineEpoch.year} • {baselineEpoch.satelliteConstellation} ({baselineEpoch.spatialResolution})
            </text>
          </svg>

          {/* Baseline Badge overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-950/90 border border-amber-600/80 rounded-lg p-2.5 shadow-xl backdrop-blur-md max-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="font-bold text-white text-xs font-mono">{baselineEpoch.year} BASELINE</span>
              <span className="text-[10px] font-mono text-amber-300">{baselineEpoch.dateLabel}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {isAr ? baselineEpoch.descriptionAr : baselineEpoch.descriptionEn}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-amber-200/90 pt-1 border-t border-slate-800">
              <span>NDVI: <strong>{baselineEpoch.averageNdvi}</strong></span>
              <span>NDWI: <strong>{baselineEpoch.averageNdwi ?? 0.16}</strong></span>
              <span>Area: <strong>{baselineEpoch.vegetationAreaHa} ha</strong></span>
            </div>
          </div>
        </div>

        {/* Layer 2: Right / Comparison Epoch Canvas (Clipped by splitPercent) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ 
            clipPath: `polygon(${splitPercent}% 0, 100% 0, 100% 100%, ${splitPercent}% 100%)` 
          }}
        >
          <svg viewBox="0 0 1000 620" className="w-full h-full">
            <defs>
              <radialGradient id="chronos-olive-dense" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#15803d" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#22c55e" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#166534" stopOpacity="1" />
              </radialGradient>

              <radialGradient id="chronos-water-ndwi" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
              </radialGradient>

              <radialGradient id="chronos-pivot-dense" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#047857" stopOpacity="1" />
              </radialGradient>

              <linearGradient id="beni-haroun-lake" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.90" />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.98" />
              </linearGradient>
            </defs>

            {/* Contemporary Background */}
            <rect 
              width="1000" 
              height="620" 
              fill={spectralMode === 'ndwi' ? '#082f49' : spectralMode === 'rgb' ? '#14532d' : spectralMode === 'thermal' ? '#0f172a' : '#022c22'} 
            />

            {/* Contemporary Render: Specific Mila Basin Graphic (Beni Haroun, Oued Endja, Rouached, Tessala, Bainan) */}
            {isOliveFarm ? (
              <g>
                {/* 1. BENI HAROUN BASIN SPECIFIC RENDER */}
                {selectedMilaSubBasinId === 'beni-haroun' && (
                  <g>
                    {/* Grand Beni Haroun Reservoir Lake (1 Billion m³) */}
                    <path 
                      d="M 120,240 C 260,160 480,180 680,240 C 850,290 920,410 820,490 C 660,560 380,530 200,470 Z" 
                      fill="url(#beni-haroun-lake)" 
                      stroke="#38bdf8" 
                      strokeWidth="2.5" 
                      opacity="0.9"
                    />
                    {/* Water waves */}
                    <path d="M 280,320 Q 380,300 480,320 T 680,320" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6" />
                    <path d="M 320,400 Q 420,380 520,400 T 720,400" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6" />

                    {/* Ain Tine Floating Pumping Barge Station */}
                    <g transform="translate(480, 290)">
                      <rect x="0" y="0" width="44" height="28" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="22" cy="14" r="7" fill="#38bdf8" className="animate-ping" />
                      <text x="22" y="44" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {isAr ? 'محطة الضخ العائمة عين التين (1 مليار م³)' : 'Ain Tine Floating Pump Barge (1B m³)'}
                      </text>
                    </g>

                    {/* Dam Barrier Wall */}
                    <path d="M 120,240 L 140,290" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
                    <text x="150" y="270" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {isAr ? 'جدار سد بني هارون' : 'Beni Haroun Dam Wall'}
                    </text>

                    {/* Pressurized Aqueduct Pipeline to Constantine and Oued Athmania */}
                    <path d="M 524,304 Q 750,220 1000,200" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 4" opacity="0.8" />
                    <text x="760" y="185" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {isAr ? 'قنوات التحويل الكبرى (الري والشرب)' : 'Regional Water Transfer Aqueduct'}
                    </text>
                  </g>
                )}

                {/* 2. OUED ENDJA ALLUVIAL RIVER PLAIN SPECIFIC RENDER */}
                {selectedMilaSubBasinId === 'oued-endja' && (
                  <g>
                    {/* Winding Oued Endja River Hydrological Corridor */}
                    <path d="M 40,80 Q 300,240 500,280 T 960,360" fill="none" stroke="#0284c7" strokeWidth="14" opacity="0.75" />
                    <path d="M 40,80 Q 300,240 500,280 T 960,360" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
                    <text x="520" y="260" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      {isAr ? 'الممر الهيدرولوجي لوادي النجاء (مياه دائمة الجريان)' : 'Oued Endja Alluvial Hydro-Corridor'}
                    </text>

                    {/* Supplementary Pivot Arcs across Oued Endja */}
                    <circle cx="280" cy="180" r="48" fill="#15803d" opacity="0.6" stroke="#4ade80" strokeWidth="1.5" />
                    <circle cx="680" cy="420" r="48" fill="#15803d" opacity="0.6" stroke="#4ade80" strokeWidth="1.5" />
                    <text x="280" y="185" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      {isAr ? 'محور قمح واد النجاء' : 'Endja Wheat Pivot'}
                    </text>
                  </g>
                )}

                {/* 3. ROUACHED AGRO-PASTORAL & GRAIN SILOS RENDER */}
                {selectedMilaSubBasinId === 'rouached' && (
                  <g>
                    {/* Regional Cereal Silos and Cooperatives Hub */}
                    <g transform="translate(680, 160)">
                      <rect x="0" y="0" width="36" height="52" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
                      <line x1="12" y1="0" x2="12" y2="52" stroke="#64748b" strokeWidth="1" />
                      <line x1="24" y1="0" x2="24" y2="52" stroke="#64748b" strokeWidth="1" />
                      <text x="18" y="-8" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {isAr ? 'صوامع حبوب الرواشد (CCLS)' : 'Rouached CCLS Grain Silos'}
                      </text>
                    </g>
                    {/* Dairy cattle pasture perimeter */}
                    <rect x="180" y="240" width="220" height="140" rx="8" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="290" y="230" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {isAr ? 'محيط تربية الأبقار الحلوب وإنتاج الأعلاف المروية' : 'Rouached Dairy & Forage Perimeter'}
                    </text>
                  </g>
                )}

                {/* 4. TESSALA LEMTAÏ MOUNTAIN TERRACES RENDER */}
                {selectedMilaSubBasinId === 'tessala' && (
                  <g>
                    {/* Elevation Contour Bands (850m Mountain Terraces) */}
                    <path d="M 0,140 Q 300,90 600,160 T 1000,110" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
                    <path d="M 0,260 Q 250,200 550,280 T 1000,220" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
                    <path d="M 0,380 Q 350,330 700,410 T 1000,360" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
                    <text x="500" y="80" fill="#4ade80" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {isAr ? 'مدرجات جبال تسالة لمطاعي (850م - زيتون جبلي بكر ممتاز)' : 'Tessala Lemtaï Mountain Terraces (850m - Cold-Pressed Olives)'}
                    </text>

                    {/* Natural Mountain Spring Feeders */}
                    <circle cx="420" cy="190" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="animate-ping" />
                    <text x="420" y="175" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      {isAr ? 'عين ماء تسالة الطبيعية' : 'Tessala Natural Spring'}
                    </text>
                  </g>
                )}

                {/* 5. BAINAN FERTILE ARBORICULTURE VALLEY RENDER */}
                {selectedMilaSubBasinId === 'bainan' && (
                  <g>
                    {/* Oued Bainan River flow */}
                    <path d="M 120,40 Q 300,280 480,360 T 880,560" fill="none" stroke="#06b6d4" strokeWidth="10" opacity="0.7" />
                    <text x="510" y="340" fill="#22d3ee" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      {isAr ? 'مجرى وادي باينان للأشجار المثمرة والخضار' : 'Oued Bainan Perennial Stream'}
                    </text>

                    {/* Sheltered Valley micro-climate bounding outline */}
                    <ellipse cx="500" cy="300" rx="420" ry="240" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />
                    <text x="500" y="520" fill="#bef264" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      {isAr ? 'منخفض باينان الزراعي الخصب المحمي مناخياً' : 'Sheltered Microclimate Bainan Agro-Valley'}
                    </text>
                  </g>
                )}

                {/* Dark-Drought Sub-Surface Stress Contours if Active */}
                {isSimulationActive && isSubsurfaceDarkDroughtDetected && (
                  <g opacity="0.6">
                    <ellipse cx="640" cy="380" rx="140" ry="80" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                    <text x="640" y="385" fill="#f43f5e" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      [DARK-DROUGHT ANOMALY: SUB-SURFACE WATER DEFICIT &lt; -2.0σ]
                    </text>
                  </g>
                )}

                {/* High Density Olive Trees Grid (Chemlal & Sigoise Varieties) */}
                {[
                  // North Section
                  { cx: 340, cy: 120, name: 'CHEMLAL-A1' }, { cx: 420, cy: 120, name: 'CHEMLAL-A2' }, { cx: 500, cy: 120, name: 'CHEMLAL-A3' }, { cx: 580, cy: 120, name: 'CHEMLAL-A4' }, { cx: 660, cy: 120, name: 'CHEMLAL-A5' }, { cx: 740, cy: 120, name: 'CHEMLAL-A6' }, { cx: 820, cy: 120, name: 'CHEMLAL-A7' },
                  { cx: 340, cy: 190, name: 'SIGOISE-B1' }, { cx: 420, cy: 190, name: 'SIGOISE-B2' }, { cx: 500, cy: 190, name: 'SIGOISE-B3' }, { cx: 580, cy: 190, name: 'SIGOISE-B4' }, { cx: 660, cy: 190, name: 'SIGOISE-B5' }, { cx: 740, cy: 190, name: 'SIGOISE-B6' }, { cx: 820, cy: 190, name: 'SIGOISE-B7' },
                  // South Section
                  { cx: 340, cy: 400, name: 'CHEMLAL-C1' }, { cx: 420, cy: 400, name: 'CHEMLAL-C2' }, { cx: 500, cy: 400, name: 'CHEMLAL-C3' }, { cx: 580, cy: 400, name: 'CHEMLAL-C4' }, { cx: 660, cy: 400, name: 'CHEMLAL-C5' }, { cx: 740, cy: 400, name: 'CHEMLAL-C6' }, { cx: 820, cy: 400, name: 'CHEMLAL-C7' },
                  { cx: 340, cy: 480, name: 'SIGOISE-D1' }, { cx: 420, cy: 480, name: 'SIGOISE-D2' }, { cx: 500, cy: 480, name: 'SIGOISE-D3' }, { cx: 580, cy: 480, name: 'SIGOISE-D4' }, { cx: 660, cy: 480, name: 'SIGOISE-D5' }, { cx: 740, cy: 480, name: 'SIGOISE-D6' }, { cx: 820, cy: 480, name: 'SIGOISE-D7' },
                ].map((tree, idx) => {
                  const isStressedTree = isSimulationActive && isSubsurfaceDarkDroughtDetected && (tree.cx >= 500 && tree.cx <= 780);
                  const fillColor = isStressedTree 
                    ? '#e11d48' 
                    : spectralMode === 'ndwi' 
                      ? 'url(#chronos-water-ndwi)' 
                      : 'url(#chronos-olive-dense)';

                  return (
                    <g key={idx}>
                      {/* Drip line connection */}
                      <line x1={tree.cx} y1={tree.cy - 25} x2={tree.cx} y2={tree.cy + 25} stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                      <circle 
                        cx={tree.cx} 
                        cy={tree.cy} 
                        r="24" 
                        fill={fillColor} 
                        stroke={isStressedTree ? '#fda4af' : '#a7f3d0'} 
                        strokeWidth="1.5" 
                      />
                      <circle cx={tree.cx} cy={tree.cy} r="4" fill="#ffffff" />
                    </g>
                  );
                })}

                {/* IoT Soil Moisture Piezometer */}
                <g>
                  <circle cx="580" cy="190" r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  <text x="580" y="170" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {isAr ? `مستشعر رطوبة ${currentMilaSubBasin.shortLabelAr} (NDWI: ${simulatedSimNdwi.toFixed(2)})` : `${currentMilaSubBasin.shortLabelEn} Probe (NDWI: ${simulatedSimNdwi.toFixed(2)})`}
                  </text>
                </g>
              </g>
            ) : (
              /* Pivot Clusters (El Menia, Ouargla, etc.) */
              <g>
                {[
                  { cx: 200, cy: 120, r: 44 }, { cx: 310, cy: 120, r: 44 }, { cx: 420, cy: 120, r: 44 }, { cx: 530, cy: 120, r: 44 }, { cx: 640, cy: 120, r: 44 }, { cx: 750, cy: 120, r: 44 },
                  { cx: 160, cy: 230, r: 44 }, { cx: 270, cy: 230, r: 44 }, { cx: 380, cy: 230, r: 44 }, { cx: 490, cy: 230, r: 44 }, { cx: 600, cy: 230, r: 44 }, { cx: 710, cy: 230, r: 44 },
                  { cx: 220, cy: 340, r: 44 }, { cx: 330, cy: 340, r: 44 }, { cx: 440, cy: 340, r: 44 }, { cx: 550, cy: 340, r: 44 }, { cx: 660, cy: 340, r: 44 }, { cx: 770, cy: 340, r: 44 },
                  { cx: 280, cy: 450, r: 44 }, { cx: 390, cy: 450, r: 44 }, { cx: 500, cy: 450, r: 44 }, { cx: 610, cy: 450, r: 44 }, { cx: 720, cy: 450, r: 44 }
                ].map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.cx} 
                      cy={p.cy} 
                      r={p.r} 
                      fill="url(#chronos-pivot-dense)" 
                      stroke="#a7f3d0" 
                      strokeWidth="1.5" 
                    />
                    <circle cx={p.cx} cy={p.cy} r="3" fill="#ffffff" />
                  </g>
                ))}
              </g>
            )}

            <text x="550" y="580" fill="#34d399" fontSize="12" fontFamily="monospace" opacity="0.8">
              Target: {comparisonEpoch.year} • {comparisonEpoch.satelliteConstellation} ({comparisonEpoch.spatialResolution})
            </text>
          </svg>

          {/* Target Epoch Badge overlay */}
          <div className="absolute top-4 right-4 z-10 bg-slate-950/90 border border-emerald-500/80 rounded-lg p-2.5 shadow-xl backdrop-blur-md max-w-[290px] text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-mono text-emerald-300">{comparisonEpoch.dateLabel}</span>
              <span className="font-bold text-white text-xs font-mono">{comparisonEpoch.year} CONTEMPORARY</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {isAr ? (isMilaCluster ? currentMilaSubBasin.descriptionAr : comparisonEpoch.descriptionAr) : (isMilaCluster ? currentMilaSubBasin.descriptionEn : comparisonEpoch.descriptionEn)}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-200/90 pt-1 border-t border-slate-800">
              <span>NDVI: <strong>{isMilaCluster ? currentMilaSubBasin.currentNdvi2026 : comparisonEpoch.averageNdvi}</strong></span>
              <span>NDWI: <strong>{isMilaCluster ? currentMilaSubBasin.currentNdwi2026 : (comparisonEpoch.averageNdwi ?? 0.52)}</strong></span>
              <span>Area: <strong>{isMilaCluster ? currentMilaSubBasin.areaHectares : comparisonEpoch.vegetationAreaHa} ha</strong></span>
            </div>
          </div>
        </div>

        {/* Split Swipe Draggable Divider Bar */}
        <div 
          className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
          style={{ left: `${splitPercent}%`, transform: 'translateX(-50%)' }}
        >
          {/* Vertical Divider Line */}
          <div className="w-0.5 h-full bg-gradient-to-b from-amber-400 via-white to-emerald-400 shadow-2xl"></div>

          {/* Central Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-2xl flex items-center justify-center text-white cursor-ew-resize pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
            <ArrowLeftRight className="w-4 h-4 text-emerald-300" />
          </div>

          {/* Floating Percent Pill */}
          <div className="absolute top-6 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700 text-[10px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
            {splitPercent}% {isAr ? 'مقارنة' : 'Split'}
          </div>
        </div>

        {/* Bottom Floating Control Bar on Map Stage */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 border border-slate-800 rounded-full px-4 py-2 shadow-2xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
            <span className="text-amber-400 font-bold">{baselineEpoch.year}</span>
            <span className="text-slate-500">◀</span>
            <span className="text-white font-bold">{splitPercent}% Swipe</span>
            <span className="text-slate-500">▶</span>
            <span className="text-emerald-400 font-bold">{comparisonEpoch.year}</span>
          </div>

          <div className="h-3 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitPercent(50)}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              50/50
            </button>
            <button
              onClick={() => setSplitPercent(10)}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              100% {comparisonEpoch.year}
            </button>
            <button
              onClick={() => setSplitPercent(90)}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              100% {baselineEpoch.year}
            </button>
          </div>
        </div>
      </div>

      {/* PostGIS Temporal Analytics & Recharts Trend Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 4 Core Temporal KPIs (Takes 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* KPI 1: Net Land Reclaimed */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'صافي المساحة المزروعة' : 'Net Developed Area'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  +{isMilaCluster ? currentMilaSubBasin.areaHectares.toLocaleString() : reclaimedHectares.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-300">ha</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 font-mono block">
                {baselineEpoch.year} ➔ {comparisonEpoch.year}
              </span>
            </div>

            {/* KPI 2: NDWI Canopy Water Dynamics */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'تطور المحتوى المائي (NDWI)' : 'Canopy Water (NDWI)'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-cyan-400">
                  +{isMilaCluster ? (currentMilaSubBasin.currentNdwi2026 - currentMilaSubBasin.baselineNdwi1988).toFixed(2) : ndwiGain.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({(baselineEpoch.averageNdwi ?? 0.16).toFixed(2)} ➔ {isMilaCluster ? currentMilaSubBasin.currentNdwi2026.toFixed(2) : (comparisonEpoch.averageNdwi ?? 0.52).toFixed(2)})
                </span>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-mono block">
                {isAr ? 'مؤشر امتصاص الرطوبة التاجية' : 'Canopy Water Absorption'}
              </span>
            </div>

            {/* KPI 3: Microclimate Cooling Deficit */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'التبريد المناخي للمنطقة' : 'Microclimate Cooling'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-teal-400">{comparisonEpoch.surfaceTempDeficitC}°C</span>
                <span className="text-xs font-mono text-slate-400">deficit</span>
              </div>
              <span className="text-[10px] text-teal-300/80 font-mono block">
                {isAr ? 'انخفاض حرارة سطح الأرض' : 'LST Heat Reduction'}
              </span>
            </div>

            {/* KPI 4: Olive Trees or Pivots */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isOliveFarm ? (isAr ? 'أشجار الزيتون المسجلة' : 'Geotagged Olive Trees') : (isAr ? 'عدد المحاور المركزية' : 'Active Pivot Units')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-amber-300">
                  {isMilaCluster ? `${currentMilaSubBasin.treeCount.toLocaleString()} شجرة` : (isOliveFarm ? '231,000' : `${comparisonEpoch.activePivotsCount} pivots`)}
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono block">
                {isMilaCluster ? currentMilaSubBasin.primaryCropAr : 'Chemlal & Sigoise Varieties'}
              </span>
            </div>
          </div>

          {/* PostGIS Temporal Query Execution Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>PostGIS 3.4 Temporal Geometry Query</span>
              </div>
              <button
                onClick={handleCopySql}
                className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedQuery ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الاستعلام' : 'Copy SQL')}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto border border-slate-850">
              {isMilaCluster 
                ? `SELECT ST_Summary(geom) FROM ${currentMilaSubBasin.postGisCadastreRef} WHERE ndwi > 0.45; -- ${currentMilaSubBasin.treeCount} Trees`
                : comparisonEpoch.postGisQuerySnippet}
            </pre>
          </div>
        </div>

        {/* Right Column: Recharts Decadal Trajectory Graph (Takes 7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'منحنى الرطوبة (NDWI) والكتلة الحيوية (1988–2026)' : 'Multi-Decadal NDWI Water & NDVI Trajectory (1988–2026)'}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>NDWI (Water)</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>NDVI (Biomass)</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="ndwiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#0284c7" domain={[-0.2, 0.8]} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} stroke="#10b981" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="ndwi" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#ndwiGradient)" name="NDWI Water Index" />
                <Line yAxisId="right" type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="NDVI Biomass" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1 text-slate-400">
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">1988 Landsat 4/5</span>
              <span className="font-bold text-amber-400">NDWI {(baselineEpoch.averageNdwi ?? 0.16).toFixed(2)} · NDVI {baselineEpoch.averageNdvi}</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">2012 Alsat & Landsat</span>
              <span className="font-bold text-teal-400">NDWI 0.35 · NDVI 0.58</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">2026 Sentinel-2C Twin</span>
              <span className="font-bold text-cyan-400">NDWI {(comparisonEpoch.averageNdwi ?? 0.52).toFixed(2)} · NDVI {comparisonEpoch.averageNdvi}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
