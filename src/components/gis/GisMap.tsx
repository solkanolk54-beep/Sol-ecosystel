import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  MapPin, 
  Activity, 
  AlertCircle,
  Truck,
  Satellite,
  Radio,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Navigation,
  Info
} from 'lucide-react';
import { 
  ParcelAsset, 
  FleetUnit, 
  LivestockHerd, 
  Language 
} from '../../types/ecosystem';
import { ParcelDetailModal } from './ParcelDetailModal';

interface GisMapProps {
  parcels: ParcelAsset[];
  fleet: FleetUnit[];
  herds: LivestockHerd[];
  language: Language;
  onDispatchStressWorkOrder: (parcel: ParcelAsset) => void;
  onDispatchGrazingWorkOrder: (herd: LivestockHerd) => void;
  onViewPassport: (cropBatchId: string) => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  parcels,
  fleet,
  herds,
  language,
  onDispatchStressWorkOrder,
  onDispatchGrazingWorkOrder,
  onViewPassport
}) => {
  const isAr = language === 'ar';

  // Layer toggles
  const [activeSpectralLayer, setActiveSpectralLayer] = useState<'ndvi' | 'rgb' | 'moisture' | 'thermal'>('ndvi');
  const [showPivots, setShowPivots] = useState(true);
  const [showFleet, setShowFleet] = useState(true);
  const [showHerds, setShowHerds] = useState(true);
  const [showBbox, setShowBbox] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Time Series Slider
  const timeSteps = ["10-Sep", "17-Sep", "24-Sep", "01-Oct", "06-Oct (Today)"];
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(4);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  // Arm Rotation state for active pivots
  const [armAngle, setArmAngle] = useState(0);

  // Inspector Modals
  const [selectedParcel, setSelectedParcel] = useState<ParcelAsset | null>(null);
  const [selectedFleetUnit, setSelectedFleetUnit] = useState<FleetUnit | null>(null);
  const [selectedHerd, setSelectedHerd] = useState<LivestockHerd | null>(null);

  // Animate rotating sprinkler arms
  useEffect(() => {
    const interval = setInterval(() => {
      setArmAngle(prev => (prev + 1.2) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Timeline playback effect
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setSelectedTimeIndex(prev => (prev + 1) % timeSteps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, timeSteps.length]);

  // Coordinate mapping bounds
  // Center: [24.155, 47.340]
  // SVG ViewBox: 0 0 1000 680
  const latToY = (lat: number) => {
    // 24.210 -> 40, 24.100 -> 640
    return 40 + ((24.210 - lat) / (24.210 - 24.100)) * 600;
  };
  const lngToX = (lng: number) => {
    // 47.280 -> 60, 47.400 -> 940
    return 60 + ((lng - 47.280) / (47.400 - 47.280)) * 880;
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Spectral overlay gradient definitions
  const getNdviColor = (ndvi: number) => {
    if (ndvi >= 0.70) return '#10b981'; // vibrant emerald
    if (ndvi >= 0.55) return '#84cc16'; // lime green
    if (ndvi >= 0.45) return '#eab308'; // yellow
    return '#f43f5e'; // rose/red stress
  };

  return (
    <div className="relative w-full h-[640px] lg:h-[700px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="z-20 px-4 py-2 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Mode Picker */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSpectralLayer('ndvi')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeSpectralLayer === 'ndvi'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'طيف الغطاء (NDVI)' : 'NDVI Multispectral'}
          </button>
          <button
            onClick={() => setActiveSpectralLayer('rgb')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeSpectralLayer === 'rgb'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'الألوان الطبيعية (RGB)' : 'True Color RGB'}
          </button>
          <button
            onClick={() => setActiveSpectralLayer('moisture')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeSpectralLayer === 'moisture'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'رادار الرطوبة (NIR)' : 'Soil Moisture'}
          </button>
          <button
            onClick={() => setActiveSpectralLayer('thermal')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeSpectralLayer === 'thermal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'الإجهاد الحراري' : 'Thermal Stress'}
          </button>
        </div>

        {/* Visibility Quick Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPivots(!showPivots)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              showPivots
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{isAr ? 'المحاور (Pivots)' : 'Pivots'}</span>
          </button>

          <button
            onClick={() => setShowFleet(!showFleet)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              showFleet
                ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Truck className="w-3 h-3 text-cyan-400" />
            <span>{isAr ? 'الأسطول (Kareema)' : 'Fleet GPS'}</span>
          </button>

          <button
            onClick={() => setShowHerds(!showHerds)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              showHerds
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{isAr ? 'الماشية (RFID)' : 'Herds'}</span>
          </button>

          <button
            onClick={() => setShowBbox(!showBbox)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-colors ${
              showBbox
                ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>{isAr ? 'مناطق الإجهاد (BBOX)' : 'Stress BBOX'}</span>
          </button>
        </div>

        {/* Map Projection & Coordinate HUD */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>EPSG:4326 PostGIS | 24.155° N, 47.340° E</span>
        </div>
      </div>

      {/* SVG GIS Center Stage Canvas */}
      <div className="relative flex-1 overflow-hidden bg-slate-950 gis-grid-pattern cursor-crosshair">
        <svg 
          viewBox="0 0 1000 680" 
          className="w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            {/* Gradients for Pivots depending on spectral layer */}
            <radialGradient id="grad-pivot-optimal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
            </radialGradient>

            <radialGradient id="grad-pivot-stressed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#f43f5e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#be123c" stopOpacity="0.95" />
            </radialGradient>

            <radialGradient id="grad-pivot-moisture" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </radialGradient>

            <radialGradient id="grad-pivot-thermal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.85" />
            </radialGradient>

            {/* Sprinkler mist pattern */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Soil & Desert Topography Contours */}
          <g opacity="0.4">
            <path d="M 0,220 Q 300,180 600,240 T 1000,200" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" />
            <path d="M 0,420 Q 400,380 700,440 T 1000,390" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" />
            <text x="70" y="140" fill="#475569" fontSize="12" fontFamily="monospace">Al-Kharj Agricultural Basin (Sector 04)</text>
            <text x="680" y="620" fill="#475569" fontSize="12" fontFamily="monospace">Wadi Al-Bayad Rangeland Pasture</text>
          </g>

          {/* Rotational Grazing Recommended Corridor between Zone B and Zone D */}
          {showHerds && (
            <g opacity="0.85">
              <path 
                d="M 680,360 C 740,320 800,240 840,150" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2.5" 
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              {/* Directional arrow */}
              <polygon points="845,145 833,158 848,162" fill="#38bdf8" />
              <text x="760" y="270" fill="#38bdf8" fontSize="11" fontWeight="bold">
                {isAr ? 'مسار الرعي التناوبي الموصى به' : 'Recommended Grazing Corridor'}
              </text>
            </g>
          )}

          {/* Agricultural Center Pivots */}
          {showPivots && parcels.map((parcel) => {
            const cx = lngToX(parcel.center[1]);
            const cy = latToY(parcel.center[0]);
            const r = 70; // Pivot radius in SVG units
            const isStressed = parcel.status === 'STRESSED' || parcel.ndviAverage < 0.45;
            
            // Choose fill gradient
            let fillId = 'url(#grad-pivot-optimal)';
            if (activeSpectralLayer === 'moisture') fillId = 'url(#grad-pivot-moisture)';
            else if (activeSpectralLayer === 'thermal') fillId = 'url(#grad-pivot-thermal)';
            else if (isStressed) fillId = 'url(#grad-pivot-stressed)';

            // Rotation angle
            const currentAngle = (armAngle + (parcel.code === 'PIVOT-01' ? 40 : parcel.code === 'PIVOT-02' ? 120 : 250)) % 360;
            const armRad = (currentAngle * Math.PI) / 180;
            const armEndX = cx + r * Math.cos(armRad);
            const armEndY = cy + r * Math.sin(armRad);

            return (
              <g 
                key={parcel.asset_id}
                className="cursor-pointer group"
                onClick={() => setSelectedParcel(parcel)}
              >
                {/* Outer Field Boundary */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={r} 
                  fill={fillId}
                  stroke={isStressed ? '#f43f5e' : '#10b981'}
                  strokeWidth={isStressed ? "2.5" : "1.5"}
                  className="transition-all duration-300 group-hover:stroke-white"
                />

                {/* Concentric Irrigation Wheel Tracks */}
                <circle cx={cx} cy={cy} r={r * 0.35} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                <circle cx={cx} cy={cy} r={r * 0.70} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

                {/* Stressed Sector Highlight if Pivot 02 */}
                {isStressed && (
                  <path 
                    d={`M ${cx} ${cy} L ${cx + r * 0.9} ${cy - r * 0.2} A ${r} ${r} 0 0 0 ${cx} ${cy - r} Z`}
                    fill="rgba(244, 63, 94, 0.45)"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Rotating Irrigation Sprinkler Arm */}
                <line 
                  x1={cx} 
                  y1={cy} 
                  x2={armEndX} 
                  y2={armEndY} 
                  stroke="#ffffff" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Sprinkler mist spray animation */}
                <circle cx={armEndX} cy={armEndY} r="4" fill="#38bdf8" filter="url(#glow)" />

                {/* Center Pivot Hub */}
                <circle cx={cx} cy={cy} r="4.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />

                {/* Label Kicker */}
                <g transform={`translate(${cx}, ${cy + r + 18})`}>
                  <rect x="-45" y="-12" width="90" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke={isStressed ? '#f43f5e' : '#334155'} strokeWidth="1" />
                  <text x="0" y="2" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {parcel.code} · NDVI {parcel.ndviAverage.toFixed(2)}
                  </text>
                </g>

                {/* Stress Badge on Pivot */}
                {isStressed && (
                  <g transform={`translate(${cx + r * 0.65}, ${cy - r * 0.65})`}>
                    <circle cx="0" cy="0" r="10" fill="#e11d48" className="animate-ping opacity-75" />
                    <circle cx="0" cy="0" r="10" fill="#e11d48" stroke="#fff" strokeWidth="1" />
                    <text x="0" y="3.5" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">!</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* SolVision Automated Bounding Box for Stress Sector (Pivot 02 NE) */}
          {showBbox && parcels.find(p => p.stressBbox) && (
            (() => {
              const p = parcels.find(p => p.stressBbox)!;
              const bbox = p.stressBbox!;
              const x1 = lngToX(bbox.minLng);
              const y1 = latToY(bbox.maxLat);
              const x2 = lngToX(bbox.maxLng);
              const y2 = latToY(bbox.minLat);
              const width = Math.abs(x2 - x1);
              const height = Math.abs(y2 - y1);

              return (
                <g key="stress-bbox" className="animate-in fade-in">
                  <rect
                    x={x1}
                    y={y1}
                    width={width}
                    height={height}
                    fill="rgba(244, 63, 94, 0.15)"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    className="animate-pulse"
                  />
                  {/* Bounding Box Coordinate Annotation */}
                  <g transform={`translate(${x1}, ${y1 - 6})`}>
                    <rect x="0" y="-14" width="160" height="16" rx="2" fill="#881337" />
                    <text x="6" y="-2" fill="#fff" fontSize="9" fontFamily="monospace">
                      ST_Envelope: [24.187N, 47.339E]
                    </text>
                  </g>
                </g>
              );
            })()
          )}

          {/* Livestock Herds (Kareema RFID / Smart Rangeland) */}
          {showHerds && herds.map((herd) => {
            const cx = lngToX(herd.coordinates[1]);
            const cy = latToY(herd.coordinates[0]);
            const isDanger = herd.overgrazingAlert || herd.grazingPressure === 'OVERGRAZING_DANGER';

            return (
              <g 
                key={herd.herd_id} 
                className="cursor-pointer group"
                onClick={() => setSelectedHerd(herd)}
              >
                {/* Grazing biomass perimeter */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isDanger ? "38" : "30"}
                  fill={isDanger ? "rgba(244, 63, 94, 0.2)" : "rgba(245, 158, 11, 0.15)"}
                  stroke={isDanger ? "#f43f5e" : "#f59e0b"}
                  strokeWidth={isDanger ? "2" : "1.2"}
                  strokeDasharray={isDanger ? "4 3" : "none"}
                  className={isDanger ? "animate-pulse" : ""}
                />

                {/* RFID Hub marker */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="7" 
                  fill={isDanger ? "#e11d48" : "#d97706"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Herd Label */}
                <g transform={`translate(${cx}, ${cy + 42})`}>
                  <rect x="-55" y="-10" width="110" height="18" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={isDanger ? "#f43f5e" : "#475569"} />
                  <text x="0" y="3" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {herd.animalType === 'CAMEL' ? '🐪' : '🐑'} {isAr ? herd.name.slice(0, 14) : herd.nameEn.slice(0, 14)} ({herd.count})
                  </text>
                </g>
              </g>
            );
          })}

          {/* Fleet GPS Trackers (Kareema) */}
          {showFleet && fleet.map((unit) => {
            const cx = lngToX(unit.coordinates[1]);
            const cy = latToY(unit.coordinates[0]);
            const isAlert = unit.status === 'DEVIATION_ALERT';

            return (
              <g 
                key={unit.fleet_id}
                className="cursor-pointer group"
                onClick={() => setSelectedFleetUnit(unit)}
              >
                {/* Route Trail */}
                {unit.routeHistory.length > 1 && (
                  <polyline 
                    points={unit.routeHistory.map(coord => `${lngToX(coord[1])},${latToY(coord[0])}`).join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                )}

                {/* Deviation alert ring */}
                {isAlert && (
                  <circle cx={cx} cy={cy} r="20" fill="none" stroke="#f43f5e" strokeWidth="2" className="animate-ping opacity-75" />
                )}

                {/* Vehicle Marker */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="9" 
                  fill={isAlert ? "#e11d48" : "#0284c7"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                <text x={cx} y={cy + 3} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  {unit.type === 'SCOUT_DRONE' ? '✈' : unit.type === 'HARVESTER' ? '🚜' : '🚚'}
                </text>

                {/* Label */}
                <g transform={`translate(${cx}, ${cy - 14})`}>
                  <rect x="-40" y="-12" width="80" height="15" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke={isAlert ? '#f43f5e' : '#0284c7'} />
                  <text x="0" y="-1" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {unit.fleet_id.split('-').slice(-2).join('-')} · {unit.speedKmh} km/h
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Map Floating Tools (Zoom & Reset) */}
        <div className="absolute bottom-16 right-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Spectral Legend Box */}
        <div className="absolute top-3 left-4 z-20 p-2.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] shadow-lg max-w-[200px]">
          <span className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'مقياس الطيف الفضائي' : 'Spectral Scale'}</span>
          </span>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span>{isAr ? 'مثالي (0.70 - 0.90)' : 'Optimal (0.7-0.9)'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-lime-500"></span>
                <span>{isAr ? 'معتدل (0.50 - 0.69)' : 'Moderate (0.5-0.7)'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                <span>{isAr ? 'بداية إجهاد (0.40 - 0.49)' : 'Warning (0.4-0.5)'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span>{isAr ? 'إجهاد حاد (< 0.40)' : 'Critical Stress (<0.4)'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sentinel-2 Time-Series Player Bar */}
      <div className="px-4 py-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
          </button>
          <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'سلسلة صور الأقمار الصناعية (Sentinel-2 MSI):' : 'Satellite Time-Series:'}</span>
            <span className="font-mono text-emerald-400 font-bold">{timeSteps[selectedTimeIndex]}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1.5 flex-1 max-w-md mx-4">
          {timeSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTimeIndex(idx)}
              className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${
                selectedTimeIndex === idx
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {step.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden md:block">
          {isAr ? 'الدقة المكانية: 10m Ground Resolution' : 'Spatial Resolution: 10m'}
        </div>
      </div>

      {/* Parcel Detail Modal */}
      <ParcelDetailModal
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
        language={language}
        onDispatchStressWorkOrder={onDispatchStressWorkOrder}
        onViewPassport={onViewPassport}
      />

      {/* Mini Inspector for Selected Fleet Unit */}
      {selectedFleetUnit && (
        <div className="absolute top-16 right-4 z-30 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? selectedFleetUnit.name : selectedFleetUnit.nameEn}</span>
            </span>
            <button onClick={() => setSelectedFleetUnit(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <p>ID: <span className="text-cyan-400">{selectedFleetUnit.fleet_id}</span></p>
            <p>Operator: {selectedFleetUnit.operator}</p>
            <p>Speed: {selectedFleetUnit.speedKmh} km/h | Fuel: {selectedFleetUnit.fuelLevelPercent}%</p>
            <p>Status: <span className={selectedFleetUnit.status === 'DEVIATION_ALERT' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{selectedFleetUnit.status}</span></p>
          </div>
        </div>
      )}

      {/* Mini Inspector for Selected Herd */}
      {selectedHerd && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>{isAr ? selectedHerd.name : selectedHerd.nameEn}</span>
            </span>
            <button onClick={() => setSelectedHerd(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <p>RFID Prefix: <span className="font-mono text-amber-300">{selectedHerd.rfid_batch_prefix}</span></p>
            <p>Head Count: <span className="font-bold text-white">{selectedHerd.count}</span> {isAr ? selectedHerd.animalType : selectedHerd.animalTypeEn}</p>
            <p>Biomass Density: <span className="font-bold font-mono text-emerald-400">{(selectedHerd.biomassDensityIndex * 100).toFixed(0)}%</span></p>
            <p>Recommended Rotation: <span className="text-cyan-400">{isAr ? selectedHerd.recommendedRotationZone : selectedHerd.recommendedRotationZoneEn}</span></p>
          </div>
          {selectedHerd.overgrazingAlert && (
            <button
              onClick={() => {
                onDispatchGrazingWorkOrder(selectedHerd);
                setSelectedHerd(null);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
            >
              {isAr ? 'تطبيق توجيه الرعي التناوبي' : 'Enforce Rotational Grazing'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
