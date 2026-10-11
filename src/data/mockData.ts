import { 
  ParcelAsset, 
  FleetUnit, 
  LivestockHerd, 
  SystemEvent, 
  WorkOrder, 
  DigitalQualityPassport,
  SovereignCloudStatus,
  SovereignNodeInfo,
  OperationsKPIs,
  StressTestScorecardMetric,
  AgriGisWilayaPole,
  AlsatSatelliteMission,
  OdasConcession,
  WaterTableSensorNode
} from '../types/ecosystem';

export const INITIAL_PARCELS: ParcelAsset[] = [
  {
    asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c",
    code: "PIVOT-01",
    name: "محور الخرج الشمالي 01",
    nameEn: "Al-Kharj North Pivot 01",
    region: "الخرج، منطقة الرياض",
    regionEn: "Al-Kharj, Riyadh Province",
    cropType: "قمح صلب (سخا 95)",
    cropTypeEn: "Durum Wheat (Sakha 95)",
    crop_batch_id: "BATCH-WHT-2026-Q3-089",
    center: [24.155, 47.310],
    radiusMeters: 450,
    areaHectares: 63.6,
    ndviAverage: 0.76,
    ndviHistorical: [
      { date: "10-Sep", ndvi: 0.55, moisture: 42 },
      { date: "17-Sep", ndvi: 0.63, moisture: 45 },
      { date: "24-Sep", ndvi: 0.71, moisture: 48 },
      { date: "01-Oct", ndvi: 0.74, moisture: 49 },
      { date: "06-Oct", ndvi: 0.76, moisture: 51 }
    ],
    status: "OPTIMAL",
    soilHealth: {
      nitrogen_ppm: 84,
      phosphorus_ppm: 38,
      potassium_ppm: 210,
      ph: 7.2,
      moisturePercent: 49.5,
      salinity_ec: 1.15
    },
    irrigationTelemetry: {
      armRotationDeg: 142,
      pressureBar: 3.8,
      flowRateLps: 112,
      isActive: true,
      speedPercent: 65
    },
    expectedHarvestDate: "2026-11-28",
    lastFertilization: "2026-09-29 (NPK 20-20-20)"
  },
  {
    asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
    code: "PIVOT-02",
    name: "محور القصيم المروي 02",
    nameEn: "Al-Qassim Irrigated Pivot 02",
    region: "عنيزة، منطقة القصيم",
    regionEn: "Unaizah, Al-Qassim Province",
    cropType: "برسيم حجازي عضوي",
    cropTypeEn: "Organic Alfalfa",
    crop_batch_id: "BATCH-ALF-2026-Q2-044",
    center: [24.185, 47.338],
    radiusMeters: 420,
    areaHectares: 55.4,
    ndviAverage: 0.38, // Stressed!
    ndviHistorical: [
      { date: "10-Sep", ndvi: 0.68, moisture: 44 },
      { date: "17-Sep", ndvi: 0.62, moisture: 39 },
      { date: "24-Sep", ndvi: 0.51, moisture: 31 },
      { date: "01-Oct", ndvi: 0.43, moisture: 24 },
      { date: "06-Oct", ndvi: 0.38, moisture: 19 }
    ],
    status: "STRESSED",
    stressSeverity: "HIGH",
    stressSector: "الربع الشمالي الشرقي (NE-Sector 4)",
    stressBbox: {
      minLat: 24.187,
      minLng: 47.339,
      maxLat: 24.192,
      maxLng: 47.345
    },
    soilHealth: {
      nitrogen_ppm: 52,
      phosphorus_ppm: 21,
      potassium_ppm: 165,
      ph: 7.9,
      moisturePercent: 19.2,
      salinity_ec: 1.85
    },
    irrigationTelemetry: {
      armRotationDeg: 68,
      pressureBar: 1.8, // Low pressure alert
      flowRateLps: 58,
      isActive: true,
      speedPercent: 40
    },
    expectedHarvestDate: "2026-10-30",
    lastFertilization: "2026-09-18 (Humic Acid)"
  },
  {
    asset_id: "9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
    code: "PIVOT-03",
    name: "محور حائل الإنتاجي 03",
    nameEn: "Hail Production Pivot 03",
    region: "بقعاء، منطقة حائل",
    regionEn: "Baqaa, Hail Province",
    cropType: "شعير علفي (صنف هيدرا)",
    cropTypeEn: "Fodder Barley (Hydra Var)",
    crop_batch_id: "BATCH-BRL-2026-Q3-112",
    center: [24.120, 47.350],
    radiusMeters: 400,
    areaHectares: 50.2,
    ndviAverage: 0.69,
    ndviHistorical: [
      { date: "10-Sep", ndvi: 0.49, moisture: 38 },
      { date: "17-Sep", ndvi: 0.58, moisture: 41 },
      { date: "24-Sep", ndvi: 0.64, moisture: 44 },
      { date: "01-Oct", ndvi: 0.67, moisture: 46 },
      { date: "06-Oct", ndvi: 0.69, moisture: 47 }
    ],
    status: "IRRIGATING",
    soilHealth: {
      nitrogen_ppm: 78,
      phosphorus_ppm: 34,
      potassium_ppm: 195,
      ph: 7.4,
      moisturePercent: 46.8,
      salinity_ec: 1.28
    },
    irrigationTelemetry: {
      armRotationDeg: 285,
      pressureBar: 4.1,
      flowRateLps: 118,
      isActive: true,
      speedPercent: 80
    },
    expectedHarvestDate: "2026-12-14",
    lastFertilization: "2026-10-02 (Urea 46%)"
  },
  {
    asset_id: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e",
    code: "PIVOT-04",
    name: "محور وادي الدواسر الجنوبي 04",
    nameEn: "Wadi Al-Dawasir South Pivot 04",
    region: "السليل، وادي الدواسر",
    regionEn: "Sulayyil, Wadi Al-Dawasir",
    cropType: "ذرة صفراء هجين",
    cropTypeEn: "Hybrid Yellow Corn",
    crop_batch_id: "BATCH-CRN-2026-Q3-031",
    center: [24.160, 47.380],
    radiusMeters: 460,
    areaHectares: 66.4,
    ndviAverage: 0.81,
    ndviHistorical: [
      { date: "10-Sep", ndvi: 0.60, moisture: 46 },
      { date: "17-Sep", ndvi: 0.69, moisture: 49 },
      { date: "24-Sep", ndvi: 0.74, moisture: 52 },
      { date: "01-Oct", ndvi: 0.78, moisture: 54 },
      { date: "06-Oct", ndvi: 0.81, moisture: 56 }
    ],
    status: "OPTIMAL",
    soilHealth: {
      nitrogen_ppm: 92,
      phosphorus_ppm: 42,
      potassium_ppm: 228,
      ph: 7.1,
      moisturePercent: 55.4,
      salinity_ec: 1.05
    },
    irrigationTelemetry: {
      armRotationDeg: 210,
      pressureBar: 3.9,
      flowRateLps: 124,
      isActive: true,
      speedPercent: 70
    },
    expectedHarvestDate: "2026-11-10",
    lastFertilization: "2026-10-04 (Chelated Zinc & Potash)"
  }
];

export const INITIAL_FLEET: FleetUnit[] = [
  {
    fleet_id: "FLEET-GPS-TRK-01",
    name: "شاحنة صيانة الري المتنقلة 01",
    nameEn: "Mobile Irrigation Service Truck 01",
    type: "IRRIGATION_TRUCK",
    operator: "م. فهد العتيبي",
    coordinates: [24.175, 47.325],
    speedKmh: 34,
    headingDeg: 55,
    fuelLevelPercent: 88,
    status: "EN_ROUTE",
    assignedWorkOrderId: "WO-2026-1002",
    routeHistory: [
      [24.150, 47.300],
      [24.162, 47.312],
      [24.175, 47.325]
    ],
    lastPing: "منذ 14 ثانية"
  },
  {
    fleet_id: "FLEET-GPS-DRN-05",
    name: "مسيرة الاستكشاف الطيفي درّون 05",
    nameEn: "Multispectral Scout Drone 05",
    type: "SCOUT_DRONE",
    operator: "الكابتن طلال السبيعي (طيران آلي)",
    coordinates: [24.188, 47.342],
    speedKmh: 48,
    headingDeg: 120,
    fuelLevelPercent: 62,
    batteryPercent: 74,
    status: "DEVIATION_ALERT", // Alert!
    routeHistory: [
      [24.180, 47.330],
      [24.183, 47.335],
      [24.188, 47.342]
    ],
    lastPing: "منذ 6 ثوانٍ"
  },
  {
    fleet_id: "FLEET-GPS-HRV-02",
    name: "حاصدة الحبوب الذاتية CLAAS 02",
    nameEn: "Autonomous Grain Harvester CLAAS 02",
    type: "HARVESTER",
    operator: "م. سالم الشمري",
    coordinates: [24.115, 47.355],
    speedKmh: 8,
    headingDeg: 270,
    fuelLevelPercent: 79,
    status: "ON_MISSION",
    routeHistory: [
      [24.110, 47.348],
      [24.115, 47.355]
    ],
    lastPing: "منذ 30 ثانية"
  },
  {
    fleet_id: "FLEET-GPS-TRC-04",
    name: "جرار فنت الذكي للاستجابة السريعة 04",
    nameEn: "Smart Rapid Fendt Tractor 04",
    type: "TRACTOR",
    operator: "سلطان القحطاني",
    coordinates: [24.148, 47.365],
    speedKmh: 0,
    headingDeg: 180,
    fuelLevelPercent: 94,
    status: "IDLE",
    routeHistory: [
      [24.148, 47.365]
    ],
    lastPing: "منذ دقيقة واحدة"
  }
];

