import { HistoricalEpoch, ChronosRegionalCluster } from '../types/chronos';

export const HISTORICAL_EPOCHS: HistoricalEpoch[] = [
  {
    year: 1988,
    dateLabel: '1988-06-18',
    satelliteConstellation: 'Landsat 5',
    sensor: 'TM (Thematic Mapper)',
    spatialResolution: '30m Multi-spectral',
    descriptionAr: 'الصحراء البكر قبل الاستصلاح الزراعي: عروق رملية وكثبان خالية تماماً من الغطاء النباتي والمحاور.',
    descriptionEn: 'Virgin Pre-Development Sahara: Barren sand ergs and plateaus with zero agricultural pivots.',
    averageNdvi: 0.08,
    vegetationAreaHa: 0,
    activePivotsCount: 0,
    surfaceTempDeficitC: 0.0,
    waterWithdrawalM3PerYear: 0,
    carbonStockTonsCo2: 420,
    postGisQuerySnippet: 'SELECT ST_Area(ST_Union(geom)) AS veg_area FROM landsat5_1988 WHERE ndvi > 0.35; -- Result: 0.00 ha',
    satelliteBadgeColor: 'bg-amber-950 text-amber-300 border-amber-800'
  },
  {
    year: 1996,
    dateLabel: '1996-05-24',
    satelliteConstellation: 'Landsat 7',
    sensor: 'ETM+ (Enhanced Thematic Mapper Plus)',
    spatialResolution: '30m Multi / 15m Pan',
    descriptionAr: 'بدايات حفر آبار الطبقة المائية الألبية وبدايات تجارب المحاور التجريبية المحدودة.',
    descriptionEn: 'Early deep Albian aquifer exploration and pilot center-pivot trials initiated.',
    averageNdvi: 0.14,
    vegetationAreaHa: 140,
    activePivotsCount: 3,
    surfaceTempDeficitC: -1.2,
    waterWithdrawalM3PerYear: 1450000,
    carbonStockTonsCo2: 3200,
    postGisQuerySnippet: 'SELECT ST_AsGeoJSON(ST_Centroid(geom)) FROM odas_exploration_1996; -- Wells: 3 active bores',
    satelliteBadgeColor: 'bg-blue-950 text-blue-300 border-blue-800'
  },
  {
    year: 2004,
    dateLabel: '2004-04-12',
    satelliteConstellation: 'Landsat 7 & Terra',
    sensor: 'MODIS & ETM+',
    spatialResolution: '30m / 250m Surface Reflectance',
    descriptionAr: 'تثبيت المحاور المركزية الأولى بمساحة 50 هكتار لكل محور وتدشين مزارع القمح الصحراوي.',
    descriptionEn: 'Standardization of 50-hectare center-pivots and strategic desert wheat cultivation.',
    averageNdvi: 0.31,
    vegetationAreaHa: 720,
    activePivotsCount: 11,
    surfaceTempDeficitC: -2.8,
    waterWithdrawalM3PerYear: 5800000,
    carbonStockTonsCo2: 18400,
    postGisQuerySnippet: 'SELECT ST_Buffer(geom, 400) FROM pivot_centers_2004; -- Radius 400m (50ha circles)',
    satelliteBadgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800'
  },
  {
    year: 2012,
    dateLabel: '2012-04-03',
    satelliteConstellation: 'Alsat-1B & Landsat 8',
    sensor: 'Alsat Multispectral Imager & OLI',
    spatialResolution: '12m / 30m',
    descriptionAr: 'إطلاق القمر الصناعي الجزائري Alsat-1B وتوسيع الامتيازات الفلاحية الكبرى لديوان ODAS.',
    descriptionEn: 'Algerian Alsat-1B constellation mission launch; major expansion of national ODAS perimeters.',
    averageNdvi: 0.46,
    vegetationAreaHa: 1950,
    activePivotsCount: 22,
    surfaceTempDeficitC: -4.5,
    waterWithdrawalM3PerYear: 12400000,
    carbonStockTonsCo2: 48900,
    postGisQuerySnippet: 'SELECT COUNT(*) FROM odas_concessions_2012 WHERE status = \'ACTIVE_IRRIGATION\';',
    satelliteBadgeColor: 'bg-teal-950 text-teal-300 border-teal-800'
  },
  {
    year: 2019,
    dateLabel: '2019-03-29',
    satelliteConstellation: 'Alsat-2A & Sentinel-2A',
    sensor: 'NAOMI HR & MSI (13 Spectral Bands)',
    spatialResolution: '2.5m Panchromatic / 10m VNIR',
    descriptionAr: 'تحول المنطقة إلى قطب زراعي استراتيجي؛ كثافة عالية للدوائر الزراعية وتأثير تبريد مناخي ملموس.',
    descriptionEn: 'Transformation into mega agro-industrial oasis cluster; distinct microclimate cooling deficit.',
    averageNdvi: 0.63,
    vegetationAreaHa: 3620,
    activePivotsCount: 34,
    surfaceTempDeficitC: -6.8,
    waterWithdrawalM3PerYear: 19800000,
    carbonStockTonsCo2: 96500,
    postGisQuerySnippet: 'SELECT ST_Difference(geom_2019, geom_2012) FROM spatial_temporal_expansion;',
    satelliteBadgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
  },
  {
    year: 2026,
    dateLabel: '2026-10-12 (Today)',
    satelliteConstellation: 'Alsat-2B & Sentinel-2C',
    sensor: 'Alsat High-Res & Multi-Spectral VNIR/SWIR',
    spatialResolution: '2.5m Super-Resolution / PostGIS Live',
    descriptionAr: 'المنظومة الرقمية المتكاملة SOL V3.4: ري ذكي بنسبة توفير 40% من مياه السقي، 42 محوراً نشطاً وإنتاجية حبوب قياسية.',
    descriptionEn: 'SOL V3.4 Digital Twin: Smart VFD irrigation, 42 optimized pivots, 40% aquifer conservation.',
    averageNdvi: 0.74,
    vegetationAreaHa: 4850,
    activePivotsCount: 42,
    surfaceTempDeficitC: -8.6,
    waterWithdrawalM3PerYear: 23600000,
    carbonStockTonsCo2: 154200,
    postGisQuerySnippet: 'SELECT ST_Summary(geom_twin) FROM sol_ecosystem_live_2026; -- 42 Certified Pivots',
    satelliteBadgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700'
  }
];

