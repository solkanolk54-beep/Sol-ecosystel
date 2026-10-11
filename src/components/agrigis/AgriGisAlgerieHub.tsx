import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Layers, 
  Globe2, 
  Wheat, 
  Droplets, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sliders, 
  Award, 
  ShieldCheck, 
  Eye, 
  Play, 
  Calendar, 
  MapPin, 
  Database, 
  Cpu, 
  FileText, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Maximize2,
  TrendingUp,
  Radio,
  Clock,
  Landmark
} from 'lucide-react';
import { 
  Language, 
  AgriGisWilayaPole, 
  AgriGisParcelCadastre, 
  AlsatSatelliteMission,
  OdasConcession,
  WaterTableSensorNode
} from '../../types/ecosystem';
import { 
  ALGERIA_AGRIGIS_POLES, 
  ALSAT_CONSTELLATION, 
  ODAS_CONCESSIONS, 
  ALGERIA_WATER_TABLE_SENSORS 
} from '../../data/mockData';

interface AgriGisAlgerieHubProps {
  language: Language;
  onDispatchWorkOrder?: (orderTitle: string, parcelName: string, coords: [number, number]) => void;
  onOpenQualityPassport?: (batchId: string) => void;
  onSwitchToGeneralGis?: () => void;
}

export const AgriGisAlgerieHub: React.FC<AgriGisAlgerieHubProps> = ({
  language,
  onDispatchWorkOrder,
  onOpenQualityPassport,
  onSwitchToGeneralGis
}) => {
  const isAr = language === 'ar';

  // Selected Pole & Parcel State
  const [selectedPoleId, setSelectedPoleId] = useState<string>('el-menia');
  const [selectedParcelId, setSelectedParcelId] = useState<string>('DZ-MN-PVT-01');

  // Spectral Layer Mode
  const [spectralMode, setSpectralMode] = useState<'alsat_ndvi' | 'alsat_rgb' | 'ndwi_water' | 'savi_soil'>('alsat_ndvi');

  // Satellite Tasking Simulation State
  const [isTaskingAlsat, setIsTaskingAlsat] = useState(false);
  const [taskingProgress, setTaskingProgress] = useState(0);
  const [taskingMessage, setTaskingMessage] = useState<string | null>(null);
  const [lastOverpassTime, setLastOverpassTime] = useState<string>('2026-10-11 11:45 UTC');

  // Interactive Arm Rotation for Selected Pivot
  const [liveArmAngle, setLiveArmAngle] = useState(135);

  // Active Pole & Parcel References
  const currentPole = ALGERIA_AGRIGIS_POLES.find(p => p.id === selectedPoleId) || ALGERIA_AGRIGIS_POLES[0];
  const currentParcel = currentPole.parcels.find(p => p.id === selectedParcelId) || currentPole.parcels[0];

  // Animate Pivot Arm
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveArmAngle(prev => (prev + 1.5) % 360);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Update selected parcel when pole changes
  useEffect(() => {
    if (currentPole.parcels.length > 0) {
      setSelectedParcelId(currentPole.parcels[0].id);
    }
  }, [selectedPoleId]);

  // Satellite Tasking Simulation
  const handleTaskAlsatOverpass = (satelliteName: string) => {
    if (isTaskingAlsat) return;
    setIsTaskingAlsat(true);
    setTaskingProgress(10);
    setTaskingMessage(
      isAr 
        ? `جاري برمجة مدار ${satelliteName} ومزامنة المحطة الأرضية بوهران/أرزيو...` 
        : `Tasking ${satelliteName} orbit & syncing Oran/Arzew ground station...`
    );

    const step1 = setTimeout(() => {
      setTaskingProgress(45);
      setTaskingMessage(
        isAr 
          ? `التقاط المسح الطيفي عالي الدقة (2.5m) فوق قطب ${currentPole.nameAr}...` 
          : `Acquiring high-resolution spectral swath (2.5m) over ${currentPole.nameEn}...`
      );
    }, 1200);

    const step2 = setTimeout(() => {
      setTaskingProgress(80);
      setTaskingMessage(
        isAr 
          ? `معالجة مصفوفة NDVI ومعايرة الانعكاس الإشعاعي وتشفير السجل في DZ-North-1...` 
          : `Processing NDVI raster & cryptographic sealing in DZ-North-1 Sovereign Vault...`
      );
    }, 2400);

    const step3 = setTimeout(() => {
      setTaskingProgress(100);
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      setLastOverpassTime(now);
      setTaskingMessage(
        isAr 
          ? `اكتمل المسح بنجاح! تم تحديث طبقة الغطاء النباتي وتحديث مؤشر رطوبة التربة.` 
          : `Acquisition completed successfully! Land cover and soil moisture refreshed.`
      );
      setTimeout(() => {
        setIsTaskingAlsat(false);
        setTaskingProgress(0);
      }, 3500);
    }, 3600);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Spectral Color Function
  const getSpectralColor = (ndvi: number) => {
    if (spectralMode === 'alsat_rgb') return '#15803d'; // Natural forest/crop green
    if (spectralMode === 'ndwi_water') return '#0284c7'; // Cyan/water
    if (spectralMode === 'savi_soil') return '#d97706'; // Amber/soil index
    // Default NDVI
    if (ndvi >= 0.75) return '#10b981'; // vibrant emerald
    if (ndvi >= 0.65) return '#84cc16'; // lime green
    if (ndvi >= 0.50) return '#eab308'; // yellow
    return '#f43f5e'; // red / stress
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Sovereign Platform Banner: AgriGIS Algérie */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Sovereign Emblem */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>AgriGIS Algérie</span>
                <span className="text-slate-400">|</span>
                <span>DZ-North-1 Sovereign</span>
              </span>

              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                EPSG:31070 (Nord Sahara UTM 31N) & EPSG:4326
              </span>

              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                {isAr ? 'الجمهورية الجزائرية الديمقراطية الشعبية' : 'People\'s Democratic Republic of Algeria'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg border border-emerald-400/30">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{isAr ? 'المنظومة الوطنية للمعلومات الجغرافية الفلاحية (AgriGIS Algérie)' : 'AgriGIS Algérie National Agricultural Spatial System'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {isAr 
                    ? 'رصد الأقطاب الزراعية الكبرى، محاور القمح الصحراوي، طبقة الألبي الجوفية، وبساتين النخيل عبر كوكبة الأقمار الجزائرية Alsat'
                    : 'Monitoring Mega-Agricultural Basins, Saharan Pivots, the Albian Aquifer & Date Oases via Algerian Alsat Satellite Constellation'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Landmark className="w-3.5 h-3.5" />
                <span>{isAr ? 'إشراف: وزارة الفلاحة والتنمية الريفية (MADR)' : 'Ministry of Agriculture (MADR)'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <Satellite className="w-3.5 h-3.5" />
                <span>{isAr ? 'الوكالة الفضائية الجزائرية (ASAL)' : 'Algerian Space Agency (ASAL)'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>{isAr ? 'ديوان تطوير الزراعة الصحراوية (ODAS)' : 'ODAS Saharan Office'}</span>
              </span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleTaskAlsatOverpass('Alsat-2A')}
              disabled={isTaskingAlsat}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isTaskingAlsat
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 border border-emerald-400/40 cursor-pointer active:scale-95'
              }`}
            >
              <Satellite className={`w-4 h-4 ${isTaskingAlsat ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'طلب مسار استشعار فضائي Alsat' : 'Task Alsat Overpass'}</span>
            </button>

            {onSwitchToGeneralGis && (
              <button
                onClick={onSwitchToGeneralGis}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'الخريطة العامة للعمليات' : 'Main Ops Map'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Satellite Tasking Progress Banner */}
        {isTaskingAlsat && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-300 mb-1.5">
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>{taskingMessage}</span>
              </span>
              <span className="font-bold">{taskingProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-emerald-500/30">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* National Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'الأقطاب الكبرى' : 'Poles Monitored'}</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">6</span>
            <span className="text-[10px] text-slate-400 ml-1">{isAr ? 'أقطاب وطنية' : 'strategic poles'}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">100% تغطية جغرافية</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'المساحة المرصودة' : 'Monitored Area'}</span>
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">780,000</span>
            <span className="text-[10px] text-slate-400 ml-1">هكتار</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-mono">{isAr ? 'قمح، بذور، نخيل، خضر' : 'Cereals, Dates, Crops'}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'المحاور الرشاشة' : 'Active Pivots'}</span>
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">3,350+</span>
            <span className="text-[10px] text-slate-400 ml-1">{isAr ? 'محور رش دائرى' : 'pivots'}</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">{isAr ? 'كفاءة ري 94.2%' : 'Irrigation 94.2%'}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'كوكبة الأقمار' : 'Alsat Constellation'}</span>
            <Satellite className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">4</span>
            <span className="text-[10px] text-slate-400 ml-1">{isAr ? 'أقمار وطنية' : 'orbiters'}</span>
          </div>
          <div className="text-[10px] text-purple-300 mt-1 font-mono">Alsat 1B / 2A / 2B / 1N</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'امتيازات ديوان ODAS' : 'ODAS Concessions'}</span>
            <Landmark className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">302</span>
            <span className="text-[10px] text-slate-400 ml-1">{isAr ? 'امتياز صناعي' : 'mega files'}</span>
          </div>
          <div className="text-[10px] text-teal-300 mt-1 font-mono">{isAr ? 'استثمار زراعي سيادي' : 'Sovereign Agro-Invest'}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'حوض الألبي الجوفي' : 'Albian Aquifer'}</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">-18.4m</span>
            <span className="text-[10px] text-slate-400 ml-1">{isAr ? 'مستوى بيزومتري' : 'piezo'}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">{isAr ? 'استدامة مائية مستقرة' : 'Stable Sustainable'}</div>
        </div>
      </div>

      {/* Main Grid: Interactive Pole Selector & National Geographic Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Stage: Interactive Agricultural Pole & Cadastre Viewer (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Pole Selector Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'اختر القطب الفلاحي الاستراتيجي للمعاينة والتفتيش:' : 'Select Strategic Agricultural Pole:'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {isAr ? `القطب المحدد: ولاية ${currentPole.wilayaNumber}` : `Wilaya ${currentPole.wilayaNumber}`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALGERIA_AGRIGIS_POLES.map((pole) => {
                const isSelected = pole.id === selectedPoleId;
                return (
                  <button
                    key={pole.id}
                    onClick={() => setSelectedPoleId(pole.id)}
                    className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold truncate">
                        {isAr ? pole.nameAr.split(' ')[1] || pole.nameAr : pole.nameEn.split(' ')[0]}
                      </span>
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        W.{pole.wilayaNumber}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {isAr ? pole.categoryLabelAr : pole.categoryLabelEn}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1 border-t border-slate-800/80">
                      <span className="text-emerald-400">{pole.activePivotsCount} {isAr ? 'محور' : 'pivots'}</span>
                      <span className="text-slate-500">NDVI {pole.ndviHealthIndex}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive GIS Spatial Visualizer Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* GIS Viewport HUD Control Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentPole.nameAr}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[11px] font-mono text-emerald-400">{currentPole.keyPerimeter}</span>
              </div>

              {/* Spectral View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSpectralMode('alsat_ndvi')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    spectralMode === 'alsat_ndvi'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'طيف Alsat (NDVI)' : 'Alsat NDVI'}
                </button>
                <button
                  onClick={() => setSpectralMode('alsat_rgb')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    spectralMode === 'alsat_rgb'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'ألوان حقيقية (RGB 2.5m)' : 'True Color RGB'}
                </button>
                <button
                  onClick={() => setSpectralMode('ndwi_water')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    spectralMode === 'ndwi_water'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'المحتوى المائي (NDWI)' : 'Water NDWI'}
                </button>
                <button
                  onClick={() => setSpectralMode('savi_soil')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    spectralMode === 'savi_soil'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'مؤشر التربة (SAVI)' : 'Soil SAVI'}
                </button>
              </div>
            </div>

            {/* Simulated Geospatial Canvas / Pivot Array */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 overflow-hidden flex items-center justify-center p-4">
              {/* Grid Background Coordinates */}
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:32px_32px]"></div>

              {/* Water Table / Aquifer Indicator Tag */}
              <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-lg p-2.5 text-[11px] text-cyan-200 shadow-lg space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentPole.waterAquiferName}</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  {isAr ? `عمق الضخ الباطني: ${currentPole.waterTableDepthMeters} متر` : `Pumping Depth: ${currentPole.waterTableDepthMeters}m`}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isAr ? 'نظام الضغط الهيدروليكي: 4.1 بار' : 'Pressure: 4.1 Bar Active'}</span>
                </div>
              </div>

              {/* Satellite Acquisition Tag */}
              <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 rounded-lg p-2.5 text-[11px] text-purple-200 shadow-lg space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Satellite className="w-3.5 h-3.5 text-purple-400" />
                  <span>{currentPole.alsatResolution}</span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono">
                  {isAr ? `آخر مسار: ${lastOverpassTime}` : `Last Pass: ${lastOverpassTime}`}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  {isAr ? 'دقة الخريطة الكاداسترية: 1:5000' : 'Cadastre Scale: 1:5000'}
                </div>
              </div>

              {/* Circular Central Pivots Representation */}
              <div className="relative z-0 flex items-center justify-center gap-4 sm:gap-8 flex-wrap max-w-full">
                {currentPole.parcels.map((parcel, idx) => {
                  const isSelected = parcel.id === selectedParcelId;
                  const pivotColor = getSpectralColor(parcel.ndvi);

                  return (
                    <div
                      key={parcel.id}
                      onClick={() => setSelectedParcelId(parcel.id)}
                      className={`relative flex flex-col items-center cursor-pointer transition-all ${
                        isSelected ? 'scale-105' : 'hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Circular Pivot Body (SVG) */}
                      <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center shadow-xl">
                        <svg className="w-full h-full -rotate-90">
                          {/* Outer Border */}
                          <circle
                            cx="50%"
                            cy="50%"
                            r="46%"
                            fill="#0f172a"
                            stroke={isSelected ? '#10b981' : '#334155'}
                            strokeWidth={isSelected ? '3' : '1.5'}
                            className="transition-colors"
                          />
                          {/* Crop Field NDVI Color Fill */}
                          <circle
                            cx="50%"
                            cy="50%"
                            r="43%"
                            fill={pivotColor}
                            fillOpacity={parcel.status === 'STRESSED' ? '0.35' : '0.65'}
                            stroke={pivotColor}
                            strokeWidth="1"
                          />

                          {/* Concentric Irrigation Tracks */}
                          <circle cx="50%" cy="50%" r="32%" fill="none" stroke="#ffffff25" strokeWidth="1" strokeDasharray="3 3" />
                          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#ffffff20" strokeWidth="1" strokeDasharray="2 2" />

                          {/* Rotating Sprinkler Arm Line */}
                          <line
                            x1="50%"
                            y1="50%"
                            x2={50 + 44 * Math.cos(((isSelected ? liveArmAngle : parcel.rotationArmAngle) * Math.PI) / 180) + "%"}
                            y2={50 + 44 * Math.sin(((isSelected ? liveArmAngle : parcel.rotationArmAngle) * Math.PI) / 180) + "%"}
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Pivot Center Well Tower */}
                          <circle cx="50%" cy="50%" r="5" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
                        </svg>

                        {/* Pivot Center Details Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2 text-center">
                          <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
                            {parcel.code.replace('DZ-', '')}
                          </span>
                          <span className="text-[9px] text-slate-100 font-semibold drop-shadow-md truncate max-w-[90px]">
                            {isAr ? parcel.cropAr.split(' ')[0] : parcel.cropEn.split(' ')[0]}
                          </span>
                          <span className={`text-[9px] font-mono px-1 rounded mt-0.5 ${
                            parcel.status === 'STRESSED'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500'
                          }`}>
                            NDVI {parcel.ndvi}
                          </span>
                        </div>
                      </div>

                      {/* Pivot Label Below */}
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {parcel.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {parcel.areaHa} ha • {parcel.waterFlowLps} L/s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Legend Overlay */}
              <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>NDVI ≥ 0.75 ({isAr ? 'نمو مثالي' : 'Optimal'})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                    <span>NDVI 0.65-0.74 ({isAr ? 'جيد' : 'Good'})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>NDVI &lt; 0.50 ({isAr ? 'إجهاد / صيانة' : 'Stress Alert'})</span>
                  </span>
                </div>

                <div className="text-cyan-400 font-semibold">
                  {isAr ? 'إحداثيات المركز: ' : 'Center Coordinates: '}
                  [{currentPole.coordinates[0].toFixed(3)}°N, {currentPole.coordinates[1].toFixed(3)}°E]
                </div>
              </div>
            </div>

            {/* Selected Parcel Telemetry Strip */}
            <div className="bg-slate-900 border-t border-slate-800 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Wheat className="w-4 h-4 text-emerald-400" />
                      <span>{currentParcel.nameAr}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">({currentParcel.code})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentParcel.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                      currentParcel.status === 'IRRIGATING' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' :
                      'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}>
                      {currentParcel.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-emerald-400">{isAr ? 'المحصول المزروع: ' : 'Crop: '}</strong>
                    {isAr ? currentParcel.cropAr : currentParcel.cropEn} • {currentParcel.areaHa} هكتار • {currentParcel.irrigationTypeAr}
                  </p>
                </div>

                {/* Telemetry Numbers */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isAr ? 'رطوبة التربة' : 'Soil Moisture'}</div>
                    <div className="text-emerald-400 font-bold">{currentParcel.moisturePercent}%</div>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isAr ? 'تدفق المياه' : 'Flow Rate'}</div>
                    <div className="text-cyan-400 font-bold">{currentParcel.waterFlowLps} L/s</div>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isAr ? 'عمق البئر' : 'Well Depth'}</div>
                    <div className="text-amber-400 font-bold">{currentParcel.waterWellDepthM}m</div>
                  </div>

                  {onDispatchWorkOrder && (
                    <button
                      onClick={() => onDispatchWorkOrder(
                        `معايرة دورة الري لمحور ${currentParcel.code}`,
                        currentParcel.nameAr,
                        currentParcel.coordinates
                      )}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      {isAr ? 'إرسال أمر عمل ميداني' : 'Dispatch WO'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Algerian Satellites, ODAS Concessions & Aquifer Monitoring (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Box 1: ASAL Alsat Satellite Constellation Fleet Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">
                  {isAr ? 'كوكبة الأقمار الصناعية الجزائرية (ASAL)' : 'ASAL Algerian Satellite Fleet'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                4 Satellites Active
              </span>
            </div>

            <div className="space-y-2">
              {ALSAT_CONSTELLATION.map((sat) => (
                <div 
                  key={sat.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{sat.satellite}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({sat.orbitAltitudeKm} km)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {sat.resolutionMeters.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-purple-300">{isAr ? 'المهمة الحالية: ' : 'Target: '}</strong>
                    {isAr ? sat.currentPassTargetAr : sat.currentPassTargetEn}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                    <span>{sat.coverageAgencyAr.split('-')[0]}</span>
                    <span className="text-emerald-400">رابط {sat.telemetryLinkQualityPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: ODAS National Agricultural Concessions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white">
                  {isAr ? 'امتيازات ديوان تطوير الزراعة الصحراوية (ODAS)' : 'ODAS Strategic Concessions'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                {isAr ? 'عقود استثمار وطنية' : 'Sovereign Portfolios'}
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {ODAS_CONCESSIONS.map((odas) => (
                <div 
                  key={odas.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-300 text-[11px] truncate max-w-[180px]">
                      {isAr ? odas.investorNameAr : odas.investorNameEn}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {odas.allocatedHectares.toLocaleString()} ha
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    <span>{isAr ? odas.wilayaAr : odas.wilayaEn}</span> • <span>{isAr ? odas.perimeterNameAr : odas.perimeterNameEn}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="text-emerald-400">{odas.boreholesCount} {isAr ? 'آبار عميقة' : 'wells'} ({odas.boreholeAvgDepthM}m)</span>
                    <span className="text-teal-400 font-bold">{odas.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Continental Intercalaire (Nappe Albienne) Water Table Telemetry */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">
                  {isAr ? 'مستشعرات استدامة المياه الجوفية (حوض الألبي)' : 'Albian Aquifer Piezometers'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                IoT Telemetry Node
              </span>
            </div>

            <div className="space-y-2">
              {ALGERIA_WATER_TABLE_SENSORS.map((sensor) => (
                <div 
                  key={sensor.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">
                      {sensor.regionAr}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {sensor.piezometricLevelM} m
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    {sensor.aquiferNameAr} • ملوحة {sensor.salinityGramsPerLiter} g/L
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                    <span className="text-emerald-400">{sensor.sustainabilityStatus}</span>
                    <span>{sensor.lastPiezometerReading}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Algerian Sovereign Quality Label & Merkle Sealing */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'موسوم الجودة الفلاحية الجزائرية السيادية (Label Qualité Algérie)' : 'Label Qualité Algérie - Sovereign Certification'}</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                DZ-North-1 Sealed
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              {isAr 
                ? 'توثيق شحنات القمح الصلب بالمنيعة وتمور دقلة نور ببسكرة وبطاطس سوف عبر شجرة ميركل السيادية وخوارزمية SHA-256 الوطنية.'
                : 'Cryptographically certifying durum wheat batches, Deglet Nour PDO dates, and seed crops via national Merkle trees.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onOpenQualityPassport && (
            <button
              onClick={() => onOpenQualityPassport('BATCH-WHT-2026-Q3-089')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? 'استعراض بطاقة الجودة الجزائرية' : 'Inspect Quality Passport'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
