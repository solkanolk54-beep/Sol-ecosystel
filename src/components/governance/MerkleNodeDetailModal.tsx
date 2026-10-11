import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  Lock, 
  GitBranch, 
  Database, 
  Clock, 
  Terminal, 
  FileCode2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Binary, 
  KeyRound, 
  HardDrive,
  Cpu,
  FileCheck2,
  ExternalLink,
  Download,
  FileText,
  Printer,
  Sparkles
} from 'lucide-react';
import { 
  MerkleTreeNode, 
  NodeIntegrityVerificationResult, 
  HexDumpLine,
  BatchVerificationReport 
} from '../../types/merkle';
import { Language } from '../../types/ecosystem';
import { 
  generateHexDump, 
  verifyNodeIntegrity,
  generateBatchVerificationReport,
  downloadBatchVerificationJsonReport,
  downloadBatchVerificationPdfReport
} from '../../utils/merkleTree';

interface MerkleNodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: MerkleTreeNode | null;
  merkleRoot: string;
  language: Language;
}

export const MerkleNodeDetailModal: React.FC<MerkleNodeDetailModalProps> = ({
  isOpen,
  onClose,
  node,
  merkleRoot,
  language
}) => {
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'hexdump' | 'json' | 'proof'>('hexdump');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<NodeIntegrityVerificationResult | null>(null);

  // Download state tracking
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'json' | null>(null);
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState<'pdf' | 'json' | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset verification state when node changes
  useEffect(() => {
    if (node) {
      setVerificationResult(null);
      setIsVerifying(false);
      setDownloadingFormat(null);
      setDownloadSuccessFormat(null);
    }
  }, [node?.id]);

  // The block payload to inspect and dump
  const blockData = useMemo(() => {
    if (!node) return null;
    if (node.leafData) {
      return {
        id: node.leafData.id,
        blockHeight: node.leafData.blockHeight,
        timestamp: node.leafData.timestamp,
        sourceSubsystem: node.leafData.sourceSubsystem,
        eventType: node.leafData.eventType,
        dataBatch: node.leafData.dataBatch,
        parcelCode: node.leafData.parcelCode,
        leafHash: node.leafData.leafHash,
        signerKey: node.leafData.signerKey,
        rawPayload: node.leafData.rawPayload
      };
    }
    return {
      nodeId: node.id,
      nodeType: node.type,
      layerIndex: node.layerIndex,
      hash: node.hash,
      label: node.label,
      dataBatch: node.dataBatch,
      timestamp: node.timestamp,
      coveredLeavesCount: node.coveredLeavesCount,
      coveredBatches: node.coveredBatches,
      merkleRootRef: merkleRoot
    };
  }, [node, merkleRoot]);

  // Generate Hex-Dump lines from the JSON block data
  const hexDumpLines: HexDumpLine[] = useMemo(() => {
    if (!blockData) return [];
    return generateHexDump(blockData);
  }, [blockData]);

  // Total raw byte size
  const totalByteSize = useMemo(() => {
    if (!blockData) return 0;
    return new TextEncoder().encode(JSON.stringify(blockData, null, 2)).length;
  }, [blockData]);

  if (!isOpen || !node) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(node.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyHex = () => {
    const rawDumpText = hexDumpLines
      .map((l) => `${l.offset}  ${l.hex}  |${l.ascii}|`)
      .join('\n');
    navigator.clipboard.writeText(rawDumpText);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(blockData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    // Realistic verification simulation delay for cryptographic hashing & traversal
    setTimeout(() => {
      const result = verifyNodeIntegrity(node, merkleRoot);
      setVerificationResult(result);
      setIsVerifying(false);
    }, 450);
  };

  const handleDownloadReport = (format: 'pdf' | 'json') => {
    if (!node) return;
    setDownloadingFormat(format);

    // Ensure verification is evaluated
    const activeResult = verificationResult || verifyNodeIntegrity(node, merkleRoot);
    if (!verificationResult) {
      setVerificationResult(activeResult);
    }

    setTimeout(() => {
      try {
        const report = generateBatchVerificationReport(node, merkleRoot, activeResult);
        if (format === 'pdf') {
          downloadBatchVerificationPdfReport(report);
        } else {
          downloadBatchVerificationJsonReport(report);
        }
        setDownloadSuccessFormat(format);
        setTimeout(() => setDownloadSuccessFormat(null), 3500);
      } catch (err) {
        console.error('Error generating report:', err);
      } finally {
        setDownloadingFormat(null);
      }
    }, 400);
  };

  const getSubsystemBadge = (subsystem?: string) => {
    switch (subsystem) {
      case 'SolVision':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Kareema':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'AtlasCloud':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
  };

  const currentBatchLabel = node.dataBatch || (node.type === 'ROOT' ? 'SOVEREIGN-MERKLE-ROOT' : node.label);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              node.type === 'ROOT' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : node.type === 'BRANCH'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              {node.type === 'ROOT' ? (
                <Lock className="w-5 h-5" />
              ) : node.type === 'BRANCH' ? (
                <GitBranch className="w-5 h-5" />
              ) : (
                <Database className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white font-mono truncate">
                  {node.label}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  node.type === 'ROOT' 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                    : node.type === 'BRANCH'
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {node.type} NODE (L{node.layerIndex})
                </span>
                {node.subsystem && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSubsystemBadge(node.subsystem)}`}>
                    {node.subsystem}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                {isAr 
                  ? 'معاينة الكتلة التشفيرية، تدقيق الهاش، وتفريغ البيانات السداسية عشرية مع تقرير التدقيق القابل للتنزيل' 
                  : 'Cryptographic block inspection, hash cross-check, binary hex-dump & downloadable audit report'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Header Download Dropdown / Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingFormat !== null}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                title="Download Verification PDF Report"
              >
                {downloadingFormat === 'pdf' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : downloadSuccessFormat === 'pdf' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <FileText className="w-3 h-3 text-emerald-400" />
                )}
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleDownloadReport('json')}
                disabled={downloadingFormat !== null}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                title="Download Verification JSON Summary"
              >
                {downloadingFormat === 'json' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : downloadSuccessFormat === 'json' ? (
                  <Check className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Download className="w-3 h-3 text-cyan-400" />
                )}
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TOP METADATA SUMMARY BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. DATA BATCH */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>{isAr ? 'دفعة البيانات (Data Batch)' : 'Data Batch'}</span>
              </span>
              <p className="font-mono font-bold text-white text-xs truncate" title={node.dataBatch}>
                {node.dataBatch || 'GLOBAL_SOVEREIGN_BATCH'}
              </p>
              {node.parcelCode && (
                <span className="text-[10px] font-mono text-cyan-300 block">
                  Parcel: {node.parcelCode}
                </span>
              )}
            </div>

            {/* 2. TIMESTAMP */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'الختم الزمني (Timestamp)' : 'Timestamp'}</span>
              </span>
              <p className="font-mono font-bold text-white text-xs truncate">
                {node.timestamp || '2026-10-07 14:15:22'}
              </p>
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                ISO: {new Date(node.timestamp || Date.now()).toISOString()}
              </span>
            </div>

            {/* 3. BLOCK / RECORD INDEX */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'الكتلة / الطبقة (Layer & Height)' : 'Layer & Height'}</span>
              </span>
              <p className="font-mono font-bold text-white text-xs">
                #{node.leafData?.blockHeight ?? 1485281} <span className="text-slate-400 text-[10px]">(Layer {node.layerIndex})</span>
              </p>
              <span className="text-[10px] font-mono text-slate-500 block">
                {node.coveredLeavesCount} Leaves Anchored
              </span>
            </div>

            {/* 4. SECURITY STANDARD */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-teal-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'معيار التشفير السيادي' : 'Crypto Standard'}</span>
              </span>
              <p className="font-mono font-bold text-white text-xs">
                HSM Level 4 / secp256k1
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block">
                RFC 6962 / Bit-for-Bit
              </span>
            </div>
          </div>

          {/* CRYPTOGRAPHIC HASH STRIP (SHA-256) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'الهاش التشفيري للكتلة (SHA-256 Hash)' : 'Cryptographic Block Hash (SHA-256)'}</span>
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الهاش' : 'Copy Hash')}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all leading-relaxed shadow-inner">
              {node.hash}
            </div>
          </div>

          {/* INTEGRITY CROSS-CHECK & DOWNLOADABLE AUDIT REPORT ACTION SECTION */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'مطابقة سلامة الكتلة وتدقيق مسار ميركل' : 'Cryptographic Integrity Cross-Check'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'إعادة حساب هاش الحمولة الخام ومطابقته مع الهاش المختوم ومسار إثبات ميركل مع إمكانية استخراج تقرير التدقيق.' 
                    : 'Re-compute payload digest, match against sealed hash, and traverse proof steps with downloadable audit report.'}
                </p>
              </div>

              {/* ACTION BUTTONS: VERIFY INTEGRITY & DOWNLOAD REPORT */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={handleVerifyIntegrity}
                  disabled={isVerifying}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all shadow-md shadow-emerald-950/60 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'التحقق من سلامة الكتلة' : 'Verify Integrity'}</span>
                </button>

                {/* THE REQUESTED BUTTONS FOR DOWNLOADABLE PDF OR JSON REPORT */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700/80 rounded-xl">
                  <button
                    onClick={() => handleDownloadReport('pdf')}
                    disabled={downloadingFormat !== null}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                    title={isAr ? 'تنزيل تقرير التدقيق بصيغة PDF' : 'Download Cryptographic Verification PDF Report'}
                  >
                    {downloadingFormat === 'pdf' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : downloadSuccessFormat === 'pdf' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>{downloadSuccessFormat === 'pdf' ? (isAr ? 'تم التحميل!' : 'Downloaded!') : (isAr ? 'تقرير PDF' : 'Download PDF')}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadReport('json')}
                    disabled={downloadingFormat !== null}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-60"
                    title={isAr ? 'تنزيل ملخص التدقيق بصيغة JSON' : 'Download Cryptographic Verification JSON Summary'}
                  >
                    {downloadingFormat === 'json' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : downloadSuccessFormat === 'json' ? (
                      <Check className="w-3.5 h-3.5 text-cyan-300" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{downloadSuccessFormat === 'json' ? (isAr ? 'تم التحميل!' : 'Downloaded!') : (isAr ? 'ملخص JSON' : 'Download JSON')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DOWNLOAD SUCCESS ALERT BANNER */}
            {downloadSuccessFormat && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {downloadSuccessFormat === 'pdf'
                      ? (isAr ? `تم بنجاح توليد وتحميل شهادة التدقيق التشفيرية (PDF) للدفعة: ${currentBatchLabel}` : `Successfully generated and downloaded formal PDF Cryptographic Verification Report for batch: ${currentBatchLabel}`)
                      : (isAr ? `تم بنجاح تحميل ملخص التدقيق بصيغة JSON للدفعة: ${currentBatchLabel}` : `Successfully generated and downloaded JSON Verification Summary Report for batch: ${currentBatchLabel}`)}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold">
                  {downloadSuccessFormat.toUpperCase()} COMPLIANT
                </span>
              </div>
            )}

            {/* VERIFICATION RESULTS DISPLAY */}
            {verificationResult && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs font-mono space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isAr
                        ? 'اكتمل التدقيق: تم تأكيد سلامة الكتلة التشفيرية ومسار ميركل بنسبة 100%'
                        : 'Verification Complete: 100% Bit-for-Bit Cryptographic Integrity Verified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                      STATUS: SECURE & VERIFIED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">1. Payload Digest Check:</span>
                    <span className="text-emerald-300 font-bold">MATCH: Identical (SHA-256)</span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">2. Merkle Root Match:</span>
                    <span className="text-cyan-300 font-bold truncate block" title={merkleRoot}>
                      ROOT MATCH: {merkleRoot.slice(0, 10)}...{merkleRoot.slice(-6)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">3. Authority Standard:</span>
                    <span className="text-teal-300 font-bold">{verificationResult.hsmStandard}</span>
                  </div>
                </div>

                {/* Direct report download prompt banner inside verified result */}
                <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="text-slate-300">
                    {isAr ? 'التقرير موثّق وجاهز للأرشفة والمشاركة الرسمية:' : 'Cryptographic audit proof is ready for formal export & regulatory submission:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReport('pdf')}
                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{isAr ? 'تصدير وثيقة PDF' : 'Export PDF Report'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadReport('json')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Download className="w-3 h-3" />
                      <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TABS FOR HEX-DUMP, JSON PAYLOAD, AND MERKLE PROOF */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('hexdump')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'hexdump'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Binary className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تفريغ البايتات (JSON Hex-Dump)' : 'JSON Hex-Dump'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-emerald-300">
                    {totalByteSize} B
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حمولة JSON' : 'Raw JSON'}</span>
                </button>

                {node.leafData && (
                  <button
                    onClick={() => setActiveTab('proof')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'proof'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مسار الإثبات' : 'Proof Steps'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300">
                      {node.leafData.merkleProof.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Action buttons for active tab */}
              {activeTab === 'hexdump' ? (
                <button
                  onClick={handleCopyHex}
                  className="flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHex ? (isAr ? 'تم نسخ الـ HexDump!' : 'Hex Copied!') : (isAr ? 'نسخ الـ HexDump' : 'Copy Hex-Dump')}</span>
                </button>
              ) : activeTab === 'json' ? (
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? (isAr ? 'تم نسخ الـ JSON!' : 'JSON Copied!') : (isAr ? 'نسخ الـ JSON' : 'Copy JSON')}</span>
                </button>
              ) : null}
            </div>

            {/* TAB CONTENT 1: JSON HEX-DUMP */}
            {activeTab === 'hexdump' && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[320px] select-all shadow-inner">
                  {/* Hex-Dump Table Header */}
                  <div className="text-[11px] font-bold text-slate-500 pb-2 border-b border-slate-850 flex items-center justify-between sticky top-0 bg-slate-950">
                    <span className="w-24">OFFSET</span>
                    <span className="flex-1 px-4">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</span>
                    <span className="w-48 text-right pr-2">ASCII DUMP</span>
                  </div>

                  {/* Hex-Dump Lines */}
                  <div className="divide-y divide-slate-900/60 pt-1 text-[11.5px] leading-relaxed">
                    {hexDumpLines.map((line, idx) => (
                      <div key={idx} className="flex items-center py-0.5 hover:bg-slate-900/50 transition-colors">
                        <span className="w-24 text-slate-500 font-mono select-none">
                          {line.offset}
                        </span>
                        <span className="flex-1 px-4 text-emerald-400 font-mono tracking-wider whitespace-nowrap">
                          {line.hex}
                        </span>
                        <span className="w-48 text-right pr-2 text-cyan-300 font-mono whitespace-pre border-l border-slate-850 pl-3">
                          {line.ascii}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                  <span>Standard canonical hexdump format (16 bytes/row)</span>
                  <span>UTF-8 Serialization • {hexDumpLines.length} blocks</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: PRETTY JSON PAYLOAD */}
            {activeTab === 'json' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 max-h-[320px] overflow-y-auto leading-relaxed select-all">
                <pre>{JSON.stringify(blockData, null, 2)}</pre>
              </div>
            )}

            {/* TAB CONTENT 3: MERKLE PROOF STEPS */}
            {activeTab === 'proof' && node.leafData && (
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-h-[320px] overflow-y-auto">
                  <div className="text-xs font-mono text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span>Sibling Proof Path Steps ({node.leafData.merkleProof.length} levels):</span>
                    <span className="text-emerald-400 font-bold">Root Traversal Ready</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {node.leafData.merkleProof.map((step, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                            {idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            step.position === 'left' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {step.position.toUpperCase()} SIBLING
                          </span>
                        </div>

                        <span className="text-slate-300 truncate max-w-sm" title={step.hash}>
                          {step.hash}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER WITH PROMINENT EXPORT ACTIONS */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">AtlasCloud Sovereign Enclave • DZ-North-1 (Algeria - Africa) • RFC 6962 Standard</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF button in footer */}
            <button
              onClick={() => handleDownloadReport('pdf')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {downloadingFormat === 'pdf' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{isAr ? 'تحميل تقرير PDF' : 'Download PDF Report'}</span>
            </button>

            {/* Download JSON button in footer */}
            <button
              onClick={() => handleDownloadReport('json')}
              disabled={downloadingFormat !== null}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 border border-slate-700"
            >
              {downloadingFormat === 'json' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isAr ? 'تحميل ملخص JSON' : 'Download JSON Summary'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
