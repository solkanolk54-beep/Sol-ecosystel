import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Server, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Cpu, 
  Globe2, 
  Layers, 
  FileCode2,
  RefreshCw,
  Download,
  Search,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  GitBranch,
  FileCheck2,
  Filter,
  Radio,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { 
  SovereignCloudStatus, 
  Language, 
  UserRole, 
  DigitalQualityPassport, 
  WorkOrder, 
  SystemEvent, 
  StressTestStage 
} from '../../types/ecosystem';
import { LiveCommitNotification, MerkleLeaf, MerkleTreeState } from '../../types/merkle';
import { 
  buildLiveMerkleTreeState, 
  generateNextLiveBatchCommit,
  generateSignedAuditReport, 
  verifyMerkleProof,
  downloadMerkleAuditLogCSV
} from '../../utils/merkleTree';
import { MerkleAuditReportModal } from './MerkleAuditReportModal';
import { MerkleTreeVisualizer } from './MerkleTreeVisualizer';
import { SOVEREIGN_NODES } from '../../data/mockData';

interface SovereignCloudPanelProps {
  status: SovereignCloudStatus;
  language: Language;
  currentRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  passports?: DigitalQualityPassport[];
  workOrders?: WorkOrder[];
  events?: SystemEvent[];
  stressTestStage?: StressTestStage;
}

