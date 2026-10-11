import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Database, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Layers, 
  Cpu, 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Satellite, 
  Radio, 
  FileCheck2, 
  HardDrive, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sliders,
  Binary,
  Zap,
  X,
  Play,
  Pause,
  FileSpreadsheet
} from 'lucide-react';
import Tree, { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import { MerkleTreeNode, MerkleTreeState, MerkleLeaf, LiveCommitNotification } from '../../types/merkle';
import { Language } from '../../types/ecosystem';
import { verifyMerkleProof, convertMerkleTreeToD3 } from '../../utils/merkleTree';
import { MerkleNodeDetailModal } from './MerkleNodeDetailModal';

interface MerkleTreeVisualizerProps {
  treeState: MerkleTreeState;
  language: Language;
  onOpenExportModal?: () => void;
  onExportAuditLogCSV?: () => void;
  // Live Sync 30-Second Polling & Commit Props
  isLiveSyncEnabled?: boolean;
  onToggleLiveSync?: () => void;
  secondsRemaining?: number;
  isPolling?: boolean;
  onSyncNow?: () => void;
  lastPolledAt?: string;
  totalLiveCommits?: number;
  latestCommitNotification?: LiveCommitNotification | null;
  onDismissNotification?: () => void;
}

// Resilient Error Boundary for Tree Component
interface TreeErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}
interface TreeErrorBoundaryState {
  hasError: boolean;
}
class TreeErrorBoundary extends React.Component<TreeErrorBoundaryProps, TreeErrorBoundaryState> {
  constructor(props: TreeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('D3 Tree fallback activated:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const MerkleTreeVisualizer: React.FC<MerkleTreeVisualizerProps> = ({
  treeState,
  language,
  onOpenExportModal,
  onExportAuditLogCSV,
  isLiveSyncEnabled = true,
  onToggleLiveSync,
  secondsRemaining = 30,
  isPolling = false,
  onSyncNow,
  lastPolledAt,
  totalLiveCommits = 0,
  latestCommitNotification,
  onDismissNotification
}) => {
  const isAr = language === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected node state & Detail Modal State (replaces old cramped side panel)
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    treeState.treeLayers[0]?.[0]?.id || 'node-root'
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');
  const [batchSearch, setBatchSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'d3' | 'hierarchical' | 'compact'>('d3');

  // Dynamic Quick Presets (incorporates newly committed batches dynamically without page reload)
  const quickPresets = useMemo(() => {
    const list: { label: string; id: string; isNew?: boolean }[] = [
      { label: 'ROOT-NODE', id: 'node-root' },
      { label: 'BATCH-WHT-089', id: 'node-leaf-0' },
      { label: 'BATCH-ALF-044', id: 'node-leaf-1' },
      { label: 'WO-2026-1002', id: 'node-leaf-2' },
      { label: 'RTK-FL001', id: 'node-leaf-3' }
    ];

    const leaves = treeState.treeLayers[0] || [];
    if (leaves.length > 8) {
      leaves.slice(8).forEach((leaf) => {
        list.push({
          label: leaf.dataBatch?.slice(0, 16) || leaf.label,
          id: leaf.id,
          isNew: true
        });
      });
    }

    return list;
  }, [treeState]);

  // D3 Tree Configuration
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 340, y: 70 });
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Update translate coordinates based on container size
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 560;
      if (orientation === 'vertical') {
        setTranslate({ x: Math.max(width / 2, 240), y: 75 });
      } else {
        setTranslate({ x: 120, y: Math.max(height / 2, 200) });
      }
    }
  }, [orientation, viewMode]);

  // Flatten all nodes into a quick lookup dictionary
  const nodeMap = useMemo(() => {
    const map = new Map<string, MerkleTreeNode>();
    treeState.treeLayers.forEach((layer) => {
      layer.forEach((node) => {
        map.set(node.id, node);
      });
    });
    return map;
  }, [treeState]);

  // Find currently selected node
  const selectedNode = useMemo(() => {
    return nodeMap.get(selectedNodeId) || treeState.treeLayers[0]?.[0] || null;
  }, [selectedNodeId, nodeMap, treeState]);

  // Convert MerkleTreeState into D3 hierarchical data
  const d3TreeData = useMemo(() => {
    return convertMerkleTreeToD3(treeState, isAr) as RawNodeDatum | null;
  }, [treeState, isAr]);

  // Compute ancestor path IDs for highlighting
  const activePathIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNode) return ids;

    let current: MerkleTreeNode | undefined = selectedNode;
    ids.add(current.id);

    const addDescendants = (n: MerkleTreeNode) => {
      if (n.leftChildId) {
        ids.add(n.leftChildId);
        const left = nodeMap.get(n.leftChildId);
        if (left) addDescendants(left);
      }
      if (n.rightChildId) {
        ids.add(n.rightChildId);
        const right = nodeMap.get(n.rightChildId);
        if (right) addDescendants(right);
      }
    };
    addDescendants(current);

    while (current && current.parentId) {
      ids.add(current.parentId);
      current = nodeMap.get(current.parentId);
    }

    return ids;
  }, [selectedNode, nodeMap]);

  // Filter leaves for the matrix or preset lists
  const leafNodes = treeState.treeLayers[0] || [];
  const filteredLeaves = useMemo(() => {
    return leafNodes.filter((node) => {
      const matchesSubsystem = subsystemFilter === 'ALL' || node.subsystem === subsystemFilter;
      const matchesSearch = !batchSearch || 
        (node.dataBatch && node.dataBatch.toLowerCase().includes(batchSearch.toLowerCase())) ||
        node.label.toLowerCase().includes(batchSearch.toLowerCase()) ||
        node.hash.toLowerCase().includes(batchSearch.toLowerCase()) ||
        (node.parcelCode && node.parcelCode.toLowerCase().includes(batchSearch.toLowerCase()));
      return matchesSubsystem && matchesSearch;
    });
  }, [leafNodes, subsystemFilter, batchSearch]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsDetailModalOpen(true);
  };

  const getSubsystemColor = (subsystem?: string) => {
    switch (subsystem) {
      case 'SolVision':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
        };
      case 'Kareema':
        return {
          bg: 'bg-cyan-500/15',
          border: 'border-cyan-500/40',
          text: 'text-cyan-400',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
        };
      case 'AtlasCloud':
        return {
          bg: 'bg-indigo-500/15',
          border: 'border-indigo-500/40',
          text: 'text-indigo-400',
          badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
        };
      default:
        return {
          bg: 'bg-teal-500/15',
          border: 'border-teal-500/40',
          text: 'text-teal-400',
          badge: 'bg-teal-950/80 text-teal-300 border-teal-700'
        };
    }
  };

  // Custom SVG Node Rendering for react-d3-tree
  const renderCustomNodeElement = ({
    nodeDatum,
    toggleNode
  }: CustomNodeElementProps) => {
    const nodeId = String(nodeDatum.attributes?.id || '');
    const isSelected = selectedNodeId === nodeId;
    const isLatestCommit = Boolean(
      latestCommitNotification &&
      (nodeDatum.attributes?.dataBatch === latestCommitNotification.batchId ||
       nodeDatum.attributes?.id === latestCommitNotification.nodeId)
    );
    const nodeType = (nodeDatum.attributes?.type as string) || 'LEAF';
    const subsystem = nodeDatum.attributes?.subsystem as string;
    const isRoot = nodeType === 'ROOT';
    const isBranch = nodeType === 'BRANCH';
    const hasChildren = Boolean(nodeDatum.children && nodeDatum.children.length > 0);

    let strokeColor = isLatestCommit ? '#34d399' : '#10b981';
    let fillColor = '#064e3b';
    let badgeBg = '#022c22';
    let headerLabel = isLatestCommit ? '⚡ LIVE COMMIT' : '🌿 LEAF';

    if (isRoot) {
      strokeColor = isSelected ? '#34d399' : '#10b981';
      fillColor = '#022c22';
      badgeBg = '#064e3b';
      headerLabel = isAr ? '🔒 جذر ميركل السيادي' : '🔒 SOVEREIGN ROOT';
    } else if (isBranch) {
      strokeColor = isSelected ? '#38bdf8' : '#0284c7';
      fillColor = '#082f49';
      badgeBg = '#0c4a6e';
      headerLabel = isAr ? '🔱 عقدة فرعية' : '🔱 MERKLE BRANCH';
    } else {
      if (subsystem === 'SolVision') {
        strokeColor = isSelected ? '#34d399' : '#059669';
        fillColor = '#064e3b';
        badgeBg = '#022c22';
        headerLabel = '🛰️ SolVision';
      } else if (subsystem === 'Kareema') {
        strokeColor = isSelected ? '#22d3ee' : '#0891b2';
        fillColor = '#083344';
        badgeBg = '#164e63';
        headerLabel = '🚜 Kareema';
      } else if (subsystem === 'AtlasCloud') {
        strokeColor = isSelected ? '#818cf8' : '#4f46e5';
        fillColor = '#1e1b4b';
        badgeBg = '#312e81';
        headerLabel = '☁️ AtlasCloud';
      } else {
        strokeColor = isSelected ? '#2dd4bf' : '#0d9488';
        fillColor = '#134e4a';
        badgeBg = '#115e59';
        headerLabel = '🔐 HSM-Enclave';
      }
    }

    const width = 184;
    const height = 66;

    return (
      <g
        onClick={(e) => {
          e.stopPropagation();
          if (nodeId) handleNodeClick(nodeId);
        }}
        className="cursor-pointer select-none group"
        style={{ cursor: 'pointer' }}
      >
        {/* Glow effect on selected */}
        {isSelected && (
          <rect
            x={-width / 2 - 4}
            y={-height / 2 - 4}
            width={width + 8}
            height={height + 8}
            rx={12}
            fill="none"
            stroke={strokeColor}
            strokeWidth={3}
            strokeDasharray="4 2"
            opacity={0.85}
          />
        )}

        {/* Pulsing ring on newly committed live node if not actively selected */}
        {isLatestCommit && !isSelected && (
          <rect
            x={-width / 2 - 4}
            y={-height / 2 - 4}
            width={width + 8}
            height={height + 8}
            rx={12}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            opacity={0.95}
          />
        )}

        {/* Node Body Card */}
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={8}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? 2.5 : isLatestCommit ? 2 : 1.5}
          fillOpacity={0.92}
        />

        {/* Live indicator mini pill on top-right */}
        {isLatestCommit && (
          <g transform={`translate(${width / 2 - 24}, ${-height / 2 + 13})`}>
            <rect
              x={-13}
              y={-6.5}
              width={26}
              height={13}
              rx={3}
              fill="#10b981"
            />
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              LIVE
            </text>
          </g>
        )}

        {/* Top Header Strip */}
        <rect
          x={-width / 2 + 5}
          y={-height / 2 + 5}
          width={width - 10}
          height={16}
          rx={4}
          fill={badgeBg}
          fillOpacity={0.85}
        />
        <text
          x={0}
          y={-height / 2 + 17}
          textAnchor="middle"
          fill="#f1f5f9"
          fontSize="9.5"
          fontFamily="sans-serif"
          fontWeight="bold"
        >
          {headerLabel}
        </text>

        {/* Center: Title / Data Batch */}
        <text
          x={0}
          y={-height / 2 + 36}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {String(nodeDatum.name).length > 21
            ? `${String(nodeDatum.name).slice(0, 19)}...`
            : String(nodeDatum.name)}
        </text>

        {/* Bottom: Truncated Hash */}
        <text
          x={0}
          y={-height / 2 + 52}
          textAnchor="middle"
          fill="#6ee7b7"
          fontSize="9"
          fontFamily="monospace"
        >
          {nodeDatum.attributes?.hash ? String(nodeDatum.attributes.hash) : ''}
        </text>

        {/* Expand/Collapse badge if children exist */}
        {hasChildren && (
          <g
            onClick={(e) => {
              e.stopPropagation();
              toggleNode();
            }}
            transform={`translate(${width / 2 - 1}, 0)`}
          >
            <circle
              r={7.5}
              fill="#0f172a"
              stroke={strokeColor}
              strokeWidth={1.5}
            />
            <text
              textAnchor="middle"
              dy={3}
              fill="#e2e8f0"
              fontSize="9"
              fontWeight="bold"
            >
              {nodeDatum.__rd3t?.collapsed ? '+' : '−'}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col space-y-4 p-4 lg:p-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'التمثيل المرئي لشجرة ميركل ومكتبة D3 التفاعلية' : 'Interactive D3 Merkle Tree & Batch Verification'}</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              react-d3-tree
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              RFC 6962
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'انقر على أي عقدة (Node) لفتح نافذة الفحص الشاملة التي تتضمن تفريغ البيانات السداسية (JSON Hex-Dump)، وزر التحقق من السلامة التشفيرية (Verify Integrity)، وتنزيل تقارير التدقيق بصيغة PDF أو JSON.'
              : 'Click any node to open the detailed modal featuring binary JSON hex-dump, Verify Integrity cross-check, and downloadable PDF or JSON verification reports.'}
          </p>
        </div>

        {/* View Mode & Subsystem Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('d3')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'd3' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{isAr ? 'شجرة D3 التفاعلية' : 'react-d3-tree'}</span>
            </button>
            <button
              onClick={() => setViewMode('hierarchical')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'hierarchical' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'المخطط الشبكي' : 'Grid View'}
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'compact' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'مصفوفة الدفعات' : 'Batch Matrix'}
            </button>
          </div>

          {onExportAuditLogCSV && (
            <button
              onClick={onExportAuditLogCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-600/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={isAr ? 'تصدير سجل تدقيق شجرة ميركل للامتثال التنظيمي كملف CSV' : 'Export Merkle tree transaction history & batch validation timestamps as CSV'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تصدير سجل التدقيق (CSV)' : 'Export Audit Log (CSV)'}</span>
            </button>
          )}

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير التقرير الموقّع' : 'Signed Report'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION: Live Sync & 30-Second Polling Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Sync Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isLiveSyncEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isAr ? 'المزامنة الحية (Live Sync):' : 'Live Sync:'}</span>
            </span>

            <button
              onClick={onToggleLiveSync}
              type="button"
              role="switch"
              aria-checked={isLiveSyncEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isLiveSyncEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
              title={isAr ? 'تشغيل أو إيقاف استطلاع الكتل كل 30 ثانية' : 'Toggle 30s batch polling cycle'}
            >
              <span className="sr-only">Toggle Live Sync</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isLiveSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Status Badge with Ping & Countdown */}
          {isLiveSyncEnabled ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">{isAr ? 'مزامنة نشطة' : 'LIVE ACTIVE'}</span>
              <span className="text-slate-400">•</span>
              {isPolling ? (
                <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{isAr ? 'جاري الاستطلاع...' : 'Polling consensus...'}</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">
                  {isAr ? `خلال ${secondsRemaining} ثانية` : `in ${secondsRemaining}s`}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-slate-500"></span>
              <span>{isAr ? 'المزامنة متوقفة مؤقتاً' : 'SYNC PAUSED'}</span>
            </div>
          )}

          {/* Mini Linear Progress Bar for 30s Countdown */}
          {isLiveSyncEnabled && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, ((30 - secondsRemaining) / 30) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">30s cycle</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Last Polled Time */}
          {lastPolledAt && (
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
              {isAr ? 'آخر فحص:' : 'Last Poll:'} <span className="text-slate-300">{lastPolledAt}</span>
            </span>
          )}

          {/* Live Commits Counter Badge */}
          {totalLiveCommits > 0 && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/70 border border-cyan-800 text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>+{totalLiveCommits} {isAr ? 'دفعات حية' : 'live commits'}</span>
            </span>
          )}

          {/* Manual Sync Now Button */}
          {onSyncNow && (
            <button
              onClick={onSyncNow}
              disabled={isPolling}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              title={isAr ? 'استطلاع دفعة جديدة فوراً' : 'Poll new batch commit immediately'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
              <span>{isAr ? 'مزامنة الآن' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Commit Notification Toast Banner */}
      {latestCommitNotification && (
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-lg bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border border-emerald-500/50 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <div>
              <span className="font-bold text-white">
                {isAr ? 'تم اعتماد دفعة جديدة في شجرة ميركل:' : 'New Batch Committed to Merkle Tree:'}
              </span>
              <span className="ml-1.5 font-mono text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                {latestCommitNotification.batchId}
              </span>
              <span className="ml-2 text-slate-400 font-mono text-[11px]">
                (Block #{latestCommitNotification.blockHeight}) • {isAr ? latestCommitNotification.summaryAr : latestCommitNotification.summary}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                handleNodeClick(latestCommitNotification.nodeId);
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {isAr ? 'فحص الدفعة' : 'Inspect Node'}
            </button>
            {onDismissNotification && (
              <button
                onClick={onDismissNotification}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Quick Batch Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 font-mono text-[11px] shrink-0">
            {isAr ? 'تحديد سريع:' : 'Quick Select:'}
          </span>
          {quickPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleNodeClick(preset.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                selectedNodeId === preset.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-1 ring-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{preset.label}</span>
              {preset.isNew && (
                <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-300 font-bold">
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم الدفعة أو الهاش...' : 'Search batch or hash...'}
            value={batchSearch}
            onChange={(e) => setBatchSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* FULL-WIDTH VISUAL TREE CANVAS (Side panel replaced by full modal on click) */}
      <div className="w-full flex flex-col space-y-3">
        {viewMode === 'd3' && d3TreeData ? (
          /* REACT-D3-TREE INTERACTIVE FULL-WIDTH VISUALIZATION */
          <div 
            ref={containerRef}
            className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 h-[560px] w-full overflow-hidden flex flex-col shadow-xl"
          >
            {/* Floating D3 Controls Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 shadow-xl">
              <button
                onClick={() => setOrientation(orientation === 'vertical' ? 'horizontal' : 'vertical')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle Vertical / Horizontal Tree Layout"
              >
                <Sliders className="w-3 h-3" />
                <span>{orientation === 'vertical' ? 'Top-Down' : 'Left-Right'}</span>
              </button>

              <div className="h-4 w-px bg-slate-700"></div>

              <button
                onClick={() => {
                  if (containerRef.current) {
                    const width = containerRef.current.clientWidth;
                    const height = containerRef.current.clientHeight;
                    if (orientation === 'vertical') {
                      setTranslate({ x: width / 2, y: 75 });
                    } else {
                      setTranslate({ x: 120, y: height / 2 });
                    }
                    setZoomLevel(0.85);
                  }
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Recenter Tree View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.0))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.4))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Hint Indicator */}
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-950/85 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm">
              {isAr ? 'انقر على أي عقدة لفتح نافذة التدقيق وتفريغ الـ Hex-Dump • اسحب للتحريك • استخدم عجلة الفأرة للتكبير' : 'Click any node to open detailed modal with JSON Hex-Dump • Drag to pan • Wheel to zoom'}
            </div>

            {/* D3 Tree Render inside ErrorBoundary */}
            <TreeErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-mono p-4">
                  <p>{isAr ? 'عذراً، حدث خطأ أثناء تشغيل شجرة D3.' : 'D3 Tree rendered with fallback.'}</p>
                  <button
                    onClick={() => setViewMode('hierarchical')}
                    className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-xs"
                  >
                    {isAr ? 'التبديل إلى المخطط الشبكي' : 'Switch to Grid View'}
                  </button>
                </div>
              }
            >
              <Tree
                key={`rd3t-${treeState.totalLeaves}-${treeState.merkleRoot.slice(-6)}`}
                data={d3TreeData}
                orientation={orientation}
                translate={translate}
                zoom={zoomLevel}
                scaleExtent={{ min: 0.3, max: 2.5 }}
                pathFunc="step"
                collapsible={true}
                separation={{ siblings: 1.25, nonSiblings: 1.45 }}
                nodeSize={orientation === 'vertical' ? { x: 220, y: 110 } : { x: 120, y: 220 }}
                pathClassFunc={() => '!stroke-slate-700 !stroke-[1.8px]'}
                renderCustomNodeElement={renderCustomNodeElement}
              />
            </TreeErrorBoundary>
          </div>
        ) : viewMode === 'hierarchical' ? (
          /* HIERARCHICAL CANVAS VIEW */
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-6 overflow-x-auto min-h-[480px] flex flex-col justify-between">
            {/* TIER 3: Sovereign Root Node */}
            <div className="flex flex-col items-center">
              {(() => {
                const rootNode = treeState.treeLayers[treeState.treeLayers.length - 1]?.[0];
                if (!rootNode) return null;
                const isSelected = selectedNodeId === rootNode.id;
                const isInPath = activePathIds.has(rootNode.id);

                return (
                  <div
                    onClick={() => handleNodeClick(rootNode.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer max-w-md w-full text-center group ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-400 ring-2 ring-emerald-400 shadow-xl shadow-emerald-950/70 scale-[1.02]'
                        : isInPath
                        ? 'bg-slate-900 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <Lock className="w-3 h-3" />
                        <span>{isAr ? 'جذر ميركل السيادي' : 'Sovereign Merkle Root'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {treeState.totalLeaves} Leaves Sealed
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-emerald-300 truncate" title={rootNode.hash}>
                      {rootNode.hash}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 font-mono truncate">
                      <span className="text-slate-500">Batches: </span>
                      {rootNode.coveredBatches.length} Verified Records
                    </div>

                    <div className="mt-1.5 text-[10px] text-slate-500 font-sans group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                      <Binary className="w-3 h-3" />
                      <span>{isAr ? 'انقر لفتح تفريغ الـ HexDump وفحص الهاش ←' : 'Click to inspect block & JSON Hex-Dump →'}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="w-0.5 h-6 bg-slate-700 my-1"></div>
            </div>

            {/* TIER 2: Intermediate Branch Layers */}
            {treeState.treeLayers.length > 2 && (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {isAr ? 'الطبقة الفرعية الوسيطة (Branch Level 1)' : 'Intermediate Branch Layer'}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {treeState.treeLayers[1]?.map((branchNode) => {
                    const isSelected = selectedNodeId === branchNode.id;
                    const isInPath = activePathIds.has(branchNode.id);

                    return (
                      <div
                        key={branchNode.id}
                        onClick={() => handleNodeClick(branchNode.id)}
                        className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/60'
                            : isInPath
                            ? 'bg-slate-900/90 border-cyan-500/60'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="text-cyan-400 font-bold">{branchNode.label}</span>
                          <span>{branchNode.coveredLeavesCount} leaves</span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate" title={branchNode.hash}>
                          {branchNode.hash.slice(0, 10)}...{branchNode.hash.slice(-6)}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-1">
                          {branchNode.dataBatch}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-0.5 h-6 bg-slate-700 my-1"></div>
              </div>
            )}

            {/* TIER 1: Leaf Transaction Nodes (Layer 0) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'أوراق المعاملات والدفعات الميدانية (Leaf Nodes)' : 'Transaction & Data Batch Leaves'}</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {filteredLeaves.length} {isAr ? 'عقدة نشطة' : 'Nodes'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {filteredLeaves.map((leafNode) => {
                  const isSelected = selectedNodeId === leafNode.id;
                  const isInPath = activePathIds.has(leafNode.id);
                  const colors = getSubsystemColor(leafNode.subsystem);

                  return (
                    <div
                      key={leafNode.id}
                      onClick={() => handleNodeClick(leafNode.id)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400 shadow-lg shadow-emerald-950/60 scale-[1.02]'
                          : isInPath
                          ? 'bg-slate-900/90 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${colors.badge}`}>
                          {leafNode.subsystem}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          #{leafNode.leafData?.blockHeight || leafNode.nodeIndex}
                        </span>
                      </div>

                      <div className="space-y-0.5 mb-2">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">
                          {isAr ? 'دفعة البيانات:' : 'Data Batch:'}
                        </span>
                        <div className="font-mono font-bold text-white text-xs truncate" title={leafNode.dataBatch}>
                          {leafNode.dataBatch}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 font-sans line-clamp-2 mb-2">
                        {isAr ? leafNode.summaryAr : leafNode.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="truncate max-w-[100px] text-slate-400" title={leafNode.hash}>
                          {leafNode.hash.slice(0, 8)}...
                        </span>
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-sans">
                          <Binary className="w-3 h-3" />
                          <span>HexDump</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* COMPACT BATCH MATRIX VIEW */
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>{isAr ? 'مصفوفة سجلات دفعات شجرة ميركل' : 'Merkle Transaction Batch Matrix'}</span>
              <span className="text-xs text-slate-400 font-mono">{filteredLeaves.length} entries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredLeaves.map((leafNode) => {
                const isSelected = selectedNodeId === leafNode.id;
                const colors = getSubsystemColor(leafNode.subsystem);

                return (
                  <div
                    key={leafNode.id}
                    onClick={() => handleNodeClick(leafNode.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-white">{leafNode.dataBatch}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${colors.badge}`}>
                        {leafNode.subsystem}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans line-clamp-1">
                      {isAr ? leafNode.summaryAr : leafNode.summary}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[120px]">{leafNode.hash}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Binary className="w-3 h-3" />
                        <span>{isAr ? 'فحص HexDump ←' : 'HexDump →'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM ACTIVE NODE ACTION STRIP */}
        {selectedNode && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
              <div className="truncate">
                <span className="text-slate-400 mr-2">
                  {isAr ? 'العقدة المحددة:' : 'Active Node:'}
                </span>
                <span className="font-bold text-white mr-2">
                  {selectedNode.label}
                </span>
                <span className="text-emerald-400 text-[11px] truncate">
                  [{selectedNode.hash.slice(0, 12)}...{selectedNode.hash.slice(-6)}]
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Binary className="w-3.5 h-3.5" />
              <span>{isAr ? 'فتح نافذة تدقيق الكتلة وتفريغ الـ Hex-Dump' : 'Open Block Inspector & Hex-Dump'}</span>
            </button>
          </div>
        )}
      </div>

      {/* THE DETAILED MODAL REPLACING THE CRAMPED SIDE PANEL */}
      <MerkleNodeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        node={selectedNode}
        merkleRoot={treeState.merkleRoot}
        language={language}
      />
    </div>
  );
};
