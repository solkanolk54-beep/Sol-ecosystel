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
  StressTestStage,
  AutomatedEmailAlert,
  LivestockAlertDeepLink
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
import { notificationService } from './services/notificationService';
import { Header } from './components/common/Header';
import { GisMap } from './components/gis/GisMap';
import { OperationsCenter } from './components/operations/OperationsCenter';
import { EmailNotificationModal } from './components/operations/EmailNotificationModal';
import { LivestockTelemetryHudCard } from './components/operations/LivestockTelemetryHudCard';
import { QualityPassports } from './components/governance/QualityPassports';
import { SovereignCloudPanel } from './components/governance/SovereignCloudPanel';
import { OpenApiDocs } from './components/api/OpenApiDocs';
import { SopManualModal } from './components/sop/SopManualModal';
import { KareemaMobileSimulatorModal } from './components/sop/KareemaMobileSimulatorModal';
import { KpiDashboardBar } from './components/sop/KpiDashboardBar';
import { StressTestModal } from './components/stressTest/StressTestModal';
import { AgriGisAlgerieHub } from './components/agrigis/AgriGisAlgerieHub';
import { UsDzAirliftTraceHub } from './components/operations/UsDzAirliftTraceHub';
import { SolChronosHub } from './components/chronos/SolChronosHub';
import { SolChronosBaselineCard } from './components/chronos/SolChronosBaselineCard';
import { 
  Satellite, 
  Radio, 
  Database,
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Wheat, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  WifiOff,
  Zap,
  HardDrive,
  Plane,
  History as HistoryIcon
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'gis' | 'agrigis' | 'airlift' | 'chronos' | 'passports' | 'sovereign' | 'api'>('gis');

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

  // Automated Email Alerts Service State
  const [emailAlerts, setEmailAlerts] = useState<AutomatedEmailAlert[]>(() => notificationService.getAlerts());
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailAlertId, setSelectedEmailAlertId] = useState<string | undefined>(undefined);
  const [emailToastNotification, setEmailToastNotification] = useState<{
    title: string;
    subtitle: string;
    time: string;
    orderId: string;
  } | null>(null);

  // Targeted Livestock Deep Link State (for spatial radar ping and focus)
  const [focusedAnimalTarget, setFocusedAnimalTarget] = useState<LivestockAlertDeepLink | null>(null);

  // Subscribe to Event Bus and Notification Service for live state synchronization
  useEffect(() => {
    const unsubEvent = eventBus.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
    });

    const unsubWorkOrder = eventBus.onWorkOrderDispatched((newWorkOrder) => {
      setWorkOrders((prev) => [newWorkOrder, ...prev]);
    });

    const unsubEmail = notificationService.subscribe((newAlert) => {
      setEmailAlerts(notificationService.getAlerts());
      setEmailToastNotification({
        title: language === 'ar'
          ? `تم إرسال إشعار بريدي آلي [P1]: ${newAlert.workOrderId}`
          : `Automated [P1] Email Dispatched: ${newAlert.workOrderId}`,
        subtitle: language === 'ar'
          ? `الفني: ${newAlert.recipientName} (${newAlert.recipientEmail}) • القطاع: ${newAlert.sector}`
          : `Responder: ${newAlert.recipientName} (${newAlert.recipientEmail}) • Sector: ${newAlert.sector}`,
        time: newAlert.sentAt.slice(11, 19) + ' UTC',
        orderId: newAlert.workOrderId
      });
      setTimeout(() => {
        setEmailToastNotification(null);
      }, 7000);
    });

    return () => {
      unsubEvent();
      unsubWorkOrder();
      unsubEmail();
    };
  }, [language]);

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

      // Automatically dispatch real-time email alerts to field technicians for all 12 crisis work orders
      notificationService.batchDispatchCrisisOrders(crisisOrders);

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
    const { workOrder } = eventBus.triggerCropStressWorkflow(parcel, 'CRITICAL');
    
    // Automatically dispatch email alert for field technician
    notificationService.dispatchDroughtEmailAlert(workOrder);

    setParcels((prev) =>
      prev.map((p) =>
        p.asset_id === parcel.asset_id
          ? {
              ...p,
              status: 'STRESSED',
              stressSeverity: 'CRITICAL'
            }
          : p
      )
    );
  };

  // Automated Email Alerts Handlers
  const handleTriggerTestDroughtEmailAlert = () => {
    const crisisOrders = generate12CrisisWorkOrders();
    const targetOrder = crisisOrders[0];
    const alert = notificationService.dispatchDroughtEmailAlert(targetOrder);
    setSelectedEmailAlertId(alert.id);
    setIsEmailModalOpen(true);
  };

  const handleOpenEmailModalWithOrder = (orderId: string) => {
    const targetAlert = emailAlerts.find(a => a.workOrderId === orderId);
    if (targetAlert) {
      setSelectedEmailAlertId(targetAlert.id);
    } else {
      const targetOrder = workOrders.find(wo => wo.order_id === orderId);
      if (targetOrder) {
        const newAlert = notificationService.dispatchDroughtEmailAlert(targetOrder);
        setSelectedEmailAlertId(newAlert.id);
      }
    }
    setIsEmailModalOpen(true);
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

  // Handler: Archive a Completed Field Work Order
  const handleArchiveWorkOrder = (orderId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.order_id === orderId
          ? {
              ...wo,
              isArchived: true,
              archivedAt: new Date().toISOString()
            }
          : wo
      )
    );

    eventBus.publish({
      topic: 'atlas.work-orders.v1',
      eventType: 'EVENT_WORK_ORDER_DISPATCHED',
      sourceSystem: 'AtlasCloud',
      payload: {
        order_id: orderId,
        action: 'WORK_ORDER_ARCHIVED_TO_SIDE_VAULT',
        archived_at: new Date().toISOString()
      }
    });
  };

  // Handler: Restore/Unarchive an Archived Work Order
  const handleUnarchiveWorkOrder = (orderId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.order_id === orderId
          ? {
              ...wo,
              isArchived: false,
              archivedAt: undefined
            }
          : wo
      )
    );

    eventBus.publish({
      topic: 'atlas.work-orders.v1',
      eventType: 'EVENT_WORK_ORDER_DISPATCHED',
      sourceSystem: 'AtlasCloud',
      payload: {
        order_id: orderId,
        action: 'WORK_ORDER_RESTORED_FROM_ARCHIVE'
      }
    });
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

  // UI Deep Linking Handler: Focus spatial map on exact animal's coordinates with radar ping
  const handleFocusLivestockOnMap = (target: LivestockAlertDeepLink) => {
    setActiveTab('gis');
    setFocusedAnimalTarget(target);
  };

  const handleClearLivestockFocus = () => {
    setFocusedAnimalTarget(null);
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
        emailAlertCount={emailAlerts.length}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
      />

      {/* Real-time Automated Email Alert Toast Banner */}
      {emailToastNotification && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-b border-rose-500/60 px-4 py-2 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xl relative z-20 font-sans">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-full bg-rose-500/20 text-rose-400">
              <Mail className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <span className="font-bold text-white block">{emailToastNotification.title}</span>
              <span className="text-[11px] text-slate-300">{emailToastNotification.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">{emailToastNotification.time}</span>
            <button
              onClick={() => handleOpenEmailModalWithOrder(emailToastNotification.orderId)}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              {isAr ? 'عرض البريد الفوري' : 'Inspect Email'}
            </button>
            <button
              onClick={() => setEmailToastNotification(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
          <div className="space-y-4">
            {/* Live Sovereign HUD Extension: Livestock & Genetic Health Card */}
            <LivestockTelemetryHudCard
              language={language}
              onFocusAnimalOnMap={handleFocusLivestockOnMap}
            />

            {/* Dedicated Central Dashboard Control Card: Sol-Chronos Historical Baseline */}
            <SolChronosBaselineCard
              language={language}
              onLaunchChronos={() => setActiveTab('chronos')}
            />

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
                    <span className="font-mono text-cyan-400">Sentinel-2 & Alsat-2A</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('agrigis')}
                      className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-emerald-400"
                    >
                      <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'منظومة AgriGIS Algérie 🇩🇿' : 'AgriGIS Algérie 🇩🇿'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('airlift')}
                      className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-indigo-400"
                    >
                      <Plane className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isAr ? 'الجسر الجوي US-DZ ✈️' : 'US-DZ Airlift ✈️'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </button>

                    <button
                      onClick={() => setActiveTab('chronos')}
                      className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-amber-400"
                    >
                      <HistoryIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'منظومة Sol-Chronos ⏳' : 'Sol-Chronos ⏳'}</span>
                    </button>

                    {isBlackoutActive ? (
                      <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>Pre-cached Vector Tiles (Offline)</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">PostGIS Geometry Layer</span>
                    )}
                  </div>
                </div>

                <GisMap
                  parcels={parcels}
                  fleet={fleet}
                  herds={herds}
                  language={language}
                  onDispatchStressWorkOrder={handleDispatchStressWorkOrder}
                  onDispatchGrazingWorkOrder={handleDispatchGrazingWorkOrder}
                  onViewPassport={handleViewPassport}
                  focusedCoordinates={focusedAnimalTarget ? focusedAnimalTarget.coordinates : null}
                  focusedAnimalInfo={focusedAnimalTarget}
                  onClearFocus={handleClearLivestockFocus}
                  onOpenChronos={() => setActiveTab('chronos')}
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
                  onArchiveWorkOrder={handleArchiveWorkOrder}
                  onUnarchiveWorkOrder={handleUnarchiveWorkOrder}
                  onRecenterFleetCorridor={handleRecenterFleetCorridor}
                  onOpenMobileSimulatorWithOrder={handleOpenMobileSimulatorWithOrder}
                  emailAlerts={emailAlerts}
                  onOpenEmailModal={() => setIsEmailModalOpen(true)}
                  onOpenEmailModalWithOrder={handleOpenEmailModalWithOrder}
                  onFocusAnimalOnMap={handleFocusLivestockOnMap}
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
                    {isBlackoutActive 
                      ? (isAr ? 'عقدة الطوارئ المحلية (Edge)' : 'Local Edge Contingency Node') 
                      : (isAr ? 'DZ-North-1 (الجزائر - إفريقيا)' : 'DZ-North-1 (Algiers, Africa)')}
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

        {/* VIEW: AgriGIS Algérie National Spatial System Tab */}
        {activeTab === 'agrigis' && (
          <AgriGisAlgerieHub
            language={language}
            onDispatchWorkOrder={(orderTitle, parcelName, coords) => {
              const newOrder: WorkOrder = {
                order_id: `WO-DZ-${Date.now().toString().slice(-4)}`,
                trigger_event_id: `EVT-DZ-${Date.now().toString().slice(-4)}`,
                asset_id: `DZ-ASSET-${Date.now().toString().slice(-4)}`,
                assetName: parcelName,
                title: orderTitle,
                titleEn: orderTitle,
                description: `أمر صيانة وتدقيق ميداني لمحور ${parcelName} تحت إشراف ديوان ODAS والربط مع العقدة السيادية بالجزائر DZ-North-1`,
                descriptionEn: `Field maintenance & inspection order for ${parcelName} under ODAS & Algiers Sovereign Node DZ-North-1`,
                severity: 'HIGH',
                status: 'DISPATCHED',
                assignedTechnician: 'م. عبد القادر بلقاسم (مهندس العمليات الميدانية - ولاية المنيعة)',
                coordinates: coords,
                bbox: {
                  minLat: coords[0] - 0.005,
                  minLng: coords[1] - 0.005,
                  maxLat: coords[0] + 0.005,
                  maxLng: coords[1] + 0.005
                },
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                etaMinutes: 20,
                solutionType: 'IRRIGATION_BOOST',
                slaLevel: 'P1_CRITICAL',
                slaMaxMinutes: 30,
                slaRemainingMinutes: 25,
                isOfflineSynced: true
              };
              setWorkOrders(prev => [newOrder, ...prev]);
              setActiveTab('gis');
            }}
            onOpenQualityPassport={(batchId) => {
              setTargetBatchForPassportModal(batchId);
              setActiveTab('passports');
            }}
            onSwitchToGeneralGis={() => setActiveTab('gis')}
          />
        )}

        {/* VIEW: SOL GLOBAL • US-DZ AIRLIFT TRACE Tab */}
        {activeTab === 'airlift' && (
          <UsDzAirliftTraceHub
            language={language}
            onDispatchConvoyWorkOrder={(orderTitle, airportHub, coords) => {
              const newOrder: WorkOrder = {
                order_id: `WO-AIRLIFT-${Date.now().toString().slice(-4)}`,
                trigger_event_id: `EVT-AIR-${Date.now().toString().slice(-4)}`,
                asset_id: `AIRLIFT-DZ-${airportHub.slice(0, 3)}`,
                assetName: airportHub,
                title: orderTitle,
                titleEn: orderTitle,
                description: `استقبال وتأمين حجر بيطري صحراوي وقافلة شاحنات مبردة لنقل قطيع أبقار عشار مستوردة بموجب شهادة USDA ومصادقة MADR`,
                descriptionEn: `Airport quarantine reception & climate-controlled convoy deployment for imported US pregnant heifers under USDA/MADR clearance`,
                severity: 'HIGH',
                status: 'DISPATCHED',
                assignedTechnician: 'د. كريم بن زاهي (كبير الأطباء البيطريين - مديرية المصالح البيطرية)',
                coordinates: coords,
                bbox: {
                  minLat: coords[0] - 0.005,
                  minLng: coords[1] - 0.005,
                  maxLat: coords[0] + 0.005,
                  maxLng: coords[1] + 0.005
                },
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                etaMinutes: 15,
                solutionType: 'HERD_REDIVERSION',
                slaLevel: 'P1_CRITICAL',
                slaMaxMinutes: 30,
                slaRemainingMinutes: 28,
                isOfflineSynced: true
              };
              setWorkOrders(prev => [newOrder, ...prev]);
              setActiveTab('gis');
            }}
            onOpenQualityPassport={(tagId) => {
              setTargetBatchForPassportModal(tagId);
              setActiveTab('passports');
            }}
          />
        )}

        {/* VIEW: Sol-Chronos Historical Spatial Analytics & Time-Series Tab (1988-2026) */}
        {activeTab === 'chronos' && (
          <SolChronosHub
            language={language}
            parcels={parcels}
            onSwitchToGeneralGis={() => setActiveTab('gis')}
          />
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
          <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
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

      {/* Automated Email Notifications Modal */}
      {isEmailModalOpen && (
        <EmailNotificationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          language={language}
          alerts={emailAlerts}
          onTriggerTestAlert={handleTriggerTestDroughtEmailAlert}
          selectedAlertId={selectedEmailAlertId}
          onOpenMobileSimulatorWithOrder={handleOpenMobileSimulatorWithOrder}
          workOrders={workOrders}
        />
      )}
    </div>
  );
}