export const INITIAL_HERDS: LivestockHerd[] = [
  {
    herd_id: "HERD-CAM-01",
    name: "قطيع إبل المجاهيم - وادي البياض",
    nameEn: "Al-Majahim Camel Herd - Al-Bayad Valley",
    rfid_batch_prefix: "RFID-SA-CAM-89100",
    count: 145,
    animalType: "CAMEL",
    animalTypeEn: "Majahim Camels",
    currentZone: "المرعى الرملي الغربي (المنطقة A)",
    currentZoneEn: "Western Sandy Pasture (Zone A)",
    assignedSector: "SECTOR-PASTURE-A4",
    coordinates: [24.135, 47.305],
    biomassDensityIndex: 0.65,
    grazingPressure: "BALANCED",
    overgrazingAlert: false,
    recommendedRotationZone: "المنطقة C (وادي الغضا)",
    recommendedRotationZoneEn: "Zone C (Al-Ghadha Valley)",
    rfidSampleTags: [
      "RFID-SA-CAM-89100-01",
      "RFID-SA-CAM-89100-02",
      "RFID-SA-CAM-89100-03"
    ]
  },
  {
    herd_id: "HERD-SHP-02",
    name: "قطيع النعيمي المحسن - شعيب الخويش",
    nameEn: "Nuaimi Sheep Herd - Al-Khuwaish Range",
    rfid_batch_prefix: "RFID-SA-SHP-44210",
    count: 380,
    animalType: "SHEEP",
    animalTypeEn: "Nuaimi Breeding Sheep",
    currentZone: "مرعى التلال الشرقية (المنطقة B)",
    currentZoneEn: "Eastern Hills Pasture (Zone B)",
    assignedSector: "SECTOR-PASTURE-B2",
    coordinates: [24.170, 47.362],
    biomassDensityIndex: 0.28, // Dangerously low biomass!
    grazingPressure: "OVERGRAZING_DANGER",
    overgrazingAlert: true,
    recommendedRotationZone: "المرعى الموسمي الشمالي (المنطقة D)",
    recommendedRotationZoneEn: "Northern Seasonal Pasture (Zone D)",
    rfidSampleTags: [
      "RFID-SA-SHP-44210-09",
      "RFID-SA-SHP-44210-14",
      "RFID-SA-SHP-44210-22"
    ]
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    order_id: "WO-2026-1002",
    trigger_event_id: "EVT-STRESS-9921",
    asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
    assetName: "محور القصيم المروي 02",
    title: "صيانة طارئة لاختناق فوهات الرش وفقدان ضغط الماء",
    titleEn: "Emergency Nozzle Clearance & Hydraulic Pressure Drop",
    description: "رصد انخفاض مؤشر NDVI إلى 0.38 مع هبوط ضغط الرش إلى 1.8 بار في الربع الشمالي الشرقي. تم تحديد Bounding Box وتكليف فني الري الميداني.",
    descriptionEn: "NDVI dropped to 0.38 with hydraulic pressure failing to 1.8 bar in NE quadrant. Bounding Box pinned for immediate technician intervention.",
    severity: "HIGH",
    status: "DISPATCHED",
    assignedFleetId: "FLEET-GPS-TRK-01",
    assignedTechnician: "م. فهد العتيبي (فريق الري المتقدم)",
    coordinates: [24.189, 47.341],
    bbox: {
      minLat: 24.187,
      minLng: 47.339,
      maxLat: 24.192,
      maxLng: 47.345
    },
    createdAt: "2026-10-06 16:45:12 UTC",
    etaMinutes: 18,
    solutionType: "NOZZLE_REPLACEMENT",
    slaLevel: "P1_CRITICAL",
    slaMaxMinutes: 15,
    slaRemainingMinutes: 7,
    photoEvidenceUrl: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=400&q=80",
    technicianSignature: "فهد العتيبي - اعتماد ميداني",
    isOfflineSynced: true
  },
  {
    order_id: "WO-2026-0988",
    trigger_event_id: "EVT-GRAZ-4410",
    asset_id: "HERD-SHP-02",
    assetName: "قطيع النعيمي المحسن (المنطقة B)",
    title: "تطبيق الرعي التناوبي الفوري وتغيير مسار القطيع",
    titleEn: "Rotational Grazing Enforcement & Herd Route Diversion",
    description: "مطابقة موقع القطيع مع خريطة الكثافة النباتية SolVision أظهرت انخفاض الكتلة الحيوية بنسبة 48%. يتطلب توجيه الرعاة لنقل القطيع للمنطقة D.",
    descriptionEn: "Matching RFID/GPS positions with SolVision vegetative biomass indicates 48% depletion. Urgent route diversion to pasture Zone D required.",
    severity: "CRITICAL",
    status: "PENDING",
    assignedTechnician: "د. هاني السالم (مشرف إدارة المراعي الطبيعية)",
    coordinates: [24.170, 47.362],
    bbox: {
      minLat: 24.166,
      minLng: 47.358,
      maxLat: 24.174,
      maxLng: 47.366
    },
    createdAt: "2026-10-06 17:02:05 UTC",
    etaMinutes: 30,
    solutionType: "HERD_REDIVERSION",
    slaLevel: "P2_HIGH",
    slaMaxMinutes: 30,
    slaRemainingMinutes: 19,
    photoEvidenceUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    technicianSignature: "د. هاني السالم - مصادقة مسار الرعي",
    isOfflineSynced: true
  }
];

export const INITIAL_EVENTS: SystemEvent[] = [
  {
    event_id: "8c4e09f1-77d4-4a21-98a0-2f1d9c8e7b6a",
    topic: "solvision.crop-stress.v1",
    eventType: "EVENT_CROP_STRESS_DETECTED",
    sourceSystem: "SolVision",
    timestamp: "2026-10-06 17:15:22.402",
    signatureHash: "sha256:d8b2e591a45903b12984fe72b0c399e28f1b6214f48419a408e0114a2bf1892d",
    isProcessed: true,
    payload: {
      asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
      pivot_code: "PIVOT-02",
      spectral_index: "NDVI",
      current_value: 0.38,
      baseline_threshold: 0.65,
      deviation_percent: -41.5,
      bbox: [24.187, 47.339, 24.192, 47.345],
      satellite_source: "Sentinel-2 MSI / AtlasCloud Sovereign Pipeline",
      auto_action: "TRIGGER_WORK_ORDER"
    }
  },
  {
    event_id: "3d9f2a81-66e3-4c12-87b9-1e0c8d7e6a5f",
    topic: "atlas.work-orders.v1",
    eventType: "EVENT_WORK_ORDER_DISPATCHED",
    sourceSystem: "AtlasCloud",
    timestamp: "2026-10-06 17:15:23.018",
    signatureHash: "sha256:9f4e2c817b3a0e5d12984fe72b0c399e28f1b6214f48419a408e0114a2bf189c",
    isProcessed: true,
    payload: {
      order_id: "WO-2026-1002",
      target_system: "Kareema-FieldOps",
      assigned_unit: "FLEET-GPS-TRK-01",
      technician: "م. فهد العتيبي",
      priority: "HIGH",
      bbox_precision: "PostGIS ST_MakeEnvelope (EPSG:4326)",
      sovereign_signature: "ECDSA-secp256k1-verified"
    }
  },
  {
    event_id: "1b8d7e6c-55a2-4f01-76a8-0d9c8b7a6e4d",
    topic: "kareema.grazing-warning.v1",
    eventType: "EVENT_HERD_GRAZING_ANOMALY",
    sourceSystem: "Kareema",
    timestamp: "2026-10-06 17:18:04.810",
    signatureHash: "sha256:4a7e9b012c3f8d6e5a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    isProcessed: false,
    payload: {
      herd_id: "HERD-SHP-02",
      rfid_count: 380,
      biomass_density: 0.28,
      threshold_minimum: 0.50,
      zone: "Zone B (Eastern Hills)",
      recommendation: "ROTATE_TO_ZONE_D",
      grazing_rest_days_required: 45
    }
  },
  {
    event_id: "5f2a1b9c-44e1-4d90-65a7-9c8b7a6e5d3c",
    topic: "kareema.fleet-gps.v1",
    eventType: "EVENT_FLEET_ROUTE_DEVIATION",
    sourceSystem: "Kareema",
    timestamp: "2026-10-06 17:19:30.120",
    signatureHash: "sha256:3b6a9e1d2c4f8a7e0d5b2c1e4f3a6b8d9c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
    isProcessed: false,
    payload: {
      fleet_id: "FLEET-GPS-DRN-05",
      deviation_distance_meters: 320,
      assigned_corridor: "CORRIDOR-SCAN-PIVOT-02",
      current_velocity_kmh: 48,
      action: "AUTO_FAILSAFE_CORRIDOR_RECENTER"
    }
  },
  {
    event_id: "2e1d0c9b-33f0-4c8f-54a6-8b7a6e5d4c2b",
    topic: "atlas.passport-sealed.v1",
    eventType: "EVENT_QUALITY_PASSPORT_SEALED",
    sourceSystem: "AtlasCloud",
    timestamp: "2026-10-06 17:20:15.900",
    signatureHash: "sha256:7c9e1d2a4f6b8a0d2e4c6b8a0d2e4c6b8a0d2e4c6b8a0d2e4c6b8a0d2e4c6b8a",
    isProcessed: true,
    payload: {
      crop_batch_id: "BATCH-WHT-2026-Q3-089",
      asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c",
      purity_score: 98.4,
      water_stress_free_index: 96.2,
      cryptographic_seal: "VERIFIED_SOVEREIGN_VAULT"
    }
  }
];

