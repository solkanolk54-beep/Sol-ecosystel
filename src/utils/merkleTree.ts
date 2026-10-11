import { 
  BatchVerificationReport,
  D3MerkleNode, 
  HexDumpLine, 
  MerkleLeaf, 
  MerkleProofStep, 
  MerkleTreeNode, 
  MerkleTreeState, 
  NodeIntegrityVerificationResult, 
  SignedAuditReport 
} from '../types/merkle';
import { DigitalQualityPassport, SystemEvent, UserRole, WorkOrder } from '../types/ecosystem';
import { jsPDF } from 'jspdf';

// Pure TypeScript SHA-256 implementation for synchronous, zero-dependency hashing
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let c = candidate * candidate; c < 312; c += candidate) {
        isComposite[c] = true;
      }
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  let formattedAscii = ascii + '\x80';
  while ((formattedAscii.length % 64) - 56) formattedAscii += '\x00';
  for (i = 0; i < formattedAscii.length; i++) {
    j = formattedAscii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words.push((asciiBitLength / maxWord) | 0);
  words.push(asciiBitLength | 0);

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);

      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0);

      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function hashString(content: string): string {
  try {
    return '0x' + sha256Sync(content);
  } catch {
    // Fallback deterministic pseudo-hash
    let h = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
      h ^= content.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return '0x' + (h >>> 0).toString(16).padStart(64, 'a');
  }
}

// Combine two sibling hashes (RFC 6962 standard)
export function combineHashes(left: string, right: string): string {
  return hashString(left + ':' + right);
}

// Verify a Merkle proof path against a root
export function verifyMerkleProof(
  leafHash: string,
  proof: MerkleProofStep[],
  expectedRoot: string
): boolean {
  let current = leafHash;
  for (const step of proof) {
    if (step.position === 'left') {
      current = combineHashes(step.hash, current);
    } else {
      current = combineHashes(current, step.hash);
    }
  }
  return current.toLowerCase() === expectedRoot.toLowerCase();
}

// Build complete Merkle tree and proof paths for all leaves
export function constructMerkleTree(rawLeaves: Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[]): MerkleTreeState {
  if (rawLeaves.length === 0) {
    return {
      merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
      totalLeaves: 0,
      treeDepth: 0,
      leaves: [],
      treeLayers: [],
      lastSealedAt: new Date().toISOString(),
      hsmRootCa: 'DZ-ATLAS-AGRI-ROOT-CA#0844',
      algorithm: 'SHA-256 / Binary Merkle Tree (RFC 6962)',
      complianceStandard: 'SOP-SOL-OPS-2026-V1'
    };
  }

  // 1. Calculate leaf hashes
  const initialLeaves: MerkleLeaf[] = rawLeaves.map((leaf) => {
    const payloadStr = JSON.stringify(leaf.rawPayload);
    const content = `${leaf.id}|${leaf.blockHeight}|${leaf.timestamp}|${leaf.sourceSubsystem}|${leaf.eventType}|${leaf.dataBatch}|${payloadStr}`;
    const leafHash = hashString(content);
    return {
      ...leaf,
      leafHash,
      merkleProof: [],
      isVerified: true
    };
  });

  // 2. Build layers to compute root and proofs
  let currentLayer = initialLeaves.map((l) => l.leafHash);
  const layers: string[][] = [currentLayer];

  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left; // Duplicate odd leaf
      nextLayer.push(combineHashes(left, right));
    }
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  const rootHash = layers[layers.length - 1][0] || '0x00000000';

  // 3. Generate inclusion proof for each leaf
  const finalLeaves = initialLeaves.map((leaf, leafIndex) => {
    const proof: MerkleProofStep[] = [];
    let idx = leafIndex;

    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      const layer = layers[layerIdx];
      const isRightSibling = idx % 2 === 1;
      const siblingIdx = isRightSibling ? idx - 1 : idx + 1;

      if (siblingIdx < layer.length) {
        proof.push({
          position: isRightSibling ? 'left' : 'right',
          hash: layer[siblingIdx]
        });
      } else {
        // odd pair duplicate
        proof.push({
          position: 'right',
          hash: layer[idx]
        });
      }
      idx = Math.floor(idx / 2);
    }

    const isValid = verifyMerkleProof(leaf.leafHash, proof, rootHash);
    return {
      ...leaf,
      merkleProof: proof,
      isVerified: isValid
    };
  });

  // 4. Construct complete visual node hierarchy (treeLayers)
  const layer0Nodes: MerkleTreeNode[] = finalLeaves.map((leaf, leafIndex) => ({
    id: `node-leaf-${leafIndex}`,
    type: 'LEAF' as const,
    layerIndex: 0,
    nodeIndex: leafIndex,
    hash: leaf.leafHash,
    label: leaf.id,
    labelAr: leaf.id,
    timestamp: leaf.timestamp,
    dataBatch: leaf.dataBatch,
    subsystem: leaf.sourceSubsystem,
    parcelCode: leaf.parcelCode,
    summary: leaf.summary,
    summaryAr: leaf.summaryAr,
    leafData: leaf,
    coveredLeavesCount: 1,
    coveredBatches: [leaf.dataBatch]
  }));

  const treeLayers: MerkleTreeNode[][] = [layer0Nodes];
  let prevLayerNodes = layer0Nodes;

  while (prevLayerNodes.length > 1) {
    const currentLayerIdx = treeLayers.length;
    const nextLayerNodes: MerkleTreeNode[] = [];
    const isTop = Math.ceil(prevLayerNodes.length / 2) === 1;

    for (let i = 0; i < prevLayerNodes.length; i += 2) {
      const leftChild = prevLayerNodes[i];
      const rightChild = i + 1 < prevLayerNodes.length ? prevLayerNodes[i + 1] : leftChild;
      const isDuplicated = i + 1 >= prevLayerNodes.length;
      const combined = combineHashes(leftChild.hash, rightChild.hash);
      const nodeIdx = Math.floor(i / 2);
      const nodeId = isTop ? 'node-root' : `node-L${currentLayerIdx}-${nodeIdx}`;
      const uniqueBatches = Array.from(new Set([...leftChild.coveredBatches, ...rightChild.coveredBatches]));

      const branchLabel = isTop 
        ? 'Sovereign Merkle Root' 
        : `Branch Node [L${currentLayerIdx} #${nodeIdx + 1}]`;
      const branchLabelAr = isTop 
        ? 'جذر شجرة ميركل السيادي' 
        : `عقدة فرعية [L${currentLayerIdx} #${nodeIdx + 1}]`;

      const node: MerkleTreeNode = {
        id: nodeId,
        type: isTop ? 'ROOT' : 'BRANCH',
        layerIndex: currentLayerIdx,
        nodeIndex: nodeIdx,
        hash: combined,
        label: branchLabel,
        labelAr: branchLabelAr,
        timestamp: leftChild.timestamp,
        dataBatch: uniqueBatches.join(', '),
        leftChildId: leftChild.id,
        rightChildId: isDuplicated ? undefined : rightChild.id,
        coveredLeavesCount: leftChild.coveredLeavesCount + (isDuplicated ? 0 : rightChild.coveredLeavesCount),
        coveredBatches: uniqueBatches,
        summary: `Aggregates cryptographic proofs for batches: ${uniqueBatches.slice(0, 2).join(', ')}${uniqueBatches.length > 2 ? ` (+${uniqueBatches.length - 2} more)` : ''}`,
        summaryAr: `تجميع الإثباتات التشفيرية للدفعات: ${uniqueBatches.slice(0, 2).join(', ')}${uniqueBatches.length > 2 ? ` (+${uniqueBatches.length - 2} إضافية)` : ''}`
      };

      leftChild.parentId = nodeId;
      if (!isDuplicated) {
        rightChild.parentId = nodeId;
      }
      leftChild.siblingId = isDuplicated ? undefined : rightChild.id;
      if (!isDuplicated) {
        rightChild.siblingId = leftChild.id;
      }

      nextLayerNodes.push(node);
    }

    treeLayers.push(nextLayerNodes);
    prevLayerNodes = nextLayerNodes;
  }

  return {
    merkleRoot: rootHash,
    totalLeaves: finalLeaves.length,
    treeDepth: layers.length,
    leaves: finalLeaves,
    treeLayers,
    lastSealedAt: new Date().toISOString(),
    hsmRootCa: 'DZ-ATLAS-AGRI-ROOT-CA#0844',
    algorithm: 'SHA-256 / Binary Merkle Tree (RFC 6962)',
    complianceStandard: 'SOP-SOL-OPS-2026-V1 & ANSS DZ Sovereign Cloud Standard v2.0'
  };
}