export const CHRONOS_REGIONAL_CLUSTERS: ChronosRegionalCluster[] = [
  {
    id: 'el-menia',
    nameAr: 'حوض المنيعة الزراعي (ODAS المركز الاستراتيجي)',
    nameEn: 'El Menia Strategic Basin (ODAS Central)',
    centerCoords: [24.155, 47.340],
    bbox: {
      minLat: 24.100,
      minLng: 47.280,
      maxLat: 24.210,
      maxLng: 47.400
    },
    odasConcessionRef: 'ODAS-DZ-MN-2026-ALPHA',
    aquiferLayer: 'البساط المائي الألبي الكبير (Continental Intercalaire)',
    baselineNdvi1988: 0.08,
    currentNdvi2026: 0.76,
    totalHectaresDeveloped: 4850
  },
  {
    id: 'ouargla',
    nameAr: 'حوض ورقلة وحاسي بن عبد الله الزراعي',
    nameEn: 'Ouargla & Hassi Ben Abdallah Agricultural Hub',
    centerCoords: [31.952, 5.328],
    bbox: {
      minLat: 31.900,
      minLng: 5.250,
      maxLat: 32.020,
      maxLng: 5.420
    },
    odasConcessionRef: 'ODAS-DZ-WGL-2026-BETA',
    aquiferLayer: 'طبقة مركب النهاية (Complexe Terminal - CT)',
    baselineNdvi1988: 0.06,
    currentNdvi2026: 0.71,
    totalHectaresDeveloped: 3280
  },
  {
    id: 'ghardaia',
    nameAr: 'محيط وادي ميزاب والقرارة',
    nameEn: 'Oued M\'zab & Guerrara Agro-Corridor',
    centerCoords: [32.485, 3.674],
    bbox: {
      minLat: 32.400,
      minLng: 3.580,
      maxLat: 32.550,
      maxLng: 3.750
    },
    odasConcessionRef: 'ODAS-DZ-GHD-2026-GAMMA',
    aquiferLayer: 'مياه الحجر الرملي الألبي العميق',
    baselineNdvi1988: 0.09,
    currentNdvi2026: 0.69,
    totalHectaresDeveloped: 2940
  },
  {
    id: 'biskra',
    nameAr: 'سهوب بسكرة وسيدي عقبة للحبوب والبيوت المحمية',
    nameEn: 'Biskra & Sidi Okba Cereal & Greenhouse Basin',
    centerCoords: [34.851, 5.728],
    bbox: {
      minLat: 34.780,
      minLng: 5.650,
      maxLat: 34.920,
      maxLng: 5.820
    },
    odasConcessionRef: 'ODAS-DZ-BSK-2026-DELTA',
    aquiferLayer: 'طبقات وادي ريغ والفرشات السطحية المتجددة',
    baselineNdvi1988: 0.12,
    currentNdvi2026: 0.78,
    totalHectaresDeveloped: 5600
  }
];
