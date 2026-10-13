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
  Check
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
import { ChronosSpectralMode, HistoricalEpoch, ChronosRegionalCluster } from '../../types/chronos';
import { HISTORICAL_EPOCHS, CHRONOS_REGIONAL_CLUSTERS } from '../../data/chronosData';
import { generateChronosSovereignReport } from '../../utils/chronosPdfGenerator';

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
  const [selectedClusterId, setSelectedClusterId] = useState<string>('el-menia');
  const [baselineYear, setBaselineYear] = useState<number>(1988);
  const [comparisonYear, setComparisonYear] = useState<number>(2026);

  // Split-Swipe Slider Position (0 to 100%)
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Spectral Layer Mode
  const [spectralMode, setSpectralMode] = useState<ChronosSpectralMode>('ndvi');

  // Autoplay Timelapse
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);

  // PostGIS Query Copy State
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentCluster = CHRONOS_REGIONAL_CLUSTERS.find(c => c.id === selectedClusterId) || CHRONOS_REGIONAL_CLUSTERS[0];
  const baselineEpoch = HISTORICAL_EPOCHS.find(e => e.year === baselineYear) || HISTORICAL_EPOCHS[0];
  const comparisonEpoch = HISTORICAL_EPOCHS.find(e => e.year === comparisonYear) || HISTORICAL_EPOCHS[HISTORICAL_EPOCHS.length - 1];

  // Timelapse Autoplay Effect
  useEffect(() => {
    if (!isAutoplay) return;
    const years = HISTORICAL_EPOCHS.map(e => e.year);
    const interval = setInterval(() => {
      setComparisonYear((prev) => {
        const nextIdx = (years.indexOf(prev) + 1) % years.length;
        return years[nextIdx];
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isAutoplay]);

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

  const handleDownloadPdfReport = () => {
    generateChronosSovereignReport({
      cluster: currentCluster,
      epochs: HISTORICAL_EPOCHS,
      baselineYear,
      comparisonYear,
      language
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(comparisonEpoch.postGisQuerySnippet);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Recharts Chart Data across decades
  const chartData = HISTORICAL_EPOCHS.map(e => ({
    year: `${e.year}`,
    ndvi: e.averageNdvi,
    areaHa: e.vegetationAreaHa,
    pivots: e.activePivotsCount,
    cooling: Math.abs(e.surfaceTempDeficitC)
  }));

  // Reclaimed Metrics
  const reclaimedHectares = comparisonEpoch.vegetationAreaHa - baselineEpoch.vegetationAreaHa;
  const ndviGrowthPercent = Math.round(((comparisonEpoch.averageNdvi - baselineEpoch.averageNdvi) / (baselineEpoch.averageNdvi || 0.01)) * 100);

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
                  PostGIS Temporal V3.4
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  38 Years Multi-Decadal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'رصد التحول البيئي من الصحراء البكر إلى الواحات الزراعية الدائرية عبر صور الأقمار الصناعية وتحليل المقارنة التفاعلي (Split-Swipe)'
                  : 'Track multi-decadal desert-to-oasis reclamation via calibrated satellite imagery and split-swipe comparative analysis'}
              </p>
            </div>
          </div>

          {/* Quick Actions & PDF Report */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isAutoplay
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
              title="Autoplay Decadal Timelapse"
            >
              {isAutoplay ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAutoplay ? (isAr ? 'إيقاف العرض' : 'Pause Timelapse') : (isAr ? 'تشغيل التسلسل الزمني' : 'Play Timelapse')}</span>
            </button>

            <button
              onClick={handleDownloadPdfReport}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
              title="Download Sovereign Historical Audit PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير التقرير السيادي (PDF)' : 'Sovereign Audit Report (PDF)'}</span>
            </button>

            {onSwitchToGeneralGis && (
              <button
                onClick={onSwitchToGeneralGis}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {isAr ? 'العودة للخريطة الحية' : 'Live GIS'}
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Region Basin Picker + Spectral Mode Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target Regional Cluster */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'الحوض الفلاحي:' : 'Agricultural Basin:'}</span>
            </span>
            <select
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CHRONOS_REGIONAL_CLUSTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Spectral Mode Buttons */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSpectralMode('ndvi')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'ndvi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'طيف الغطاء (NDVI)' : 'NDVI Multispectral'}
            </button>
            <button
              onClick={() => setSpectralMode('rgb')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'rgb'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'الألوان الطبيعية (RGB)' : 'True Color (RGB)'}
            </button>
            <button
              onClick={() => setSpectralMode('ndwi')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'ndwi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'رادار الرطوبة (NDWI)' : 'Aquifer Moisture (NDWI)'}
            </button>
            <button
              onClick={() => setSpectralMode('thermal')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                spectralMode === 'thermal'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'التبريد الحراري (LST)' : 'Thermal Cooling Deficit'}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Decadal Timeline Slider (1988 - 2026) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">{isAr ? 'شريط السلاسل الزمنية التاريخية' : 'Multi-Decadal Timeline Epochs'}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-amber-400 font-semibold">{isAr ? 'الأساس:' : 'Baseline:'} <strong>{baselineYear}</strong></span>
            <span>⇄</span>
            <span className="text-emerald-400 font-semibold">{isAr ? 'المقارن:' : 'Target:'} <strong>{comparisonYear}</strong></span>
          </div>
        </div>

        {/* Discrete Decade Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {HISTORICAL_EPOCHS.map((epoch) => {
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
                  <span className="font-mono text-emerald-300 font-bold">NDVI {epoch.averageNdvi}</span>
                  <span className="font-mono text-slate-400">{epoch.vegetationAreaHa} ha</span>
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
        className="relative w-full h-[520px] sm:h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none cursor-ew-resize shadow-2xl"
      >
        {/* Layer 1: Left / Baseline Epoch Canvas (1988 Virgin Desert or selected baseline) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: '100%' }}
        >
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            <defs>
              <pattern id="desert-dunes" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 0,30 Q 30,10 60,30" fill="none" stroke="#78350f" strokeWidth="0.8" opacity="0.3" />
                <path d="M 0,50 Q 30,40 60,50" fill="none" stroke="#92400e" strokeWidth="0.8" opacity="0.25" />
              </pattern>
            </defs>

            {/* Desert Background */}
            <rect width="1000" height="600" fill={spectralMode === 'rgb' ? '#78350f' : spectralMode === 'thermal' ? '#450a0a' : '#1c1917'} />
            <rect width="1000" height="600" fill="url(#desert-dunes)" />

            {/* Baseline Sand Dunes & Topo Contours */}
            <path d="M 0,160 Q 250,110 500,180 T 1000,130" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.4" />
            <path d="M 0,340 Q 300,280 600,360 T 1000,310" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.4" />
            <path d="M 0,480 Q 250,440 500,510 T 1000,470" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.3" />

            {/* Baseline Few Pivots if later year */}
            {baselineEpoch.activePivotsCount > 0 && (
              <g opacity="0.9">
                <circle cx="280" cy="220" r="42" fill={spectralMode === 'thermal' ? '#ea580c' : '#15803d'} stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
                <circle cx="380" cy="240" r="42" fill={spectralMode === 'thermal' ? '#ea580c' : '#15803d'} stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
                {baselineEpoch.activePivotsCount > 6 && (
                  <circle cx="260" cy="340" r="42" fill={spectralMode === 'thermal' ? '#ea580c' : '#15803d'} stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
                )}
              </g>
            )}

            {/* Baseline Water Table Sensor Inactive */}
            <circle cx="480" cy="310" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x="480" y="325" fill="#fef08a" fontSize="10" fontFamily="monospace" textAnchor="middle">
              {baselineEpoch.year === 1988 ? 'Unexploited Deep Albian Aquifer' : 'Early Well Bores'}
            </text>

            <text x="50" y="550" fill="#fde68a" fontSize="12" fontFamily="monospace" opacity="0.6">
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
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            <defs>
              {/* Vibrant Agro-Ecological Pivots Gradients */}
              <radialGradient id="chronos-pivot-dense" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#047857" stopOpacity="1" />
              </radialGradient>

              <radialGradient id="chronos-pivot-thermal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
              </radialGradient>
            </defs>

            {/* Contemporary Background */}
            <rect width="1000" height="600" fill={spectralMode === 'rgb' ? '#14532d' : spectralMode === 'thermal' ? '#0f172a' : '#022c22'} />

            {/* Modern Road / Pivot Access Corridors */}
            <g stroke="#334155" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
              <line x1="120" y1="20" x2="880" y2="580" />
              <line x1="880" y1="20" x2="120" y2="580" />
              <line x1="500" y1="0" x2="500" y2="600" />
            </g>

            {/* Mega Agricultural Circular Pivots Cluster (42 Modern Pivots) */}
            <g>
              {[
                // Row 1
                { cx: 200, cy: 120, r: 44, code: 'PVT-01' },
                { cx: 310, cy: 120, r: 44, code: 'PVT-02' },
                { cx: 420, cy: 120, r: 44, code: 'PVT-03' },
                { cx: 530, cy: 120, r: 44, code: 'PVT-04' },
                { cx: 640, cy: 120, r: 44, code: 'PVT-05' },
                { cx: 750, cy: 120, r: 44, code: 'PVT-06' },

                // Row 2
                { cx: 160, cy: 230, r: 44, code: 'PVT-07' },
                { cx: 270, cy: 230, r: 44, code: 'PVT-08' },
                { cx: 380, cy: 230, r: 44, code: 'PVT-09' },
                { cx: 490, cy: 230, r: 44, code: 'PVT-10' },
                { cx: 600, cy: 230, r: 44, code: 'PVT-11' },
                { cx: 710, cy: 230, r: 44, code: 'PVT-12' },
                { cx: 820, cy: 230, r: 44, code: 'PVT-13' },

                // Row 3
                { cx: 220, cy: 340, r: 44, code: 'PVT-14' },
                { cx: 330, cy: 340, r: 44, code: 'PVT-15' },
                { cx: 440, cy: 340, r: 44, code: 'PVT-16' },
                { cx: 550, cy: 340, r: 44, code: 'PVT-17' },
                { cx: 660, cy: 340, r: 44, code: 'PVT-18' },
                { cx: 770, cy: 340, r: 44, code: 'PVT-19' },

                // Row 4
                { cx: 280, cy: 450, r: 44, code: 'PVT-20' },
                { cx: 390, cy: 450, r: 44, code: 'PVT-21' },
                { cx: 500, cy: 450, r: 44, code: 'PVT-22' },
                { cx: 610, cy: 450, r: 44, code: 'PVT-23' },
                { cx: 720, cy: 450, r: 44, code: 'PVT-24' },
              ].map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.cx} 
                    cy={p.cy} 
                    r={p.r} 
                    fill={spectralMode === 'thermal' ? 'url(#chronos-pivot-thermal)' : 'url(#chronos-pivot-dense)'} 
                    stroke="#a7f3d0" 
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  {/* Pivot center well and rotating arm */}
                  <circle cx={p.cx} cy={p.cy} r="3" fill="#ffffff" />
                  <line 
                    x1={p.cx} 
                    y1={p.cy} 
                    x2={p.cx + 40} 
                    y2={p.cy + 10} 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                    opacity="0.8" 
                  />
                </g>
              ))}
            </g>

            {/* Smart Sensors & VFD Aquifer Piezometers */}
            <g>
              <circle cx="500" cy="230" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
              <text x="500" y="215" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                Smart VFD Albian Well #04 (40% Conservation)
              </text>
            </g>

            <text x="550" y="550" fill="#34d399" fontSize="12" fontFamily="monospace" opacity="0.8">
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
              {isAr ? comparisonEpoch.descriptionAr : comparisonEpoch.descriptionEn}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-200/90 pt-1 border-t border-slate-800">
              <span>NDVI: <strong>{comparisonEpoch.averageNdvi}</strong></span>
              <span>Area: <strong>{comparisonEpoch.vegetationAreaHa} ha</strong></span>
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
                {isAr ? 'صافي المساحة المستصلحة' : 'Net Reclaimed Area'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-400">+{reclaimedHectares.toLocaleString()}</span>
                <span className="text-xs font-mono text-slate-300">ha</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 font-mono block">
                {baselineEpoch.year} ➔ {comparisonEpoch.year}
              </span>
            </div>

            {/* KPI 2: NDVI Growth Delta */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'نمو مؤشر الغطاء النباتي' : 'NDVI Biomass Gain'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-teal-300">+{ndviGrowthPercent}%</span>
                <span className="text-xs font-mono text-slate-400">({baselineEpoch.averageNdvi} ➔ {comparisonEpoch.averageNdvi})</span>
              </div>
              <span className="text-[10px] text-teal-300/80 font-mono block">
                {isAr ? 'كثافة الكتلة الحيوية' : 'Vegetative Density'}
              </span>
            </div>

            {/* KPI 3: Microclimate Cooling Deficit */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'التبريد المناخي للمنطقة' : 'Microclimate Cooling'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-cyan-400">{comparisonEpoch.surfaceTempDeficitC}°C</span>
                <span className="text-xs font-mono text-slate-400">deficit</span>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-mono block">
                {isAr ? 'انخفاض حرارة سطح الأرض' : 'LST Heat Reduction'}
              </span>
            </div>

            {/* KPI 4: Active Circular Pivot Count */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'عدد المحاور المركزية' : 'Active Pivot Units'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-amber-300">{comparisonEpoch.activePivotsCount}</span>
                <span className="text-xs font-mono text-slate-400">pivots (+{comparisonEpoch.activePivotsCount - baselineEpoch.activePivotsCount})</span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono block">
                {isAr ? 'منظومات ري محوري نشطة' : 'Standard 50ha Circles'}
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
              {comparisonEpoch.postGisQuerySnippet}
            </pre>
          </div>
        </div>

        {/* Right Column: Recharts Decadal Trajectory Graph (Takes 7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'منحنى التطور البيئي والغطاء النباتي (1988 - 2026)' : 'Multi-Decadal Vegetation & Area Trajectory (1988 - 2026)'}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Area (Ha)</span>
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>NDVI Index</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} stroke="#38bdf8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="areaHa" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" name="Vegetation Area (ha)" />
                <Line yAxisId="right" type="monotone" dataKey="ndvi" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8' }} name="Average NDVI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1 text-slate-400">
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">1988 Pre-Agri</span>
              <span className="font-bold text-amber-400">0 ha · NDVI 0.08</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">2012 Expansion</span>
              <span className="font-bold text-teal-400">1,950 ha · NDVI 0.46</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-500 block">2026 Live Twin</span>
              <span className="font-bold text-emerald-400">4,850 ha · NDVI 0.74</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