export const INITIAL_PASSPORTS: DigitalQualityPassport[] = [
  {
    crop_batch_id: "BATCH-WHT-2026-Q3-089",
    asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c",
    parcelName: "محور الخرج الشمالي 01",
    parcelNameEn: "Al-Kharj North Pivot 01",
    cropVariety: "قمح صلب عالي البروتين (سخا 95)",
    cropVarietyEn: "High-Protein Durum Wheat (Sakha 95)",
    sowingDate: "2026-07-15",
    harvestDate: "2026-11-28 (مجدول)",
    targetSiloId: "SILO-SOV-RYD-04 (صوامع الرياض السيادية)",
    averageNdviGrowth: 0.76,
    waterStressFreeIndex: 96.2,
    soilPurityIndex: 98.4,
    organicCertified: true,
    carbonFootprintKgPerTon: 142.5,
    cryptographicSeal: {
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      issuerSovereignKey: "KSA-ATLAS-AGRI-ROOT-CA#0921",
      merkleRoot: "0x89fbc0214a51e6d98c21a4f02891bbec3820914a",
      timestamp: "2026-10-06T17:20:15Z",
      verifiedOnChain: true
    },
    traceabilityStages: [
      {
        stage: "SEED",
        stageAr: "أصل البذور واعتماد الصنف",
        stageEn: "Certified Seed Origin",
        timestamp: "2026-07-15 09:30",
        location: "محطة إكثار البذور المعتمدة، الرياض",
        verifier: "هيئة الأمن الغذائي والزراعي",
        status: "VERIFIED"
      },
      {
        stage: "GERMINATION",
        stageAr: "الإنبات وتحليل كيمياء التربة",
        stageEn: "Germination & Soil Chemistry",
        timestamp: "2026-08-02 11:15",
        location: "مختبر AtlasCloud الحقلي - الخرج",
        verifier: "مختبرات المركز الوطني للزراعة",
        status: "VERIFIED"
      },
      {
        stage: "SPECTRAL_MONITORING",
        stageAr: "الرصد الطيفي الفضائي (SolVision)",
        stageEn: "Satellite Spectral Health (SolVision)",
        timestamp: "2026-10-06 14:00",
        location: "Sentinel-2 MSI Orbit 44 / خوارزميات SolVision",
        verifier: "محرك SolVision للتحليل الطيفي اللحظي",
        status: "CURRENT"
      },
      {
        stage: "HARVEST",
        stageAr: "الحصاد والوزن الرقمي الميداني",
        stageEn: "Field Harvest & Digital Weighing",
        timestamp: "2026-11-28 07:00",
        location: "أسطول الحصاد الآلي Kareema 02",
        verifier: "نظام الموازين الذكية Kareema IoT",
        status: "SCHEDULED"
      },
      {
        stage: "SILO_STORAGE",
        stageAr: "التخزين في الصومعة السيادية والتشفير النهائي",
        stageEn: "Sovereign Silo Storage & Vault Sealing",
        timestamp: "2026-11-29 16:30",
        location: "صوامع الحبوب الاستراتيجية - الخرج",
        verifier: "سحابة AtlasCloud السيادية للتوثيق",
        status: "SCHEDULED"
      }
    ]
  },
  {
    crop_batch_id: "BATCH-ALF-2026-Q2-044",
    asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
    parcelName: "محور القصيم المروي 02",
    parcelNameEn: "Al-Qassim Irrigated Pivot 02",
    cropVariety: "برسيم حجازي عضوي درجة أولى",
    cropVarietyEn: "Premium Organic Alfalfa",
    sowingDate: "2026-06-10",
    harvestDate: "2026-10-30 (مجدول بعد إصلاح الإجهاد)",
    targetSiloId: "SILO-FODDER-QSM-01 (مستودع الأعلاف عنيزة)",
    averageNdviGrowth: 0.58,
    waterStressFreeIndex: 82.4,
    soilPurityIndex: 94.1,
    organicCertified: true,
    carbonFootprintKgPerTon: 98.2,
    cryptographicSeal: {
      hash: "74b87337454200d4d33f80c4663dc5e5ff1b5f106fd09071064fb2bc7c20ea88",
      issuerSovereignKey: "KSA-ATLAS-AGRI-ROOT-CA#0844",
      merkleRoot: "0x39fae1104c92b7e19a44c9b20148efdc29104b31",
      timestamp: "2026-10-06T15:10:00Z",
      verifiedOnChain: true
    },
    traceabilityStages: [
      {
        stage: "SEED",
        stageAr: "بذور حجازية نقية 99.8%",
        stageEn: "Pure Hijazi Seed Variety 99.8%",
        timestamp: "2026-06-10 08:00",
        location: "بنك البذور الوطني، القصيم",
        verifier: "مركز بحوث المراعي والزراعة",
        status: "VERIFIED"
      },
      {
        stage: "GERMINATION",
        stageAr: "مرحلة التفريع والتثبيت الحيوي",
        stageEn: "Branching & Rhizobial Inoculation",
        timestamp: "2026-06-28 10:00",
        location: "عنيزة، القصيم",
        verifier: "المرشد الزراعي الميداني Kareema",
        status: "VERIFIED"
      },
      {
        stage: "SPECTRAL_MONITORING",
        stageAr: "تنبيه إجهاد ري موضعي نشط",
        stageEn: "Active Localized Irrigation Stress Detected",
        timestamp: "2026-10-06 16:45",
        location: "محور القصيم 02 - الربع NE",
        verifier: "أمر عمل Kareema WO-2026-1002 قيد المعالجة",
        status: "CURRENT"
      },
      {
        stage: "HARVEST",
        stageAr: "الحشة الرابعة مجدولة",
        stageEn: "4th Cutting Harvest Scheduled",
        timestamp: "2026-10-30 06:00",
        location: "محور القصيم 02",
        verifier: "أسطول Kareema 04",
        status: "SCHEDULED"
      },
      {
        stage: "SILO_STORAGE",
        stageAr: "التخزين والكبس البالي الرقمي",
        stageEn: "Storage & Digital RFID Bale Tagging",
        timestamp: "2026-11-01 12:00",
        location: "صوامع عنيزة",
        verifier: "سحابة AtlasCloud",
        status: "SCHEDULED"
      }
    ]
  }
];

export const SOVEREIGN_NODES: SovereignNodeInfo[] = [
  {
    id: "DZ-NORTH-1",
    code: "DZ-North-1 (Algiers / الجزائر)",
    nameAr: "مركز الجزائر للبيانات السيادية (DZ-North-1) - قارة إفريقيا",
    nameEn: "Algiers Sovereign Datacenter (DZ-North-1) - Africa",
    cityAr: "الجزائر العاصمة",
    cityEn: "Algiers",
    countryAr: "الجمهورية الجزائرية الديمقراطية الشعبية",
    countryEn: "Democratic Republic of Algeria",
    continentAr: "قارة إفريقيا",
    continentEn: "Africa",
    isPrimary: true,
    status: "ONLINE",
    uptimePercent: 99.998,
    latencyMs: 8,
    postGisEndpoint: "https://dz-algiers.atlascloud.sovereign:5432/geodatabase",
    tierClassification: "Tier IV National Sovereign Vault"
  },
  {
    id: "DZ-WEST-2",
    code: "DZ-West-2 (Oran / وهران)",
    nameAr: "مركز وهران الاحتياطي السيادي (DZ-West-2) - قارة إفريقيا",
    nameEn: "Oran Sovereign Backup Vault (DZ-West-2) - Africa",
    cityAr: "وهران",
    cityEn: "Oran",
    countryAr: "الجمهورية الجزائرية الديمقراطية الشعبية",
    countryEn: "Algeria",
    continentAr: "قارة إفريقيا",
    continentEn: "Africa",
    isPrimary: false,
    status: "ONLINE",
    uptimePercent: 99.995,
    latencyMs: 12,
    postGisEndpoint: "https://dz-oran-mirror.atlascloud.sovereign:5432/geodatabase",
    tierClassification: "Tier III+ Disaster Recovery Vault"
  },
  {
    id: "KSA-CENTRAL-1",
    code: "KSA-Central-1 (Riyadh / الرياض)",
    nameAr: "مركز الرياض للبيانات السيادية (KSA-Central-1) - الشرق الأوسط",
    nameEn: "Riyadh Sovereign Datacenter (KSA-Central-1) - Middle East",
    cityAr: "الرياض",
    cityEn: "Riyadh",
    countryAr: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    continentAr: "الشرق الأوسط",
    continentEn: "Middle East",
    isPrimary: false,
    status: "ONLINE",
    uptimePercent: 99.998,
    latencyMs: 34,
    postGisEndpoint: "https://ksa-riyadh.atlascloud.sovereign:5432/geodatabase",
    tierClassification: "Tier IV Federated Sovereign Vault"
  }
];