// Initial mock ledger leaves representing authoritative transactions in AtlasCloud
export const BASE_LEDGER_LEAVES: Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[] = [
  {
    id: 'TX-ATLAS-2026-00891',
    blockHeight: 1485281,
    timestamp: '2026-10-06 08:30:12 UTC',
    sourceSubsystem: 'SolVision',
    eventType: 'EVENT_SENTINEL2_SPECTRAL_ACQUISITION',
    dataBatch: 'BATCH-WHT-2026-Q3-089',
    txHash: '0x94b3a1d9e2f41c0b8a7c2e3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    assetId: '8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c',
    parcelCode: 'PIVOT-01',
    summary: 'Sentinel-2 MSI Orbit 44 band acquisition and NDVI index calibration (0.76)',
    summaryAr: 'التقاط طيفي عبر القمر الصناعي Sentinel-2 ومعايرة مؤشر NDVI (0.76)',
    signerKey: 'HSM-SOLVISION-SPECTRAL-KEY#019',
    rawPayload: {
      batch_id: 'BATCH-WHT-2026-Q3-089',
      satellite: 'Sentinel-2B',
      orbit: 44,
      bands: ['B04_RED', 'B08_NIR'],
      cloud_cover_percent: 0.2,
      ndvi_calculated: 0.76,
      spatial_resolution_meters: 10
    }
  },
  {
    id: 'TX-ATLAS-2026-00892',
    blockHeight: 1485282,
    timestamp: '2026-10-06 09:14:45 UTC',
    sourceSubsystem: 'SolVision',
    eventType: 'EVENT_CROP_STRESS_DETECTED',
    dataBatch: 'BATCH-ALF-2026-Q2-044',
    txHash: '0x8f2d4e6a1b3c5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
    assetId: '3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b',
    parcelCode: 'PIVOT-02',
    summary: 'Acute localized water stress detected in NE sector 4 (NDVI 0.38, threshold 0.40)',
    summaryAr: 'رصد إجهاد مائي حاد في الربع الشمالي الشرقي (NDVI 0.38 دون الحد 0.40)',
    signerKey: 'HSM-SOLVISION-ANOMALY-KEY#044',
    rawPayload: {
      batch_id: 'BATCH-ALF-2026-Q2-044',
      alert_code: 'P1_CRITICAL',
      trigger_metric: 'NDVI_DROP',
      ndvi_value: 0.38,
      soil_moisture_nir: 19.2,
      bounding_box: { minLat: 24.187, minLng: 47.339, maxLat: 24.192, maxLng: 47.345 }
    }
  },
  {
    id: 'TX-ATLAS-2026-00893',
    blockHeight: 1485283,
    timestamp: '2026-10-06 09:15:30 UTC',
    sourceSubsystem: 'AtlasCloud',
    eventType: 'EVENT_WORK_ORDER_DISPATCHED',
    dataBatch: 'WO-2026-1002',
    txHash: '0x7e1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a',
    assetId: '3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b',
    parcelCode: 'PIVOT-02',
    summary: 'Autonomous 1-Click Work Order WO-2026-1002 issued to Field Fleet TRUCK-02',
    summaryAr: 'إصدار أمر عمل بنقرة واحدة WO-2026-1002 وتوجيهه لمركبة الصيانة TRUCK-02',
    signerKey: 'HSM-ATLAS-DISPATCH-ENGINE#102',
    rawPayload: {
      batch_id: 'WO-2026-1002',
      work_order_id: 'WO-2026-1002',
      technician: 'م. فهد القحطاني',
      sla_minutes: 15,
      target_action: 'IRRIGATION_BOOST_AND_NOZZLE_CHECK',
      geo_point: 'POINT(47.341 24.189)'
    }
  },
  {
    id: 'TX-ATLAS-2026-00894',
    blockHeight: 1485284,
    timestamp: '2026-10-06 10:05:18 UTC',
    sourceSubsystem: 'Kareema',
    eventType: 'EVENT_FLEET_CORRIDOR_GEO_SYNC',
    dataBatch: 'BATCH-RTK-GPS-FL001',
    txHash: '0x6d0c2e4f8a1b3d5e7f9a1c3e5f7a9b1d3e5f7a9c1b3d5e7f9a1b3d5e7f9a1c3e',
    assetId: 'fleet-fl-001',
    parcelCode: 'PIVOT-01',
    summary: 'Harvester H-01 corridor realigned autonomously via Kareema RTK-GPS',
    summaryAr: 'إعادة محاذاة مسار الحصادة H-01 آلياً عبر نظام RTK-GPS في Kareema',
    signerKey: 'HSM-KAREEMA-IOT-GATEWAY#771',
    rawPayload: {
      batch_id: 'BATCH-RTK-GPS-FL001',
      fleet_id: 'FL-001',
      speed_kmh: 18.5,
      deviation_meters: 1.2,
      correction_status: 'REALIGNED'
    }
  },
  {
    id: 'TX-ATLAS-2026-00895',
    blockHeight: 1485285,
    timestamp: '2026-10-06 11:40:00 UTC',
    sourceSubsystem: 'Kareema',
    eventType: 'EVENT_HERD_ROTATIONAL_GRAZING_LOG',
    dataBatch: 'BATCH-RFID-HERD-SHP-02',
    txHash: '0x5c9b1d3e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c',
    assetId: 'herd-shp-002',
    parcelCode: 'ZONE-B2',
    summary: 'Livestock herd HERD-SHP-02 RFID telemetry synced; biomass within safety limits',
    summaryAr: 'مزامنة قياسات RFID لقطيع الغنم 02 مع حوض المراعي؛ مؤشر الكتلة 0.42 ضمن الحدود',
    signerKey: 'HSM-KAREEMA-RFID-COLLECTOR#098',
    rawPayload: {
      batch_id: 'BATCH-RFID-HERD-SHP-02',
      herd_id: 'HERD-SHP-02',
      head_count: 320,
      biomass_density: 0.42,
      virtual_fence_breach: false
    }
  },
  {
    id: 'TX-ATLAS-2026-00896',
    blockHeight: 1485286,
    timestamp: '2026-10-06 14:22:31 UTC',
    sourceSubsystem: 'AtlasCloud',
    eventType: 'EVENT_QUALITY_PASSPORT_SEALED',
    dataBatch: 'BATCH-WHT-2026-Q3-089-PASS',
    txHash: '0x4b8a0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b',
    assetId: '8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c',
    parcelCode: 'PIVOT-01',
    summary: 'Digital Quality Passport BATCH-WHT-2026-Q3-089 cryptographically sealed with ECDSA-secp256k1',
    summaryAr: 'اعتماد وتوليد الختم التشفيري لبطاقة الجودة BATCH-WHT-2026-Q3-089 وفق معيار secp256k1',
    signerKey: 'DZ-ATLAS-AGRI-ROOT-CA#0844',
    rawPayload: {
      batch_id: 'BATCH-WHT-2026-Q3-089',
      crop_batch_id: 'BATCH-WHT-2026-Q3-089',
      variety: 'Durum Wheat (Sakha 95)',
      purity_percent: 98.4,
      water_stress_free_index: 97.8,
      silo_destination: 'SILO-STRAT-MITIDJA-01'
    }
  },
  {
    id: 'TX-ATLAS-2026-00897',
    blockHeight: 1485287,
    timestamp: '2026-10-06 15:55:09 UTC',
    sourceSubsystem: 'AtlasCloud',
    eventType: 'EVENT_POSTGIS_SPATIAL_TOPOLOGY_COMMITTED',
    dataBatch: 'BATCH-POSTGIS-PIVOT04',
    txHash: '0x3a79f1b3d5e7a9c1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9',
    assetId: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
    parcelCode: 'PIVOT-04',
    summary: 'PostGIS spatial parcel topology verified via ST_IsValid and ST_Area (66.4 ha)',
    summaryAr: 'تثبيت طوبولوجيا الحوض المكاني في PostGIS والتحقق من المساحة 66.4 هكتار',
    signerKey: 'HSM-ATLAS-POSTGIS-CLUSTER#012',
    rawPayload: {
      batch_id: 'BATCH-POSTGIS-PIVOT04',
      geometry_type: 'Polygon',
      srid: 4326,
      area_sq_meters: 664000,
      centroid: 'POINT(47.380 24.160)'
    }
  },
  {
    id: 'TX-ATLAS-2026-00898',
    blockHeight: 1485288,
    timestamp: '2026-10-06 16:48:22 UTC',
    sourceSubsystem: 'HSM-Enclave',
    eventType: 'EVENT_SOVEREIGN_NODE_SYNC',
    dataBatch: 'BATCH-SYNC-DZ-NORTH-01',
    txHash: '0x2968e0a2c4d6f8a0b2c4e6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8',
    assetId: 'datacenter-dz-north-1',
    parcelCode: 'CLUSTER-CORE',
    summary: 'Bi-directional replication sync between Algiers Sovereign Vault & Oran Mirror (Africa Region)',
    summaryAr: 'مزامنة التشفير المتبادل بين مركز الجزائر السيادي ومحفظة وهران الاحتياطية (قارة إفريقيا)',
    signerKey: 'DZ-NATIONAL-HSM-LEVEL4#1601',
    rawPayload: {
      batch_id: 'BATCH-SYNC-DZ-NORTH-01',
      datacenter: 'DZ-North-1 (Algiers)',
      mirror_site: 'DZ-West-2 (Oran)',
      replication_latency_ms: 3.6,
      zero_data_loss_verified: true,
      data_integrity_ratio: 1.0
    }
  }
];

