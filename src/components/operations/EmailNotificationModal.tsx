import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Server, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  RefreshCw, 
  Flame, 
  Smartphone, 
  Radio, 
  ChevronRight,
  Eye,
  Settings,
  BellRing
} from 'lucide-react';
import { AutomatedEmailAlert, Language, TechnicianContact, WorkOrder } from '../../types/ecosystem';
import { notificationService, FIELD_TECHNICIANS } from '../../services/notificationService';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  alerts: AutomatedEmailAlert[];
  onTriggerTestAlert?: () => void;
  selectedAlertId?: string;
  onOpenMobileSimulatorWithOrder?: (order: WorkOrder) => void;
  workOrders?: WorkOrder[];
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  alerts,
  onTriggerTestAlert,
  selectedAlertId,
  onOpenMobileSimulatorWithOrder,
  workOrders = []
}) => {
  const isAr = language === 'ar';
  const [activeAlertId, setActiveAlertId] = useState<string>(
    selectedAlertId || alerts[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DELIVERED' | 'ACKNOWLEDGED'>('ALL');
  const [viewMode, setViewMode] = useState<'HTML' | 'RAW_TEXT'>('HTML');
  const [copiedId, setCopiedId] = useState(false);
  const [supervisorEmailInput, setSupervisorEmailInput] = useState(notificationService.getSupervisorEmail());
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(notificationService.isAutoAlertEnabled());

  // Keep activeAlertId updated when alerts change
  React.useEffect(() => {
    if (!activeAlertId && alerts.length > 0) {
      setActiveAlertId(alerts[0].id);
    } else if (selectedAlertId) {
      setActiveAlertId(selectedAlertId);
    }
  }, [alerts, selectedAlertId]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSearch = 
        a.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'ALL' || a.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [alerts, searchQuery, filterStatus]);

  const currentAlert = useMemo(() => {
    return alerts.find(a => a.id === activeAlertId) || alerts[0] || null;
  }, [alerts, activeAlertId]);

  if (!isOpen) return null;

  const handleCopyMessageId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveSupervisor = () => {
    notificationService.setSupervisorEmail(supervisorEmailInput);
    setIsEditingSupervisor(false);
  };

  const handleToggleAutoSend = () => {
    const next = !autoSendEnabled;
    setAutoSendEnabled(next);
    notificationService.setAutoAlertEnabled(next);
  };

  const handleAcknowledge = (alertId: string, action: 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SITE') => {
    notificationService.acknowledgeAlert(alertId, action);
  };

  const handleOpenMobileForAlert = (alert: AutomatedEmailAlert) => {
    const wo = workOrders.find(w => w.order_id === alert.workOrderId);
    if (wo && onOpenMobileSimulatorWithOrder) {
      onOpenMobileSimulatorWithOrder(wo);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-emerald-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Mail className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'خدمة الإشعارات والتنبيه الآلي بالبريد الإلكتروني' : 'Automated Email Notification Service'}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                    P1 DROUGHT CRISIS
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'إرسال تنبيهات بريدية فورية للفنيين الميدانيين عند إطلاق أوامر عمل P1 الحرجة أثناء موجات الجفاف.'
                  : 'Instant automated email dispatch to field technicians upon P1 Critical Work Order release during drought events.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerTestAlert && (
              <button
                onClick={onTriggerTestAlert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                title="Send test P1 drought email alert"
              >
                <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>{isAr ? 'إرسال تنبيه تجريبي P1' : 'Send Test P1 Alert'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-banner: Supervisor CC & Delivery Stats */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{isAr ? 'نسخة المشرف (CC):' : 'Supervisor CC:'}</span>
              {isEditingSupervisor ? (
                <div className="flex items-center gap-1">
                  <input
                    type="email"
                    value={supervisorEmailInput}
                    onChange={(e) => setSupervisorEmailInput(e.target.value)}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono w-56"
                    placeholder="supervisor@domain.com"
                  />
                  <button
                    onClick={handleSaveSupervisor}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                  >
                    {isAr ? 'حفظ' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-cyan-300 font-semibold">{supervisorEmailInput}</span>
                  <button
                    onClick={() => setIsEditingSupervisor(true)}
                    className="text-slate-500 hover:text-slate-300 text-[10px] underline"
                  >
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-slate-400">{isAr ? 'الإرسال التلقائي:' : 'Auto-Dispatch:'}</span>
              <button
                onClick={handleToggleAutoSend}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
                  autoSendEnabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {autoSendEnabled ? (isAr ? 'مفعل (نشط)' : 'ACTIVE (ENABLED)') : (isAr ? 'معطل' : 'DISABLED')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{alerts.length} {isAr ? 'رسالة تم إرسالها' : 'Dispatched'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{alerts.filter(a => a.status === 'ACKNOWLEDGED').length} {isAr ? 'تم استلامها' : 'Acknowledged'}</span>
            </span>
          </div>
        </div>

        {/* Main Content: Split Pane */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Email Dispatches Feed */}
          <div className="md:col-span-5 border-r border-slate-800/80 flex flex-col min-h-0 bg-slate-950/60">
            {/* Search and Filters */}
            <div className="p-3 border-b border-slate-850 space-y-2 bg-slate-900/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث برقم الأمر أو الفني أو القطاع...' : 'Search order, technician, sector...'}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    filterStatus === 'ALL'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'} ({alerts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('DELIVERED')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    filterStatus === 'DELIVERED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'تم التسليم' : 'Delivered'}
                </button>
                <button
                  onClick={() => setFilterStatus('ACKNOWLEDGED')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    filterStatus === 'ACKNOWLEDGED'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'تم الإقرار' : 'Acknowledged'}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-2 space-y-1">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p>{isAr ? 'لا توجد تنبيهات بريدية مطابقة.' : 'No automated email alerts found.'}</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isSelected = alert.id === currentAlert?.id;
                  const isAck = alert.status === 'ACKNOWLEDGED';

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setActiveAlertId(alert.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border border-rose-500/40 shadow-md ring-1 ring-rose-500/20'
                          : 'bg-slate-900/40 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white">{alert.workOrderId}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            P1 CRITICAL
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{alert.sentAt.slice(11, 19)} UTC</span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200 truncate mb-1">
                        {alert.recipientName}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mb-2">
                        {alert.assetName} • {alert.sector}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500 truncate max-w-[150px]">{alert.recipientEmail}</span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          isAck 
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {isAck ? 'ACKNOWLEDGED' : 'DELIVERED'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Realistic Email Reader Preview */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-slate-950 overflow-y-auto">
            {currentAlert ? (
              <div className="p-5 space-y-4">
                {/* Email Metadata Card */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        RFC 5322 AUTOMATED DISPATCH EMAIL
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === 'HTML' ? 'RAW_TEXT' : 'HTML')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                      >
                        {viewMode === 'HTML' ? 'View Plain Text' : 'View Formatted HTML'}
                      </button>
                      <button
                        onClick={() => handleCopyMessageId(currentAlert.messageId)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750"
                        title="Copy Message-ID"
                      >
                        {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>ID</span>
                      </button>
                    </div>
                  </div>

                  {/* Header Details */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 w-16 shrink-0">FROM:</span>
                      <span className="text-emerald-400 font-semibold truncate">
                        Kareema Autonomous Dispatch System &lt;dispatch-alerts@kareema.sovereign.dz&gt;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 w-16 shrink-0">TO:</span>
                      <span className="text-white font-semibold truncate">
                        {currentAlert.recipientName} &lt;{currentAlert.recipientEmail}&gt;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 w-16 shrink-0">CC:</span>
                      <span className="text-cyan-300 truncate">
                        Supervisor &lt;{currentAlert.supervisorCc}&gt;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 w-16 shrink-0">SUBJECT:</span>
                      <span className="text-rose-400 font-bold truncate">
                        {isAr ? currentAlert.subjectAr : currentAlert.subject}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                      <span>DATE: {currentAlert.sentAt}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>TLS 1.3 Sovereign MTA Relay Verified</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technician Immediate Response Actions Toolbar */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-rose-300 font-bold block mb-0.5">
                      {isAr ? 'إجراءات الفني الميداني الفورية (Technician Field Actions):' : 'Technician Field Response Actions:'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {currentAlert.status === 'ACKNOWLEDGED'
                        ? (isAr ? `تم الإقرار بواسطة الفني في: ${currentAlert.acknowledgedAt}` : `Acknowledged by technician at: ${currentAlert.acknowledgedAt}`)
                        : (isAr ? 'في انتظار إقرار الفني والتحرك الميداني نحو الموقع.' : 'Awaiting responder acknowledgement & dispatch to coordinates.')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentAlert.status !== 'ACKNOWLEDGED' ? (
                      <button
                        onClick={() => handleAcknowledge(currentAlert.id, 'ACKNOWLEDGED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إقرار الاستلام (Acknowledge)' : 'Acknowledge Dispatch'}</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1.5 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ACKNOWLEDGED & EN ROUTE</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenMobileForAlert(currentAlert)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isAr ? 'تطبيق Kareema الميداني' : 'Open Field App'}</span>
                    </button>
                  </div>
                </div>

                {/* Email Body Rendering */}
                {viewMode === 'HTML' ? (
                  <div 
                    className="rounded-xl overflow-hidden shadow-lg border border-slate-800"
                    dangerouslySetInnerHTML={{ __html: currentAlert.emailBodyHtml }}
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentAlert.emailBodyText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Mail className="w-12 h-12 text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-400 mb-1">
                  {isAr ? 'حدد رسالة تنبيه لمعاينتها' : 'Select an alert to preview email'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  {isAr 
                    ? 'سيتم هنا عرض نص وهيكل البريد الإلكتروني المرسل للفنيين الميدانيين.' 
                    : 'The complete RFC 5322 formatted email alert will be rendered here.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Technician Directory */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">{isAr ? 'الفنيون المعتمدون في الدليل:' : 'Certified Responders:'}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FIELD_TECHNICIANS.slice(0, 4).map(t => (
                <span
                  key={t.id}
                  className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                  title={`${t.email} (${t.phone})`}
                >
                  {isAr ? t.nameAr : t.nameEn} ({t.assignedFleetId})
                </span>
              ))}
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Sovereign MTA Node: DZ-North-1 (Algiers Cluster)
          </div>
        </div>
      </div>
    </div>
  );
};
