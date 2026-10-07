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
  OperationsKPIs
} from './types/ecosystem';
import { 
  INITIAL_PARCELS, 
  INITIAL_FLEET, 
  INITIAL_HERDS, 
  INITIAL_EVENTS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_PASSPORTS, 
  INITIAL_SOVEREIGN_STATUS,
  INITIAL_KPIS
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
import { 
  Satellite, 
  Radio, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Wheat, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'gis' | 'passports' | 'sovereign' | 'api'>('gis');

  // SOP Role state (Section 2 of SOP)
  const [currentRole, setCurrentRole] = useState<UserRole>('ALL');
  const [isSopManualOpen, setIsSopManualOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [activeWorkOrderForMobile, setActiveWorkOrderForMobile] = useState<WorkOrder | null>(null);

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

  // Handler: Dispatch Stress Work Order (SolVision -> AtlasCloud -> Kareema)
  const handleDispatchStressWorkOrder = (parcel: ParcelAsset) => {
    const result = eventBus.triggerCropStressWorkflow(parcel, 'HIGH');
    
    // Update parcel status
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
              completionNotes: notes
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

      // Publish completion event
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

    // Update MTTR and KPIs
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

  // Simulation: Trigger synthetic stress event on Pivot 02
  const handleSimulateStress = () => {
    const pivot = parcels.find((p) => p.code === 'PIVOT-02') || parcels[0];
    handleDispatchStressWorkOrder(pivot);
  };

  // Simulation: Trigger synthetic overgrazing on Herd 02
  const handleSimulateGrazing = () => {
    const herd = herds.find((h) => h.herd_id === 'HERD-SHP-02') || herds[0];
    handleDispatchGrazingWorkOrder(herd);
  };

  // Reset to initial baseline
  const handleResetSimulation = () => {
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

  // Active alerts count for badge
  const activeAlertCount = 
    (parcels.some(p => p.status === 'STRESSED') ? 1 : 0) +
    (herds.some(h => h.overgrazingAlert) ? 1 : 0) +
    (fleet.some(f => f.status === 'DEVIATION_ALERT') ? 1 : 0);

  const isAr = language === 'ar';

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
        activeAlertCount={activeAlertCount}
      />

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
                  <span className="font-mono text-[11px] text-slate-500">PostGIS Geometry Layer</span>
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
                  <span className="font-mono text-emerald-400 text-[11px]">Kareema Dispatch Bus</span>
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
                    {isAr ? '[3] حوض السحابة السيادية وتتبع Seed-to-Silo' : '[3] Seed-to-Silo & Sovereign Data Governance'}
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
                    {isAr ? 'محرك استعلامات PostGIS ←' : 'PostGIS Engine →'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'العقدة السحابية السيادية' : 'Sovereign Node'}</span>
                  <span className="font-bold text-white font-mono">KSA-Central-1 (Riyadh)</span>
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
                  <span className="font-bold text-cyan-400 font-mono">{cloudStatus.geoServerWmsLatencyMs} ms</span>
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

        {/* VIEW 3: Sovereign Cloud & PostGIS Panel Tab */}
        {activeTab === 'sovereign' && (
          <SovereignCloudPanel
            status={cloudStatus}
            language={language}
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
          <span className="text-emerald-400">PostGIS 3.4 / GeoServer 2.24</span>
          <span>·</span>
          <span>Kafka EventBus 3.6</span>
          <span>·</span>
          <span>Kingdom of Saudi Arabia</span>
        </div>
      </footer>

      {/* Interactive SOP Document Modal (SOP-SOL-OPS-2026-V1) */}
      <SopManualModal
        isOpen={isSopManualOpen}
        onClose={() => setIsSopManualOpen(false)}
        language={language}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
      />

      {/* Interactive Kareema Mobile Field App Simulator Modal */}
      <KareemaMobileSimulatorModal
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        workOrder={activeWorkOrderForMobile || workOrders[0]}
        language={language}
        onCompleteWorkOrder={handleCompleteWorkOrder}
      />
    </div>
  );
}
