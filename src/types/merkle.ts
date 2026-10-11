import { Language, UserRole } from './ecosystem';

export interface MerkleProofStep {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleLeaf {
  id: string; // e.g. TX-ATLAS-2026-001
  blockHeight: number;
  timestamp: string;
  sourceSubsystem: 'SolVision' | 'Kareema' | 'AtlasCloud' | 'HSM-Enclave';
  eventType: string;
  dataBatch: string; // Specific data batch / batch ID, e.g. "BATCH-WHT-2026-Q3-089"
  txHash: string;
  assetId: string;
  parcelCode: string;
  summary: string;
  summaryAr: string;
  rawPayload: Record<string, any>;
  leafHash: string;
  merkleProof: MerkleProofStep[];
  isVerified: boolean;
  signerKey: string;
}

export interface MerkleTreeNode {
  id: string; // e.g. "node-root", "node-L1-0", "node-leaf-3"
  type: 'ROOT' | 'BRANCH' | 'LEAF';
  layerIndex: number; // 0 = leaves, 1 = parent branch, ..., N = root
  nodeIndex: number;
  hash: string;
  label: string;
  labelAr: string;
  timestamp?: string;
  dataBatch?: string;
  subsystem?: 'SolVision' | 'Kareema' | 'AtlasCloud' | 'HSM-Enclave';
  parcelCode?: string;
  summary?: string;
  summaryAr?: string;
  leafData?: MerkleLeaf;
  leftChildId?: string;
  rightChildId?: string;
  parentId?: string;
  siblingId?: string;
  coveredLeavesCount: number;
  coveredBatches: string[];
}

export interface MerkleTreeState {
  merkleRoot: string;
  totalLeaves: number;
  treeDepth: number;
  leaves: MerkleLeaf[];
  treeLayers: MerkleTreeNode[][];
  lastSealedAt: string;
  hsmRootCa: string;
  algorithm: string;
  complianceStandard: string;
}

export interface SignedAuditReport {
  reportHeader: {
    reportId: string;
    reportTitle: string;
    reportTitleAr: string;
    generatedAt: string;
    exportTimestampIso: string;
    exporter: {
      role: UserRole;
      roleTitleAr: string;
      roleTitleEn: string;
      operatorId: string;
      isAuthorized: boolean;
      authorizationStandard: string;
      terminal: string;
    };
    environment: string;
    sovereignJurisdiction: string;
    complianceFramework: string;
    sopReference: string;
  };
  merkleState: {
    merkleRoot: string;
    hashAlgorithm: string;
    totalTransactions: number;
    treeDepth: number;
    rootCA: string;
    zeroKnowledgeProofStatus: 'VERIFIED_VALID' | 'PENDING' | 'INVALID';
  };
  cryptographicSignature: {
    signatureAlgorithm: string;
    hsmKeyId: string;
    signatureHex: string;
    timestampAuthority: string;
    staCertificateThumbprint: string;
    publicKeyFingerprint: string;
    reportDigestSha256: string;
  };
  auditMetrics: {
    certifiedCropBatches: number;
    fieldWorkOrdersAudited: number;
    p1CriticalIncidents: number;
    spectralSentinelScans: number;
    offlineReconciledCount: number;
    dataLossPercent: number;
    auditIntegrityStatus: string;
  };
  transactionLogs: MerkleLeaf[];
}

export interface D3MerkleNode {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: D3MerkleNode[];
}

export interface HexDumpLine {
  offset: string;
  hex: string;
  ascii: string;
}

export interface NodeIntegrityVerificationResult {
  isPayloadMatch: boolean;
  isProofMatch: boolean;
  isOverallValid: boolean;
  computedHash: string;
  expectedHash: string;
  merkleRoot: string;
  proofStepsCount: number;
  hsmStandard: string;
  timestampVerified: string;
}

export interface BatchVerificationReport {
  reportMetadata: {
    reportId: string;
    generatedAt: string;
    standard: string;
    environment: string;
    jurisdiction: string;
    verifierRole: string;
  };
  targetBatch: {
    batchId: string;
    nodeId: string;
    nodeType: string;
    layerIndex: number;
    subsystem: string;
    parcelCode?: string;
    blockHeight: number;
    timestamp: string;
    summary: string;
  };
  verificationAudit: NodeIntegrityVerificationResult;
  merkleProofPath: MerkleProofStep[];
  rawBlockData: any;
  hexDumpPreview: HexDumpLine[];
}

export interface LiveCommitNotification {
  batchId: string;
  nodeId: string;
  blockHeight: number;
  subsystem: string;
  timestamp: string;
  summary: string;
  summaryAr: string;
  merkleRoot: string;
}

export interface LiveSyncState {
  isEnabled: boolean;
  isPolling: boolean;
  secondsRemaining: number;
  pollIntervalSeconds: number;
  lastPolledAt: string | null;
  totalBatchesCommittedLive: number;
  latestCommit: LiveCommitNotification | null;
}
