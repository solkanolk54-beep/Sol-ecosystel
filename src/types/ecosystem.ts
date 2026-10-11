export type Language = 'ar' | 'en';

export type UserRole = 
  | 'ALL'
  | 'OPERATIONS_SUPERVISOR'
  | 'GIS_ENGINEER'
  | 'FLEET_MANAGER'
  | 'LIVESTOCK_CONTROLLER';

export type SlaLevel = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type StressSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkOrderStatus = 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';

export type EventTopic = 
  | 'solvision.crop-stress.v1'
  | 'atlas.work-orders.v1'
  | 'kareema.fleet-gps.v1'
  | 'kareema.livestock-rfid.v1'
  | 'kareema.grazing-warning.v1'
  | 'atlas.passport-sealed.v1';

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface ParcelAsset {
  asset_id: string; // UUIDv4
  code: string; // e.g. PIVOT-01
  name: string;
  nameEn: string;
  region: string;
  regionEn: string;
  cropType: string;
  cropTypeEn: string;
  crop_batch_id: string;
  center: [number, number]; // [lat, lng]
  radiusMeters: number;
  areaHectares: number;
  ndviAverage: number;
  ndviHistorical: { date: string; ndvi: number; moisture: number }[];
  status: 'OPTIMAL' | 'STRESSED' | 'IRRIGATING' | 'MAINTENANCE';
  stressSeverity?: StressSeverity;
  stressSector?: string; // e.g. "NE-Quarter"
  stressBbox?: BoundingBox;
  soilHealth: {
    nitrogen_ppm: number;
    phosphorus_ppm: number;
    potassium_ppm: number;
    ph: number;
    moisturePercent: number;
    salinity_ec: number;
  };
  irrigationTelemetry: {
    armRotationDeg: number;
    pressureBar: number;
    flowRateLps: number;
    isActive: boolean;
    speedPercent: number;
  };
  expectedHarvestDate: string;
  lastFertilization: string;
}

export interface FleetUnit {
  fleet_id: string; // GPS Tracker ID
  name: string;
  nameEn: string;
  type: 'TRACTOR' | 'IRRIGATION_TRUCK' | 'HARVESTER' | 'SCOUT_DRONE';
  operator: string;
  coordinates: [number, number]; // [lat, lng]
  speedKmh: number;
  headingDeg: number;
  fuelLevelPercent: number;
  batteryPercent?: number;
  status: 'IDLE' | 'EN_ROUTE' | 'ON_MISSION' | 'DEVIATION_ALERT';
  assignedWorkOrderId?: string;
  routeHistory: [number, number][];
  lastPing: string;
}

export interface LivestockHerd {
  herd_id: string;
  name: string;
  nameEn: string;
  rfid_batch_prefix: string;
  count: number;
  animalType: 'CAMEL' | 'SHEEP' | 'CATTLE';
  animalTypeEn: string;
  currentZone: string;
  currentZoneEn: string;
  assignedSector: string;
  coordinates: [number, number]; // [lat, lng]
  biomassDensityIndex: number; // 0.0 - 1.0
  grazingPressure: 'BALANCED' | 'ELEVATED' | 'OVERGRAZING_DANGER';
  overgrazingAlert: boolean;
  recommendedRotationZone: string;
  recommendedRotationZoneEn: string;
  rfidSampleTags: string[];
}

export interface SystemEvent {
  event_id: string; // UUIDv4
  topic: EventTopic;
  eventType: 
    | 'EVENT_CROP_STRESS_DETECTED'
    | 'EVENT_WORK_ORDER_DISPATCHED'
    | 'EVENT_FLEET_ROUTE_DEVIATION'
    | 'EVENT_HERD_GRAZING_ANOMALY'
    | 'EVENT_QUALITY_PASSPORT_SEALED'
    | 'EVENT_SOVEREIGN_NODE_SYNC';
  sourceSystem: 'SolVision' | 'Kareema' | 'AtlasCloud';
  timestamp: string;
  payload: Record<string, any>;
  signatureHash: string; // SHA-256
  isProcessed: boolean;
}