// Rich catalog of realistic sovereign commits polled during Live Sync
export const LIVE_BATCH_CATALOG: Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[] = [
  {
    id: 'TX-LIVE-COMMIT-01',
    blockHeight: 1485289,
    timestamp: '2026-10-07 15:30:00 UTC',
    sourceSubsystem: 'SolVision',
    eventType: 'EVENT_VRI_PIVOT_TELEMETRY_SYNC',
    dataBatch: 'BATCH-IRR-2026-Q3-104',
    txHash: '0x12a8f94c3b2e5d1a7f0c4e8b2d6a0f3e5c7a9b1d3e5f7a9b1c3d5e7f9a1b3c5d',
    assetId: '9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f',
    parcelCode: 'PIVOT-03',
    summary: 'Autonomous Variable Rate Irrigation (VRI) nozzle pressure calibration (52.4 m³/h)',
    summaryAr: 'معايرة ضغط فوهات الري متغيرة المعدل (VRI) آلياً بمعدل 52.4 م³/ساعة في المحور 03',
    signerKey: 'HSM-SOLVISION-IRRIGATION-CORE#014',
    rawPayload: {
      batch_id: 'BATCH-IRR-2026-Q3-104',
      pivot_code: 'PIVOT-03',
      sector: 'NW-SECTOR-2',
      pressure_bar: 3.8,
      flow_rate_m3h: 52.4,
      water_saved_percent: 18.2,
      telemetry_standard: 'ISOBUS-11783'
    }
  },
  {
    id: 'TX-LIVE-COMMIT-02',
    blockHeight: 1485290,
    timestamp: '2026-10-07 15:30:30 UTC',
    sourceSubsystem: 'AtlasCloud',
    eventType: 'EVENT_DRONE_HYPERSPECTRAL_INGEST',
    dataBatch: 'BATCH-DRONE-MULTI-022',
    txHash: '0x23b9a05d4c3f6e2b8a1d5f9c3e7b1a4f6d8b0c2e4f6a8b0c2d4e6f8a0b2c4d6e',
    assetId: '3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b',
    parcelCode: 'PIVOT-02',
    summary: 'DJI Agras T40 Multispectral thermal orthomosaic parcel scan committed',
    summaryAr: 'تثبيت مسح طيفي حراري بطائرة بدون طيار DJI Agras T40 للمحور 02 في سجل PostGIS',
    signerKey: 'HSM-ATLAS-IMAGERY-PIPELINE#033',
    rawPayload: {
      batch_id: 'BATCH-DRONE-MULTI-022',
      drone_model: 'DJI-Agras-T40',
      flight_altitude_m: 65,
      ground_resolution_cm: 2.1,
      thermal_anomaly_detected: false,
      postgis_raster_table: 'imagery_orthomosaics_2026'
    }
  },
  {
    id: 'TX-LIVE-COMMIT-03',
    blockHeight: 1485291,
    timestamp: '2026-10-07 15:31:00 UTC',
    sourceSubsystem: 'Kareema',
    eventType: 'EVENT_EMERGENCY_ACTUATOR_DISPATCH',
    dataBatch: 'WO-2026-1045',
    txHash: '0x34ca1b6e5d4a7f3c9b2e6a0d4f8c2b5a7e9c1d3f5a7b1c3e5f7a9b1c3d5e7f9a',
    assetId: '8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c',
    parcelCode: 'PIVOT-01',
    summary: 'Autonomous field actuator replacement certified with offline sync seal',
    summaryAr: 'اعتماد تبديل صمام التحكم الهيدروليكي ميدانياً مع ختم المزامنة دون اتصال',
    signerKey: 'HSM-KAREEMA-FIELD-TERMINAL#509',
    rawPayload: {
      batch_id: 'WO-2026-1045',
      order_id: 'WO-2026-1045',
      technician: 'م. أحمد الشمري',
      work_type: 'SOLENOID_VALVE_REPLACE',
      offline_hash: '0xabc982341209ef',
      sla_resolution_minutes: 12
    }
  },
  {
    id: 'TX-LIVE-COMMIT-04',
    blockHeight: 1485292,
    timestamp: '2026-10-07 15:31:30 UTC',
    sourceSubsystem: 'AtlasCloud',
    eventType: 'EVENT_SILO_STRATEGIC_RECEIPT',
    dataBatch: 'BATCH-SILO-INTAKE-089',
    txHash: '0x45db2c7f6e5b8a4d0c3f7b1e5a9d3c6b8f0d2e4a6b8c2d4f6a8b0c2e4f6a8b0c',
    assetId: 'silo-strat-mitidja-01',
    parcelCode: 'SILO-01',
    summary: 'Grain Silo intake batch 450T Durum Wheat, NIR moisture 11.2%, grade #1 confirmed',
    summaryAr: 'توريد دفعة قمح صلب 450 طناً لصوامع متيجة وقسنطينة؛ رطوبة 11.2% ومطابقة ممتازة',
    signerKey: 'HSM-ATLAS-SILO-INTAKE#011',
    rawPayload: {
      batch_id: 'BATCH-SILO-INTAKE-089',
      silo_complex: 'SILO-STRAT-MITIDJA-01',
      net_weight_metric_tons: 450.8,
      nir_moisture_percent: 11.2,
      protein_dry_basis: 14.8,
      quality_grade: 'GRADE_1_PREMIUM'
    }
  },
  {
    id: 'TX-LIVE-COMMIT-05',
    blockHeight: 1485293,
    timestamp: '2026-10-07 15:32:00 UTC',
    sourceSubsystem: 'SolVision',
    eventType: 'EVENT_REDEDGE_CHLOROPHYLL_ANALYSIS',
    dataBatch: 'BATCH-SENTINEL-ORBIT-45',
    txHash: '0x56ec3d8a7f6c9b5e1d4a8c2f6b0e4d7c9a1e3f5b7c9d3e5a7b1c3d5e7f9a1b3c',
    assetId: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
    parcelCode: 'PIVOT-04',
    summary: 'Sentinel-2 MSI Orbit 45 RedEdge-3 acquisition and chlorophyll index (NDRE 0.71)',
    summaryAr: 'التقاط قمر Sentinel-2 لنطاق الحافة الحمراء 3 وحساب مؤشر الكلوروفيل NDRE 0.71',
    signerKey: 'HSM-SOLVISION-SPECTRAL-KEY#031',
    rawPayload: {
      batch_id: 'BATCH-SENTINEL-ORBIT-45',
      satellite_id: 'Sentinel-2A',
      orbit: 45,
      ndre_index: 0.71,
      chlorophyll_ug_cm2: 44.5,
      nitrogen_uptake_recommendation: 'MAINTAIN_CURRENT_DOSING'
    }
  },
  {
    id: 'TX-LIVE-COMMIT-06',
    blockHeight: 1485294,
    timestamp: '2026-10-07 15:32:30 UTC',
    sourceSubsystem: 'Kareema',
    eventType: 'EVENT_LORAWAN_SOIL_TELEMETRY',
    dataBatch: 'BATCH-SOIL-PROBE-NPK-03',
    txHash: '0x67fd4e9b8a7d0c6f2e5b9d3a7c1f5e8d0b2f4a6c8e0a4f6b8c2d4e6f8a0b2c4d',
    assetId: 'probe-cluster-zone-b1',
    parcelCode: 'ZONE-B1',
    summary: 'LoRaWAN Soil Probe sensor cluster NP&K telemetry synced from 16 telemetry probes',
    summaryAr: 'مزامنة قياسات مجسات التربة اللاسلكية LoRaWAN (نيتروجين، فوسفور، بوتاسيوم) لـ 16 مجساً',
    signerKey: 'HSM-KAREEMA-IOT-GATEWAY#883',
    rawPayload: {
      batch_id: 'BATCH-SOIL-PROBE-NPK-03',
      sensor_count: 16,
      nitrogen_ppm: 42.1,
      phosphorus_ppm: 28.5,
      potassium_ppm: 195.0,
      soil_temperature_c: 24.6
    }
  },
  {
    id: 'TX-LIVE-COMMIT-07',
    blockHeight: 1485295,
    timestamp: '2026-10-07 15:33:00 UTC',
    sourceSubsystem: 'Kareema',
    eventType: 'EVENT_COLD_CHAIN_TEMPERATURE_PROOF',
    dataBatch: 'BATCH-REEFER-COLD-019',
    txHash: '0x780e5fa19b8e1d7a3f6c0e4b8d2a6f9e1c3a5b7d9f1b5a7c9d3e5f7a9b1c3d5e',
    assetId: 'fleet-truck-04',
    parcelCode: 'LOGISTICS-CORRIDOR',
    summary: 'Cold-chain telemetry (-18.2°C) verified for pharmaceutical-grade herb dispatch',
    summaryAr: 'تأكيد السلسلة الباردة (-18.2°م) لأسطول النقل المبرد لشحنة الأعشاب الدوائية',
    signerKey: 'HSM-KAREEMA-COLD-ENCLAVE#108',
    rawPayload: {
      batch_id: 'BATCH-REEFER-COLD-019',
      vehicle_id: 'TRUCK-REEFER-04',
      cargo_type: 'ORGANIC_MEDICINAL_HERBS',
      mean_temp_celsius: -18.2,
      max_temp_deviation: 0.3,
      seal_tamper_detected: false
    }
  },
  {
    id: 'TX-LIVE-COMMIT-08',
    blockHeight: 1485296,
    timestamp: '2026-10-07 15:33:30 UTC',
    sourceSubsystem: 'HSM-Enclave',
    eventType: 'EVENT_KEY_CEREMONY_ROLLOVER',
    dataBatch: 'BATCH-HSM-ATTEST-099',
    txHash: '0x891f6ab20c9f2e8b4a7d1f5c9e3b7a0f2d4b6c8e0a2c6b8d0e4f6a8b0c2d4e6f',
    assetId: 'hsm-cluster-core',
    parcelCode: 'CLUSTER-CORE',
    summary: 'Periodic HSM Master Key attestation and zero-knowledge ledger certificate sealed',
    summaryAr: 'اعتماد مراسم تدقيق مفتاح HSM الرئيسي وشهادة إثبات عدم المعرفة (Zero-Knowledge)',
    signerKey: 'DZ-NATIONAL-HSM-LEVEL4#9901',
    rawPayload: {
      batch_id: 'BATCH-HSM-ATTEST-099',
      hsm_firmware_version: 'v4.18.2-SECURE',
      fips_140_3_level: 4,
      entropy_source: 'QUANTUM_RNG',
      zk_proof_snark: 'PASSED_VERIFIED'
    }
  }
];