export const INITIAL_SOVEREIGN_STATUS: SovereignCloudStatus = {
  activeNode: "مركز الجزائر للبيانات السيادية (DZ-North-1) - قارة إفريقيا",
  activeNodeEn: "Algiers Sovereign Datacenter (DZ-North-1) - Africa",
  clusterHealth: "OPTIMAL",
  eventBusThroughputMsgSec: 4280,
  postGisRecordsCount: 1485290,
  encryptionMode: "AES-256-GCM (National Sovereign Standard)",
  sovereignDataResidency: "الجمهورية الجزائرية الديمقراطية الشعبية - قارة إفريقيا (العقدة الأساسية / DZ-North-1)",
  geoServerWmsLatencyMs: 8,
  storageUsageTb: 84.6,
  storageTotalTb: 250.0
};

export const INITIAL_KPIS: OperationsKPIs = {
  mttrMinutes: 14.2, // Target < 20 min for P1
  predictionAccuracyPercent: 96.8, // Target >= 95%
  sovereignEncryptionPercent: 100, // Target 100%
  p1SlaCompliancePercent: 98.4,
  openP1Count: 1,
  openP2Count: 2,
  offlineQueuePending: 0
};

export interface SopRoleDefinition {
  id: string;
  titleAr: string;
  titleEn: string;
  iconName: string;
  responsibilitiesAr: string[];
  responsibilitiesEn: string[];
}

export const SOP_ROLES: SopRoleDefinition[] = [
  {
    id: 'OPERATIONS_SUPERVISOR',
    titleAr: 'مشرف غرفة العمليات (Operations Supervisor)',
    titleEn: 'Operations Supervisor',
    iconName: 'ShieldCheck',
    responsibilitiesAr: [
      'مراقبة التدفق اللحظي للبيانات وناقل الأحداث (Kafka Stream Inspector).',
      'التدقيق في التنبيهات ذات الخطورة العالية (P1/P2) وإسناد المهام.',
      'اعتماد وتوليد بطاقة الجودة الرقمية (Digital Quality Passport) عند الحصاد.'
    ],
    responsibilitiesEn: [
      'Monitor real-time Kafka event bus stream throughput.',
      'Audit high-priority threshold alerts (P1/P2) and assign tasks.',
      'Authorize and seal Digital Quality Passports upon harvest.'
    ]
  },
  {
    id: 'GIS_ENGINEER',
    titleAr: 'مهندس الاستشعار الزراعي (GIS / Remote Sensing Engineer)',
    titleEn: 'GIS / Remote Sensing Engineer',
    iconName: 'Satellite',
    responsibilitiesAr: [
      'تحليل طبقات NDVI الطيفية وصور الأقمار الصناعية (Sentinel-2).',
      'التحقق من صحة تنبيهات الإجهاد المائي/الأمراض ومطابقتها مع قراءات رطوبة التربة NIR.',
      'مراجعة الشريحة الزمنية واستخراج Bounding Box للمناطق المجهدة.'
    ],
    responsibilitiesEn: [
      'Analyze Sentinel-2 multispectral NDVI and NIR moisture layers.',
      'Validate water stress and pest alerts against soil telemetry.',
      'Audit satellite time-series and extract PostGIS Bounding Boxes.'
    ]
  },
  {
    id: 'FLEET_MANAGER',
    titleAr: 'قائد العمليات الميدانية للأسطول (Field Fleet Manager)',
    titleEn: 'Field Fleet Manager',
    iconName: 'Truck',
    responsibilitiesAr: [
      'متابعة حركة الشاحنات والمحاور ومسيرات الدرّون في Kareema.',
      'إسناد أوامر العمل (Work Orders) للفنيين والسائقين عبر التطبيق الميداني.',
      'مراقبة انحرافات المسار وتفعيل خطط إعادة التوجيه الآلي.'
    ],
    responsibilitiesEn: [
      'Track real-time trucks, pivot telemetry, and drone GPS in Kareema.',
      'Dispatch field work orders to technicians with ETA and coordinates.',
      'Monitor fleet route deviations and auto-recenter corridors.'
    ]
  },
  {
    id: 'LIVESTOCK_CONTROLLER',
    titleAr: 'مراقب المراعي والحيوان (Livestock Controller)',
    titleEn: 'Livestock Controller',
    iconName: 'Radio',
    responsibilitiesAr: [
      'رصد كثافة الغطاء النباتي ومطابقتها مع مواقع إحداثيات GPS/RFID للماشية.',
      'التوجيه الآلي واليدوي لروادع الرعي ومسارات الرعي التناوبي (Rotational Grazing).',
      'حماية المناطق المعرضة للتدهور البيئي وتطبيق فترات إراحة المرعى.'
    ],
    responsibilitiesEn: [
      'Correlate rangeland vegetative biomass with RFID/GPS ear-tags.',
      'Enforce rotational grazing corridors to prevent overgrazing.',
      'Safeguard sensitive pasture sectors and enforce rest periods.'
    ]
  }
];

export const SOP_SLA_MATRIX = [
  {
    level: 'P1_CRITICAL',
    titleAr: 'حرِج (P1 - Critical)',
    titleEn: 'P1 - Critical',
    color: 'rose',
    typeAr: 'إجهاد مائي حاد / انسداد المحور أو هبوط الضغط',
    typeEn: 'Acute Water Stress / Pivot Hydraulic Failure',
    slaMinutes: 15,
    slaTextAr: 'أقل من 15 دقيقة',
    slaTextEn: '< 15 minutes',
    actionAr: 'إطلاق أمر عمل بنقرة واحدة (1-Click Work Order Dispatch) لتوجيه فرقة الصيانة فوراً.',
    actionEn: '1-Click Work Order Dispatch to immediately route mobile irrigation technicians.'
  },
  {
    level: 'P2_HIGH',
    titleAr: 'عالي (P2 - High)',
    titleEn: 'P2 - High',
    color: 'amber',
    typeAr: 'انحراف مسار الأسطول / رعي جائر في القطاع',
    typeEn: 'Fleet Route Deviation / Overgrazing in Zone',
    slaMinutes: 30,
    slaTextAr: 'خلال 30 دقيقة',
    slaTextEn: 'Within 30 minutes',
    actionAr: 'إعادة توجيه القطيع إلى أروقة الرعي التناوبي وإرسال تنبيه للمشرف الميداني.',
    actionEn: 'Reroute herd to rotational corridors and notify pasture superintendent.'
  },
  {
    level: 'P3_MEDIUM',
    titleAr: 'متوسط (P3 - Medium)',
    titleEn: 'P3 - Medium',
    color: 'sky',
    typeAr: 'إنذار آفة أو تغير كيميائي في التربة',
    typeEn: 'Pest Alert / Soil Chemistry Anomaly',
    slaMinutes: 120,
    slaTextAr: 'خلال ساعتين',
    slaTextEn: 'Within 2 hours',
    actionAr: 'تكليف مهندس الوقاية بأخذ عينات ميدانية وتوثيقها في النظام.',
    actionEn: 'Assign crop protection engineer for physical soil sampling and lab logs.'
  },
  {
    level: 'P4_LOW',
    titleAr: 'منخفض (P4 - Low)',
    titleEn: 'P4 - Low',
    color: 'emerald',
    typeAr: 'تحديث دوري للبيانات / مزامنة Sentinel-2',
    typeEn: 'Routine Data Sync / Sentinel-2 Tile Ingest',
    slaMinutes: 0,
    slaTextAr: 'تلقائي (مراقبة)',
    slaTextEn: 'Automated (Passive)',
    actionAr: 'مراجعة مؤشرات سلامة البيانات وحالة التشفير السيادي AES-256-GCM.',
    actionEn: 'Automated cryptographic health check and AES-256-GCM audit.'
  }
];

