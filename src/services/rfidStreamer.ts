import { eventBus } from './eventBus';
import { LivestockTelemetryPacket } from '../types/ecosystem';

type TelemetryListener = (packet: LivestockTelemetryPacket) => void;

// Initial Animal Pool with RFID & Genomic Identifiers
const INITIAL_ANIMALS: Omit<LivestockTelemetryPacket, 'timestamp' | 'alertTriggered' | 'alertReason'>[] = [
  {
    tagId: 'DZ-CAM-89100-01',
    rfidChipId: 'RFID-DZ-CAM-89100-01',
    breed: 'إبل المجاهيم الصحراوية (Desert Majahim)',
    herdId: 'HERD-CAM-01',
    animalType: 'CAMEL',
    temperatureCelsius: 37.8,
    heartRateBpm: 56,
    heatToleranceScore: 96.2,
    coordinates: [24.135, 47.305],
    boundaryStatus: 'NOMINAL',
    locationName: 'المرعى الرملي الغربي (المنطقة A)',
    locationNameEn: 'Western Sandy Pasture (Zone A)',
    pastureZone: 'ZONE-A'
  },
  {
    tagId: 'DZ-SHP-44210-14',
    rfidChipId: 'RFID-DZ-SHP-44210-14',
    breed: 'نعاج أولاد جلال المحسنة (Ouled Djellal)',
    herdId: 'HERD-SHP-02',
    animalType: 'SHEEP',
    temperatureCelsius: 39.5, // Elevated temp
    heartRateBpm: 84,
    heatToleranceScore: 89.2,
    coordinates: [24.171, 47.363],
    boundaryStatus: 'BOUNDARY_WARNING',
    locationName: 'شعيب السهوب وتلال المرعى (المنطقة B)',
    locationNameEn: 'Steppe Pasture & Eastern Hills (Zone B)',
    pastureZone: 'ZONE-B'
  },
  {
    tagId: 'US-DZ-HOL-921-002',
    rfidChipId: 'RFID-840-003-921-002',
    breed: 'أبقار هولشتاين عشار أمريكية (Genomic Holstein Heifer)',
    herdId: 'HERD-HOL-03',
    animalType: 'CATTLE',
    temperatureCelsius: 38.6,
    heartRateBpm: 72,
    heatToleranceScore: 94.0,
    coordinates: [24.156, 47.333],
    boundaryStatus: 'NOMINAL',
    locationName: 'محيط الحظائر المبردة ومزارع الأعلاف (المنطقة C)',
    locationNameEn: 'Evaporative Cooling Bio-Sanctuary (Zone C)',
    pastureZone: 'ZONE-C'
  },
  {
    tagId: 'DZ-CAM-89100-03',
    rfidChipId: 'RFID-DZ-CAM-89100-03',
    breed: 'إبل المجاهيم - سلالة متأقلمة',
    herdId: 'HERD-CAM-01',
    animalType: 'CAMEL',
    temperatureCelsius: 37.9,
    heartRateBpm: 58,
    heatToleranceScore: 95.8,
    coordinates: [24.138, 47.308],
    boundaryStatus: 'NOMINAL',
    locationName: 'ممر وادي الغضا المائي',
    locationNameEn: 'Al-Ghadha Valley Water Corridor',
    pastureZone: 'ZONE-A'
  },
  {
    tagId: 'US-DZ-HOL-921-001',
    rfidChipId: 'RFID-840-003-921-001',
    breed: 'أبقار هولشتاين - إنتاجية 12,800 لتر/سنة',
    herdId: 'HERD-HOL-03',
    animalType: 'CATTLE',
    temperatureCelsius: 38.7,
    heartRateBpm: 74,
    heatToleranceScore: 93.6,
    coordinates: [24.154, 47.330],
    boundaryStatus: 'NOMINAL',
    locationName: 'الحظيرة النموذجية المبردة (المنيعة)',
    locationNameEn: 'Climate-Controlled Desert Parlor (El Menia)',
    pastureZone: 'ZONE-C'
  }
];

