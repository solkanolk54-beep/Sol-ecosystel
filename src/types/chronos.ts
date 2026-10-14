import { BoundingBox, ParcelAsset } from './ecosystem';

export type ChronosSpectralMode = 'ndvi' | 'rgb' | 'ndwi' | 'thermal';

export interface HistoricalEpoch {
  year: number;
  dateLabel: string;
  satelliteConstellation: string;
  sensor: string;
  spatialResolution: string;
  descriptionAr: string;
  descriptionEn: string;
  averageNdvi: number;
  averageNdwi: number; // Canopy Water / Moisture Index (-1.0 to +1.0)
  vegetationAreaHa: number;
  activePivotsCount: number;
  surfaceTempDeficitC: number; // Cooling relative to surrounding terrain
  waterWithdrawalM3PerYear: number;
  carbonStockTonsCo2: number;
  postGisQuerySnippet: string;
  satelliteBadgeColor: string;
  subsurfaceSoilMoisturePercent?: number; // 0-100%
  darkDroughtSigmaDelta?: number; // Standard deviations from 38-year rolling mean
}

export interface ChronosComparisonState {
  baselineYear: number; // e.g. 1988
  contemporaryYear: number; // e.g. 2026
  splitPositionPercent: number; // 0 - 100 for draggable split-swipe
  spectralMode: ChronosSpectralMode;
  selectedRegionId: string;
  isAutoplayActive: boolean;
}

export interface DarkDroughtSimParams {
  thermalSpikeC: number; // +2.5°C to +4.0°C
  precipitationDeficitPercent: number; // 30% to 90%
  soilMoistureDepletionRate: number; // % depletion
  testZoneId: string;
}

export interface DarkDroughtSimulationResult {
  tippingPointPercent: number; // 0 - 100%
  subsurfaceStressDetected: boolean;
  canopyYellowingRisk: 'LOW' | 'ELEVATED' | 'CRITICAL' | 'IMMINENT_COLLAPSE';
  soilMoistureRemainingPercent: number;
  kareemaDispatchRequired: boolean;
  sha256Proof: string;
  merkleLeaf: string;
  dispatchWorkOrderId?: string;
}

export interface ChronosRegionalCluster {
  id: string;
  nameAr: string;
  nameEn: string;
  centerCoords: [number, number]; // [lat, lng]
  bbox: BoundingBox;
  odasConcessionRef: string;
  aquiferLayer: string;
  baselineNdvi1988: number;
  currentNdvi2026: number;
  baselineNdwi1988: number;
  currentNdwi2026: number;
  totalHectaresDeveloped: number;
  cropCategory?: 'OLIVE_GROVES' | 'DESERT_PIVOT_WHEAT' | 'STEPPE_FOREST_BELT' | 'OASIS_PALM_AGRONOMY';
  treesOrPivotsCount?: number;
  historicalMeanNdvi?: number;
  historicalStdDevNdvi?: number;
  historicalMeanNdwi?: number;
  historicalStdDevNdwi?: number;
  darkDroughtSubsurfaceThreshold?: number; // -2 sigma NDWI limit
  subBasins?: MilaSubBasinZone[];
}

export interface MilaSubBasinZone {
  id: string; // 'beni-haroun' | 'oued-endja' | 'rouached' | 'tessala' | 'bainan'
  nameAr: string;
  nameEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  coordinates: [number, number]; // [lat, lng]
  bbox: BoundingBox;
  areaHectares: number;
  treeCount: number;
  primaryCropAr: string;
  primaryCropEn: string;
  waterFeatureAr: string;
  waterFeatureEn: string;
  irrigationTypeAr: string;
  irrigationTypeEn: string;
  baselineNdwi1988: number;
  currentNdwi2026: number;
  baselineNdvi1988: number;
  currentNdvi2026: number;
  soilMoisturePercent: number;
  postGisCadastreRef: string;
  descriptionAr: string;
  descriptionEn: string;
}

