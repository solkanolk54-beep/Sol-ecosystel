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
  telemetryHistorical?: {
    timestamp: string;
    pressureBar: number;
    flowRateLps: number;
    speedPercent?: number;
    nominalPressure?: number;
  }[];
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
  isArchived?: boolean;
  archivedAt?: string;
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

export interface TechnicianContact {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  assignedFleetId: string;
  sectorAr: string;
  sectorEn: string;
  status: 'ON_DUTY' | 'DISPATCHED' | 'STANDBY';
  alertMethods: ('EMAIL' | 'SMS' | 'RADIO')[];
}

export interface AutomatedEmailAlert {
  id: string; // e.g. "EML-DROUGHT-WO-CRISIS-01"
  workOrderId: string;
  recipientEmail: string;
  recipientName: string;
  supervisorCc: string;
  subject: string;
  subjectAr: string;
  sentAt: string;
  status: 'DELIVERED' | 'ACKNOWLEDGED' | 'QUEUED';
  priority: 'P1_CRITICAL' | 'P2_HIGH';
  assetCode: string;
  assetName: string;
  sector: string;
  assignedFleet: string;
  droughtTrigger: {
    eventName: string;
    spectralNdvi: number;
    hydraulicPressureBar: number;
    coordinates: [number, number];
    slaDeadlineMinutes: number;
    emergencyCode: string;
  };
  technicianActionTaken?: 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SITE';
  acknowledgedAt?: string;
  emailBodyHtml: string;
  emailBodyText: string;
  deliveryMta: string; // e.g. "Sovereign MTA Mail-Relay (TLS 1.3 / DZ-North-1)"
  securitySeal: string; // SHA-256 integrity hash
  messageId: string;
}

// ==========================================
// AgriGIS Algérie (منظومة نظم المعلومات الجغرافية الفلاحية الجزائرية)
// ==========================================

export type AlgeriaPoleCategory = 
  | 'SAHARAN_PIVOTS' 
  | 'OASIS_DATES' 
  | 'CEREAL_PLAINS' 
  | 'HORTICULTURE_STEPPE';

export interface AgriGisParcelCadastre {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  cropAr: string;
  cropEn: string;
  areaHa: number;
  irrigationTypeAr: string;
  irrigationTypeEn: string;
  status: 'OPTIMAL' | 'STRESSED' | 'IRRIGATING';
  ndvi: number;
  moisturePercent: number;
  waterFlowLps: number;
  pivotRadiusM: number;
  rotationArmAngle: number;
  coordinates: [number, number]; // [lat, lng]
  waterWellDepthM: number;
  soilEcSalinity: number;
  nitrogenPpm: number;
}

export interface AgriGisWilayaPole {
  id: string;
  wilayaNumber: number;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  category: AlgeriaPoleCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  totalAreaHectares: number;
  activePivotsCount: number;
  primaryCropsAr: string[];
  primaryCropsEn: string[];
  waterSourceAr: string;
  waterSourceEn: string;
  waterTableDepthMeters: number;
  waterAquiferName: string; // e.g. "حوض المياه الجوفية الألبي (Continent Intercalaire)"
  alsatResolution: string;
  coordinates: [number, number]; // Center [lat, lng]
  dasConcessionsCount: number; // ODAS concessions
  annualProductionTons: number;
  ndviHealthIndex: number;
  droughtVulnerability: 'LOW' | 'MEDIUM' | 'HIGH';
  parcels: AgriGisParcelCadastre[];
  keyPerimeter: string;
}

export interface AlsatSatelliteMission {
  id: string;
  satellite: 'Alsat-1B' | 'Alsat-2A' | 'Alsat-2B' | 'Alsat-1N';
  launchYear: number;
  orbitAltitudeKm: number;
  sensorType: string;
  resolutionMeters: string;
  spectralBands: string[];
  revisitPeriodDays: number;
  coverageAgencyAr: string;
  coverageAgencyEn: string;
  status: 'OPERATIONAL' | 'STANDBY';
  currentPassTargetAr: string;
  currentPassTargetEn: string;
  lastAcquisitionUtc: string;
  telemetryLinkQualityPercent: number;
}

export interface OdasConcession {
  id: string;
  code: string; // e.g. "ODAS-MENIA-2026-P04"
  investorNameAr: string;
  investorNameEn: string;
  wilayaAr: string;
  wilayaEn: string;
  perimeterNameAr: string;
  perimeterNameEn: string;
  allocatedHectares: number;
  cultivatedHectares: number;
  targetCropsAr: string;
  targetCropsEn: string;
  boreholesCount: number;
  boreholeAvgDepthM: number;
  status: 'OPERATIONAL_HARVEST' | 'EXPANSION_PHASE' | 'DRILLING_PHASE';
  investmentTier: 'STRATEGIC_NATIONAL' | 'AGRI_INDUSTRIAL' | 'INNOVATION_PILOT';
  approvalDate: string;
}

