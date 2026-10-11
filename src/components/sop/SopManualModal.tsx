import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  Satellite, 
  Truck, 
  Radio, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Download, 
  Printer, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Layers,
  HardDrive,
  Users
} from 'lucide-react';
import { Language, UserRole } from '../../types/ecosystem';
import { SOP_ROLES, SOP_SLA_MATRIX } from '../../data/mockData';

interface SopManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const SopManualModal: React.FC<SopManualModalProps> = ({
  isOpen,
  onClose,
  language,
  currentRole,
  onSelectRole
}) => {
  const isAr = language === 'ar';
  const [activeSection, setActiveSection] = useState<'all' | 'roles' | 'sla' | 'workflow' | 'contingency' | 'kpis'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {isAr ? 'دليل الممارسات التشغيلية المعياري (SOP)' : 'Standard Operating Procedure (SOP)'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-bold">
                  SOP-SOL-OPS-2026-V1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'مركز العمليات الجغرافية الموحد — منظومة SOL-Ecosystem (SolVision × Kareema × AtlasCloud)'
                  : 'Unified GIS Operations Center — SOL-Ecosystem (Certified Oct 2026)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print SOP"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'all' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'عرض الدليل كاملاً' : 'Full Manual'}
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'roles' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'الأدوار والمسؤوليات' : 'Roles & Matrix'}
          </button>
          <button
            onClick={() => setActiveSection('sla')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'sla' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'مستويات الخطورة و SLA' : 'Alert SLAs'}
          </button>
          <button
            onClick={() => setActiveSection('workflow')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'workflow' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'دورة العمل التشغيلية' : '4-Step Workflow'}
          </button>
          <button
            onClick={() => setActiveSection('contingency')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'contingency' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'إجراءات الطوارئ' : 'Contingency'}
          </button>
          <button
            onClick={() => setActiveSection('kpis')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'kpis' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'مؤشرات الأداء (KPIs)' : 'KPIs'}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Section 1: Purpose & Objective */}
          {(activeSection === 'all') && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{isAr ? '1. الغرض والهدف (Purpose & Objective)' : '1. Purpose & Objective'}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'تحديد الإجراءات التشغيلية القياسية لإدارة ومتابعة التنبيهات الصادرة عن لوحة التحكم الموحدة (SOL-Ecosystem Unified Console)، وضمان الاستجابة السريعة للتنبيهات الصادرة من SolVision عبر إطلاق وتوجيه أوامر العمل (Work Orders) الميدانية في Kareema، مع حفظ وتوثيق كافة العمليات داخل السحابة السيادية AtlasCloud.'
                  : 'Define standard operating procedures for triaging alerts from the SOL-Ecosystem Unified Console, ensuring rapid dispatch from SolVision detections to Kareema field crews while preserving full cryptographic lineage in AtlasCloud.'}
              </p>
            </div>
          )}

          {/* Section 2: Roles & Responsibilities */}
          {(activeSection === 'all' || activeSection === 'roles') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? '2. أدوار الموظفين والمسؤوليات (Roles & Responsibilities)' : '2. Roles & Responsibilities'}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? 'انقر على الدور لتفعيله في لوحة التحكم' : 'Click role to switch active view'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SOP_ROLES.map((role) => {
                  const isCurrent = currentRole === role.id;
                  const Icon = role.id === 'OPERATIONS_SUPERVISOR' ? ShieldCheck :
                               role.id === 'GIS_ENGINEER' ? Satellite :
                               role.id === 'FLEET_MANAGER' ? Truck : Radio;

                  return (
                    <div
                      key={role.id}
                      onClick={() => onSelectRole(role.id as UserRole)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <h4 className="text-xs font-bold text-white">
                            {isAr ? role.titleAr : role.titleEn}
                          </h4>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                            {isAr ? 'نشط حالياً' : 'ACTIVE'}
                          </span>
                        )}
                      </div>

                      <ul className="text-xs space-y-1 text-slate-400 pl-4 list-disc">
                        {(isAr ? role.responsibilitiesAr : role.responsibilitiesEn).map((resp, idx) => (
                          <li key={idx} className="leading-snug">{resp}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Alert Matrix & Escalation SLA */}
          {(activeSection === 'all' || activeSection === 'sla') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isAr ? '3. تصنيف التنبيهات ومستويات الاستجابة (Alert Matrix & Escalation SLA)' : '3. Alert Matrix & Escalation SLA'}</span>
              </h3>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-3.5 py-2.5">{isAr ? 'مستوى الخطورة' : 'Severity'}</th>
                      <th className="px-3.5 py-2.5">{isAr ? 'نوع التنبيه / المؤشر' : 'Alert Indicator'}</th>
                      <th className="px-3.5 py-2.5">{isAr ? 'زمن الاستجابة (SLA)' : 'Required SLA'}</th>
                      <th className="px-3.5 py-2.5">{isAr ? 'الإجراء التشغيلي المطلوب' : 'Required Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {SOP_SLA_MATRIX.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="px-3.5 py-2.5 font-bold whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            item.level === 'P1_CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            item.level === 'P2_HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            item.level === 'P3_MEDIUM' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                            'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {isAr ? item.titleAr : item.titleEn}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-300">
                          {isAr ? item.typeAr : item.typeEn}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-cyan-400 font-bold whitespace-nowrap">
                          {isAr ? item.slaTextAr : item.slaTextEn}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-400 text-[11px]">
                          {isAr ? item.actionAr : item.actionEn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Operational Workflow */}
          {(activeSection === 'all' || activeSection === 'workflow') && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? '4. خطوات دورة العمل التشغيلية (Standard Operational Workflow)' : '4. Standard Operational Workflow'}</span>
              </h3>

              {/* Workflow Flowchart Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-center flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300">
                <div className="p-2 rounded bg-teal-950/60 border border-teal-800 text-teal-300 font-bold">
                  [ SolVision ]<br/><span className="text-[10px] text-slate-400">تنبيه طيفي تلقائي</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
                <div className="p-2 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-bold">
                  [ لوحة GIS / مراجعة BBOX ]<br/><span className="text-[10px] text-slate-400">تحقق خلال زمن SLA</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
                <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-bold">
                  [ Kareema Work Order ]<br/><span className="text-[10px] text-slate-400">إسناد وتوجيه الأسطول</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
                  [ AtlasCloud Vault ]<br/><span className="text-[10px] text-slate-400">ختم وتوثيق SHA-256</span>
                </div>
              </div>

              {/* Detailed 4 Steps */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>{isAr ? 'الخطوة 1: استلام التنبيه والتحقق المكاني (Alert Triaging)' : 'Step 1: Alert Triaging'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'عند صدور حدث EVENT_CROP_STRESS_DETECTED، يضغط المهندس على التنبيه لاستعراض Bounding Box Overlay الخاص بالقطاع المتأثر على الخريطة التفاعلية، ومقارنة التغير الزمني لمؤشر NDVI عبر Satellite Time-Series Slider.'
                      : 'Upon EVENT_CROP_STRESS_DETECTED, inspect the Bounding Box overlay on the GIS map and compare the 10-day NDVI variance using the Satellite Time-Series slider.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>{isAr ? 'الخطوة 2: إصدار وتوجيه أمر العمل (Work Order Dispatch)' : 'Step 2: Work Order Dispatch'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'الضغط على زر "تحويل إلى أمر عمل ميداني" (1-Click Work Order) لتعبئة Asset ID والإحداثيات الجغرافية ونوع التدخل آلياً، واختيار أقرب فرقة صيانة بناءً على موقع Fleet GPS Tracker اللحظي.'
                      : 'Trigger 1-Click Work Order to auto-populate Asset ID UUIDv4, coordinates, and intervention type, dispatching to the nearest fleet unit.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>{isAr ? 'الخطوة 3: التنفيذ الميداني والإغلاق (Field Execution & Sign-off)' : 'Step 3: Field Execution & Sign-off'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'يتلقى الفني التكليف عبر تطبيق Kareema، وينفذ الصيانة (مثل استبدال الفوهات التالفة)، ثم يرفع تقريراً مصوراً ويثبت إنهاء العمل ليقوم المشرف باعتماد الإغلاق النهائي.'
                      : 'Field technician executes instructions via Kareema mobile terminal, uploads photo verification, and submits for supervisor sign-off.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] flex items-center justify-center font-bold">4</span>
                    <span>{isAr ? 'الخطوة 4: الحفظ السيادي وإصدار شهادة الجودة (Sovereign Archiving & Quality Passport)' : 'Step 4: Sovereign Archiving & Quality Passport'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'تقوم AtlasCloud بتجميع سجلات التدخل الميداني وقراءات SolVision لربطها بـ crop_batch_id، وتوقيع السجل بختم تشفيري SHA-256 وشجرة Merkle Root لضمان سلامة الإنتاج من البذرة إلى الصومعة.'
                      : 'AtlasCloud aggregates intervention history with crop_batch_id, sealing with SHA-256 and Merkle proof into the sovereign vault.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Contingency Plans */}
          {(activeSection === 'all' || activeSection === 'contingency') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-rose-400" />
                <span>{isAr ? '5. إجراءات الطوارئ وانقطاع الخدمة (Contingency Plans)' : '5. Contingency Plans'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isAr ? 'أ. انقطاع شبكة الاتصالات الميدانية (Offline Mode)' : 'A. Field Telemetry Outage (Offline Mode)'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'تُحفظ كافة أوامر العمل وقراءات الأجهزة في تطبيق Kareema الميداني محلياً عبر IndexedDB المشفر مع إعادة المزامنة التلقائية فور عودة التغطية.'
                      : 'Work orders and GPS logs are preserved locally in Kareema mobile IndexedDB vault with automated sync on reconnection.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isAr ? 'ب. تعثر ناقل الأحداث (Kafka Bus Latency Failover)' : 'B. Kafka Event Bus Failover'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'التحويل التلقائي إلى خادم الإشعارات النسبي في AtlasCloud (Failover System) مع رفع تنبيه P1 لمهندس البنية التحتية.'
                      : 'Automatic failover to AtlasCloud reserve pub/sub broker with immediate P1 escalation to infrastructure DevOps.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Operations KPIs */}
          {(activeSection === 'all' || activeSection === 'kpis') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? '6. مؤشرات الأداء الرئيسية لغرفة العمليات (Operations KPIs)' : '6. Operations KPIs'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'متوسط زمن الاستجابة (MTTR)' : 'Mean Time to Respond (MTTR)'}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">14.2 min</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Target: &lt; 20 min (P1)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'دقة التنبؤ الطيفي SolVision' : 'Prediction Accuracy'}
                  </span>
                  <span className="text-xl font-bold font-mono text-cyan-400">96.8%</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Target: &ge; 95% Match</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'نسبة التشفير السيادي للإنتاج' : 'Sovereign Encryption Rate'}
                  </span>
                  <span className="text-xl font-bold font-mono text-teal-400">100.0%</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Target: 100% Sealed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            <span>Doc ID: SOP-SOL-OPS-2026-V1</span>
            <span className="mx-2">·</span>
            <span>Kingdom of Saudi Arabia</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            {isAr ? 'فهمت الإجراءات المعيارية' : 'Acknowledge SOP'}
          </button>
        </div>
      </div>
    </div>
  );
};