export const STRESS_TEST_DEFAULT_SCORECARD: StressTestScorecardMetric[] = [
  {
    id: "MTR-01",
    nameAr: "استجابة وضع عدم الاتصال (Offline Transition)",
    nameEn: "Offline Mode Auto-Transition",
    targetMetric: "< 5s (تحول تلقائي 100%)",
    actualResult: "1.4s (تحول فوري دون إغلاق التطبيق)",
    status: "SUCCESS",
    detailsAr: "تم التبديل التلقائي إلى التخزين الآمن SQLite / PWA Offline Cache دون فقدان الجلسة.",
    detailsEn: "Instant fallback to encrypted SQLite / PWA Cache with zero session interruption."
  },
  {
    id: "MTR-02",
    nameAr: "سلامة البيانات المحفوظة أوفلاين (Data Integrity)",
    nameEn: "Preserved Offline Data Integrity",
    targetMetric: "0% Data Loss (عدم ضياع أي صورة أو توقيع)",
    actualResult: "12/12 تقرير صيانة مكتمل ومحفوظ محلياً",
    status: "SUCCESS",
    detailsAr: "تم حفظ 12 تقرير صيانة مصور مع التوقيعات الرقمية محلياً بحالة Pending_Sync بنجاح.",
    detailsEn: "12/12 field reports with photos and digital signatures cached as Pending_Sync."
  },
  {
    id: "MTR-03",
    nameAr: "معدل زمن المزامنة عند عودة الشبكة (Reconciliation Rate)",
    nameEn: "Reconnection Auto-Reconciliation Time",
    targetMetric: "< 60s (إتمام مزامنة كافة الأحداث)",
    actualResult: "18.2s (استكمال المزامنة والتشفير)",
    status: "SUCCESS",
    detailsAr: "اكتملت مزامنة حزمة البيانات المتراكمة وتثبيت السجلات في PostGIS خلال 18.2 ثانية.",
    detailsEn: "Batch reconciliation into PostGIS and GeoServer completed in 18.2 seconds."
  },
  {
    id: "MTR-04",
    nameAr: "زمن التدخل الميداني الفعلي (MTTR under Crisis)",
    nameEn: "Actual Field MTTR Under Crisis",
    targetMetric: "< 20 min (استجابة P1 الميدانية)",
    actualResult: "16.5 min (متوسط الوصول والتنفيذ الفعلي)",
    status: "SUCCESS",
    detailsAr: "حقق الفنيون زمن استجابة 16.5 دقيقة معتمدين على الخرائط المتجهية والـ GPS المعزول.",
    detailsEn: "Field crews resolved acute stress in 16.5 min using cached vector GPS navigation."
  },
  {
    id: "MTR-05",
    nameAr: "التطابق التشفيري للتاريخ السلسلي (Sovereign Cryptographic Audit)",
    nameEn: "Cryptographic Lineage Consistency",
    targetMetric: "100% تطابق أختام SHA-256 و Merkle Roots",
    actualResult: "100% مطابقة تامة وانعدام أي تعارض زمني",
    status: "SUCCESS",
    detailsAr: "تم توثيق كافة التقارير برقم crop_batch_id وختمها في خزانة AtlasCloud دون أي تصادم.",
    detailsEn: "Zero cryptographic collisions; Merkle roots validated and permanently sealed."
  }
];

export const STRESS_TEST_CRISIS_PIVOTS = [
  { code: "PIVOT-01", sector: "القطاع الجنوبي الغربي SW-2", ndvi: 0.28, hectares: 14.2 },
  { code: "PIVOT-01", sector: "القطاع الجنوبي الشرقي SE-3", ndvi: 0.26, hectares: 12.8 },
  { code: "PIVOT-02", sector: "الربع الشمالي الشرقي NE-4", ndvi: 0.25, hectares: 18.5 },
  { code: "PIVOT-04", sector: "الربع الغربي W-1", ndvi: 0.29, hectares: 15.0 }
];

// =========================================================================
// AgriGIS Algérie (منظومة نظم المعلومات الجغرافية الفلاحية الجزائرية)
// إشراف مشترك: وزارة الفلاحة والتنمية الريفية (MADR) والوكالة الفضائية الجزائرية (ASAL)
// =========================================================================

