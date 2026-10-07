import React from 'react';
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
  ChevronRight
} from 'lucide-react';
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
