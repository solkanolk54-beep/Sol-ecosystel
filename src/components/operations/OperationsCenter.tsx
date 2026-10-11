import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  Radio, 
  FileText, 
  Send, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  MapPin,
  Navigation,
  Smartphone,
  Mail,
  Eye
} from 'lucide-react';
import { 
  SystemEvent, 
  WorkOrder, 
  Language, 
  ParcelAsset, 
  LivestockHerd,
  UserRole,
  AutomatedEmailAlert
} from '../../types/ecosystem';

interface OperationsCenterProps {
  events: SystemEvent[];
  workOrders: WorkOrder[];
  parcels: ParcelAsset[];
  herds: LivestockHerd[];
  language: Language;
  currentRole?: UserRole;
  onDispatchStressWorkOrder: (parcel: ParcelAsset) => void;
  onDispatchGrazingWorkOrder: (herd: LivestockHerd) => void;
  onCompleteWorkOrder: (orderId: string, notes: string) => void;
  onRecenterFleetCorridor: (fleetId: string) => void;
  onOpenMobileSimulatorWithOrder?: (order: WorkOrder) => void;
  emailAlerts?: AutomatedEmailAlert[];
  onOpenEmailModal?: () => void;
  onOpenEmailModalWithOrder?: (orderId: string) => void;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({
  events,
  workOrders,
  parcels,
  herds,
  language,
  currentRole = 'ALL',
  onDispatchStressWorkOrder,
  onDispatchGrazingWorkOrder,
  onCompleteWorkOrder,
  onRecenterFleetCorridor,
  onOpenMobileSimulatorWithOrder,
  emailAlerts = [],
  onOpenEmailModal,
  onOpenEmailModalWithOrder
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'alerts' | 'workOrders' | 'eventBus' | 'emails'>('alerts');
  const [selectedEventForInspection, setSelectedEventForInspection] = useState<SystemEvent | null>(null);
  const [resolvingOrderId, setResolvingOrderId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Active stress parcel
  const stressedPivot = parcels.find(p => p.status === 'STRESSED' || p.ndviAverage < 0.45);
  // Active grazing alert herd
  const overgrazingHerd = herds.find(h => h.overgrazingAlert);

  // Check if work order already generated for stressed pivot
  const pivotWorkOrderExists = workOrders.some(
    wo => wo.asset_id === (stressedPivot?.asset_id ?? '') && wo.status !== 'COMPLETED'
  );

  // Check if work order already generated for herd
  const herdWorkOrderExists = workOrders.some(
    wo => wo.asset_id === (overgrazingHerd?.herd_id ?? '') && wo.status !== 'COMPLETED'
  );

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-full">
      {/* Header Tabs */}
      <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{isAr ? 'مركز العمليات والأحداث اللحظية' : 'Operations & Real-time Alerts'}</span>
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'التنبيهات الحادة' : 'Threshold Alerts'}
          </button>

          <button
            onClick={() => setActiveTab('workOrders')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'workOrders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isAr ? 'أوامر العمل' : 'Work Orders'}</span>
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">
              {workOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'emails'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-rose-300" />
            <span>{isAr ? 'تنبيهات البريد P1' : 'P1 Email Alerts'}</span>
            {emailAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono font-bold animate-pulse">
                {emailAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('eventBus')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'eventBus'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'ناقل الأحداث' : 'Event Bus'}</span>
          </button>
        </div>
      </div>

      {/* Synergistic Pipeline Workflow Visualizer */}
      <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-900 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'مسار الأتمتة الميدانية (SolVision → AtlasCloud → Kareema):' : 'Automated Field Synergy Workflow:'}</span>
          </span>
          <span className="font-mono text-emerald-400">Zero-Latency Event Loop</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-1.5 rounded bg-teal-950/40 border border-teal-800/40 text-teal-300">
            <span className="font-bold block text-teal-200">1. SolVision</span>
            <span>{isAr ? 'رصد انخفاض NDVI < العتبة' : 'Detect NDVI Stress < 0.40'}</span>
          </div>
          <div className="p-1.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
            <span className="font-bold block text-indigo-200">2. AtlasCloud</span>
            <span>{isAr ? 'حساب Bounding Box وإصدار WO' : 'PostGIS BBOX & Dispatch'}</span>
          </div>
          <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
            <span className="font-bold block text-cyan-200">3. Kareema Ops</span>
            <span>{isAr ? 'توجيه الأسطول وفنيي الري' : 'Field Crew Dispatch & IoT'}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {/* Tab 1: Real-time Threshold Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {/* Role Guide Prompt if specific role is selected */}
            {currentRole !== 'ALL' && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between gap-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    {isAr
                      ? `دورك التشغيلي الحالي: ${currentRole === 'OPERATIONS_SUPERVISOR' ? 'مشرف غرفة العمليات' : currentRole === 'GIS_ENGINEER' ? 'مهندس الاستشعار الزراعي' : currentRole === 'FLEET_MANAGER' ? 'قائد الأسطول الميداني' : 'مراقب المراعي والحيوان'} (راجع مهامك وفق وثيقة SOP-2026-V1)`
                      : `Active SOP Role: ${currentRole} (Follow SOP-SOL-OPS-2026-V1 protocols)`}
                  </span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">SOP Active</span>
              </div>
            )}

            {/* Alert 1: Pivot #2 Water Stress */}
            {stressedPivot && (
              <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-900/60 border border-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-200">
                        {isAr ? 'إجهاد مائي حاد في المحور 02' : 'Severe Water Stress: Pivot #02'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-300 border border-rose-700 font-bold">
                        P1 CRITICAL
                      </span>
                      {/* Live SLA Countdown Badge */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-500/60 text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>{isAr ? 'SLA متبقي: 07:18 دقيقة' : 'SLA: 07:18 rem'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-rose-300/80 mt-1">
                      {isAr
                        ? `هبط مؤشر NDVI إلى 0.38 في الربع الشمالي الشرقي (NE-4). هبوط في ضغط الري إلى 1.8 بار.`
                        : `NDVI dropped to 0.38 in Sector NE-4. Irrigation pressure down to 1.8 bar.`}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                      <span>PostGIS BBOX: [24.187N, 47.339E]</span>
                      <span>·</span>
                      <span className="text-cyan-400">{isAr ? 'SOP الخطوة 1: تم التحقق' : 'SOP Step 1: Triaged'}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {pivotWorkOrderExists ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'تم إطلاق أمر العمل (الخطوة 2)' : 'WO Dispatched (Step 2)'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDispatchStressWorkOrder(stressedPivot)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تحويل بنقرة واحدة (1-Click WO)' : '1-Click Dispatch'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Alert 2: Cattle Zone B Overgrazing Warning */}
            {overgrazingHerd && (
              <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-900/60 border border-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Radio className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-200">
                        {isAr ? 'تحذير رعي جائر: قطيع النعيمي (المنطقة B)' : 'Overgrazing Warning: Herd Zone B'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300 border border-amber-700 font-bold">
                        P2 HIGH
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500/60 text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isAr ? 'SLA متبقي: 19:42 دقيقة' : 'SLA: 19:42 rem'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/80 mt-1">
                      {isAr
                        ? `انخفاض كثافة الغطاء النباتي الرعوي بنسبة 48%. يتطلب توجيه الرعاة للمرعى البديل (المنطقة D).`
                        : `Vegetation biomass down 48%. Rangeland algorithm recommends rotational diversion to Zone D.`}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      RFID Head Count: {overgrazingHerd.count} · {isAr ? 'SOP الخطوة 2: تحويل الرعي التناوبي' : 'SOP Step 2: Rotational Routing'}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {herdWorkOrderExists ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'أمر التوجيه نشط' : 'Diversion Active'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDispatchGrazingWorkOrder(overgrazingHerd)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تفعيل الرعي التناوبي الفوري' : 'Enforce Rotational Grazing'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Alert 3: Fleet Drone Deviation */}
            <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-900/60 border border-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Navigation className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-sky-200">
                      {isAr ? 'انحراف مسار الأسطول: مسيرة الدرّون 05' : 'Route Deviation: Scout Drone 05'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-900/80 text-sky-300 border border-sky-700 font-bold">
                      P2 HIGH
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-500/60 text-sky-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{isAr ? 'SLA متبقي: 24:10 دقيقة' : 'SLA: 24:10 rem'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-sky-300/80 mt-1">
                    {isAr
                      ? `انحراف 320 متراً عن الممر الطيفي المخصص لمسح المحور 02. السرعة: 48 كم/س.`
                      : `320m drift off designated multispectral scanning corridor. Velocity: 48 km/h.`}
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    FLEET-GPS-DRN-05 · Battery: 74%
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => onRecenterFleetCorridor('FLEET-GPS-DRN-05')}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md transition-colors"
                >
                  {isAr ? 'إعادة ضبط المسار الآلي' : 'Auto-Recenter Corridor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dispatched Work Orders */}
        {activeTab === 'workOrders' && (
          <div className="space-y-3">
            {workOrders.map((order) => {
              const isCompleted = order.status === 'COMPLETED';

              return (
                <div
                  key={order.order_id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-colors ${
                    isCompleted
                      ? 'bg-slate-900/40 border-slate-800 opacity-80'
                      : 'bg-slate-900/80 border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{order.order_id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">ETA: {order.etaMinutes} mins</span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">{order.createdAt}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {isAr ? order.title : order.titleEn}
                    </h4>
                    <p className="text-xs text-slate-300/90 mt-1">
                      {isAr ? order.description : order.descriptionEn}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                    <div>
                      <span className="text-slate-500">{isAr ? 'الفني المكلف: ' : 'Assigned Tech: '}</span>
                      <span className="text-slate-200">{order.assignedTechnician}</span>
                    </div>
                    {order.assignedFleetId && (
                      <div>
                        <span className="text-slate-500">{isAr ? 'المركبة: ' : 'Vehicle: '}</span>
                        <span className="text-cyan-300">{order.assignedFleetId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">BBOX: </span>
                      <span className="text-slate-300">[{order.bbox.minLat}, {order.bbox.minLng}]</span>
                    </div>
                  </div>

                  {/* Completion resolution notes if completed */}
                  {order.completionNotes && (
                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300">
                      <span className="font-bold">{isAr ? 'تقرير الإنجاز الميداني: ' : 'Field Resolution Report: '}</span>
                      <span>{order.completionNotes}</span>
                    </div>
                  )}

                  {/* Complete Action */}
                  {!isCompleted && (
                    <div className="pt-1 flex items-center justify-end gap-2">
                      {resolvingOrderId === order.order_id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            placeholder={isAr ? 'أدخل ملاحظات الصيانة الميدانية...' : 'Enter field maintenance notes...'}
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => {
                              onCompleteWorkOrder(order.order_id, resolutionNotes || (isAr ? 'تم استبدال الفوهات التالفة واستعادة ضغط الري بنجاح إلى 3.9 بار.' : 'Replaced damaged nozzles and restored pressure to 3.9 bar.'));
                              setResolvingOrderId(null);
                              setResolutionNotes('');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                          >
                            {isAr ? 'تأكيد الإنجاز' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setResolvingOrderId(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {onOpenMobileSimulatorWithOrder && (
                            <button
                              onClick={() => onOpenMobileSimulatorWithOrder(order)}
                              className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 text-xs font-medium border border-cyan-700/60 transition-colors flex items-center gap-1.5"
                              title="Inspect on Kareema Mobile Field App"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{isAr ? 'تطبيق Kareema الميداني' : 'Kareema Mobile App'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setResolvingOrderId(order.order_id)}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            {isAr ? 'تسجيل إنجاز المهمة الميدانية' : 'Mark Completed with Report'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email Alert Banner for P1 Drought Orders */}
                  {(order.severity === 'CRITICAL' || order.order_id.includes('CRISIS') || order.slaLevel === 'P1_CRITICAL') && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-mono">
                        <Mail className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        <span>{isAr ? 'تم إرسال إيميل P1 آلي للفني الميداني' : 'Automated P1 email dispatched to technician'}</span>
                      </div>
                      <button
                        onClick={() => onOpenEmailModalWithOrder ? onOpenEmailModalWithOrder(order.order_id) : onOpenEmailModal ? onOpenEmailModal() : undefined}
                        className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800 text-[10px] font-bold font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-rose-400" />
                        <span>{isAr ? 'معاينة البريد' : 'Preview Email'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Kafka / RabbitMQ Event Bus Stream */}
        {activeTab === 'eventBus' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
              <span>TOPIC / PAYLOAD STREAM</span>
              <span>SHA-256 SIGNATURE</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {events.slice(0, 15).map((evt) => (
                <div
                  key={evt.event_id}
                  onClick={() => setSelectedEventForInspection(evt)}
                  className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        evt.sourceSystem === 'SolVision' ? 'bg-teal-400' :
                        evt.sourceSystem === 'AtlasCloud' ? 'bg-indigo-400' : 'bg-cyan-400'
                      }`}></span>
                      <span className="font-bold text-white">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-500">[{evt.sourceSystem}]</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{evt.timestamp.split(' ')[1] || evt.timestamp}</span>
                  </div>

                  <div className="text-slate-400 text-[10px] truncate">
                    Topic: <span className="text-emerald-400">{evt.topic}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate">
                    Hash: {evt.signatureHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Automated Email Alerts */}
        {activeTab === 'emails' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {isAr ? 'خدمة الإشعارات والتنبيه الآلي بالبريد الإلكتروني للفنيين' : 'Automated Technician Email Alert Dispatch Service'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr 
                      ? 'يتم إرسال تنبيهات بريدية فورية مشفرة بـ TLS 1.3 للفنيين الميدانيين مع نسخة للمشرف عند إطلاق أوامر عمل P1 الحرجة.'
                      : 'Real-time TLS 1.3 encrypted email dispatches transmitted automatically to technicians upon P1 drought order issuance.'}
                  </p>
                </div>
              </div>
              {onOpenEmailModal && (
                <button
                  onClick={onOpenEmailModal}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فتح مركز البريد الكامل' : 'Open Full Console'}</span>
                </button>
              )}
            </div>

            {emailAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>{isAr ? 'لم يتم إرسال أي تنبيهات بريدية بعد. يتم الإرسال آلياً فور إطلاق أوامر P1 أثناء الجفاف.' : 'No automated email alerts dispatched yet. Dispatches trigger automatically during P1 drought events.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {emailAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 text-xs">{alert.workOrderId}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          P1 CRITICAL
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          alert.status === 'ACKNOWLEDGED'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{alert.sentAt}</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {isAr ? alert.subjectAr : alert.subject}
                      </h4>
                      <p className="text-[11px] text-slate-300/80 mt-0.5">
                        {alert.assetName} • {alert.sector} • Vehicle: {alert.assignedFleet}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-850 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500">TO: </span>
                        <span className="text-white font-semibold">{alert.recipientName} ({alert.recipientEmail})</span>
                      </div>
                      <button
                        onClick={() => onOpenEmailModalWithOrder ? onOpenEmailModalWithOrder(alert.workOrderId) : onOpenEmailModal ? onOpenEmailModal() : undefined}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isAr ? 'عرض نص البريد' : 'Read Email'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Payload Inspection Modal */}
      {selectedEventForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{selectedEventForInspection.eventType}</span>
              </span>
              <button onClick={() => setSelectedEventForInspection(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Event ID (UUIDv4): <span className="text-white">{selectedEventForInspection.event_id}</span></p>
              <p className="text-slate-400 text-[11px]">Topic: <span className="text-emerald-400">{selectedEventForInspection.topic}</span></p>
              <p className="text-slate-400 text-[11px]">Source: <span className="text-cyan-400">{selectedEventForInspection.sourceSystem}</span></p>
              <p className="text-slate-400 text-[11px]">Signature: <span className="text-amber-400">{selectedEventForInspection.signatureHash}</span></p>
            </div>
            <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-56">
              {JSON.stringify(selectedEventForInspection.payload, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEventForInspection(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