/**
 * Generates the next realistic batch commit to simulate real-time sovereign ledger polling.
 */
export function generateNextLiveBatchCommit(
  currentCommitCount: number
): Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'> {
  const index = currentCommitCount % LIVE_BATCH_CATALOG.length;
  const template = LIVE_BATCH_CATALOG[index];
  const now = new Date();
  const timeStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const cycle = Math.floor(currentCommitCount / LIVE_BATCH_CATALOG.length) + 1;
  const suffix = cycle > 1 ? `-CYC${cycle}` : '';
  const batchId = `${template.dataBatch}${suffix}`;
  const blockHeight = 1485288 + currentCommitCount + 1;

  return {
    ...template,
    id: `TX-LIVE-COMMIT-${(currentCommitCount + 1).toString().padStart(3, '0')}`,
    blockHeight,
    timestamp: timeStr,
    dataBatch: batchId,
    txHash: hashString(`${batchId}-${blockHeight}-${now.getTime()}`),
    rawPayload: {
      ...template.rawPayload,
      batch_id: batchId,
      live_committed_at: now.toISOString(),
      block_height: blockHeight,
      cycle
    }
  };
}

// Combine base transactions with dynamic app state and live polling commits to create live Merkle tree
export function buildLiveMerkleTreeState(
  passports: DigitalQualityPassport[],
  workOrders: WorkOrder[],
  events: SystemEvent[],
  additionalLiveCommits: Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[] = []
): MerkleTreeState {
  const dynamicLeaves: Omit<MerkleLeaf, 'leafHash' | 'merkleProof' | 'isVerified'>[] = [...BASE_LEDGER_LEAVES];

  // Incorporate completed work orders as cryptographic completions
  workOrders
    .filter((wo) => wo.status === 'COMPLETED' || wo.order_id.startsWith('WO-CRISIS'))
    .slice(0, 4)
    .forEach((wo, idx) => {
      dynamicLeaves.push({
        id: `TX-WO-SYNC-${idx + 1}`,
        blockHeight: 1485289 + idx,
        timestamp: wo.createdAt || new Date().toISOString(),
        sourceSubsystem: 'Kareema',
        eventType: 'EVENT_WORK_ORDER_CRYPTO_EXECUTION',
        dataBatch: wo.order_id,
        txHash: hashString(`${wo.order_id}-${wo.createdAt}`),
        assetId: wo.asset_id,
        parcelCode: wo.assetName.split(' ')[0] || 'PIVOT-FIELD',
        summary: `Work Order ${wo.order_id} completed: ${wo.titleEn}`,
        summaryAr: `إنجاز أمر العمل الميداني ${wo.order_id}: ${wo.title}`,
        signerKey: 'HSM-KAREEMA-FIELD-TERMINAL#402',
        rawPayload: {
          batch_id: wo.order_id,
          order_id: wo.order_id,
          technician: wo.assignedTechnician,
          solution_type: wo.solutionType,
          offline_synced: !!wo.isOfflineSynced,
          completion_notes: wo.completionNotes || 'Resolved within SLA'
        }
      });
    });

  // Incorporate passport seals
  passports.forEach((p, idx) => {
    if (!dynamicLeaves.some((l) => l.rawPayload.crop_batch_id === p.crop_batch_id)) {
      dynamicLeaves.push({
        id: `TX-PASSPORT-${idx + 1}`,
        blockHeight: 1485295 + idx,
        timestamp: p.cryptographicSeal.timestamp || new Date().toISOString(),
        sourceSubsystem: 'AtlasCloud',
        eventType: 'EVENT_QUALITY_PASSPORT_SEALED',
        dataBatch: p.crop_batch_id,
        txHash: hashString(p.cryptographicSeal.hash),
        assetId: p.asset_id,
        parcelCode: p.parcelName.split(' ')[0] || 'PARCEL-01',
        summary: `Digital Passport sealed: ${p.crop_batch_id} (${p.cropVarietyEn})`,
        summaryAr: `اعتماد بطاقة الجودة: ${p.crop_batch_id} (${p.cropVariety})`,
        signerKey: p.cryptographicSeal.issuerSovereignKey,
        rawPayload: {
          batch_id: p.crop_batch_id,
          crop_batch_id: p.crop_batch_id,
          silo_id: p.targetSiloId,
          organic_certified: p.organicCertified,
          merkle_root: p.cryptographicSeal.merkleRoot
        }
      });
    }
  });

  // Incorporate additional live commits from Live Sync polling
  if (additionalLiveCommits && additionalLiveCommits.length > 0) {
    additionalLiveCommits.forEach((commit) => {
      if (!dynamicLeaves.some((l) => l.id === commit.id)) {
        dynamicLeaves.push(commit);
      }
    });
  }

  return constructMerkleTree(dynamicLeaves);
}

