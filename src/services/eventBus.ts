import { 
  SystemEvent, 
  WorkOrder, 
  ParcelAsset, 
  LivestockHerd, 
  DigitalQualityPassport 
} from '../types/ecosystem';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateSha256(content: string): string {
  // Simple deterministic hash simulation for front-end demonstration
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const dummyTail = Array.from({ length: 7 }, (_, i) => 
    Math.abs((hash ^ (i * 997))).toString(16).padStart(8, '0')
  ).join('');
  return `sha256:${hex}${dummyTail}`.slice(0, 71);
}

type EventListener = (event: SystemEvent) => void;
type WorkOrderListener = (workOrder: WorkOrder) => void;

class SolEcosystemEventBus {
  private listeners: EventListener[] = [];
  private workOrderListeners: WorkOrderListener[] = [];
  private events: SystemEvent[] = [];

  constructor() {
    this.events = [];
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public onWorkOrderDispatched(listener: WorkOrderListener): () => void {
    this.workOrderListeners.push(listener);
    return () => {
      this.workOrderListeners = this.workOrderListeners.filter(l => l !== listener);
    };
  }

  public publish(event: Omit<SystemEvent, 'event_id' | 'timestamp' | 'signatureHash' | 'isProcessed'>): SystemEvent {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 23);
    const event_id = generateUUID();
    const signatureHash = generateSha256(`${event_id}:${event.topic}:${JSON.stringify(event.payload)}`);

    const fullEvent: SystemEvent = {
      ...event,
      event_id,
      timestamp,
      signatureHash,
      isProcessed: true
    };

    this.events.unshift(fullEvent);
    this.listeners.forEach(fn => fn(fullEvent));

    return fullEvent;
  }

  /**
   * Synergistic Workflow: SolVision -> AtlasCloud -> Kareema
   * Triggered when SolVision computes an NDVI stress anomaly
   */
  public triggerCropStressWorkflow(
    parcel: ParcelAsset, 
    severity: 'HIGH' | 'CRITICAL' = 'HIGH'
  ): { stressEvent: SystemEvent; workOrderEvent: SystemEvent; workOrder: WorkOrder } {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    // 1. SolVision emits EVENT_CROP_STRESS_DETECTED
    const stressEvent = this.publish({
      topic: 'solvision.crop-stress.v1',
      eventType: 'EVENT_CROP_STRESS_DETECTED',
      sourceSystem: 'SolVision',
      payload: {
        asset_id: parcel.asset_id,
        pivot_code: parcel.code,
        spectral_index: 'NDVI',
        current_value: 0.34,
        baseline_threshold: 0.65,
        deviation_percent: -47.7,
        bbox: parcel.stressBbox || {
          minLat: parcel.center[0] - 0.003,
          minLng: parcel.center[1] - 0.003,
          maxLat: parcel.center[0] + 0.003,
          maxLng: parcel.center[1] + 0.003
        },
        satellite_source: 'Sentinel-2 MSI Orbit 44 (SolVision Auto-Processor)',
        spatial_engine: 'PostGIS ST_Intersects & ST_Envelope'
      }
    });

    // 2. AtlasCloud computes Bounding Box, determines technician, and issues Work Order to Kareema
    const workOrderId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const workOrder: WorkOrder = {
      order_id: workOrderId,
      trigger_event_id: stressEvent.event_id,
      asset_id: parcel.asset_id,
      assetName: parcel.name,
      title: `استجابة طارئة: إجهاد نباتي حاد في ${parcel.code} (${parcel.name})`,
      titleEn: `Emergency Response: Severe Crop Stress on ${parcel.code} (${parcel.nameEn})`,
      description: `رصد محرك SolVision هبوط مؤشر NDVI إلى 0.34 مع نقص مائي حاد. قامت AtlasCloud بحساب إحداثيات Bounding Box وتوجيه أمر عمل فوري لأسطول Kareema.`,
      descriptionEn: `SolVision detected NDVI collapse to 0.34 with acute water stress. AtlasCloud computed bounding box coordinates and dispatched an automated Kareema work order.`,
      severity: severity,
      status: 'DISPATCHED',
      assignedFleetId: 'FLEET-GPS-TRK-01',
      assignedTechnician: 'م. فهد العتيبي (فريق الدعم الميداني)',
      coordinates: parcel.center,
      bbox: parcel.stressBbox || {
        minLat: parcel.center[0] - 0.003,
        minLng: parcel.center[1] - 0.003,
        maxLat: parcel.center[0] + 0.003,
        maxLng: parcel.center[1] + 0.003
      },
      createdAt: timestampStr,
      etaMinutes: 15,
      solutionType: 'IRRIGATION_BOOST'
    };

    // 3. AtlasCloud emits EVENT_WORK_ORDER_DISPATCHED to Kareema
    const workOrderEvent = this.publish({
      topic: 'atlas.work-orders.v1',
      eventType: 'EVENT_WORK_ORDER_DISPATCHED',
      sourceSystem: 'AtlasCloud',
      payload: {
        order_id: workOrderId,
        trigger_event_id: stressEvent.event_id,
        target_system: 'Kareema-FieldOps-Fleet',
        asset_id: parcel.asset_id,
        severity: severity,
        assigned_fleet_id: 'FLEET-GPS-TRK-01',
        technician: 'م. فهد العتيبي',
        geo_resolution: 'PostGIS Centroid & ST_MakeEnvelope'
      }
    });

    this.workOrderListeners.forEach(fn => fn(workOrder));

    return { stressEvent, workOrderEvent, workOrder };
  }

