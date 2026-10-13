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
  vegetationAreaHa: number;
  activePivotsCount: number;
  surfaceTempDeficitC: number; // Cooling relative to surrounding desert
  waterWithdrawalM3PerYear: number;
  carbonStockTonsCo2: number;
  postGisQuerySnippet: string;
  satelliteBadgeColor: string;
}

export interface ChronosComparisonState {
  baselineYear: number; // e.g. 1988
  contemporaryYear: number; // e.g. 2026
  splitPositionPercent: number; // 0 - 100 for draggable split-swipe
  spectralMode: ChronosSpectralMode;
  selectedRegionId: string;
  isAutoplayActive: boolean;
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
  totalHectaresDeveloped: number;
}