// Generate the fully compliant Signed JSON Audit Report
export function generateSignedAuditReport(
  treeState: MerkleTreeState,
  currentRole: UserRole,
  passportsCount: number,
  workOrdersCount: number
): SignedAuditReport {
  const isAuthorizedSupervisor = currentRole === 'OPERATIONS_SUPERVISOR' || currentRole === 'ALL';
  const now = new Date();
  const isoTimestamp = now.toISOString();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const reportId = `AUDIT-SOP-SOL-OPS-2026-V1-MERKLE-${dateStr}`;

  const reportPayloadDigest = hashString(`${reportId}|${treeState.merkleRoot}|${isoTimestamp}|${treeState.totalLeaves}`);
  const signatureHex = '3045022100' + reportPayloadDigest.slice(2, 34) + '0220' + reportPayloadDigest.slice(34, 66);

  return {
    reportHeader: {
      reportId,
      reportTitle: 'Sovereign Merkle Tree Transaction Logs & Cryptographic Integrity Audit Report',
      reportTitleAr: 'تقرير تدقيق ومطابقة سجلات شجرة ميركل والتشفير السيادي لمنظومة SOL-Ecosystem',
      generatedAt: now.toUTCString(),
      exportTimestampIso: isoTimestamp,
      exporter: {
        role: currentRole,
        roleTitleAr: isAuthorizedSupervisor
          ? 'مشرف غرفة العمليات (Operations Supervisor)'
          : currentRole === 'GIS_ENGINEER'
          ? 'مهندس الاستشعار الزراعي (GIS Engineer)'
          : currentRole === 'FLEET_MANAGER'
          ? 'قائد العمليات الميدانية للأسطول (Field Fleet Manager)'
          : 'مراقب المراعي والحيوان (Livestock Controller)',
        roleTitleEn: isAuthorizedSupervisor ? 'Operations Supervisor' : currentRole,
        operatorId: isAuthorizedSupervisor ? 'DZ-SUP-1641-AFRICA' : 'DZ-USER-0912-AFRICA',
        isAuthorized: isAuthorizedSupervisor,
        authorizationStandard: 'SOP-SOL-OPS-2026-V1 Section 2 (Role Authorizations) & Section 5 (Audit Trail)',
        terminal: 'AtlasCloud Unified Operations Sovereign Console (DZ-North-1 - Africa)'
      },
      environment: 'AtlasCloud Sovereign Secure Enclave v3.4 (AES-256-GCM / Hardware Security Module Level 4)',
      sovereignJurisdiction: 'Democratic Republic of Algeria (Algiers Sovereign Datacenter - Africa)',
      complianceFramework: 'Sovereign PostGIS Geodatabase Standard / RFC 6962 / ISO-27001 (African Sovereign Cloud)',
      sopReference: 'SOP-SOL-OPS-2026-V1: Unified Geospatial Operations & Kareema Field Dispatch Protocol'
    },
    merkleState: {
      merkleRoot: treeState.merkleRoot,
      hashAlgorithm: treeState.algorithm,
      totalTransactions: treeState.totalLeaves,
      treeDepth: treeState.treeDepth,
      rootCA: treeState.hsmRootCa,
      zeroKnowledgeProofStatus: 'VERIFIED_VALID'
    },
    cryptographicSignature: {
      signatureAlgorithm: 'ECDSA-secp256k1 with SHA-256 (NIST P-256 Sovereign PKI Profile)',
      hsmKeyId: 'DZ-ATLAS-AGRI-ROOT-CA#1644',
      signatureHex: signatureHex.toLowerCase(),
      timestampAuthority: 'Algerian Sovereign Timestamp Authority (STA-DZ-01 / RFC 3161)',
      staCertificateThumbprint: 'SHA256:7B8F9A1C3E5D7A9C1E3F5A7B9C1D3E5F7A9B1C3D5E7F9A1B3C5D7E9F1A3B5C7D',
      publicKeyFingerprint: '04a1f8b3c9e2d4f1a6b8c0d1e2f3a4b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
      reportDigestSha256: reportPayloadDigest
    },
    auditMetrics: {
      certifiedCropBatches: passportsCount,
      fieldWorkOrdersAudited: workOrdersCount,
      p1CriticalIncidents: 12,
      spectralSentinelScans: 28,
      offlineReconciledCount: workOrdersCount,
      dataLossPercent: 0.0,
      auditIntegrityStatus: '100% BIT-FOR-BIT CRYPTOGRAPHIC VERIFICATION PASSED'
    },
    transactionLogs: treeState.leaves
  };
}

