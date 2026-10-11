import React, { useState } from 'react';
import { 
  X, 
  Satellite, 
  Droplets, 
  Activity, 
  Calendar, 
  Clock, 
  Compass, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Gauge,
  Waves,
  TrendingDown,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { ParcelAsset, Language } from '../../types/ecosystem';

interface ParcelDetailModalProps {
  parcel: ParcelAsset | null;
  onClose: () => void;
  language: Language;
  onDispatchStressWorkOrder?: (parcel: ParcelAsset) => void;
  onViewPassport?: (cropBatchId: string) => void;
}

export const ParcelDetailModal: React.FC<ParcelDetailModalProps> = ({
  parcel,
  onClose,
  language,
  onDispatchStressWorkOrder,
  onViewPassport
}) => {
  if (!parcel) return null;
  const isAr = language === 'ar';

  const isStressed = parcel.status === 'STRESSED' || parcel.ndviAverage < 0.45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
              isStressed 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {parcel.code}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? parcel.name : parcel.nameEn}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                  isStressed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {parcel.status}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                asset_id: {parcel.asset_id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Stress Warning Banner if applicable */}
          {isStressed && (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-200">
                    {isAr ? 'تنبيه إجهاد مائي حاد تم رصده عبر SolVision' : 'Acute Water Stress Detected by SolVision'}
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-1">
                    {isAr
                      ? `تم اكتشاف انخفاض مؤشر NDVI إلى ${parcel.ndviAverage} في ${parcel.stressSector || 'القطاع الشمالي'}. هبوط في ضغط المضخة (${parcel.irrigationTelemetry.pressureBar} بار).`
                      : `NDVI dropped to ${parcel.ndviAverage} in ${parcel.stressSector || 'Northern Sector'}. Hydraulic pressure collapsed to ${parcel.irrigationTelemetry.pressureBar} bar.`}
                  </p>
                  {parcel.stressBbox && (
                    <div className="text-[11px] font-mono text-rose-300 mt-2 bg-rose-950/80 px-2 py-1 rounded inline-block">
                      PostGIS BBOX: [{parcel.stressBbox.minLat}, {parcel.stressBbox.minLng}, {parcel.stressBbox.maxLat}, {parcel.stressBbox.maxLng}]
                    </div>
                  )}
                </div>
              </div>

              {onDispatchStressWorkOrder && (
                <button
                  onClick={() => onDispatchStressWorkOrder(parcel)}
                  className="shrink-0 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md transition-colors"
                >
                  {isAr ? 'إصدار أمر عمل Kareema' : 'Dispatch Work Order'}
                </button>
              )}
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'مؤشر الغطاء (NDVI)' : 'Spectral NDVI'}
              </span>
              <span className={`text-xl font-bold font-mono ${
                parcel.ndviAverage > 0.6 ? 'text-emerald-400' : parcel.ndviAverage > 0.45 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {parcel.ndviAverage.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sentinel-2 MSI</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'المساحة والقطر' : 'Area & Radius'}
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {parcel.areaHectares} <span className="text-xs font-normal text-slate-400">ha</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">R = {parcel.radiusMeters}m</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'ضغط شبكة الري' : 'Irrigation Pressure'}
              </span>
              <span className={`text-xl font-bold font-mono ${
                parcel.irrigationTelemetry.pressureBar >= 3.0 ? 'text-cyan-400' : 'text-rose-400'
              }`}>
                {parcel.irrigationTelemetry.pressureBar} <span className="text-xs font-normal text-slate-400">bar</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{parcel.irrigationTelemetry.flowRateLps} L/s flow</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'رطوبة التربة' : 'Soil Moisture'}
              </span>
              <span className={`text-xl font-bold font-mono ${
                parcel.soilHealth.moisturePercent > 30 ? 'text-teal-400' : 'text-amber-400'
              }`}>
                {parcel.soilHealth.moisturePercent}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">pH: {parcel.soilHealth.ph}</span>
            </div>
          </div>

          {/* Real-Time & Historical Irrigation Telemetry Recharts Chart */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{isAr ? 'اتجاهات ضغط الري وتدفق المياه تاريخياً' : 'Irrigation Pressure & Flow Rate Trends'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      IoT Telemetry
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? `رسم بياني لحظي وتاريخي عبر مكتبة Recharts لمتابعة الضغط الهيدروليكي (bar) ومعدل التدفق (L/s)`
                      : `Dynamic Recharts dual-axis time-series correlating hydraulic pressure (bar) vs flow rate (L/s)`}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">{isAr ? 'الضغط الحالي:' : 'Current:'}</span>
                  <span className={`font-bold ${parcel.irrigationTelemetry.pressureBar >= 3.0 ? 'text-cyan-400' : 'text-rose-400 animate-pulse'}`}>
                    {parcel.irrigationTelemetry.pressureBar} bar
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">{isAr ? 'التدفق:' : 'Flow:'}</span>
                  <span className="text-emerald-400 font-bold">
                    {parcel.irrigationTelemetry.flowRateLps} L/s
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Chart Container */}
            <div className="h-60 w-full pt-2">
              {(() => {
                // Prepare or fallback time series
                const chartData = (parcel.telemetryHistorical && parcel.telemetryHistorical.length > 0)
                  ? parcel.telemetryHistorical
                  : [
                      { timestamp: "00:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 0.98).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 0.97), nominalPressure: 3.8 },
                      { timestamp: "03:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 1.01).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 0.99), nominalPressure: 3.8 },
                      { timestamp: "06:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 1.03).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 1.02), nominalPressure: 3.8 },
                      { timestamp: "09:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 1.00).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 1.00), nominalPressure: 3.8 },
                      { timestamp: "12:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 0.95).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 0.94), nominalPressure: 3.8 },
                      { timestamp: "15:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 0.97).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 0.96), nominalPressure: 3.8 },
                      { timestamp: "18:00", pressureBar: Number((parcel.irrigationTelemetry.pressureBar * 1.02).toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps * 1.03), nominalPressure: 3.8 },
                      { timestamp: "21:00", pressureBar: Number(parcel.irrigationTelemetry.pressureBar.toFixed(2)), flowRateLps: Math.round(parcel.irrigationTelemetry.flowRateLps), nominalPressure: 3.8 }
                    ];

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#64748b" 
                        fontSize={11} 
                        tickLine={false}
                        fontFamily="monospace"
                      />
                      {/* Left Axis: Hydraulic Pressure (bar) */}
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        domain={[0, 5]} 
                        stroke="#38bdf8" 
                        fontSize={11} 
                        tickLine={false}
                        fontFamily="monospace"
                        unit=" b"
                      />
                      {/* Right Axis: Flow Rate (L/s) */}
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 150]} 
                        stroke="#10b981" 
                        fontSize={11} 
                        tickLine={false}
                        fontFamily="monospace"
                        unit=" L/s"
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl font-mono text-xs space-y-1">
                                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                                  {isAr ? `التوقيت: ${label}` : `Time: ${label}`}
                                </div>
                                <div className="text-cyan-400 flex items-center justify-between gap-3">
                                  <span>{isAr ? 'ضغط الري:' : 'Pressure:'}</span>
                                  <span className="font-bold">{payload[0]?.value} bar</span>
                                </div>
                                <div className="text-emerald-400 flex items-center justify-between gap-3">
                                  <span>{isAr ? 'معدل التدفق:' : 'Flow Rate:'}</span>
                                  <span className="font-bold">{payload[1]?.value} L/s</span>
                                </div>
                                <div className="text-amber-400/80 text-[10px] flex items-center justify-between gap-3 pt-0.5 border-t border-slate-800/80">
                                  <span>{isAr ? 'الضغط الاسمي:' : 'Nominal Threshold:'}</span>
                                  <span>3.0 bar</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => {
                          if (value === 'pressureBar') return isAr ? 'ضغط الري (bar)' : 'Pressure (bar)';
                          if (value === 'flowRateLps') return isAr ? 'تدفق المياه (L/s)' : 'Flow Rate (L/s)';
                          return value;
                        }}
                      />
                      {/* Critical Low Pressure Threshold Line at 3.0 bar */}
                      <ReferenceLine 
                        yAxisId="left" 
                        y={3.0} 
                        stroke="#f43f5e" 
                        strokeDasharray="4 4" 
                        label={{
                          value: isAr ? 'عتبة الأمان (3.0 bar)' : 'P1 SLA Floor (3.0 bar)',
                          fill: '#f43f5e',
                          fontSize: 10,
                          position: 'insideTopLeft'
                        }}
                      />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="pressureBar" 
                        stroke="#38bdf8" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1, stroke: '#0f172a' }}
                        activeDot={{ r: 6, fill: '#38bdf8' }}
                        name="pressureBar"
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="flowRateLps" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#0f172a' }}
                        activeDot={{ r: 6, fill: '#10b981' }}
                        name="flowRateLps"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Telemetry Summary Footer */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isAr 
                    ? `دوران ذراع الرش: ${parcel.irrigationTelemetry.armRotationDeg}° · سرعة المحور: ${parcel.irrigationTelemetry.speedPercent}%`
                    : `Arm Angle: ${parcel.irrigationTelemetry.armRotationDeg}° · Pivot Speed: ${parcel.irrigationTelemetry.speedPercent}%`}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                parcel.irrigationTelemetry.pressureBar >= 3.0
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
              }`}>
                {parcel.irrigationTelemetry.pressureBar >= 3.0
                  ? (isAr ? 'الضغط الهيدروليكي مستقر' : 'Hydraulic Nominal')
                  : (isAr ? 'تحذير: هبوط حاد في الضغط' : 'Warning: Hydraulic Pressure Drop')}
              </span>
            </div>
          </div>

          {/* Historical NDVI & Moisture Trend */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'السلسلة الزمنية لمؤشر NDVI (آخر 30 يوماً)' : 'NDVI Historical Time-Series (30 Days)'}</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">GeoServer WMS Time Dimension</span>
            </div>

            <div className="h-32 flex items-end gap-3 pt-6 pb-2 border-b border-slate-800">
              {parcel.ndviHistorical.map((point, idx) => {
                const heightPercent = Math.max(15, Math.min(100, point.ndvi * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-white font-mono whitespace-nowrap pointer-events-none">
                      NDVI: {point.ndvi} | H2O: {point.moisture}%
                    </div>
                    <div 
                      className={`w-full rounded-t transition-all ${
                        point.ndvi > 0.6 
                          ? 'bg-emerald-500 group-hover:bg-emerald-400' 
                          : point.ndvi > 0.45 
                          ? 'bg-amber-500 group-hover:bg-amber-400' 
                          : 'bg-rose-500 group-hover:bg-rose-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">{point.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agronomy & Soil Chemistry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'البيانات الزراعية والصنف' : 'Agronomic Metadata'}</span>
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">{isAr ? 'المحصول' : 'Crop'}:</span>
                  <span className="text-white font-medium">{isAr ? parcel.cropType : parcel.cropTypeEn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">{isAr ? 'دفعة التتبع' : 'Batch ID'}:</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{parcel.crop_batch_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">{isAr ? 'تاريخ الحصاد المتوقع' : 'Harvest Date'}:</span>
                  <span className="text-slate-200 font-mono">{parcel.expectedHarvestDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{isAr ? 'آخر تسميد' : 'Last Fertilization'}:</span>
                  <span className="text-slate-200">{parcel.lastFertilization}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Droplets className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'كيمياء التربة (NPK & Salinity)' : 'Soil Chemistry Metrics'}</span>
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Nitrogen (N):</span>
                  <span className="text-slate-200 font-mono">{parcel.soilHealth.nitrogen_ppm} ppm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Phosphorus (P):</span>
                  <span className="text-slate-200 font-mono">{parcel.soilHealth.phosphorus_ppm} ppm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Potassium (K):</span>
                  <span className="text-slate-200 font-mono">{parcel.soilHealth.potassium_ppm} ppm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{isAr ? 'الملوحة الكهربية (EC)' : 'Salinity (EC)'}:</span>
                  <span className="text-slate-200 font-mono">{parcel.soilHealth.salinity_ec} dS/m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Lat: {parcel.center[0]}° N</span>
            <span>·</span>
            <span>Lng: {parcel.center[1]}° E</span>
          </div>

          <div className="flex items-center gap-3">
            {onViewPassport && (
              <button
                onClick={() => onViewPassport(parcel.crop_batch_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'بطاقة الجودة الرقمية' : 'View Passport'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
