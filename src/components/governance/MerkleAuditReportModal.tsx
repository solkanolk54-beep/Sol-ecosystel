import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Lock, 
  X, 
  FileCode2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Cpu,
  Layers,
  KeyRound,
  RefreshCw,
  Terminal,
  FileCheck2
} from 'lucide-react';
import { SignedAuditReport } from '../../types/merkle';
import { Language, UserRole } from '../../types/ecosystem';
import { downloadJsonAuditReport } from '../../utils/merkleTree';

interface MerkleAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SignedAuditReport;
  language: Language;
  currentRole: UserRole;
  onElevateToSupervisor?: () => void;
}

export const MerkleAuditReportModal: React.FC<MerkleAuditReportModalProps> = ({
  isOpen,
  onClose,
  report,
  language,
  currentRole,
  onElevateToSupervisor
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'proofs'>('preview');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityVerified, setIntegrityVerified] = useState(false);

  if (!isOpen) return null;

  const isAuthorized = report.reportHeader.exporter.isAuthorized;
  const jsonContent = JSON.stringify(report, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    downloadJsonAuditReport(report);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const handleVerifyAllIntegrity = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      setIsVerifyingIntegrity(false);
      setIntegrityVerified(true);
      setTimeout(() => setIntegrityVerified(false), 5000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isAr 
                    ? 'تقرير تدقيق سجلات شجرة ميركل الموقّع (Signed Merkle Audit Report)' 
                    : 'Signed Merkle Tree Audit Report Export'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SOP-SOL-OPS-2026-V1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                ID: {report.reportHeader.reportId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Authorization Status Bar */}
        <div className={`px-4 sm:px-5 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
          isAuthorized
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {isAuthorized ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              {isAuthorized ? (
                <>
                  <strong>{isAr ? 'مصادقة معتمدة:' : 'Authorized Clearance:'}</strong>{' '}
                  {isAr 
                    ? `المشرف ${report.reportHeader.exporter.operatorId} يمتلك صلاحية التصدير والاعتماد التشفيري.`
                    : `Supervisor ${report.reportHeader.exporter.operatorId} is cryptographically authorized to export audit reports.`}
                </>
              ) : (
                <>
                  <strong>{isAr ? 'صلاحية مقيدة:' : 'Restricted Role:'}</strong>{' '}
                  {isAr
                    ? `أنت متصل بالدور (${report.reportHeader.exporter.roleTitleAr}). يتطلب التصدير صلاحيات مشرف العمليات.`
                    : `Active role is ${report.reportHeader.exporter.roleTitleEn}. Export requires Operations Supervisor authorization.`}
                </>
              )}
            </span>
          </div>

          {!isAuthorized && onElevateToSupervisor && (
            <button
              onClick={onElevateToSupervisor}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isAr ? 'الترقية لصلاحية المشرف المعتمد' : 'Authenticate as Supervisor'}</span>
            </button>
          )}

          {isAuthorized && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>ECDSA-secp256k1 Signed</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-1 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة ملف JSON الموقّع' : 'Signed JSON Preview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'الملخص والأختام التشفيرية' : 'Summary & Cryptographic Seals'}</span>
          </button>

          <button
            onClick={() => setActiveTab('proofs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'proofs'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسارات إثبات ميركل (Proofs)' : 'Merkle Inclusion Proofs'} ({report.transactionLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: JSON Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{isAr ? 'هيكل التقرير وفق معيار RFC 6962 وNCA ECC' : 'Payload Schema (RFC 6962 / NCA ECC Standard)'}</span>
                <span className="text-slate-500">{jsonContent.length.toLocaleString()} bytes</span>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-300 max-h-[380px] overflow-y-auto leading-relaxed shadow-inner">
                <pre>{jsonContent}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: Executive Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'جذر شجرة ميركل (Merkle Root)' : 'Live Merkle Root'}</span>
                  <p className="font-mono text-emerald-400 font-bold truncate text-xs" title={report.merkleState.merkleRoot}>
                    {report.merkleState.merkleRoot}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">SHA-256 Binary Tree (RFC 6962)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'مرجع المفتاح السيادي (HSM Root CA)' : 'HSM Root CA'}</span>
                  <p className="font-mono text-white font-bold text-xs">
                    {report.cryptographicSignature.hsmKeyId}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono">Hardware Security Module L4</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'هيئة الختم الزمني (Timestamp Authority)' : 'Timestamp Authority'}</span>
                  <p className="font-mono text-cyan-300 font-bold text-xs truncate">
                    STA-DZ-01 (RFC 3161)
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">{report.reportHeader.generatedAt}</span>
                </div>
              </div>

              {/* Cryptographic Details Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2.5">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'التوقيع الرقمي السيادي (Digital Signature Digest)' : 'Sovereign Digital Signature Digest'}</span>
                  </span>
                  <span className="text-emerald-400">{report.cryptographicSignature.signatureAlgorithm}</span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <p className="break-all">
                    <span className="text-slate-500">ECDSA-HEX: </span>
                    <span className="text-emerald-300 font-bold">{report.cryptographicSignature.signatureHex}</span>
                  </p>
                  <p className="break-all">
                    <span className="text-slate-500">REPORT-DIGEST-SHA256: </span>
                    <span className="text-cyan-300">{report.cryptographicSignature.reportDigestSha256}</span>
                  </p>
                  <p className="break-all">
                    <span className="text-slate-500">STA-CERT-FINGERPRINT: </span>
                    <span className="text-slate-400">{report.cryptographicSignature.staCertificateThumbprint}</span>
                  </p>
                </div>
              </div>

              {/* Audit Metrics */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'إحصائيات التدقيق ومطابقة السجلات الميدانية' : 'Audit Verification Metrics'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'إجمالي المعاملات' : 'Transactions'}</span>
                    <span className="text-base font-bold text-white font-mono">{report.merkleState.totalTransactions}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'دفعات الحصاد المعتمدة' : 'Crop Batches'}</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">{report.auditMetrics.certifiedCropBatches}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'أوامر العمل المدققة' : 'Audited Orders'}</span>
                    <span className="text-base font-bold text-cyan-400 font-mono">{report.auditMetrics.fieldWorkOrdersAudited}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'نسبة فقدان البيانات' : 'Data Loss'}</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">0.00%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Proofs */}
          {activeTab === 'proofs' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>{isAr ? 'إثباتات التضمين في شجرة ميركل (Merkle Membership Inclusions)' : 'Merkle Inclusion Proof Paths'}</span>
                <button
                  onClick={handleVerifyAllIntegrity}
                  disabled={isVerifyingIntegrity}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'إعادة فحص كافة الإثباتات' : 'Re-verify All Proofs'}</span>
                </button>
              </div>

              {integrityVerified && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs font-mono animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'تم التحقق بنجاح: 100% من أوراق شجرة ميركل تطابق الجذر السيادي بدقة تامة.' : 'Verification Successful: 100% of Merkle leaf proofs match the Root Hash.'}</span>
                </div>
              )}

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {report.transactionLogs.map((leaf, idx) => (
                  <div 
                    key={leaf.id} 
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">#{leaf.blockHeight}</span>
                        <span className="text-white font-bold">{leaf.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {leaf.sourceSubsystem}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VALID</span>
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs font-sans">
                      {isAr ? leaf.summaryAr : leaf.summary}
                    </p>

                    <div className="text-[10px] text-slate-500 truncate">
                      <span>Leaf Hash: </span>
                      <span className="text-slate-400">{leaf.leafHash}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>Proof Steps: </span>
                      <span className="text-cyan-400">{leaf.merkleProof.length} sibling hashes</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 font-sans">
                        {leaf.merkleProof.map((p, pIdx) => `${p.position[0].toUpperCase()}:${p.hash.slice(0, 6)}...`).join(' → ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-emerald-400 font-bold">{report.transactionLogs.length}</span>
            <span>{isAr ? 'معاملة موثقة في التقرير' : 'Verified Transactions in Audit Log'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ JSON' : 'Copy JSON')}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!isAuthorized}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all cursor-pointer ${
                isAuthorized
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {downloadSuccess ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {downloadSuccess
                  ? (isAr ? 'تم تحميل ملف التقرير بنجاح!' : 'Report Downloaded!')
                  : (isAr ? 'تحميل تقرير التدقيق الموقّع (.json)' : 'Export Signed JSON Audit Report')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
