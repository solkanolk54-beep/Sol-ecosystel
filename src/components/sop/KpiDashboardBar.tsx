import React from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  BookOpen, 
  Smartphone, 
  Users, 
  TrendingUp,
  Cpu
} from 'lucide-react';
import { OperationsKPIs, Language, UserRole } from '../../types/ecosystem';

interface KpiDashboardBarProps {
  kpis: OperationsKPIs;
  language: Language;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenSopManual: () => void;
  onOpenMobileSimulator: () => void;
}

export const KpiDashboardBar: React.FC<KpiDashboardBarProps> = ({
  kpis,
  language,
  currentRole,
  onSelectRole,
  onOpenSopManual,
  onOpenMobileSimulator
}) => {
  const isAr = language === 'ar';

  const roleLabels: Record<UserRole, { ar: string; en: string }> = {
    ALL: { ar: 'كافة الأدوار (شامل)', en: 'All Roles (Overview)' },
    OPERATIONS_SUPERVISOR: { ar: 'مشرف غرفة العمليات', en: 'Operations Supervisor' },
    GIS_ENGINEER: { ar: 'مهندس الاستشعار الزراعي', en: 'GIS Engineer' },
    FLEET_MANAGER: { ar: 'قائد الأسطول الميداني', en: 'Fleet Manager' },
    LIVESTOCK_CONTROLLER: { ar: 'مراقب المراعي والحيوان', en: 'Livestock Controller' }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Role Picker (Section 2 of SOP) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isAr ? 'الدور التشغيلي (SOP Role):' : 'Active Role:'}</span>
        </div>
        <select
          value={currentRole}
          onChange={(e) => onSelectRole(e.target.value as UserRole)}
          className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="ALL">{isAr ? roleLabels.ALL.ar : roleLabels.ALL.en}</option>
          <option value="OPERATIONS_SUPERVISOR">{isAr ? roleLabels.OPERATIONS_SUPERVISOR.ar : roleLabels.OPERATIONS_SUPERVISOR.en}</option>
          <option value="GIS_ENGINEER">{isAr ? roleLabels.GIS_ENGINEER.ar : roleLabels.GIS_ENGINEER.en}</option>
          <option value="FLEET_MANAGER">{isAr ? roleLabels.FLEET_MANAGER.ar : roleLabels.FLEET_MANAGER.en}</option>
          <option value="LIVESTOCK_CONTROLLER">{isAr ? roleLabels.LIVESTOCK_CONTROLLER.ar : roleLabels.LIVESTOCK_CONTROLLER.en}</option>
        </select>
      </div>

      {/* KPI Badges (Section 6 of SOP) */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-mono">
        {/* MTTR */}
        <div className="flex items-center gap-1.5" title="Mean Time To Respond (Target < 20 min)">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">MTTR:</span>
          <span className="font-bold text-white">{kpis.mttrMinutes}m</span>
          <span className="text-[10px] text-emerald-400">(&lt;20m)</span>
        </div>

        {/* Prediction Accuracy */}
        <div className="flex items-center gap-1.5" title="SolVision Spectral Match Rate (Target >= 95%)">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">{isAr ? 'دقة التنبؤ:' : 'Accuracy:'}</span>
          <span className="font-bold text-white">{kpis.predictionAccuracyPercent}%</span>
          <span className="text-[10px] text-cyan-400">(&ge;95%)</span>
        </div>

        {/* Sovereign Encryption Rate */}
        <div className="hidden md:flex items-center gap-1.5" title="Sovereign Vault Cryptographic Sealing">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400 text-[11px]">{isAr ? 'التشفير السيادي:' : 'Sovereign:'}</span>
          <span className="font-bold text-teal-300">{kpis.sovereignEncryptionPercent}%</span>
        </div>

        {/* P1 SLA Compliance */}
        <div className="flex items-center gap-1.5" title="P1 Critical Alerts Resolved within SLA">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 text-[11px]">SLA:</span>
          <span className="font-bold text-emerald-400">{kpis.p1SlaCompliancePercent}%</span>
        </div>
      </div>

      {/* Quick Launch SOP & Mobile Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSopManual}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          title="Open SOP-SOL-OPS-2026-V1"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAr ? 'دليل الإجراءات المعياري (SOP)' : 'SOP Manual'}</span>
        </button>

        <button
          onClick={onOpenMobileSimulator}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold transition-colors"
          title="Open Kareema Field Mobile Terminal"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isAr ? 'محاكي تطبيق Kareema' : 'Kareema Mobile'}</span>
        </button>
      </div>
    </div>
  );
};