  /**
   * Synergistic Workflow: Kareema -> SolVision (Smart Grazing Engine)
   * Matches livestock RFID/GPS with spectral vegetation maps to prevent overgrazing
   */
  public triggerGrazingWarningWorkflow(herd: LivestockHerd): {
    warningEvent: SystemEvent;
    advisoryWorkOrder: WorkOrder;
  } {
    const warningEvent = this.publish({
      topic: 'kareema.grazing-warning.v1',
      eventType: 'EVENT_HERD_GRAZING_ANOMALY',
      sourceSystem: 'Kareema',
      payload: {
        herd_id: herd.herd_id,
        herd_name: herd.name,
        animal_count: herd.count,
        rfid_prefix: herd.rfid_batch_prefix,
        current_zone: herd.currentZone,
        biomass_density: 0.22,
        warning_type: 'OVERGRAZING_IMMINENT',
        algorithmic_action: 'ENFORCE_ROTATIONAL_GRAZING_CORRIDOR',
        target_zone: herd.recommendedRotationZone
      }
    });

    const advisoryWorkOrder: WorkOrder = {
      order_id: `WO-GRAZ-${Math.floor(1000 + Math.random() * 9000)}`,
      trigger_event_id: warningEvent.event_id,
      asset_id: herd.herd_id,
      assetName: herd.name,
      title: `توجيه مسار الرعي التناوبي: ${herd.name}`,
      titleEn: `Rotational Grazing Route Guidance: ${herd.nameEn}`,
      description: `انخفضت الكتلة الحيوية النباتية في ${herd.currentZone} إلى أقل من 25%. يجب توجيه القطيع فوراً إلى ${herd.recommendedRotationZone} لتجنب تدهور الغطاء النباتي.`,
      descriptionEn: `Biomass index in ${herd.currentZoneEn} declined below 25%. Immediate herd diversion to ${herd.recommendedRotationZoneEn} is required to prevent land degradation.`,
      severity: 'CRITICAL',
      status: 'PENDING',
      assignedTechnician: 'د. هاني السالم (إدارة المراعي والغابات)',
      coordinates: herd.coordinates,
      bbox: {
        minLat: herd.coordinates[0] - 0.005,
        minLng: herd.coordinates[1] - 0.005,
        maxLat: herd.coordinates[0] + 0.005,
        maxLng: herd.coordinates[1] + 0.005
      },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      etaMinutes: 25,
      solutionType: 'HERD_REDIVERSION'
    };

    this.workOrderListeners.forEach(fn => fn(advisoryWorkOrder));

    return { warningEvent, advisoryWorkOrder };
  }