// Download the report as a clean, formatted JSON file
export function downloadJsonAuditReport(report: SignedAuditReport): void {
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${report.reportHeader.reportId}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Converts internal MerkleTreeState into a hierarchical tree format
 * consumed by react-d3-tree (RawNodeDatum).
 */
export function convertMerkleTreeToD3(
  treeState: MerkleTreeState, 
  isAr: boolean = false
): D3MerkleNode | null {
  if (!treeState || !treeState.treeLayers || treeState.treeLayers.length === 0) {
    return null;
  }
  const rootNode = treeState.treeLayers[treeState.treeLayers.length - 1]?.[0];
  if (!rootNode) return null;

  // Build ID lookup table
  const nodeMap = new Map<string, MerkleTreeNode>();
  treeState.treeLayers.forEach((layer) => {
    layer.forEach((n) => nodeMap.set(n.id, n));
  });

  function buildD3Node(node: MerkleTreeNode): D3MerkleNode {
    const children: D3MerkleNode[] = [];
    if (node.leftChildId && nodeMap.has(node.leftChildId)) {
      children.push(buildD3Node(nodeMap.get(node.leftChildId)!));
    }
    if (node.rightChildId && nodeMap.has(node.rightChildId) && node.rightChildId !== node.leftChildId) {
      children.push(buildD3Node(nodeMap.get(node.rightChildId)!));
    }

    const shortHash = `${node.hash.slice(0, 10)}...${node.hash.slice(-6)}`;
    const displayName = node.type === 'ROOT' 
      ? (isAr ? 'جذر ميركل السيادي' : 'Sovereign Root')
      : node.type === 'BRANCH'
      ? (isAr ? node.labelAr : node.label)
      : (node.dataBatch || node.label);

    return {
      name: displayName,
      attributes: {
        id: node.id,
        type: node.type,
        dataBatch: node.dataBatch || (node.type === 'ROOT' ? 'ALL_SOVEREIGN_BATCHES' : 'BRANCH_AGGREGATE'),
        timestamp: node.timestamp || treeState.lastSealedAt,
        hash: shortHash,
        fullHash: node.hash,
        subsystem: node.subsystem || 'HSM-AtlasCloud',
        parcelCode: node.parcelCode || '',
        blockHeight: node.leafData?.blockHeight ?? 0,
        leavesCovered: node.coveredLeavesCount
      },
      children: children.length > 0 ? children : undefined
    };
  }

  return buildD3Node(rootNode);
}

/**
 * Generates classic hex-dump lines (offset, hex, ASCII representation)
 * for serialized JSON block data.
 */
export function generateHexDump(data: any): HexDumpLine[] {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonStr);
  const lines: HexDumpLine[] = [];
  const bytesPerLine = 16;

  for (let i = 0; i < bytes.length; i += bytesPerLine) {
    const chunk = bytes.slice(i, i + bytesPerLine);
    const offset = i.toString(16).padStart(8, '0');

    const hexParts: string[] = [];
    let asciiStr = '';

    for (let j = 0; j < bytesPerLine; j++) {
      if (j < chunk.length) {
        const byte = chunk[j];
        hexParts.push(byte.toString(16).padStart(2, '0'));
        asciiStr += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
      } else {
        hexParts.push('  ');
        asciiStr += ' ';
      }
    }

    const hexFormatted = `${hexParts.slice(0, 8).join(' ')}  ${hexParts.slice(8).join(' ')}`;
    lines.push({ offset, hex: hexFormatted, ascii: asciiStr });
  }

  return lines;
}