export interface WaterTableSensorNode {
  id: string;
  code: string;
  regionAr: string;
  aquiferNameAr: string;
  piezometricLevelM: number;
  staticWaterLevelM: number;
  rechargeRateMmYear: number;
  salinityGramsPerLiter: number;
  sustainabilityStatus: 'SUSTAINABLE' | 'MODERATE_MONITORED' | 'STRESSED';
  lastPiezometerReading: string;
}

// SOL GLOBAL • US-DZ AIRLIFT TRACE TYPES
export type AirliftFlightStatus = 'AIRBORNE' | 'APPROACHING' | 'LANDED_QUARANTINE' | 'DISPATCHED_TO_DAIRY' | 'SCHEDULED_DEPARTURE';
export type CargoBreedType = 'HOLSTEIN_HEIFER' | 'JERSEY_GENOMIC' | 'BROWN_SWISS_ARID';

export interface AirliftCargoSpec {
  headCount: number;
  breed: CargoBreedType;
  breedLabelAr: string;
  breedLabelEn: string;
  avgWeightKg: number;
  gestationStageWeeks: number; // e.g. 14-22 weeks pregnant heifers
  originState: 'Texas' | 'Arizona' | 'New Mexico';
  originRanch: string;
  usdaHealthCertNumber: string;
  rfidRangeStart: string;
  rfidRangeEnd: string;
  averageGenomicMeritIndex: number; // TPI / Genomic rating
  waterConsumptionRateLitersPerHour: number;
}

export interface AircraftTelemetry {
  callsign: string;
  aircraftType: 'Boeing 747-400F' | 'Boeing 777F' | 'Ilyushin Il-76TD-90VD';
  operator: string;
  originIcao: string;
  originName: string;
  destIcao: string;
  destNameAr: string;
  destNameEn: string;
  destWilayaNumber: number;
  currentCoordinates: [number, number];
  altitudeFeet: number;
  groundSpeedKnots: number;
  headingDeg: number;
  cabinTemperatureCelsius: number;
  cabinHumidityPercent: number;
  cabinCo2Ppm: number;
  ventilationStatus: 'OPTIMAL_CIRCULATION' | 'BOOST_FAN_ACTIVE' | 'WARNING_HIGH_HUMIDITY';
  feedWaterSupplyRemainingHours: number;
  estimatedArrivalUtc: string;
  routeProgressPercent: number;
  flightPathWaypoints: [number, number][];
}

export interface ReceptionHubAndQuarantine {
  quarantineStationId: string;
  airportIcao: string;
  stationNameAr: string;
  stationNameEn: string;
  wilayaAr: string;
  veterinarySupervisors: string[];
  quarantineCapacityHeads: number;
  activeOccupancyHeads: number;
  targetMegaDairyAr: string;
  targetMegaDairyEn: string;
  transportFleetAssignedCount: number;
  isolationProtocolDays: number;
  biosecurityLevel: 'STRICT_QUARANTINE_L4' | 'BIOSECURE_EXPEDITION' | 'CLEARANCE_GRANTED';
}

export interface CowIndividualPedigree {
  tagId: string;
  rfidChipId: string;
  breed: CargoBreedType;
  sireName: string;
  damName: string;
  expectedAnnualMilkYieldLiters: number;
  heatToleranceScore: number;
  pregnancyStatus: string;
  genomicProfileScore: number;
  usdaExportSeal: string;
  dzMinistryHealthApproval: string;
  assignedAirBridgeFlight: string;
  currentLocationStage: 'IN_TRANSIT_AIR' | 'QUARANTINE_INSPECTION' | 'CLIMATE_CONVOY' | 'DESERT_PARLOR';
  currentHeartRateBpm: number;
  temperatureCelsius: number;
}

export interface AirliftMission {
  flightId: string;
  status: AirliftFlightStatus;
  missionNameAr: string;
  missionNameEn: string;
  cargo: AirliftCargoSpec;
  telemetry: AircraftTelemetry;
  receptionHub: ReceptionHubAndQuarantine;
  sampledPedigreeList: CowIndividualPedigree[];
  serverConnectionStatus: 'CONNECTED_REALTIME' | 'OFFLINE_REPLAY' | 'STANDBY';
  satelliteDataRelay: 'INMARSAT_AERO_04' | 'ALSAT_GROUND_LINK' | 'STARLINK_AIR';
  lastTelemetryPingSec: number;
}