const PRESET_QUERIES = [
  {
    name: "حساب مساحات المحاور بالهكتار (ST_Area & ST_Centroid)",
    nameEn: "Calculate Pivot Areas in Hectares (ST_Area & ST_Centroid)",
    sql: `SELECT asset_id, code, ST_Area(geom::geography)/10000 AS hectares, ST_AsText(ST_Centroid(geom)) AS center_point\nFROM spatial_parcels\nWHERE status IN ('OPTIMAL', 'STRESSED');`,
    result: [
      { asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", code: "PIVOT-01", hectares: 63.6, center_point: "POINT(47.310 24.155)" },
      { asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", code: "PIVOT-02", hectares: 55.4, center_point: "POINT(47.338 24.185)" },
      { asset_id: "9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f", code: "PIVOT-03", hectares: 50.2, center_point: "POINT(47.350 24.120)" },
      { asset_id: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", code: "PIVOT-04", hectares: 66.4, center_point: "POINT(47.380 24.160)" }
    ]
  },
  {
    name: "استخراج Bounding Box للمناطق المجهدة (ST_Envelope)",
    nameEn: "Extract Stress Bounding Box (ST_Envelope & ST_Intersects)",
    sql: `SELECT code, ST_AsGeoJSON(ST_Envelope(geom)) AS bbox_geojson, ndvi_average\nFROM spatial_parcels\nWHERE ndvi_average < 0.40;`,
    result: [
      {
        code: "PIVOT-02",
        ndvi_average: 0.38,
        bbox_geojson: '{"type":"Polygon","coordinates":[[[47.339,24.187],[47.345,24.187],[47.345,24.192],[47.339,24.192],[47.339,24.187]]]}'
      }
    ]
  },
  {
    name: "مطابقة رعي الماشية مع نطاقات الحماية الزراعية (ST_DWithin)",
    nameEn: "Livestock Proximity to Crops (ST_DWithin Buffer)",
    sql: `SELECT h.herd_id, p.code, ROUND(ST_Distance(h.geom::geography, p.geom::geography)) AS distance_meters\nFROM livestock_telemetry h\nCROSS JOIN spatial_parcels p\nWHERE ST_DWithin(h.geom::geography, p.geom::geography, 2500);`,
    result: [
      { herd_id: "HERD-SHP-02", code: "PIVOT-02", distance_meters: 1420 },
      { herd_id: "HERD-CAM-01", code: "PIVOT-01", distance_meters: 2180 }
    ]
  }
];

export const SovereignCloudPanel: React.FC<SovereignCloudPanelProps> = ({
  status,
  language,
  currentRole = 'OPERATIONS_SUPERVISOR',
  onSelectRole,
  passports = [],
  workOrders = [],
  events = [],
  stressTestStage = 'IDLE'
}) => {
  const isAr = language === 'ar';

  // PostGIS SQL State
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [activeQuerySql, setActiveQuerySql] = useState(PRESET_QUERIES[0].sql);
  const [queryResults, setQueryResults] = useState<any[]>(PRESET_QUERIES[0].result);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState(12);

  // Merkle Tree & Audit State
  const [merkleSearch, setMerkleSearch] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');
  const [expandedLeafId, setExpandedLeafId] = useState<string | null>(null);
  const [verifiedLeavesMap, setVerifiedLeavesMap] = useState<Record<string, boolean>>({});
  const [copiedRoot, setCopiedRoot] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewMerkleGraph, setViewMerkleGraph] = useState(false);

  // Live Sync & Batch Polling State (polls every 30 seconds)
  const [liveCommits, setLiveCommits] = useState<Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[]>([]);
  const [isLiveSyncEnabled, setIsLiveSyncEnabled] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isPollingCommit, setIsPollingCommit] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<string>(
    new Date().toISOString().replace('T', ' ').slice(11, 19) + ' UTC'
  );
  const [latestCommitNotification, setLatestCommitNotification] = useState<LiveCommitNotification | null>(null);

  // Sovereign Cluster Node Management (Primary: DZ-North-1 Algiers, Algeria - Africa)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('DZ-NORTH-1');
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const activeNode = useMemo(
    () => SOVEREIGN_NODES.find((n) => n.id === selectedNodeId) || SOVEREIGN_NODES[0],
    [selectedNodeId]
  );

  // Build live dynamic Merkle Tree state including live polled batch commits
  const merkleTreeState: MerkleTreeState = useMemo(() => {
    return buildLiveMerkleTreeState(passports, workOrders, events, liveCommits);
  }, [passports, workOrders, events, stressTestStage, liveCommits]);

  // Handler for committing a new batch into the Merkle tree
  const handleCommitNewLiveBatch = () => {
    setIsPollingCommit(true);
    setTimeout(() => {
      const nextCommit = generateNextLiveBatchCommit(liveCommits.length);
      setLiveCommits((prev) => [...prev, nextCommit]);

      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').slice(11, 19) + ' UTC';
      setLastPolledAt(timeStr);
      setIsPollingCommit(false);
      setSecondsRemaining(30);

      // Node ID for the new leaf in the updated tree
      const leafIndex = merkleTreeState.leaves.length;
      setLatestCommitNotification({
        batchId: nextCommit.dataBatch,
        nodeId: `node-leaf-${leafIndex}`,
        blockHeight: nextCommit.blockHeight,
        subsystem: nextCommit.sourceSubsystem,
        timestamp: nextCommit.timestamp,
        summary: nextCommit.summary,
        summaryAr: nextCommit.summaryAr,
        merkleRoot: merkleTreeState.merkleRoot
      });
    }, 450);
  };

  // 30-Second Polling Timer for Live Sync
  useEffect(() => {
    if (!isLiveSyncEnabled) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleCommitNewLiveBatch();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveSyncEnabled, liveCommits.length, merkleTreeState.leaves.length]);

  // Check authorization
  const isSupervisorAuthorized = currentRole === 'OPERATIONS_SUPERVISOR' || currentRole === 'ALL';

  // Generate signed audit report object
  const signedAuditReport = useMemo(() => {
    return generateSignedAuditReport(
      merkleTreeState, 
      currentRole, 
      passports.length, 
      workOrders.length
    );
  }, [merkleTreeState, currentRole, passports.length, workOrders.length]);

  const handleSelectPreset = (index: number) => {
    setSelectedQueryIndex(index);
    setActiveQuerySql(PRESET_QUERIES[index].sql);
    setQueryResults(PRESET_QUERIES[index].result);
  };

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionTimeMs(Math.floor(8 + Math.random() * 12));
      setQueryResults(PRESET_QUERIES[selectedQueryIndex].result);
    }, 400);
  };

  const handleVerifyIndividualLeaf = (leaf: MerkleLeaf) => {
    const isValid = verifyMerkleProof(leaf.leafHash, leaf.merkleProof, merkleTreeState.merkleRoot);
    setVerifiedLeavesMap(prev => ({ ...prev, [leaf.id]: isValid }));
  };

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(merkleTreeState.merkleRoot);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  // Regulatory Compliance CSV Audit Log Export Handler
  const [csvExportNotification, setCsvExportNotification] = useState<string | null>(null);

  const handleExportAuditLogCSV = () => {
    downloadMerkleAuditLogCSV(merkleTreeState, {
      clusterNode: `${activeNode.code} • ${isAr ? activeNode.continentAr : activeNode.continentEn}`,
      operatorRole: currentRole,
      fileNamePrefix: `sovereign-merkle-audit-${activeNode.id.toLowerCase()}`
    });
    setCsvExportNotification(
      isAr 
        ? `تم تصدير سجل تدقيق شجرة ميركل (${merkleTreeState.totalLeaves} معاملة) بنجاح عبر عقدة ${activeNode.cityAr} (${activeNode.code}) كملف CSV للامتثال التنظيمي (RFC 6962 / ISO 27001).`
        : `Successfully exported Merkle audit log (${merkleTreeState.totalLeaves} transactions) via ${activeNode.cityEn} node (${activeNode.code}) to CSV for regulatory compliance.`
    );
    setTimeout(() => {
      setCsvExportNotification(null);
    }, 4500);
  };

  // Filtered leaves
  const filteredLeaves = merkleTreeState.leaves.filter((leaf) => {
    const matchesSubsystem = selectedSubsystem === 'ALL' || leaf.sourceSubsystem === selectedSubsystem;
    const matchesSearch = 
      leaf.id.toLowerCase().includes(merkleSearch.toLowerCase()) ||
      leaf.eventType.toLowerCase().includes(merkleSearch.toLowerCase()) ||
      leaf.parcelCode.toLowerCase().includes(merkleSearch.toLowerCase()) ||
      leaf.summary.toLowerCase().includes(merkleSearch.toLowerCase()) ||
      leaf.summaryAr.includes(merkleSearch) ||
      leaf.leafHash.toLowerCase().includes(merkleSearch.toLowerCase());
    return matchesSubsystem && matchesSearch;
  });

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col space-y-6 p-4 lg:p-6">
      {/* Title & Sovereign Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>
                {isAr 
                  ? 'الحوكمة السيادية وتتبع السلسلة (Sovereign Governance & Traceability)' 
                  : 'Sovereign Governance & Traceability Panel'}
              </span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AtlasCloud Sovereign Node v3.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'حوكمة السجلات غير القابلة للتغيير عبر شجرة ميركل (Merkle Tree)، والتشفير السيادي، ومطابقة أوامر العمل الميدانية في Kareema مع قياسات SolVision.'
              : 'Immutable Merkle Tree transaction auditing, PostGIS spatial data sovereignty, and signed cryptographic audit trail certification.'}
          </p>
        </div>

        {/* Global Export & Sovereign Authority Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Audit Log CSV Button */}
          <button
            onClick={handleExportAuditLogCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 hover:text-white border border-emerald-600/50 text-xs font-bold shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
            title={isAr ? 'تصدير سجل تدقيق شجرة ميركل للامتثال التنظيمي كملف CSV' : 'Export Merkle tree transaction history & validation timestamps as CSV for regulatory compliance'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr ? 'تصدير سجل التدقيق (CSV)' : 'Export Audit Log'}
            </span>
          </button>

          {/* Export Signed Merkle Audit Report JSON Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            title={isAr ? 'تصدير سجلات شجرة ميركل كتقرير تدقيق موقّع' : 'Export Merkle Tree Audit Report as Signed JSON'}
          >
            <Download className="w-4 h-4" />
            <span>
              {isAr ? 'تقرير تدقيق موقّع (.json)' : 'Signed Audit Report'}
            </span>
          </button>
        </div>
      </div>

      {/* CSV Export Success Notification Toast */}
      {csvExportNotification && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950/90 to-slate-900 border border-emerald-500/60 text-emerald-200 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
            <span className="font-semibold">{csvExportNotification}</span>
          </div>
          <button
            onClick={() => setCsvExportNotification(null)}
            className="text-slate-400 hover:text-white text-sm font-bold px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cluster Nodes & Sovereign Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Primary Sovereign Node Card - Algeria (Africa) */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/40 space-y-1.5 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isAr ? 'العقدة السيادية الأساسية' : 'Primary Sovereign Node'}</span>
            </span>
            <button
              onClick={() => setIsNodeModalOpen(true)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/80 hover:bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-800/80 transition-colors cursor-pointer"
              title={isAr ? 'إدارة وتبديل العقد السيادية' : 'Manage & Switch Sovereign Nodes'}
            >
              <Globe2 className="w-3 h-3 text-emerald-400" />
              <span>{isAr ? 'العقد السيادية' : 'Nodes'}</span>
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">{activeNode.code}</span>
              </p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                {isAr ? activeNode.continentAr : activeNode.continentEn}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 truncate font-medium">
              {isAr ? activeNode.nameAr : activeNode.nameEn}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold">Uptime: {activeNode.uptimePercent}%</span>
            <span className="text-cyan-400 font-semibold">{activeNode.latencyMs}ms latency</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'سجلات PostGIS المكانية' : 'PostGIS Records'}</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">1,485,290 geometries</p>
          <p className="text-[11px] text-cyan-400 font-mono">WMS Latency: {status.geoServerWmsLatencyMs}ms</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'حالة شجرة ميركل الحية' : 'Live Merkle Tree'}</span>
            <div className="flex items-center gap-1.5">
              {isLiveSyncEnabled && (
                <span className="relative flex h-2 w-2" title="30s Live Sync Active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <GitBranch className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-white font-mono flex items-center justify-between">
            <span>{merkleTreeState.totalLeaves} Sealed Leaves</span>
            {liveCommits.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-sans font-semibold bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                +{liveCommits.length} {isAr ? 'مباشر' : 'live'}
              </span>
            )}
          </p>
          <p className="text-[11px] text-indigo-400 font-mono">
            Tree Depth: {merkleTreeState.treeDepth} Layers {isLiveSyncEnabled ? `• Poll in ${secondsRemaining}s` : '• Paused'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'معيار التشفير السيادي' : 'Cryptographic Security'}</span>
            <HardDrive className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">HSM Level 4 / secp256k1</p>
          <p className="text-[11px] text-teal-400 font-mono">RFC 6962 Standard</p>
        </div>
      </div>

      {/* SECTION 1: Interactive Visual Merkle Tree & Batch Inspection */}
      <MerkleTreeVisualizer
        treeState={merkleTreeState}
        language={language}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportAuditLogCSV={handleExportAuditLogCSV}
        isLiveSyncEnabled={isLiveSyncEnabled}
        onToggleLiveSync={() => setIsLiveSyncEnabled((prev) => !prev)}
        secondsRemaining={secondsRemaining}
        isPolling={isPollingCommit}
        onSyncNow={handleCommitNewLiveBatch}
        lastPolledAt={lastPolledAt}
        totalLiveCommits={liveCommits.length}
        latestCommitNotification={latestCommitNotification}
        onDismissNotification={() => setLatestCommitNotification(null)}
      />

      {/* SECTION 2: Sovereign Merkle Transaction Ledger Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-4 lg:p-5 space-y-4">
        {/* Ledger Section Top Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr 
                  ? 'سجل المعاملات والكتل التشفيرية (Cryptographic Ledger)' 
                  : 'Sovereign Transaction Ledger Table'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'استعراض جدولي تفصيلي لكافة الكتل، ومفاتيح التوقيع الرقمي HSM، وحمولات البيانات الخام.' 
                : 'Detailed tabular inspection of all blocks, HSM digital signature keys, and raw payloads.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs text-slate-400">
            <span className="px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60 text-slate-300">
              {filteredLeaves.length} / {merkleTreeState.totalLeaves} {isAr ? 'معاملة مسجلة' : 'Recorded Transactions'}
            </span>
            <button
              onClick={handleExportAuditLogCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-600/50 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title={isAr ? 'تصدير سجل تدقيق شجرة ميركل للامتثال التنظيمي كملف CSV' : 'Export Merkle tree transaction history & validation timestamps as CSV'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تصدير سجل التدقيق (CSV)' : 'Export Audit Log (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Role Authorization Strip */}
        <div className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2.5 ${
          isSupervisorAuthorized
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {isSupervisorAuthorized ? (
                <>
                  <strong>{isAr ? 'الصلاحية الحالية:' : 'Active Role:'}</strong>{' '}
                  {isAr 
                    ? 'مشرف غرفة العمليات (Operations Supervisor) — تمتلك الصلاحية السيادية لتوقيع وتصدير تقارير تدقيق ميركل (SOP Section 2).' 
                    : 'Operations Supervisor — Authorized to sign and export sovereign Merkle audit reports.'}
                </>
              ) : (
                <>
                  <strong>{isAr ? 'تنبيه الصلاحية:' : 'Role Authorization Notice:'}</strong>{' '}
                  {isAr 
                    ? `أنت تتصفح بدور (${currentRole}). يتطلب تصدير التقرير الرسمي تصريح المشرف المعتمد.`
                    : `Active role is ${currentRole}. Exporting signed audit reports requires Operations Supervisor authorization.`}
                </>
              )}
            </span>
          </div>

          {!isSupervisorAuthorized && onSelectRole && (
            <button
              onClick={() => onSelectRole('OPERATIONS_SUPERVISOR')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              {isAr ? 'تفعيل صلاحية مشرف العمليات' : 'Elevate to Supervisor Role'}
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Subsystem Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            {['ALL', 'SolVision', 'Kareema', 'AtlasCloud', 'HSM-Enclave'].map((subsystem) => (
              <button
                key={subsystem}
                onClick={() => setSelectedSubsystem(subsystem)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubsystem === subsystem
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {subsystem === 'ALL' ? (isAr ? 'الكل' : 'All') : subsystem}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث برقم الكتلة، الكود، الهاش...' : 'Search block, parcel, tx hash...'}
              value={merkleSearch}
              onChange={(e) => setMerkleSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Transaction Logs Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="px-3 py-2.5 font-bold">Block / Tx</th>
                <th className="px-3 py-2.5 font-bold">Subsystem</th>
                <th className="px-3 py-2.5 font-bold">Event Type</th>
                <th className="px-3 py-2.5 font-bold">Parcel / Asset</th>
                <th className="px-3 py-2.5 font-bold">Leaf Hash (SHA-256)</th>
                <th className="px-3 py-2.5 font-bold text-center">Merkle Proof</th>
                <th className="px-3 py-2.5 font-bold text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {filteredLeaves.map((leaf) => {
                const isVerified = verifiedLeavesMap[leaf.id] !== undefined 
                  ? verifiedLeavesMap[leaf.id] 
                  : leaf.isVerified;
                const isExpanded = expandedLeafId === leaf.id;

                return (
                  <React.Fragment key={leaf.id}>
                    <tr className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-bold text-white">#{leaf.blockHeight}</div>
                        <div className="text-[10px] text-slate-500">{leaf.id}</div>
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          leaf.sourceSubsystem === 'SolVision'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                            : leaf.sourceSubsystem === 'Kareema'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : leaf.sourceSubsystem === 'AtlasCloud'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {leaf.sourceSubsystem}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-sans">
                        <div className="text-slate-200 font-semibold text-xs truncate max-w-xs">
                          {isAr ? leaf.summaryAr : leaf.summary}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{leaf.eventType}</div>
                      </td>

                      <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">
                        <span className="font-bold text-cyan-300">{leaf.parcelCode}</span>
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px] block" title={leaf.leafHash}>
                          {leaf.leafHash.slice(0, 14)}...{leaf.leafHash.slice(-8)}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleVerifyIndividualLeaf(leaf)}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer ${
                            isVerified
                              ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title="Verify cryptographic inclusion proof against current Root"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{isAr ? 'إثبات سليم' : 'Valid Proof'}</span>
                        </button>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setExpandedLeafId(isExpanded ? null : leaf.id)}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Inspect Payload"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Drawer for Raw Leaf Payload */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={7} className="p-3.5 font-mono text-[11px]">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-slate-400 text-xs">
                              <span className="text-emerald-400 font-bold">TX Payload & Proof Details</span>
                              <span>Signer: {leaf.signerKey}</span>
                            </div>
                            <div className="text-slate-300 overflow-x-auto">
                              <pre>{JSON.stringify(leaf.rawPayload, null, 2)}</pre>
                            </div>
                            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                              <span>Sibling Hashes in Path: </span>
                              {leaf.merkleProof.map((p, idx) => (
                                <span key={idx} className="mr-2 text-cyan-400">
                                  [{p.position}]: {p.hash.slice(0, 10)}...
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive PostGIS Query Terminal */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'محرك الاستعلامات المكانية PostGIS (Spatial SQL Console)' : 'Interactive PostGIS Spatial SQL Console'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isAr ? 'نماذج جاهزة:' : 'Presets:'}</span>
            <select
              value={selectedQueryIndex}
              onChange={(e) => handleSelectPreset(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              {PRESET_QUERIES.map((q, idx) => (
                <option key={idx} value={idx}>
                  {isAr ? q.name : q.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="relative">
          <textarea
            value={activeQuerySql}
            onChange={(e) => setActiveQuerySql(e.target.value)}
            rows={4}
            className="w-full font-mono text-xs p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 focus:outline-none focus:border-emerald-500 font-semibold"
          />
          <button
            onClick={handleRunQuery}
            disabled={isExecuting}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAr ? 'تنفيذ الاستعلام المكاني' : 'Execute Spatial SQL'}</span>
          </button>
        </div>

        {/* Query Output Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{isAr ? 'مخرجات الاستعلام المكاني' : 'Query Results'} ({queryResults.length} records)</span>
            <span className="text-emerald-400 font-bold">{executionTimeMs}ms execution time</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  {Object.keys(queryResults[0] || {}).map((col) => (
                    <th key={col} className="px-3 py-2 font-bold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {queryResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 text-slate-300 truncate max-w-xs">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sovereign Cryptographic Audit Trail Standards */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'سجلات التدقيق الأمني والتشفير السيادي (Sovereign Audit Trail)' : 'Sovereign Audit & Encryption Trail'}</span>
        </h4>

        <div className="font-mono text-xs space-y-2 text-slate-300">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">ENCRYPTION-AT-REST:</span>
            <span>AES-256-GCM Hardware Security Module (HSM) Level 4</span>
            <span className="text-[10px] text-slate-500">VERIFIED</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">IN-TRANSIT SECURITY:</span>
            <span>mTLS v1.3 with Sovereign PKI Certificates</span>
            <span className="text-[10px] text-slate-500">ACTIVE</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">DATA RESIDENCY:</span>
            <span>
              {isAr 
                ? 'الأساسية: مركز الجزائر السيادي (DZ-North-1 - إفريقيا) | الاحتياطية: محفظة وهران (DZ-West-2)' 
                : 'Primary: Algiers Sovereign Center (DZ-North-1 - Africa) | Secondary: Oran Vault (DZ-West-2)'}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">COMPLIANT (DZ / AU)</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">MERKLE INTEGRITY:</span>
            <span>RFC 6962 SHA-256 Binary Tree with Zero-Knowledge Sibling Proofs</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% AUDITED</span>
          </div>
        </div>
      </div>

      {/* Merkle Audit Report Modal */}
      {isExportModalOpen && (
        <MerkleAuditReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          report={signedAuditReport}
          language={language}
          currentRole={currentRole}
          onElevateToSupervisor={onSelectRole ? () => onSelectRole('OPERATIONS_SUPERVISOR') : undefined}
        />
      )}

      {/* Sovereign Node Management & Cluster Topology Modal */}
      {isNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{isAr ? 'خريطة وإدارة العقد السحابية السيادية' : 'Sovereign Cloud Nodes & Data Residency'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {isAr ? 'الجزائر • قارة إفريقيا' : 'Algeria • Africa Region'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'العقدة الأساسية المعينة للمنظومة هي مركز الجزائر (DZ-North-1) لضمان السيادة الوطنية وتوطين البيانات.'
                      : 'Primary designated cluster node is Algiers Sovereign Center (DZ-North-1) ensuring continental data residency.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNodeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nodes list */}
            <div className="space-y-3">
              {SOVEREIGN_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white font-mono text-sm">{node.code}</span>
                          {node.isPrimary && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {isAr ? 'العقدة الأساسية (الجزائر - إفريقيا)' : 'PRIMARY NODE (Africa)'}
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-700">
                            {isAr ? node.continentAr : node.continentEn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {isAr ? node.nameAr : node.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Endpoint: {node.postGisEndpoint}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1 font-mono text-xs">
                        <div className="flex items-center gap-1.5 justify-end text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{node.uptimePercent}% Uptime</span>
                        </div>
                        <span className="text-cyan-400 block text-[11px]">{node.latencyMs}ms Latency</span>
                        <span className="text-[10px] text-slate-500 block">{node.tierClassification}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAr 
                    ? `العقدة النشطة حالياً: ${activeNode.code} (${activeNode.cityAr})`
                    : `Active Target Node: ${activeNode.code} (${activeNode.cityEn})`}
                </span>
              </div>
              <button
                onClick={() => setIsNodeModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                {isAr ? 'تأكيد وحفظ' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