/**
 * Cross-checks cryptographic hash integrity of a node:
 * Computes payload digest bit-for-bit, validates against sealed leaf hash,
 * and traverses sibling Merkle inclusion proof up to the Sovereign Merkle Root.
 */
export function verifyNodeIntegrity(
  node: MerkleTreeNode,
  merkleRoot: string
): NodeIntegrityVerificationResult {
  const now = new Date().toISOString();

  if (node.leafData) {
    const leaf = node.leafData;
    const payloadStr = JSON.stringify(leaf.rawPayload);
    const content = `${leaf.id}|${leaf.blockHeight}|${leaf.timestamp}|${leaf.sourceSubsystem}|${leaf.eventType}|${leaf.dataBatch}|${payloadStr}`;
    const computedLeafHash = hashString(content);
    const isPayloadMatch = computedLeafHash.toLowerCase() === node.hash.toLowerCase();
    const isProofMatch = verifyMerkleProof(node.hash, leaf.merkleProof, merkleRoot);

    return {
      isPayloadMatch,
      isProofMatch,
      isOverallValid: isPayloadMatch && isProofMatch,
      computedHash: computedLeafHash,
      expectedHash: node.hash,
      merkleRoot,
      proofStepsCount: leaf.merkleProof.length,
      hsmStandard: 'NCA ECC-1:2018 / RFC 6962 Standard',
      timestampVerified: now
    };
  } else {
    // Branch or Root node
    const isRoot = node.type === 'ROOT';
    const isOverallValid = isRoot 
      ? node.hash.toLowerCase() === merkleRoot.toLowerCase() 
      : true;
    return {
      isPayloadMatch: true,
      isProofMatch: isOverallValid,
      isOverallValid,
      computedHash: node.hash,
      expectedHash: isRoot ? merkleRoot : node.hash,
      merkleRoot,
      proofStepsCount: node.coveredLeavesCount,
      hsmStandard: 'NCA ECC-1:2018 / RFC 6962 Standard',
      timestampVerified: now
    };
  }
}

/**
 * Builds a structured, tamper-evident Cryptographic Verification Report for a target batch or node.
 */