  /**
   * Sovereign Data Governance: Seals Digital Quality Passport
   */
  public triggerPassportSealing(passport: DigitalQualityPassport): SystemEvent {
    return this.publish({
      topic: 'atlas.passport-sealed.v1',
      eventType: 'EVENT_QUALITY_PASSPORT_SEALED',
      sourceSystem: 'AtlasCloud',
      payload: {
        crop_batch_id: passport.crop_batch_id,
        asset_id: passport.asset_id,
        purity_score: passport.soilPurityIndex,
        water_stress_free: passport.waterStressFreeIndex,
        cryptographic_hash: passport.cryptographicSeal.hash,
        merkle_root: passport.cryptographicSeal.merkleRoot,
        sovereignty_status: 'DZ_NATIONAL_SOVEREIGN_VAULT_SEALED'
      }
    });
  }
  /**
   * Sovereign Bus Integration: Livestock & Genetic RFID Telemetry Streamer
   * Streams animal vitals, HTI, and boundary status to `sol.telemetry.livestock.v3`.
   * Automatically triggers a Kareema operational alert/work order when a boundary breach
   * or critical body temperature spike occurs.
   */
  public triggerLivestockTelemetryEvent(data: {
    tagId: string;
    rfidChipId: string;
    breed: string;
    temperatureCelsius: number;
    heartRateBpm: number;
    heatToleranceScore: number;
    coordinates: [number, number];
    boundaryStatus: 'NOMINAL' | 'BOUNDARY_WARNING' | 'BREACH';
    locationName: string;
  }): {
    telemetryEvent: SystemEvent;
    dispatchWorkOrder?: WorkOrder;
  } {
    const isCriticalTemp = data.temperatureCelsius >= 39.4;
    const isBoundaryBreach = data.boundaryStatus !== 'NOMINAL';
    const isAlertCondition = isCriticalTemp || isBoundaryBreach;

    const telemetryEvent = this.publish({
      topic: 'sol.telemetry.livestock.v3',
      eventType: isBoundaryBreach ? 'EVENT_LIVESTOCK_BOUNDARY_BREACH' : 'EVENT_LIVESTOCK_TELEMETRY_PACKET',
      sourceSystem: 'Kareema',
      payload: {
        tag_id: data.tagId,
        rfid_chip_id: data.rfidChipId,
        breed: data.breed,
        temperature_c: data.temperatureCelsius,
        heart_rate_bpm: data.heartRateBpm,
        heat_tolerance_score: data.heatToleranceScore,
        coordinates: data.coordinates,
        boundary_status: data.boundaryStatus,
        location: data.locationName,
        alert_triggered: isAlertCondition,
        alert_reason: isCriticalTemp 
          ? `CRITICAL_HYPERTHERMIA_SPIKE (${data.temperatureCelsius}°C)` 
          : isBoundaryBreach ? `GEOPERIMETER_BOUNDARY_WARNING (${data.boundaryStatus})` : 'NORMAL_STREAM'
      }
    });

    let dispatchWorkOrder: WorkOrder | undefined;

    if (isAlertCondition) {
      dispatchWorkOrder = {
        order_id: `WO-LIVESTOCK-${Math.floor(1000 + Math.random() * 9000)}`,
        trigger_event_id: telemetryEvent.event_id,
        asset_id: data.rfidChipId,
        assetName: `البقرة المستوردة ${data.tagId} (${data.breed})`,
        title: isBoundaryBreach 
          ? `إنذار اختراق سياج المرعى: ${data.tagId}` 
          : `طوارئ إجهاد حراري حاد للبقرة: ${data.tagId} (${data.temperatureCelsius}°C)`,
        titleEn: isBoundaryBreach
          ? `Boundary Warning & Perimeter Breach: ${data.tagId}`
          : `Critical Hyperthermia Alert: ${data.tagId} (${data.temperatureCelsius}°C)`,
        description: isBoundaryBreach
          ? `تم رصد خروج البقرة ${data.tagId} عن سياج المرعى الجغرافي المحدد في ${data.locationName}. مطلوب تدخل فوري لإعادة الحيوان إلى الممر الآمن.`
          : `ارتفعت حرارة جسم البقرة ${data.tagId} إلى ${data.temperatureCelsius}°C وتجاوز معدل النبض ${data.heartRateBpm} BPM. مطلوب تفعيل الرذاذ التبخيري والفحص البيطري الفوري.`,
        descriptionEn: isBoundaryBreach
          ? `RFID tag ${data.tagId} crossed geofenced sanctuary perimeter in ${data.locationName}. Rapid response required to herd back to safety corridor.`
          : `Body temperature spiked to ${data.temperatureCelsius}°C with heart rate at ${data.heartRateBpm} BPM. Immediate misting and veterinary inspection dispatched.`,
        severity: 'CRITICAL',
        status: 'PENDING',
        assignedTechnician: 'د. كريم بن زاهي (الفريق البيطري السريع - Kareema)',
        coordinates: data.coordinates,
        bbox: {
          minLat: data.coordinates[0] - 0.003,
          minLng: data.coordinates[1] - 0.003,
          maxLat: data.coordinates[0] + 0.003,
          maxLng: data.coordinates[1] + 0.003
        },
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        etaMinutes: 12,
        solutionType: isBoundaryBreach ? 'HERD_REDIVERSION' : 'SOIL_SAMPLING',
        slaLevel: 'P1_CRITICAL',
        slaMaxMinutes: 15,
        slaRemainingMinutes: 10
      };

      this.workOrderListeners.forEach(fn => fn(dispatchWorkOrder!));
    }

    return { telemetryEvent, dispatchWorkOrder };
  }
}

export const eventBus = new SolEcosystemEventBus();