export const ALGERIA_AGRIGIS_POLES: AgriGisWilayaPole[] = [
  {
    id: "el-menia",
    wilayaNumber: 58,
    nameAr: "قطب المنيعة الاستراتيجي للحبوب الصحراوية",
    nameEn: "El Menia Strategic Saharan Grain Pole",
    nameFr: "Pôle Céréalier Stratégique d'El Menia",
    category: "SAHARAN_PIVOTS",
    categoryLabelAr: "محاور القمح الصحراوي الكبرى",
    categoryLabelEn: "Mega Saharan Pivot Farming",
    descriptionAr: "القطب القومي الأول لإنتاج القمح الصلب والزراعات الزيتية تحت المحاور الرشاشة العملاقة فوق حوض الألبي الجوفي.",
    descriptionEn: "National premier pole for durum wheat and oilseed crops under central pivot irrigation tapping the Albian aquifer.",
    totalAreaHectares: 120000,
    activePivotsCount: 840,
    primaryCropsAr: ["قمح صلب (سيميتو / هيدرا)", "ذرة علفية صفراء", "شعير بذور", "دوار الشمس"],
    primaryCropsEn: ["Durum Wheat (Simeto / Hydra)", "Yellow Silage Corn", "Certified Seed Barley", "Sunflower"],
    waterSourceAr: "حوض المياه الجوفية الألبي (Continent Intercalaire)",
    waterSourceEn: "Continental Intercalaire (Albian Mega-Aquifer)",
    waterTableDepthMeters: 380,
    waterAquiferName: "نفق المياه الجوفية الألبي (Nappe Albienne)",
    alsatResolution: "Alsat-2A (2.5m) + Alsat-1B NDVI",
    coordinates: [30.585, 2.880],
    dasConcessionsCount: 64,
    annualProductionTons: 420000,
    ndviHealthIndex: 0.78,
    droughtVulnerability: "LOW",
    keyPerimeter: "محيط حاسي القارة وقصر الفروج الزراعي",
    parcels: [
      {
        id: "DZ-MN-PVT-01",
        code: "DZ-ELMENIA-01",
        nameAr: "محور المنيعة النموذجي 01 (حاسي القارة)",
        nameEn: "El Menia Model Pivot 01 (Hassi Gara)",
        cropAr: "قمح صلب جزائري (سيميتو بذور نقية)",
        cropEn: "Durum Wheat (Certified Simeto)",
        areaHa: 68.5,
        irrigationTypeAr: "رش محوري دائري ذكي مع مستشعرات رطوبة",
        irrigationTypeEn: "Smart Center Pivot with IoT Moisture Probes",
        status: "OPTIMAL",
        ndvi: 0.79,
        moisturePercent: 52.4,
        waterFlowLps: 115,
        pivotRadiusM: 467,
        rotationArmAngle: 135,
        coordinates: [30.582, 2.875],
        waterWellDepthM: 390,
        soilEcSalinity: 1.12,
        nitrogenPpm: 88
      },
      {
        id: "DZ-MN-PVT-02",
        code: "DZ-ELMENIA-02",
        nameAr: "محور المنيعة الجنوبي 02 (محيط سبسب)",
        nameEn: "El Menia South Pivot 02 (Sebseb)",
        cropAr: "قمح صلب استراتيجي (صنف سيرتا)",
        cropEn: "Strategic Durum Wheat (Cirta Var)",
        areaHa: 62.0,
        irrigationTypeAr: "رش محوري مستمر بقوة ضغط 4.2 بار",
        irrigationTypeEn: "High-Pressure Center Pivot (4.2 Bar)",
        status: "IRRIGATING",
        ndvi: 0.74,
        moisturePercent: 48.1,
        waterFlowLps: 108,
        pivotRadiusM: 444,
        rotationArmAngle: 280,
        coordinates: [30.595, 2.895],
        waterWellDepthM: 410,
        soilEcSalinity: 1.25,
        nitrogenPpm: 82
      },
      {
        id: "DZ-MN-PVT-03",
        code: "DZ-ELMENIA-03",
        nameAr: "محور المنيعة الاستثماري 03 (امتياز ODAS)",
        nameEn: "El Menia Investment Pivot 03 (ODAS Concession)",
        cropAr: "ذرة علفية صفراء هجين",
        cropEn: "Hybrid Yellow Silage Maize",
        areaHa: 75.0,
        irrigationTypeAr: "رش محوري موفر للطاقة الشمسية",
        irrigationTypeEn: "Solar-Powered Low-Drift Pivot",
        status: "STRESSED",
        ndvi: 0.42,
        moisturePercent: 26.5,
        waterFlowLps: 72,
        pivotRadiusM: 488,
        rotationArmAngle: 45,
        coordinates: [30.570, 2.860],
        waterWellDepthM: 425,
        soilEcSalinity: 1.65,
        nitrogenPpm: 58
      }
    ]
  },
  {
    id: "adrar-timimoun",
    wilayaNumber: 1,
    nameAr: "قطب أدرار وتيميمون للزراعات الكبرى والصناعية",
    nameEn: "Adrar & Timimoun Industrial Mega-Agriculture Pole",
    nameFr: "Pôle Agro-Industriel d'Adrar & Timimoun",
    category: "SAHARAN_PIVOTS",
    categoryLabelAr: "الاستثمارات الزراعية الكبرى والشراكات",
    categoryLabelEn: "Mega Agro-Industrial Concessions",
    descriptionAr: "أكبر مساحة للزراعة التعاقدية في إفريقيا بالشراكة مع ديوان ODAS ومحاور إنتاج الحبوب والشمندر السكري.",
    descriptionEn: "Largest contractual farming zone in Africa under ODAS concessions, producing grain, forage, and industrial beets.",
    totalAreaHectares: 160000,
    activePivotsCount: 1120,
    primaryCropsAr: ["قمح بذور معتمد", "ذرة صفراء", "برسيم حجازي للتصدير", "فول الصويا"],
    primaryCropsEn: ["Certified Foundation Wheat", "Corn Silage", "Premium Alfalfa", "Soybeans"],
    waterSourceAr: "الفرشة الجوفية الصحراوية العميقة ونظام الفقارات الذكي",
    waterSourceEn: "Deep Saharan Aquifers & Modernized Hydro Systems",
    waterTableDepthMeters: 290,
    waterAquiferName: "حوض أدرار الرسوبي المشترك",
    alsatResolution: "Alsat-2B (2.5m) + Alsat-1B Multi-band",
    coordinates: [27.870, -0.285],
    dasConcessionsCount: 88,
    annualProductionTons: 580000,
    ndviHealthIndex: 0.81,
    droughtVulnerability: "LOW",
    keyPerimeter: "محيط شروين وتاوزوز وأولاد أحمد",
    parcels: [
      {
        id: "DZ-ADR-PVT-01",
        code: "DZ-ADRAR-01",
        nameAr: "محور أدرار - أولاد أحمد 01",
        nameEn: "Adrar Ouled Ahmed Pivot 01",
        cropAr: "قمح صلب منتقى (بذور وطنية معتمدة)",
        cropEn: "Certified Foundation Wheat Seeds",
        areaHa: 80.0,
        irrigationTypeAr: "رش محوري مؤتمت بالكامل بإنترنت الأشياء",
        irrigationTypeEn: "Automated IoT Controlled Pivot",
        status: "OPTIMAL",
        ndvi: 0.82,
        moisturePercent: 54.0,
        waterFlowLps: 130,
        pivotRadiusM: 504,
        rotationArmAngle: 210,
        coordinates: [27.865, -0.290],
        waterWellDepthM: 310,
        soilEcSalinity: 1.05,
        nitrogenPpm: 94
      },
      {
        id: "DZ-TMM-PVT-02",
        code: "DZ-TIMIMOUN-02",
        nameAr: "محور تيميمون الواحاتي 02",
        nameEn: "Timimoun Oasis Pivot 02",
        cropAr: "برسيم حجازي عضوي عالي البروتين",
        cropEn: "High-Protein Organic Alfalfa",
        areaHa: 55.0,
        irrigationTypeAr: "رش ميكانيكي ليلي موفر للبخر",
        irrigationTypeEn: "Nocturnal Evaporation-Minimized Pivot",
        status: "IRRIGATING",
        ndvi: 0.77,
        moisturePercent: 49.3,
        waterFlowLps: 98,
        pivotRadiusM: 418,
        rotationArmAngle: 95,
        coordinates: [29.260, 0.230],
        waterWellDepthM: 340,
        soilEcSalinity: 1.18,
        nitrogenPpm: 86
      }
    ]
  },
  {
    id: "biskra-tolga",
    wilayaNumber: 7,
    nameAr: "قطب بسكرة وطولقة لواحات النخيل والزراعة المحمية",
    nameEn: "Biskra & Tolga Royal Dates & Protected Horticulture",
    nameFr: "Pôle Phœnicicole & Plasticulture de Biskra",
    category: "OASIS_DATES",
    categoryLabelAr: "تمور دقلة نور والبيوت البلاستيكية",
    categoryLabelEn: "Deglet Nour Dates & Greenhouses",
    descriptionAr: "العاصمة العالمية لتمور دقلة نور الفاخرة وأكبر مركز وطني للزراعات الخضرية المبكرة تحت الدفيئات البلاستيكية.",
    descriptionEn: "World capital of premium Deglet Nour dates and Algeria's primary winter greenhouse vegetable basin.",
    totalAreaHectares: 85000,
    activePivotsCount: 310,
    primaryCropsAr: ["تمور دقلة نور الملكية", "طماطم وفلفل البيوت البلاستيكية", "تين ورمان الواحات", "بواكير الخضار"],
    primaryCropsEn: ["Royal Deglet Nour Dates", "Protected Greenhouse Tomatoes/Peppers", "Oasis Figs & Pomegranates", "Early Primeurs"],
    waterSourceAr: "مياه وادي جدي وآبار سد فم الغرزة المعالجة",
    waterSourceEn: "Oued Djedi Basin & Foum El Gherza Dam Reservoirs",
    waterTableDepthMeters: 180,
    waterAquiferName: "حوض الزيبان الرسوبي",
    alsatResolution: "Alsat-2A (2.5m Multispectral) High Precision",
    coordinates: [34.850, 5.730],
    dasConcessionsCount: 42,
    annualProductionTons: 620000,
    ndviHealthIndex: 0.75,
    droughtVulnerability: "MEDIUM",
    keyPerimeter: "واحات طولقة، سيدي عقبة والزاب الغربي",
    parcels: [
      {
        id: "DZ-BSK-PLM-01",
        code: "DZ-BISKRA-01",
        nameAr: "واحة طولقة الملكية للتمور 01",
        nameEn: "Tolga Royal Palm Oasis 01",
        cropAr: "نخيل دقلة نور معتمدة جغرافياً (IG Deglet Nour)",
        cropEn: "Certified PDO Deglet Nour Date Palms",
        areaHa: 45.0,
        irrigationTypeAr: "ري موضعي قطرة-قطرة مع رصد رطوبة الجذور",
        irrigationTypeEn: "Root-Zone Micro-Drip Irrigation",
        status: "OPTIMAL",
        ndvi: 0.76,
        moisturePercent: 44.2,
        waterFlowLps: 65,
        pivotRadiusM: 380,
        rotationArmAngle: 0,
        coordinates: [34.720, 5.380],
        waterWellDepthM: 195,
        soilEcSalinity: 1.80,
        nitrogenPpm: 74
      },
      {
        id: "DZ-BSK-GH-02",
        code: "DZ-BISKRA-02",
        nameAr: "مجمع البيوت البلاستيكية الذكية - سيدي عقبة 02",
        nameEn: "Sidi Okba Smart Greenhouse Cluster 02",
        cropAr: "طماطم مبكرة وفلفل حلو تحت الدفيئات",
        cropEn: "Protected Greenhouse Tomatoes & Sweet Peppers",
        areaHa: 38.0,
        irrigationTypeAr: "تسميد وري آلي بالكمبيوتر (Fertigation)",
        irrigationTypeEn: "Automated Fertigation System",
        status: "OPTIMAL",
        ndvi: 0.84,
        moisturePercent: 58.0,
        waterFlowLps: 52,
        pivotRadiusM: 350,
        rotationArmAngle: 0,
        coordinates: [34.750, 5.890],
        waterWellDepthM: 210,
        soilEcSalinity: 1.40,
        nitrogenPpm: 110
      }
    ]
  },
  {
    id: "el-oued-souf",
    wilayaNumber: 39,
    nameAr: "قطب وادي سوف للبطاطس والزراعات الرملية",
    nameEn: "El Oued (Souf) Potato & Sand Basin Pole",
    nameFr: "Pôle Pomme de Terre d'El Oued (Souf)",
    category: "HORTICULTURE_STEPPE",
    categoryLabelAr: "عاصمة البطاطس والمحاصيل الحقلية",
    categoryLabelEn: "National Potato Capital & Sand Crops",
    descriptionAr: "المعجزة الزراعية الصحراوية لإنتاج ثلث حاجة الجزائر من البطاطس والخضار، مع الجمع بين الغيطان ومحاور الرش الحديثة.",
    descriptionEn: "Agricultural marvel producing one third of national potato supply via desert sand basin farming and pivots.",
    totalAreaHectares: 95000,
    activePivotsCount: 680,
    primaryCropsAr: ["بطاطس استهلاكية وصناعية (سبونتا)", "بصل وثوم", "قمح صحراوي", "نخيل الغيطان"],
    primaryCropsEn: ["Spunta Consumer & Processing Potatoes", "Onions & Garlic", "Desert Wheat", "Traditional Ghout Date Palms"],
    waterSourceAr: "مياه العرق الشرقي الجوفية وشبكة الصرف السطحي",
    waterSourceEn: "Grand Erg Oriental Aquifer & Regulated Drainage",
    waterTableDepthMeters: 140,
    waterAquiferName: "الفرشة الجوفية لرمال وادي سوف",
    alsatResolution: "Alsat-2B (2.5m) + Sentinel-2 Synergy",
    coordinates: [33.360, 6.860],
    dasConcessionsCount: 52,
    annualProductionTons: 1150000,
    ndviHealthIndex: 0.72,
    droughtVulnerability: "MEDIUM",
    keyPerimeter: "محيط قمار، الدبيلة وحاسي خليفة",
    parcels: [
      {
        id: "DZ-EOD-POT-01",
        code: "DZ-ELOUED-01",
        nameAr: "محور قمار لإنتاج البطاطس 01",
        nameEn: "Guemar Potato Production Pivot 01",
        cropAr: "بطاطس سبونتا درجة أولى (Spunta Extra)",
        cropEn: "Spunta Extra Grade Potatoes",
        areaHa: 52.0,
        irrigationTypeAr: "رش رذاذي دقيق لحماية التربة الرملية",
        irrigationTypeEn: "Micro-Sprinkler Pivot for Sandy Soil",
        status: "OPTIMAL",
        ndvi: 0.75,
        moisturePercent: 47.0,
        waterFlowLps: 92,
        pivotRadiusM: 407,
        rotationArmAngle: 180,
        coordinates: [33.480, 6.810],
        waterWellDepthM: 145,
        soilEcSalinity: 1.30,
        nitrogenPpm: 95
      }
    ]
  },
  {
    id: "setif-hauts-plateaux",
    wilayaNumber: 19,
    nameAr: "قطب سطيف والهضاب العليا للحبوب الواسعة",
    nameEn: "Sétif & High Plateaus Large-Scale Cereal Pole",
    nameFr: "Pôle Céréalier des Hauts-Plateaux de Sétif",
    category: "CEREAL_PLAINS",
    categoryLabelAr: "سهول الحبوب والبقوليات الجافة",
    categoryLabelEn: "High Plains Cereals & Pulses",
    descriptionAr: "الخزان التاريخي للقمح الجزائري ومركز معهد ITGC لأبحاث تحسين أصناف الحبوب المقاومة للجفاف والجليد الربيعي.",
    descriptionEn: "Historic granary of Algerian wheat and ITGC research hub for drought and frost-resistant seed strains.",
    totalAreaHectares: 180000,
    activePivotsCount: 220,
    primaryCropsAr: ["قمح صلب (محمد البشير / أكساد)", "شعير محلي", "بقوليات جافة (حمص، عدس)", "أعلاف شتوية"],
    primaryCropsEn: ["Durum Wheat (Béchir / ACSAD)", "Local Barley", "Dry Pulses (Chickpeas, Lentils)", "Winter Forage"],
    waterSourceAr: "مياه الأمطار المنتظمة + الري التكميلي من سد الموان والخرزات",
    waterSourceEn: "Rainfed with Supplementary Irrigation from El Mahouan Dam",
    waterTableDepthMeters: 90,
    waterAquiferName: "حوض سهول الهضاب العليا الشمالية",
    alsatResolution: "Alsat-1B (24m Wide Swath) + Alsat-2A",
    coordinates: [36.190, 5.410],
    dasConcessionsCount: 30,
    annualProductionTons: 490000,
    ndviHealthIndex: 0.69,
    droughtVulnerability: "HIGH",
    keyPerimeter: "سهول العلمة، بازر سكرة وعين ولمان",
    parcels: [
      {
        id: "DZ-STF-CER-01",
        code: "DZ-SETIF-01",
        nameAr: "محيط العلمة للحبوب المروية 01",
        nameEn: "El Eulma Irrigated Cereal Perimeter 01",
        cropAr: "قمح صلب جزائري أصيل (محمد البشير ITGC)",
        cropEn: "Algerian Durum Wheat (Mohamed El Béchir ITGC)",
        areaHa: 70.0,
        irrigationTypeAr: "ري تكميلي بالمرشات لمواجهة الجفاف الربيعي",
        irrigationTypeEn: "Supplementary Sprinkler Irrigation",
        status: "OPTIMAL",
        ndvi: 0.71,
        moisturePercent: 43.8,
        waterFlowLps: 84,
        pivotRadiusM: 472,
        rotationArmAngle: 120,
        coordinates: [36.150, 5.680],
        waterWellDepthM: 105,
        soilEcSalinity: 0.95,
        nitrogenPpm: 80
      }
    ]
  },
  {
    id: "tiaret-sirsou",
    wilayaNumber: 14,
    nameAr: "قطب تيارت وسرسو للزراعات الكبرى والثروة الحيوانية",
    nameEn: "Tiaret (Sirsou) Cereals, Livestock & Pasture Pole",
    nameFr: "Pôle Céréalier & Pastoral du Sersou (Tiaret)",
    category: "CEREAL_PLAINS",
    categoryLabelAr: "سهول سرسو ومراعي الماشية",
    categoryLabelEn: "Sersou Plains & Steppic Pastures",
    descriptionAr: "سهول سرسو الشهيرة لزراعة الحبوب وتربية السلالات الأصيلة من الماشية (أولاد جلال) والخيول البربرية، مع مراقبة الرعي الفضائي.",
    descriptionEn: "Legendary Sersou plains combining durum grains, Ouled Djellal livestock pastoralism, and satellite-guided grazing.",
    totalAreaHectares: 140000,
    activePivotsCount: 180,
    primaryCropsAr: ["قمح صلب وشعير", "مراعي طبيعية مدعمة", "أعلاف خضراء (خرطال)", "بقوليات"],
    primaryCropsEn: ["Durum Wheat & Barley", "Enriched Steppic Rangelands", "Green Oats Forage", "Vetch Legumes"],
    waterSourceAr: "حوض وادي مينا وسدود بختة والدحموني",
    waterSourceEn: "Oued Mina Basin & Bekhadda Dam Reservoirs",
    waterTableDepthMeters: 75,
    waterAquiferName: "فرشة سهول سرسو الباطنية",
    alsatResolution: "Alsat-1B Biomass Monitor + Alsat-2A",
    coordinates: [35.370, 1.320],
    dasConcessionsCount: 26,
    annualProductionTons: 360000,
    ndviHealthIndex: 0.65,
    droughtVulnerability: "HIGH",
    keyPerimeter: "سهول سرسو، فرندة ومهدية",
    parcels: [
      {
        id: "DZ-TRT-CER-01",
        code: "DZ-TIARET-01",
        nameAr: "محيط سرسو النموذجي للحبوب 01",
        nameEn: "Sersou Model Grain Perimeter 01",
        cropAr: "قمح صلب بذور نقية (صنف بوفرنيك)",
        cropEn: "Durum Wheat (Bouvernek Pure Strain)",
        areaHa: 65.0,
        irrigationTypeAr: "ري تكميلي موسمي محوري",
        irrigationTypeEn: "Seasonal Center Pivot Irrigation",
        status: "OPTIMAL",
        ndvi: 0.68,
        moisturePercent: 41.5,
        waterFlowLps: 76,
        pivotRadiusM: 455,
        rotationArmAngle: 160,
        coordinates: [35.340, 1.350],
        waterWellDepthM: 85,
        soilEcSalinity: 0.90,
        nitrogenPpm: 75
      }
    ]
  }
];