export interface WorkOrder {
  order_id: string; // UUIDv4
  trigger_event_id: string;
  asset_id: string;
  assetName: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  severity: StressSeverity;
  status: WorkOrderStatus;
  assignedFleetId?: string;
  assignedTechnician: string;
  coordinates: [number, number];
  bbox: BoundingBox;
  createdAt: string;
  etaMinutes: number;
  solutionType: 'IRRIGATION_BOOST' | 'NOZZLE_REPLACEMENT' | 'HERD_REDIVERSION' | 'SOIL_SAMPLING';
  completionNotes?: string;
  slaLevel?: SlaLevel;
  slaMaxMinutes?: number;
  slaRemainingMinutes?: number;
  photoEvidenceUrl?: string;
  technicianSignature?: string;
  isOfflineSynced?: boolean;
}

export interface OperationsKPIs {
  mttrMinutes: number; // Target < 20 min for P1
  predictionAccuracyPercent: number; // Target >= 95%
  sovereignEncryptionPercent: number; // Target 100%
  p1SlaCompliancePercent: number;
  openP1Count: number;
  openP2Count: number;
  offlineQueuePending: number;
}

export interface DigitalQualityPassport {
  crop_batch_id: string;
  asset_id: string;
  parcelName: string;
  parcelNameEn: string;
  cropVariety: string;
  cropVarietyEn: string;
  sowingDate: string;
  harvestDate: string;
  targetSiloId: string;
  averageNdviGrowth: number;
  waterStressFreeIndex: number; // percentage (e.g. 96%)
  soilPurityIndex: number; // percentage
  organicCertified: boolean;
  carbonFootprintKgPerTon: number;
  cryptographicSeal: {
    hash: string; // SHA-256
    issuerSovereignKey: string;
    merkleRoot: string;
    timestamp: string;
    verifiedOnChain: boolean;
  };
  traceabilityStages: {
    stage: 'SEED' | 'GERMINATION' | 'SPECTRAL_MONITORING' | 'HARVEST' | 'SILO_STORAGE';
    stageEn: string;
    stageAr: string;
    timestamp: string;
    location: string;
    verifier: string;
    status: 'VERIFIED' | 'CURRENT' | 'SCHEDULED';
  }[];
}

export interface SovereignNodeInfo {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  continentAr: string;
  continentEn: string;
  isPrimary: boolean;
  status: 'ONLINE' | 'STANDBY' | 'SYNCING';
  uptimePercent: number;
  latencyMs: number;
  postGisEndpoint: string;
  tierClassification: string;
}

export interface SovereignCloudStatus {
  activeNode: string;
  activeNodeEn: string;
  clusterHealth: 'OPTIMAL' | 'DEGRADED' | 'SYNCING';
  eventBusThroughputMsgSec: number;
  postGisRecordsCount: number;
  encryptionMode: string;
  sovereignDataResidency: string;
  geoServerWmsLatencyMs: number;
  storageUsageTb: number;
  storageTotalTb: number;
}

export type StressTestStage = 
  | 'IDLE'
  | 'STAGE_0_BASELINE'
  | 'STAGE_1_MULTI_DROUGHT'
  | 'STAGE_2_BLACKOUT'
  | 'STAGE_3_OFFLINE_EXECUTION'
  | 'STAGE_4_RESTORATION'
  | 'STAGE_5_SCORECARD';

export interface StressTestScorecardMetric {
  id: string;
  nameAr: string;
  nameEn: string;
  targetMetric: string;
  actualResult: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  detailsAr: string;
  detailsEn: string;
}

export interface EmergencyStressTestState {
  isActive: boolean;
  currentStage: StressTestStage;
  elapsedSeconds: number;
  networkOnline: boolean;
  offlineQueueCount: number;
  totalAlertsDispatched: number;
  activeP1Count: number;
  offlineReportsCompleted: number;
  reconciliationProgress: number; // 0 - 100%
  scorecard: StressTestScorecardMetric[];
}