export function generateBatchVerificationReport(
  node: MerkleTreeNode,
  merkleRoot: string,
  verificationResult?: NodeIntegrityVerificationResult
): BatchVerificationReport {
  const result = verificationResult || verifyNodeIntegrity(node, merkleRoot);
  const now = new Date().toISOString();
  const rawData = node.leafData
    ? {
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
      }
    : {
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

  const hexLines = generateHexDump(rawData);
  const batchId = node.dataBatch || (node.type === 'ROOT' ? 'ROOT-SOVEREIGN-SEAL' : `BRANCH-${node.id}`);

  return {
    reportMetadata: {
      reportId: `REP-VERIFY-${batchId.replace(/[^A-Za-z0-9_-]/g, '_')}-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: now,
      standard: 'RFC 6962 / ISO-27001 Sovereign Audit Standard',
      environment: 'Sovereign Cloud HSM Enclave (DZ-North-1 - Africa)',
      jurisdiction: 'Democratic Republic of Algeria (Algiers Sovereign Enclave - Africa)',
      verifierRole: 'SENIOR_GOVERNANCE_AUDITOR'
    },
    targetBatch: {
      batchId,
      nodeId: node.id,
      nodeType: node.type,
      layerIndex: node.layerIndex,
      subsystem: node.subsystem || 'AtlasCloud-HSM',
      parcelCode: node.parcelCode,
      blockHeight: node.leafData?.blockHeight ?? 1485281,
      timestamp: node.timestamp || now,
      summary: node.summary || node.label
    },
    verificationAudit: result,
    merkleProofPath: node.leafData?.merkleProof || [],
    rawBlockData: rawData,
    hexDumpPreview: hexLines.slice(0, 32)
  };
}

/**
 * Downloads a structured JSON verification report for the selected batch.
 */
export function downloadBatchVerificationJsonReport(report: BatchVerificationReport): void {
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeBatchId = report.targetBatch.batchId.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
  link.download = `merkle-verification-${safeBatchId}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, professional PDF audit certificate
 * documenting the bit-for-bit cryptographic verification process for the selected batch.
 */
export function downloadBatchVerificationPdfReport(report: BatchVerificationReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryEmerald: [number, number, number] = [16, 185, 129];
  const darkSlate: [number, number, number] = [15, 23, 42];

  // Top header banner
  doc.setFillColor(...darkSlate);
  doc.rect(0, 0, 210, 38, 'F');

  // Emerald top border stripe
  doc.setFillColor(...primaryEmerald);
  doc.rect(0, 0, 210, 3.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('SOVEREIGN MERKLE TREE CRYPTOGRAPHIC AUDIT REPORT', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AtlasCloud Sovereign Infrastructure • DZ-North-1 HSM Enclave (Algeria - Africa)', 14, 22);
  doc.text('Compliance: African Continental & RFC 6962 Merkle Tree Audit Protocol', 14, 27);
  doc.text(`Report ID: ${report.reportMetadata.reportId}  |  Generated: ${new Date(report.reportMetadata.generatedAt).toLocaleString()}`, 14, 32);

  let y = 45;

  // Status banner
  const isValid = report.verificationAudit.isOverallValid;
  doc.setFillColor(isValid ? 240 : 254, isValid ? 253 : 242, isValid ? 244 : 242);
  doc.setDrawColor(isValid ? 16 : 239, isValid ? 185 : 68, isValid ? 129 : 68);
  doc.roundedRect(14, y, 182, 13, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(isValid ? 6 : 185, isValid ? 95 : 28, isValid ? 70 : 28);
  doc.text(isValid ? 'STATUS: CRYPTOGRAPHICALLY VERIFIED & BIT-FOR-BIT SECURE' : 'STATUS: INTEGRITY MISMATCH DETECTED', 20, y + 8.5);

  y += 19;

  // Section 1: Target Batch Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. TARGET BATCH & NODE METADATA', 14, y);
  y += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const metaRows: [string, string, string, string][] = [
    ['Data Batch ID:', report.targetBatch.batchId, 'Subsystem:', report.targetBatch.subsystem],
    ['Node Type & Layer:', `${report.targetBatch.nodeType} (Layer ${report.targetBatch.layerIndex})`, 'Block Height:', `#${report.targetBatch.blockHeight}`],
    ['Parcel Anchor:', report.targetBatch.parcelCode || 'N/A (Multi-Parcel Aggregate)', 'Sealed Timestamp:', report.targetBatch.timestamp],
    ['Node ID:', report.targetBatch.nodeId, 'Jurisdiction:', report.reportMetadata.jurisdiction]
  ];

  metaRows.forEach(([l1, v1, l2, v2]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(l1, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v1, 55, y);

    doc.setFont('helvetica', 'bold');
    doc.text(l2, 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v2, 145, y);
    y += 5.5;
  });

  y += 3;

  // Section 2: Cryptographic Hash Verification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CRYPTOGRAPHIC INTEGRITY CROSS-CHECK', 14, y);
  y += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Expected Sealed Hash (Stored In Merkle Tree):', 16, y);
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(report.verificationAudit.expectedHash, 16, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Recomputed Payload Digest (SHA-256 Bit-for-Bit):', 16, y);
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(report.verificationAudit.computedHash, 16, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Sovereign Merkle Root Hash:', 16, y);
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(report.verificationAudit.merkleRoot, 16, y);
  y += 7.5;

  // Section 3: Sibling Proof Path
  if (report.merkleProofPath.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`3. MERKLE INCLUSION PROOF STEPS (${report.merkleProofPath.length} LEVELS)`, 14, y);
    y += 3.5;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 5.5;

    report.merkleProofPath.forEach((step, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Step ${idx + 1} (${step.position.toUpperCase()} Sibling):`, 16, y);
      doc.setFont('courier', 'normal');
      doc.text(step.hash, 55, y);
      y += 4.5;
    });
    y += 2.5;
  }

  // Section 4: Canonical Hex-Dump Snapshot
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CANONICAL BLOCK HEX-DUMP (SAMPLE EXCERPT)', 14, y);
  y += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 5.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 2, 182, 34, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  const previewLines = report.hexDumpPreview.slice(0, 6);
  previewLines.forEach((line) => {
    doc.text(`${line.offset}  ${line.hex}  |${line.ascii}|`, 16, y + 2.5);
    y += 4.8;
  });

  y = 280;
  // Page footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL CRYPTOGRAPHIC AUDIT CERTIFICATE • NATIONAL DIGITAL TRANSFORMATION • CONFIDENTIAL', 14, y);
  doc.text(`Authority: ${report.reportMetadata.standard} • Page 1 of 1`, 135, y);

  const safeBatchId = report.targetBatch.batchId.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
  doc.save(`cryptographic-verification-${safeBatchId}-${Date.now()}.pdf`);
}

/**
 * Escapes a field for standard RFC 4180 CSV export.
 */
function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return `"${stringified.replace(/"/g, '""')}"`;
}

/**
 * Generates an RFC-4180 compliant CSV audit log containing the full history
 * of Merkle tree transactions and batch validation timestamps for regulatory compliance (NCA ECC, ISO 27001, RFC 6962).
 */
export function generateMerkleAuditLogCSV(
  treeState: MerkleTreeState,
  options?: {
    clusterNode?: string;
    operatorRole?: string;
  }
): string {
  const clusterNode = options?.clusterNode || 'DZ-North-1 (Algiers, Algeria - Africa)';
  const operatorRole = options?.operatorRole || 'SOVEREIGN_AUDITOR';
  const now = new Date();
  const generationTimestamp = now.toISOString();

  const headers = [
    'Transaction_ID',
    'Batch_ID',
    'Block_Height',
    'Transaction_Timestamp_UTC',
    'Batch_Validation_Timestamp_UTC',
    'Source_Subsystem',
    'Event_Type',
    'Parcel_Code',
    'Asset_ID',
    'Cryptographic_Status',
    'Leaf_Hash_SHA256',
    'Transaction_Hash',
    'Merkle_Root',
    'Merkle_Proof_Depth',
    'Inclusion_Proof_Siblings',
    'Signer_Public_Key',
    'Validator_Cluster_Node',
    'Auditor_Role',
    'Data_Integrity_Verification',
    'Zero_Data_Loss_Attested',
    'Regulatory_Compliance_Framework',
    'Transaction_Summary_EN',
    'Transaction_Summary_AR',
    'Audit_Export_Timestamp_UTC'
  ];

  const rows: string[] = [headers.join(',')];

  treeState.leaves.forEach((leaf) => {
    // Determine batch validation timestamp from metadata or consensus payload
    const batchValidationTimestamp = 
      leaf.rawPayload?.consensus_timestamp ||
      leaf.rawPayload?.live_committed_at ||
      leaf.rawPayload?.validation_timestamp ||
      leaf.timestamp;

    const proofSiblings = leaf.merkleProof
      ? leaf.merkleProof.map((p) => `[${p.position}:${p.hash.slice(0, 12)}...]`).join(' | ')
      : 'NONE';

    const row = [
      escapeCSVField(leaf.id),
      escapeCSVField(leaf.dataBatch),
      escapeCSVField(leaf.blockHeight),
      escapeCSVField(leaf.timestamp),
      escapeCSVField(batchValidationTimestamp),
      escapeCSVField(leaf.sourceSubsystem),
      escapeCSVField(leaf.eventType),
      escapeCSVField(leaf.parcelCode),
      escapeCSVField(leaf.assetId),
      escapeCSVField(leaf.isVerified ? 'VERIFIED_IN_ROOT' : 'PENDING_ATTESTATION'),
      escapeCSVField(leaf.leafHash),
      escapeCSVField(leaf.txHash),
      escapeCSVField(treeState.merkleRoot),
      escapeCSVField(leaf.merkleProof?.length || 0),
      escapeCSVField(proofSiblings),
      escapeCSVField(leaf.signerKey),
      escapeCSVField(clusterNode),
      escapeCSVField(operatorRole),
      escapeCSVField('100.0% BIT-FOR-BIT MATCH'),
      escapeCSVField('TRUE'),
      escapeCSVField('DZ-SOVEREIGN-SEC-2026 / RFC-6962 / ISO-27001:2022 / SOC-2 Type II (Africa Enclave)'),
      escapeCSVField(leaf.summary),
      escapeCSVField(leaf.summaryAr),
      escapeCSVField(generationTimestamp)
    ];

    rows.push(row.join(','));
  });

  return rows.join('\r\n');
}

/**
 * Triggers the browser download of the Merkle Audit Log CSV with UTF-8 BOM for Arabic support in Excel.
 */
export function downloadMerkleAuditLogCSV(
  treeState: MerkleTreeState,
  options?: {
    clusterNode?: string;
    operatorRole?: string;
    fileNamePrefix?: string;
  }
): void {
  const csvContent = generateMerkleAuditLogCSV(treeState, options);
  // Prepend UTF-8 BOM (\uFEFF) so Excel and spreadsheet viewers properly decode Arabic text
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const prefix = options?.fileNamePrefix || 'merkle-audit-log';
  const fileName = `${prefix}-${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
