import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  BatteryMedium, 
  MapPin, 
  Navigation, 
  Camera, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Send, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { WorkOrder, Language } from '../../types/ecosystem';

interface KareemaMobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  language: Language;
  onCompleteWorkOrder: (orderId: string, notes: string) => void;
}

export const KareemaMobileSimulatorModal: React.FC<KareemaMobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  language,
  onCompleteWorkOrder
}) => {
  if (!isOpen || !workOrder) return null;
  const isAr = language === 'ar';

  const [isOffline, setIsOffline] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(true);
  const [fieldNotes, setFieldNotes] = useState(
    isAr 
      ? 'تم تنظيف واستبدال 4 فوهات رش مسدودة في الربع الشمالي الشرقي. عودة ضغط الخط الهيدروليكي إلى 3.9 بار وتأكيد عمل الذراع بسلاسة.'
      : 'Replaced 4 choked spray nozzles in NE sector. Hydraulic line pressure restored to 3.9 bar, arm rotation confirmed optimal.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitReport = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      onCompleteWorkOrder(workOrder.order_id, fieldNotes);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-t-4 border-t-cyan-500"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Mobile Device Status Bar */}
        <div className="px-5 py-2.5 bg-slate-950 text-slate-400 flex items-center justify-between text-[11px] border-b border-slate-800 font-mono">
          <div className="flex items-center gap-1.5">
            <span>17:42</span>
            <span>·</span>
            <span className="text-cyan-400 font-bold">Kareema Field App</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className="flex items-center gap-1 hover:text-white"
              title="Toggle Offline Contingency Mode"
            >
              {isOffline ? (
                <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                  <Wifi className="w-3 h-3" />
                  Online
                </span>
              )}
            </button>
            <BatteryMedium className="w-4 h-4 text-slate-300" />
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-xs font-bold">
              K
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'أمر العمل الميداني (SOP الخطوة 3)' : 'Field Work Order (SOP Step 3)'}
              </h3>
              <p className="text-[10px] text-cyan-400 font-mono">{workOrder.order_id}</p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
            {workOrder.status}
          </span>
        </div>

        {/* Scrollable Mobile Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Success Banner */}
          {submittedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-center font-bold animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
              <span>{isAr ? 'تم إغلاق أمر العمل وإرسال التقرير بنجاح!' : 'Work Order Completed & Synced!'}</span>
            </div>
          )}

          {/* Assigned Technician Banner */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">{isAr ? 'الفني المسند:' : 'Assigned Tech:'}</span>
            <span className="font-bold text-white text-[11px]">{workOrder.assignedTechnician}</span>
          </div>

          {/* Mission Details Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white">{workOrder.assetName}</span>
              <span className="text-rose-400 font-mono font-bold">{workOrder.severity} SLA</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isAr ? workOrder.description : workOrder.descriptionEn}
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-850 font-mono text-[10px] text-slate-300 flex items-center justify-between">
              <span>BBOX: [{workOrder.bbox.minLat}, {workOrder.bbox.minLng}]</span>
              <span className="text-cyan-400">ETA: {workOrder.etaMinutes}m</span>
            </div>
          </div>

          {/* Field Photo Upload & Verification (SOP Requirement) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'التوثيق المصور للموقع (Photo Evidence)' : 'Field Photographic Evidence'}</span>
            </label>
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center">
              {photoUploaded ? (
                <img
                  src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80"
                  alt="Irrigation Nozzle Repair"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <Camera className="w-6 h-6 mx-auto mb-1" />
                  <span>انقر لالتقاط صورة</span>
                </div>
              )}
              <span className="absolute bottom-1 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                GPS Verified · 24.189°N
              </span>
            </div>
          </div>

          {/* Technician Field Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">
              {isAr ? 'تقرير الإنجاز الميداني للمشرف:' : 'Field Resolution Notes:'}
            </label>
            <textarea
              rows={3}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Digital Signature */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isAr ? 'التوقيع الرقمي:' : 'Digital Signature:'}</span>
            <span className="font-mono text-emerald-400 font-bold">ECDSA-secp256k1-Signed</span>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleSubmitReport}
            disabled={isSubmitting || workOrder.status === 'COMPLETED'}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmitting 
                ? (isAr ? 'جارِ المزامنة مع AtlasCloud...' : 'Syncing to AtlasCloud...') 
                : (isAr ? 'إرسال التقرير وإغلاق المهمة' : 'Submit & Close Work Order')}
            </span>
          </button>
        </div>

        {/* Mobile Device Home Bar */}
        <div className="py-2 bg-slate-950 flex justify-center border-t border-slate-800">
          <div className="w-24 h-1 rounded-full bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};