class SovereignRfidStreamer {
  private timer: NodeJS.Timeout | null = null;
  private isStreaming: boolean = true;
  private currentIndex: number = 0;
  private listeners: TelemetryListener[] = [];
  private animals = [...INITIAL_ANIMALS];
  private recentPackets: LivestockTelemetryPacket[] = [];
  private boundaryWarningCounter: number = 1; // 1 active initially (DZ-SHP-44210-14)
  private streamIntervalMs: number = 3800;

  constructor() {
    this.startStreaming();
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public startStreaming(): void {
    if (this.timer) clearInterval(this.timer);
    this.isStreaming = true;
    this.timer = setInterval(() => {
      this.tick();
    }, this.streamIntervalMs);
  }

  public pauseStreaming(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isStreaming = false;
  }

  public toggleStreaming(): boolean {
    if (this.isStreaming) {
      this.pauseStreaming();
    } else {
      this.startStreaming();
    }
    return this.isStreaming;
  }

  public isStreamingActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Main Stream Loop: Generates a real-time livestock packet and publishes to sovereign bus
   */
  private tick(): void {
    const baseAnimal = this.animals[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.animals.length;

    // Simulate natural telemetry jitter
    const tempJitter = (Math.random() - 0.5) * 0.2;
    const currentTemp = +(baseAnimal.temperatureCelsius + tempJitter).toFixed(1);
    const hrJitter = Math.floor((Math.random() - 0.5) * 4);
    const currentHr = Math.max(50, Math.min(105, baseAnimal.heartRateBpm + hrJitter));
    const htiJitter = (Math.random() - 0.5) * 0.4;
    const currentHti = +(baseAnimal.heatToleranceScore + htiJitter).toFixed(1);

    // Micro-coordinate drift
    const latDrift = (Math.random() - 0.5) * 0.0006;
    const lngDrift = (Math.random() - 0.5) * 0.0006;
    const currentCoords: [number, number] = [
      +(baseAnimal.coordinates[0] + latDrift).toFixed(5),
      +(baseAnimal.coordinates[1] + lngDrift).toFixed(5)
    ];

    const isAlert = baseAnimal.boundaryStatus !== 'NOMINAL' || currentTemp >= 39.4;
    const alertReason = currentTemp >= 39.4 
      ? `CRITICAL_HYPERTHERMIA_SPIKE (${currentTemp}°C)` 
      : baseAnimal.boundaryStatus !== 'NOMINAL' 
        ? `BOUNDARY_WARNING: Crossing Sector Fence in ${baseAnimal.pastureZone}` 
        : undefined;

    const packet: LivestockTelemetryPacket = {
      ...baseAnimal,
      temperatureCelsius: currentTemp,
      heartRateBpm: currentHr,
      heatToleranceScore: currentHti,
      coordinates: currentCoords,
      timestamp: new Date().toISOString(),
      alertTriggered: isAlert,
      alertReason
    };

    // 1. Sovereign Bus Integration: Publish to `sol.telemetry.livestock.v3`
    eventBus.triggerLivestockTelemetryEvent({
      tagId: packet.tagId,
      rfidChipId: packet.rfidChipId,
      breed: packet.breed,
      temperatureCelsius: packet.temperatureCelsius,
      heartRateBpm: packet.heartRateBpm,
      heatToleranceScore: packet.heatToleranceScore,
      coordinates: packet.coordinates,
      boundaryStatus: packet.boundaryStatus,
      locationName: packet.locationName
    });

    // 2. Buffer packet and notify UI listeners
    this.recentPackets = [packet, ...this.recentPackets.slice(0, 19)];
    this.listeners.forEach(fn => fn(packet));
  }

  /**
   * Manual Action: Simulate Boundary Warning or Breach
   */
  public triggerSimulatedBoundaryBreach(tagId?: string): LivestockTelemetryPacket {
    const targetTag = tagId || 'DZ-SHP-44210-14';
    const targetIndex = this.animals.findIndex(a => a.tagId === targetTag);
    const animal = targetIndex >= 0 ? this.animals[targetIndex] : this.animals[1];

    // Breached coordinates outside safety perimeter
    const breachedCoords: [number, number] = [24.1782, 47.3715];

    animal.boundaryStatus = 'BREACH';
    animal.coordinates = breachedCoords;
    animal.temperatureCelsius = 39.7;
    animal.heartRateBpm = 92;

    this.boundaryWarningCounter = Math.max(1, this.boundaryWarningCounter + 1);

    const packet: LivestockTelemetryPacket = {
      ...animal,
      temperatureCelsius: 39.7,
      heartRateBpm: 92,
      heatToleranceScore: 86.4,
      coordinates: breachedCoords,
      boundaryStatus: 'BREACH',
      timestamp: new Date().toISOString(),
      alertTriggered: true,
      alertReason: `GEOPERIMETER_BREACH: RFID ${animal.rfidChipId} crossed sanctuary boundary into non-grazing corridor`
    };

    // Sovereign Bus Integration + Kareema operational alert dispatch
    eventBus.triggerLivestockTelemetryEvent({
      tagId: packet.tagId,
      rfidChipId: packet.rfidChipId,
      breed: packet.breed,
      temperatureCelsius: packet.temperatureCelsius,
      heartRateBpm: packet.heartRateBpm,
      heatToleranceScore: packet.heatToleranceScore,
      coordinates: packet.coordinates,
      boundaryStatus: packet.boundaryStatus,
      locationName: packet.locationName
    });

    this.recentPackets = [packet, ...this.recentPackets.slice(0, 19)];
    this.listeners.forEach(fn => fn(packet));

    return packet;
  }

  /**
   * Manual Action: Simulate Critical Hyperthermia Spike
   */
  public triggerSimulatedHyperthermia(tagId?: string): LivestockTelemetryPacket {
    const targetTag = tagId || 'US-DZ-HOL-921-002';
    const targetIndex = this.animals.findIndex(a => a.tagId === targetTag);
    const animal = targetIndex >= 0 ? this.animals[targetIndex] : this.animals[2];

    animal.temperatureCelsius = 40.2;
    animal.heartRateBpm = 104;

    const packet: LivestockTelemetryPacket = {
      ...animal,
      temperatureCelsius: 40.2,
      heartRateBpm: 104,
      heatToleranceScore: 78.5,
      coordinates: animal.coordinates,
      boundaryStatus: 'NOMINAL',
      timestamp: new Date().toISOString(),
      alertTriggered: true,
      alertReason: `CRITICAL_HYPERTHERMIA_SPIKE: Body temp 40.2°C exceeds safety threshold (39.4°C). Immediate misting required.`
    };

    eventBus.triggerLivestockTelemetryEvent({
      tagId: packet.tagId,
      rfidChipId: packet.rfidChipId,
      breed: packet.breed,
      temperatureCelsius: packet.temperatureCelsius,
      heartRateBpm: packet.heartRateBpm,
      heatToleranceScore: packet.heatToleranceScore,
      coordinates: packet.coordinates,
      boundaryStatus: packet.boundaryStatus,
      locationName: packet.locationName
    });

    this.recentPackets = [packet, ...this.recentPackets.slice(0, 19)];
    this.listeners.forEach(fn => fn(packet));

    return packet;
  }

  /**
   * Clear active breach status back to nominal
   */
  public resetBreachStatus(tagId: string): void {
    const target = this.animals.find(a => a.tagId === tagId);
    if (target) {
      target.boundaryStatus = 'NOMINAL';
      target.temperatureCelsius = 38.2;
      target.heartRateBpm = 68;
      target.coordinates = [24.168, 47.360];
      this.boundaryWarningCounter = Math.max(0, this.boundaryWarningCounter - 1);
    }
  }

  public getRecentPackets(): LivestockTelemetryPacket[] {
    return [...this.recentPackets];
  }

  public getBoundaryWarningCount(): number {
    return this.boundaryWarningCounter;
  }

  public getActiveHerdCount(): number {
    return 745; // 145 Camels + 380 Sheep + 220 Cattle
  }

  public getAverageHti(): number {
    const total = this.animals.reduce((acc, curr) => acc + curr.heatToleranceScore, 0);
    return +(total / this.animals.length).toFixed(1);
  }
}

export const rfidStreamer = new SovereignRfidStreamer();