export const ALSAT_CONSTELLATION: AlsatSatelliteMission[] = [
  {
    id: "alsat-2a",
    satellite: "Alsat-2A",
    launchYear: 2010,
    orbitAltitudeKm: 670,
    sensorType: "NAOMI High-Resolution Optical Imager",
    resolutionMeters: "2.5m Panchromatic / 10m Multispectral (4 Bands)",
    spectralBands: ["PAN (450-900nm)", "Blue (450-520nm)", "Green (530-590nm)", "Red (625-695nm)", "NIR (760-890nm)"],
    revisitPeriodDays: 3,
    coverageAgencyAr: "الوكالة الفضائية الجزائرية (ASAL) - مركز تقنيات الفضاء بأرزيو",
    coverageAgencyEn: "Algerian Space Agency (ASAL) - Space Tech Center (CTS)",
    status: "OPERATIONAL",
    currentPassTargetAr: "محاور المنيعة وحاسي القارة (الرصد الطيفي لمرحلة التفريع)",
    currentPassTargetEn: "El Menia Central Pivots (Tillering Spectral Health Pass)",
    lastAcquisitionUtc: "2026-10-11 09:42:15 UTC",
    telemetryLinkQualityPercent: 99.4
  },
  {
    id: "alsat-2b",
    satellite: "Alsat-2B",
    launchYear: 2016,
    orbitAltitudeKm: 670,
    sensorType: "High-Resolution Earth Observation Payload",
    resolutionMeters: "2.5m Panchromatic / 10m Multispectral",
    spectralBands: ["PAN", "B1 Blue", "B2 Green", "B3 Red", "B4 Near-Infrared"],
    revisitPeriodDays: 3,
    coverageAgencyAr: "الوكالة الفضائية الجزائرية (ASAL) - مركز تطوير الأقمار الصناعية بوهران",
    coverageAgencyEn: "ASAL - Satellite Development Center (CDS Oran)",
    status: "OPERATIONAL",
    currentPassTargetAr: "محاور أدرار وتيميمون (تدقيق امتيازات ديوان ODAS)",
    currentPassTargetEn: "Adrar & Timimoun Mega-Concessions Audit Pass",
    lastAcquisitionUtc: "2026-10-11 11:18:04 UTC",
    telemetryLinkQualityPercent: 99.8
  },
  {
    id: "alsat-1b",
    satellite: "Alsat-1B",
    launchYear: 2016,
    orbitAltitudeKm: 660,
    sensorType: "Wide Swath Multispectral Multisensor (SLIM-6)",
    resolutionMeters: "24m Multispectral (Swath Width 600 km)",
    spectralBands: ["Green (520-600nm)", "Red (630-690nm)", "NIR (770-900nm)"],
    revisitPeriodDays: 4,
    coverageAgencyAr: "الوكالة الفضائية الجزائرية (ASAL) - المسح الزراعي الشامل",
    coverageAgencyEn: "ASAL - National Agricultural Wide-Swath Cadastre",
    status: "OPERATIONAL",
    currentPassTargetAr: "الخريطة القومية للغطاء النباتي (مؤشر NDVI لكامل التراب الوطني)",
    currentPassTargetEn: "National Land Cover & Cereal NDVI Mosaic",
    lastAcquisitionUtc: "2026-10-11 07:12:30 UTC",
    telemetryLinkQualityPercent: 98.9
  },
  {
    id: "alsat-1n",
    satellite: "Alsat-1N",
    launchYear: 2016,
    orbitAltitudeKm: 665,
    sensorType: "Nanotechnology Radiation & IoT Payload",
    resolutionMeters: "Experimental IoT Link / Compact Camera",
    spectralBands: ["RGB Color / IoT Telemetry Beacon"],
    revisitPeriodDays: 5,
    coverageAgencyAr: "الوكالة الفضائية الجزائرية (ASAL) - تجارب الربط السيادي IoT",
    coverageAgencyEn: "ASAL - Sovereign Micro-Telemetry Beacon",
    status: "OPERATIONAL",
    currentPassTargetAr: "مستشعرات الضغط في آبار حوض الألبي بالمنيعة",
    currentPassTargetEn: "Albian Aquifer Piezometer IoT Node Sync",
    lastAcquisitionUtc: "2026-10-11 10:05:40 UTC",
    telemetryLinkQualityPercent: 97.6
  }
];

