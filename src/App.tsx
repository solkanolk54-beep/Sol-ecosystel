import React, { useState, useEffect } from 'react';
import { 
  Language, 
  ParcelAsset, 
  FleetUnit, 
  LivestockHerd, 
  SystemEvent, 
  WorkOrder, 
  DigitalQualityPassport, 
  SovereignCloudStatus, 
  UserRole, 
  OperationsKPIs, 
  StressTestStage 
} from './types/ecosystem';
import { 
  INITIAL_PARCELS, 
  INITIAL_FLEET, 
  INITIAL_HERDS, 
  INITIAL_EVENTS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_PASSPORTS, 
  INITIAL_SOVEREIGN_STATUS, 
  INITIAL_KPIS,
  STRESS_TEST_CRISIS_PIVOTS
} from './data/mockData';
import { eventBus } from './services/eventBus';
import { Header } from './components/common/Header';
import { GisMap } from './components/gis/GisMap';
import { OperationsCenter } from './components/operations/OperationsCenter';
import { QualityPassports } from './components/governance/QualityPassports';
import { SovereignCloudPanel } from './components/governance/SovereignCloudPanel';
import { OpenApiDocs } from './components/api/OpenApiDocs';
import { SopManualModal } from './components/sop/SopManualModal';
import { KareemaMobileSimulatorModal } from './components/sop/KareemaMobileSimulatorModal';
import { KpiDashboardBar } from './components/sop/KpiDashboardBar';
import { StressTestModal } from './components/stressTest/StressTestModal';
import { 
  Satellite, 
  Radio, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Wheat, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  WifiOff,
  Zap,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'gis' | 'passports' | 'sovereign' | 'api'>('gis');

  // SOP Role state (Section 2 of SOP)
  const [currentRole, setCurrentRole] = useState<UserRole>('ALL');
  const [isSopManualOpen, setIsSopManualOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [activeWorkOrderForMobile, setActiveWorkOrderForMobile] = useState<WorkOrder | null>(null);

  // Emergency Stress Test Protocol (EXERCISE-DARK-DROUGHT-2026)
  const [isStressTestModalOpen, setIsStressTestModalOpen] = useState(false);
  const [stressTestStage, setStressTestStage] = useState<StressTestStage>('IDLE');

  // Core Data State
  const [parcels, setParcels] = useState<ParcelAsset[]>(INITIAL_PARCELS);
  const [fleet, setFleet] = useState<FleetUnit[]>(INITIAL_FLEET);
  const [herds, setHerds] = useState<LivestockHerd[]>(INITIAL_HERDS);
  const [events, setEvents] = useState<SystemEvent[]>(INITIAL_EVENTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [passports, setPassports] = useState<DigitalQualityPassport[]>(INITIAL_PASSPORTS);
  const [cloudStatus, setCloudStatus] = useState<SovereignCloudStatus>(INITIAL_SOVEREIGN_STATUS);
  const [kpis, setKpis] = useState<OperationsKPIs>(INITIAL_KPIS);
  const [targetBatchForPassportModal, setTargetBatchForPassportModal] = useState<string | null>(null);

  // Subscribe to Event Bus for live state synchronization
  useEffect(() => {
    const unsubEvent = eventBus.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
    });

    const unsubWorkOrder = eventBus.onWorkOrderDispatched((newWorkOrder) => {
      setWorkOrders((prev) => [newWorkOrder, ...prev]);
    });

    return () => {
      unsubEvent();
      unsubWorkOrder();
    };
  }, []);

  // Generate 12 Crisis Work Orders for EXERCISE-DARK-DROUGHT-2026
  const generate12CrisisWorkOrders = (): WorkOrder[] => {
    const crisisPivots: { code: string; assetId: string; name: string; sector: string; coords: [number, number]; tech: string; fleet: string }[] = [
      { code: "PIVOT-01", assetId: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", name: "محور الخرج الشمالي 01", sector: "القطاع SW-1", coords: [24.152, 47.308], tech: "فهد العتيبي", fleet: "FLEET-GPS-TRK-01" },
      { code: "PIVOT-01", assetId: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", name: "محور الخرج الشمالي 01", sector: "القطاع SW-2", coords: [24.154, 47.307], tech: "فهد العتيبي", fleet: "FLEET-GPS-TRK-01" },
      { code: "PIVOT-01", assetId: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", name: "محور الخرج الشمالي 01", sector: "القطاع SE-3", coords: [24.156, 47.312], tech: "م. سالم الشمري", fleet: "FLEET-GPS-HRV-02" },
      { code: "PIVOT-01", assetId: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", name: "محور الخرج الشمالي 01", sector: "القطاع NW-4", coords: [24.157, 47.309], tech: "م. سالم الشمري", fleet: "FLEET-GPS-HRV-02" },
      { code: "PIVOT-02", assetId: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", name: "محور القصيم المروي 02", sector: "الربع NE-1", coords: [24.187, 47.339], tech: "سلطان القحطاني", fleet: "FLEET-GPS-TRC-04" },
      { code: "PIVOT-02", assetId: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", name: "محور القصيم المروي 02", sector: "الربع NE-2", coords: [24.188, 47.341], tech: "سلطان القحطاني", fleet: "FLEET-GPS-TRC-04" },
      { code: "PIVOT-02", assetId: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", name: "محور القصيم المروي 02", sector: "الربع NE-3", coords: [24.190, 47.343], tech: "فهد العتيبي", fleet: "FLEET-GPS-TRK-01" },
      { code: "PIVOT-02", assetId: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", name: "محور القصيم المروي 02", sector: "الربع NE-4", coords: [24.191, 47.345], tech: "فهد العتيبي", fleet: "FLEET-GPS-TRK-01" },
      { code: "PIVOT-04", assetId: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", name: "محور وادي الدواسر الجنوبي 04", sector: "الربع W-1", coords: [24.159, 47.378], tech: "طلال السبيعي", fleet: "FLEET-GPS-DRN-05" },
      { code: "PIVOT-04", assetId: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", name: "محور وادي الدواسر الجنوبي 04", sector: "الربع W-2", coords: [24.161, 47.379], tech: "طلال السبيعي", fleet: "FLEET-GPS-DRN-05" },
      { code: "PIVOT-04", assetId: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", name: "محور وادي الدواسر الجنوبي 04", sector: "الربع S-3", coords: [24.162, 47.382], tech: "سلطان القحطاني", fleet: "FLEET-GPS-TRC-04" },
      { code: "PIVOT-04", assetId: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", name: "محور وادي الدواسر الجنوبي 04", sector: "الربع S-4", coords: [24.163, 47.384], tech: "سلطان القحطاني", fleet: "FLEET-GPS-TRC-04" }
    ];

    return crisisPivots.map((item, idx) => ({
      order_id: `WO-CRISIS-2026-${String(idx + 1).padStart(2, '0')}`,
      trigger_event_id: `EVT-DARK-DROUGHT-${idx + 1}`,
      asset_id: item.assetId,
      assetName: `${item.name} (${item.sector})`,
      title: `طوارئ P1: هبوط مائي حاد في ${item.code} - ${item.sector}`,
      titleEn: `Emergency P1: Acute Drought on ${item.code} - ${item.sector}`,
      description: `تفشي طيفي مفاجئ (NDVI = 0.28). هبوط حاد في ضغط خط الرشاشات. مطلوب تدخل يدوي وفحص الصمامات فوراً.`,
      descriptionEn: `Sudden spectral drought detection (NDVI = 0.28). Hydraulic pressure dropped. Urgent valve inspection.`,
      severity: 'CRITICAL',
      status: 'DISPATCHED',
      assignedFleetId: item.fleet,
      assignedTechnician: item.tech,
      coordinates: item.coords,
      bbox: {
        minLat: item.coords[0] - 0.002,
        minLng: item.coords[1] - 0.002,
        maxLat: item.coords[0] + 0.002,
        maxLng: item.coords[1] + 0.002
      },
      createdAt: '2026-10-07 09:15:00 UTC',
      etaMinutes: 14,
      solutionType: 'IRRIGATION_BOOST',
      slaLevel: 'P1_CRITICAL',
      slaMaxMinutes: 15,
      slaRemainingMinutes: 8,
      photoEvidenceUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=400&q=80',
      technicianSignature: `${item.tech} - مصادقة معتمدة`,
      isOfflineSynced: false
    }));
  };

  // Handler: Apply Crisis Stage to Global Console
  const handleApplyCrisisToConsole = (stage: StressTestStage) => {
    setStressTestStage(stage);

    if (stage === 'STAGE_1_MULTI_DROUGHT' || stage === 'STAGE_2_BLACKOUT' || stage === 'STAGE_3_OFFLINE_EXECUTION') {
      // Mark Pivots 01, 02, 04 as stressed with NDVI = 0.28
      setParcels((prev) =>
        prev.map((p) =>
          p.code === 'PIVOT-01' || p.code === 'PIVOT-02' || p.code === 'PIVOT-04'
            ? {
                ...p,
                status: 'STRESSED',
                stressSeverity: 'CRITICAL',
                ndviAverage: 0.28,
                irrigationTelemetry: {
                  ...p.irrigationTelemetry,
                  pressureBar: 1.5,
                  flowRateLps: 45
                }
              }
            : p
        )
      );

      // Generate 12 crisis orders
      const crisisOrders = generate12CrisisWorkOrders();
      setWorkOrders((prev) => [...crisisOrders, ...prev.filter(wo => !wo.order_id.startsWith('WO-CRISIS'))]);

      // Emit high priority event
      eventBus.publish({
        topic: 'solvision.crop-stress.v1',
        eventType: 'EVENT_CROP_STRESS_DETECTED',
        sourceSystem: 'SolVision',
        payload: {
          exercise_code: 'EXERCISE-DARK-DROUGHT-2026',
          outbreak_type: 'MULTI_POINT_ACUTE_STRESS',
          pivots_affected: ['PIVOT-01', 'PIVOT-02', 'PIVOT-04'],
          total_hectares: 45.0,
          average_ndvi: 0.28,
          contingency_status: stage === 'STAGE_2_BLACKOUT' ? 'NETWORK_BLACKOUT_OFFLINE_CACHE_ACTIVE' : 'DISPATCHED'
        }
      });

      setKpis((prev) => ({
        ...prev,
        openP1Count: 12,
        offlineQueuePending: stage === 'STAGE_2_BLACKOUT' || stage === 'STAGE_3_OFFLINE_EXECUTION' ? 12 : 0
      }));

    } else if (stage === 'STAGE_4_RESTORATION' || stage === 'STAGE_5_SCORECARD') {
      // Resolve all crisis work orders
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.order_id.startsWith('WO-CRISIS')
            ? {
                ...wo,
                status: 'COMPLETED',
                completionNotes: 'تم فتح صمامات الضغط البديلة يدوياً واستعادة ضغط الري بنجاح إلى 3.9 بار دون فقدان أي بيانات.',
                isOfflineSynced: true
              }
            : wo
        )
      );

      // Restore pivots to healthy optimal state
      setParcels((prev) =>
        prev.map((p) =>
          p.code === 'PIVOT-01'
            ? { ...p, status: 'OPTIMAL', ndviAverage: 0.76, irrigationTelemetry: { ...p.irrigationTelemetry, pressureBar: 3.8 } }
            : p.code === 'PIVOT-02'
            ? { ...p, status: 'OPTIMAL', ndviAverage: 0.68, irrigationTelemetry: { ...p.irrigationTelemetry, pressureBar: 3.8 } }
            : p.code === 'PIVOT-04'
            ? { ...p, status: 'OPTIMAL', ndviAverage: 0.81, irrigationTelemetry: { ...p.irrigationTelemetry, pressureBar: 3.9 } }
            : p
        )
      );

      // Commit cryptographic hash
      eventBus.publish({
        topic: 'atlas.passport-sealed.v1',
        eventType: 'EVENT_SOVEREIGN_NODE_SYNC',
        sourceSystem: 'AtlasCloud',
        payload: {
          exercise_code: 'EXERCISE-DARK-DROUGHT-2026',
          reconciled_orders_count: 12,
          reconciliation_duration_seconds: 18.2,
          merkle_root_sealed: '0x992abfc01928471e9842a189fbc0028194',
          data_loss_percent: 0.0,
          status: 'FULL_SOVEREIGN_RECONCILIATION_SUCCESS'
        }
      });

      setKpis((prev) => ({
        ...prev,
        openP1Count: 0,
        offlineQueuePending: 0,
        mttrMinutes: 16.5,
        p1SlaCompliancePercent: 100.0
      }));

    } else if (stage === 'STAGE_0_BASELINE') {
      handleResetSimulation();
    }
  };

  // Handler: Dispatch Stress Work Order (SolVision -> AtlasCloud -> Kareema)
  const handleDispatchStressWorkOrder = (parcel: ParcelAsset) => {
    eventBus.triggerCropStressWorkflow(parcel, 'HIGH');
    
    setParcels((prev) =>
      prev.map((p) =>
        p.asset_id === parcel.asset_id
          ? {
              ...p,
              status: 'STRESSED',
              stressSeverity: 'HIGH'
            }
          : p
      )
    );
  };

  // Handler: Dispatch Grazing Warning Work Order (Kareema -> SolVision)
  const handleDispatchGrazingWorkOrder = (herd: LivestockHerd) => {
    eventBus.triggerGrazingWarningWorkflow(herd);

    setHerds((prev) =>
      prev.map((h) =>
        h.herd_id === herd.herd_id
          ? {
              ...h,
              overgrazingAlert: true,
              grazingPressure: 'OVERGRAZING_DANGER'
            }
          : h
      )
    );
  };

  // Handler: Complete a Field Work Order
  const handleCompleteWorkOrder = (orderId: string, notes: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.order_id === orderId
          ? {
              ...wo,
              status: 'COMPLETED',
              completionNotes: notes,
              isOfflineSynced: true
            }
          : wo
      )
    );

    // If this was for Pivot #2, simulate restoration of health and pressure
    const completedOrder = workOrders.find((w) => w.order_id === orderId);
    if (completedOrder && completedOrder.asset_id === '3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b') {
      setParcels((prev) =>
        prev.map((p) =>
          p.code === 'PIVOT-02'
            ? {
                ...p,
                status: 'OPTIMAL',
                ndviAverage: 0.68,
                irrigationTelemetry: {
                  ...p.irrigationTelemetry,
                  pressureBar: 3.8,
                  flowRateLps: 110
                }
              }
            : p
        )
      );

      eventBus.publish({
        topic: 'atlas.work-orders.v1',
        eventType: 'EVENT_WORK_ORDER_DISPATCHED',
        sourceSystem: 'Kareema',
        payload: {
          order_id: orderId,
          status: 'RESOLVED_AND_VERIFIED',
          technician_notes: notes,
          post_inspection_pressure: '3.8 bar'
        }
      });
    }

    setKpis((prev) => ({
      ...prev,
      openP1Count: Math.max(0, prev.openP1Count - 1),
      mttrMinutes: 13.8,
      p1SlaCompliancePercent: 99.1
    }));
  };

  // Handler: Recenter Drone corridor
  const handleRecenterFleetCorridor = (fleetId: string) => {
    setFleet((prev) =>
      prev.map((f) =>
        f.fleet_id === fleetId
          ? {
              ...f,
              status: 'ON_MISSION'
            }
          : f
      )
    );

    eventBus.publish({
      topic: 'kareema.fleet-gps.v1',
      eventType: 'EVENT_FLEET_ROUTE_DEVIATION',
      sourceSystem: 'Kareema',
      payload: {
        fleet_id: fleetId,
        action: 'CORRIDOR_REALIGNED_AUTONOMOUSLY'
      }
    });
  };

  // Open Kareema Mobile Simulator with a specific work order
  const handleOpenMobileSimulatorWithOrder = (order: WorkOrder) => {
    setActiveWorkOrderForMobile(order);
    setIsMobileSimulatorOpen(true);
  };

  // Simulation triggers
  const handleSimulateStress = () => {
    const pivot = parcels.find((p) => p.code === 'PIVOT-02') || parcels[0];
    handleDispatchStressWorkOrder(pivot);
  };

  const handleSimulateGrazing = () => {
    const herd = herds.find((h) => h.herd_id === 'HERD-SHP-02') || herds[0];
    handleDispatchGrazingWorkOrder(herd);
  };

  const handleResetSimulation = () => {
    setStressTestStage('IDLE');
    setParcels(INITIAL_PARCELS);
    setFleet(INITIAL_FLEET);
    setHerds(INITIAL_HERDS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setEvents(INITIAL_EVENTS);
    setKpis(INITIAL_KPIS);
  };

  const handleViewPassport = (cropBatchId: string) => {
    setActiveTab('passports');
    setTargetBatchForPassportModal(cropBatchId);
  };

  const isAr = language === 'ar';
  const isBlackoutActive = stressTestStage === 'STAGE_2_BLACKOUT' || stressTestStage === 'STAGE_3_OFFLINE_EXECUTION';

  const activeAlertCount = 
    (parcels.some(p => p.status === 'STRESSED') ? (stressTestStage !== 'IDLE' ? 12 : 1) : 0) +
    (herds.some(h => h.overgrazingAlert) ? 1 : 0) +
    (fleet.some(f => f.status === 'DEVIATION_ALERT') ? 1 : 0);

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Universal Top Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cloudStatus={cloudStatus}
        currentRole={currentRole}
        onSimulateStress={handleSimulateStress}
        onSimulateGrazing={handleSimulateGrazing}
        onResetSimulation={handleResetSimulation}
        onOpenSopManual={() => setIsSopManualOpen(true)}
        onOpenStressTestModal={() => setIsStressTestModalOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* Global Emergency Crisis Banner if Blackout is active */}
      {isBlackoutActive && (
        <div className="bg-rose-950 border-b border-rose-600 px-4 py-2.5 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in font-mono shadow-lg">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
            <span>
              <strong>[EXERCISE-DARK-DROUGHT-2026]</strong> {isAr ? 'وضع الطوارئ والصلابة السيادية نشط: انقطاع شامل لشبكة الاتصالات (Network Blackout) — تفعيل SQLite / PWA Offline Cache' : 'Sovereign Offline Contingency Active: Total Network Blackout — Encrypted SQLite Cache Engaged'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-rose-900/80 px-2 py-0.5 rounded text-[11px] font-bold text-white border border-rose-700">
              {isAr ? 'طابور الأوفلاين: 12/12 محفوظ' : 'Offline Queue: 12/12 Cached'}
            </span>
            <button
              onClick={() => setIsStressTestModalOpen(true)}
              className="px-2.5 py-0.5 rounded bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors"
            >
              {isAr ? 'إدارة الأزمة' : 'Manage Crisis'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 max-w-[1720px] mx-auto w-full">
        {/* SOP Role & KPI Dashboard Bar (Section 2 & 6 of SOP) */}
        <KpiDashboardBar
          kpis={kpis}
          language={language}
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          onOpenSopManual={() => setIsSopManualOpen(true)}
          onOpenMobileSimulator={() => {
            setActiveWorkOrderForMobile(workOrders[0] || null);
            setIsMobileSimulatorOpen(true);
          }}
          onOpenStressTest={() => setIsStressTestModalOpen(true)}
        />

        {/* VIEW 1: GIS Center Stage & Operations Center (The Main Console) */}
        {activeTab === 'gis' && (
          <div className="space-y-6">
            {/* Top Operational Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Component [1]: GIS Interactive Map (Takes 7 of 12 cols on desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Satellite className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? '[1] الخريطة الجغرافية التفاعلية (GIS Center Stage)' : '[1] GIS Interactive Map'}</span>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-cyan-400">Sentinel-2 MSI Orbit 44</span>
                  </div>
                  {isBlackoutActive ? (
                    <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>Pre-cached Vector Tiles (Offline)</span>
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-slate-500">PostGIS Geometry Layer</span>
                  )}
                </div>

                <GisMap
                  parcels={parcels}
                  fleet={fleet}
                  herds={herds}
                  language={language}
                  onDispatchStressWorkOrder={handleDispatchStressWorkOrder}
                  onDispatchGrazingWorkOrder={handleDispatchGrazingWorkOrder}
                  onViewPassport={handleViewPassport}
                />
              </div>

              {/* Component [2]: Real-time Alerts & Operations Center (Takes 5 of 12 cols on desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-2 h-[640px] lg:h-[730px]">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? '[2] مركز التنبيهات والأوامر اللحظية' : '[2] Real-time Alerts & Ops'}</span>
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {isBlackoutActive ? 'Offline Edge Buffer' : 'Kareema Dispatch Bus'}
                  </span>
                </div>

                <OperationsCenter
                  events={events}
                  workOrders={workOrders}
                  parcels={parcels}
                  herds={herds}
                  language={language}
                  currentRole={currentRole}
                  onDispatchStressWorkOrder={handleDispatchStressWorkOrder}
                  onDispatchGrazingWorkOrder={handleDispatchGrazingWorkOrder}
                  onCompleteWorkOrder={handleCompleteWorkOrder}
                  onRecenterFleetCorridor={handleRecenterFleetCorridor}
                  onOpenMobileSimulatorWithOrder={handleOpenMobileSimulatorWithOrder}
                />
              </div>
            </div>

            {/* Component [3]: Seed-to-Silo & Sovereign Data Governance (Compact Strip on GIS View) */}
            <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? '[3] الحوكمة السيادية وتتبع السلسلة (Sovereign Governance & Traceability)' : '[3] Sovereign Governance & Traceability (Merkle Trail)'}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <button
                    onClick={() => setActiveTab('passports')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs"
                  >
                    {isAr ? 'عرض بطاقات الجودة الرقمية ←' : 'View Quality Passports →'}
                  </button>
                  <button
                    onClick={() => setActiveTab('sovereign')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs"
                  >
                    {isAr ? 'شجرة ميركل والتدقيق السيادي ←' : 'Sovereign Governance & Merkle Logs →'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'العقدة السحابية السيادية' : 'Sovereign Node'}</span>
                  <span className="font-bold text-white font-mono">
                    {isBlackoutActive ? 'Local Edge Contingency Node' : 'KSA-Central-1 (Riyadh)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'دفعات الإنتاج الموثقة' : 'Traceable Batches'}</span>
                  <span className="font-bold text-emerald-400 font-mono">{passports.length} Certified Batches</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'معيار التشفير' : 'Sovereign Encryption'}</span>
                  <span className="font-bold text-teal-400 font-mono">AES-256-GCM / SHA-256</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'استجابة GeoServer WMS' : 'GeoServer Latency'}</span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {isBlackoutActive ? 'OFFLINE (Buffer)' : `${cloudStatus.geoServerWmsLatencyMs} ms`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Seed-to-Silo Digital Quality Passports Tab */}
        {activeTab === 'passports' && (
          <QualityPassports
            passports={passports}
            language={language}
          />
        )}

        {/* VIEW 3: Sovereign Governance & Traceability Panel Tab */}
        {activeTab === 'sovereign' && (
          <SovereignCloudPanel
            status={cloudStatus}
            language={language}
            currentRole={currentRole}
            onSelectRole={setCurrentRole}
            passports={passports}
            workOrders={workOrders}
            events={events}
            stressTestStage={stressTestStage}
          />
        )}

        {/* VIEW 4: OpenAPI & REST Architecture Explorer Tab */}
        {activeTab === 'api' && (
          <OpenApiDocs
            language={language}
          />
        )}
      </main>

      {/* Footer System Telemetry Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">SOL-Ecosystem Platform</span>
          <span>·</span>
          <span>SolVision (EO & Spectral)</span>
          <span>·</span>
          <span>Kareema (IoT & Field Ops)</span>
          <span>·</span>
          <span>AtlasCloud (Sovereign Geodatabase)</span>
          <span>·</span>
          <span className="text-emerald-400 font-mono">SOP-SOL-OPS-2026-V1</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-rose-400">EXERCISE-DARK-DROUGHT-2026</span>
          <span>·</span>
          <span className="text-emerald-400">PostGIS 3.4 / GeoServer 2.24</span>
          <span>·</span>
          <span>Kingdom of Saudi Arabia</span>
        </div>
      </footer>

      {/* Interactive SOP Document Modal (SOP-SOL-OPS-2026-V1) */}
      {isSopManualOpen && (
        <SopManualModal
          isOpen={isSopManualOpen}
          onClose={() => setIsSopManualOpen(false)}
          language={language}
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
        />
      )}

      {/* Interactive Kareema Mobile Field App Simulator Modal */}
      {isMobileSimulatorOpen && (
        <KareemaMobileSimulatorModal
          isOpen={isMobileSimulatorOpen}
          onClose={() => setIsMobileSimulatorOpen(false)}
          workOrder={activeWorkOrderForMobile || workOrders[0]}
          language={language}
          onCompleteWorkOrder={handleCompleteWorkOrder}
        />
      )}

      {/* Emergency Stress Test Modal (EXERCISE-DARK-DROUGHT-2026) */}
      {isStressTestModalOpen && (
        <StressTestModal
          isOpen={isStressTestModalOpen}
          onClose={() => setIsStressTestModalOpen(false)}
          language={language}
          onApplyCrisisToConsole={handleApplyCrisisToConsole}
          onResetCrisis={handleResetSimulation}
        />
      )}
    </div>
  );
}