export const ODAS_CONCESSIONS: OdasConcession[] = [
  {
    id: "ODAS-DZ-01",
    code: "ODAS-MENIA-2026-STRAT-01",
    investorNameAr: "المجمع العمومي الزراعي Agrodiv - قطب المنيعة",
    investorNameEn: "Agrodiv National Agro-Group - El Menia Pole",
    wilayaAr: "المنيعة (ولاية 58)",
    wilayaEn: "El Menia (Wilaya 58)",
    perimeterNameAr: "محيط حاسي القارة للحبوب الاستراتيجية",
    perimeterNameEn: "Hassi Gara Strategic Cereals Perimeter",
    allocatedHectares: 15000,
    cultivatedHectares: 12400,
    targetCropsAr: "قمح صلب 100% + تناوب عباد الشمس",
    targetCropsEn: "100% Durum Wheat + Sunflower Rotation",
    boreholesCount: 24,
    boreholeAvgDepthM: 395,
    status: "OPERATIONAL_HARVEST",
    investmentTier: "STRATEGIC_NATIONAL",
    approvalDate: "2024-03-15"
  },
  {
    id: "ODAS-DZ-02",
    code: "ODAS-ADRAR-2026-IND-02",
    investorNameAr: "شراكة مزارع الجنوب الكبرى (شراكة وطنية خاصة)",
    investorNameEn: "Southern Mega Farms Consortium (Public-Private)",
    wilayaAr: "أدرار (ولاية 01)",
    wilayaEn: "Adrar (Wilaya 01)",
    perimeterNameAr: "محيط شروين الموحد",
    perimeterNameEn: "Cherouine Integrated Agro-Industrial Perimeter",
    allocatedHectares: 25000,
    cultivatedHectares: 18600,
    targetCropsAr: "بذور القمح المنتقاة، الذرة العلفية، فول الصويا",
    targetCropsEn: "Certified Wheat Seeds, Forage Corn, Soybeans",
    boreholesCount: 38,
    boreholeAvgDepthM: 320,
    status: "OPERATIONAL_HARVEST",
    investmentTier: "STRATEGIC_NATIONAL",
    approvalDate: "2023-11-20"
  },
  {
    id: "ODAS-DZ-03",
    code: "ODAS-TIMI-2026-FOR-03",
    investorNameAr: "مجمع بلادنا الجزائري لإنتاج الحليب والأعلاف",
    investorNameEn: "Baladna Algeria Dairy & Feed Megaproject",
    wilayaAr: "تيميمون (ولاية 49)",
    wilayaEn: "Timimoun (Wilaya 49)",
    perimeterNameAr: "محيط تينركوك للاستثمار المتكامل",
    perimeterNameEn: "Tinerkouk Integrated Agropastoral Perimeter",
    allocatedHectares: 117000,
    cultivatedHectares: 45000,
    targetCropsAr: "برسيم حجازي، ذرة سيلاج، إنتاج بودرة الحليب",
    targetCropsEn: "Alfalfa, Silage Corn, Industrial Milk Powder",
    boreholesCount: 95,
    boreholeAvgDepthM: 360,
    status: "EXPANSION_PHASE",
    investmentTier: "STRATEGIC_NATIONAL",
    approvalDate: "2024-04-28"
  },
  {
    id: "ODAS-DZ-04",
    code: "ODAS-OUED-2026-HORT-04",
    investorNameAr: "تعاونية منتجي البطاطس الصحراوية - وادي سوف",
    investorNameEn: "Saharan Potato Producers Cooperative - Souf",
    wilayaAr: "الوادي (ولاية 39)",
    wilayaEn: "El Oued (Wilaya 39)",
    perimeterNameAr: "محيط حاسي خليفة الزراعي",
    perimeterNameEn: "Hassi Khelifa Agricultural Basin",
    allocatedHectares: 8500,
    cultivatedHectares: 8100,
    targetCropsAr: "بطاطس سبونتا، بصل جاف، تمور معتمدة",
    targetCropsEn: "Spunta Potatoes, Dry Onions, Certified Dates",
    boreholesCount: 19,
    boreholeAvgDepthM: 155,
    status: "OPERATIONAL_HARVEST",
    investmentTier: "AGRI_INDUSTRIAL",
    approvalDate: "2023-08-10"
  }
];

export const ALGERIA_WATER_TABLE_SENSORS: WaterTableSensorNode[] = [
  {
    id: "SENS-ALB-01",
    code: "DZ-PIEZO-MENIA-ALBIEN-01",
    regionAr: "حوض المنيعة - حاسي القارة",
    aquiferNameAr: "حوض الألبي العملاق (Continent Intercalaire)",
    piezometricLevelM: -18.4,
    staticWaterLevelM: 42.0,
    rechargeRateMmYear: 4.8,
    salinityGramsPerLiter: 0.85,
    sustainabilityStatus: "SUSTAINABLE",
    lastPiezometerReading: "منذ 4 دقائق (مستشعر IoT سيادي)"
  },
  {
    id: "SENS-ALB-02",
    code: "DZ-PIEZO-ADRAR-CI-02",
    regionAr: "حوض أدرار - أولاد أحمد",
    aquiferNameAr: "طبقة الحجر الرملي القاري المشترك",
    piezometricLevelM: -22.1,
    staticWaterLevelM: 38.5,
    rechargeRateMmYear: 3.9,
    salinityGramsPerLiter: 0.92,
    sustainabilityStatus: "SUSTAINABLE",
    lastPiezometerReading: "منذ 11 دقيقة"
  },
  {
    id: "SENS-BSK-03",
    code: "DZ-PIEZO-BISKRA-CT-03",
    regionAr: "واحات بسكرة - زيبان",
    aquiferNameAr: "طبقة المركب النهائي (Complexe Terminal)",
    piezometricLevelM: -34.8,
    staticWaterLevelM: 65.0,
    rechargeRateMmYear: 7.2,
    salinityGramsPerLiter: 1.85,
    sustainabilityStatus: "MODERATE_MONITORED",
    lastPiezometerReading: "منذ 18 دقيقة"
  },
  {
    id: "SENS-OED-04",
    code: "DZ-PIEZO-OUED-ERG-04",
    regionAr: "وادي سوف - قمار",
    aquiferNameAr: "الفرشة المائية السطحية للعرق الشرقي",
    piezometricLevelM: -8.2,
    staticWaterLevelM: 14.0,
    rechargeRateMmYear: 12.0,
    salinityGramsPerLiter: 1.45,
    sustainabilityStatus: "SUSTAINABLE",
    lastPiezometerReading: "منذ 6 دقائق"
  }
];



