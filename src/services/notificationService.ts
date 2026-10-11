import { 
  WorkOrder, 
  AutomatedEmailAlert, 
  TechnicianContact 
} from '../types/ecosystem';
import { eventBus, generateSha256, generateUUID } from './eventBus';

export const FIELD_TECHNICIANS: TechnicianContact[] = [
  {
    id: 'TECH-01',
    nameAr: 'م. فهد العتيبي',
    nameEn: 'Eng. Fahad Al-Otaibi',
    email: 'fahad.otaibi@kareema.fieldops.sovereign.dz',
    phone: '+213 (0) 550 12 34 56',
    assignedFleetId: 'FLEET-GPS-TRK-01',
    sectorAr: 'محور 01 (القطاع الجنوبي الغربي SW)',
    sectorEn: 'Pivot 01 (Southwest Sector SW)',
    status: 'DISPATCHED',
    alertMethods: ['EMAIL', 'SMS', 'RADIO']
  },
  {
    id: 'TECH-02',
    nameAr: 'م. سالم الشمري',
    nameEn: 'Eng. Salem Al-Shammari',
    email: 'salem.shammari@kareema.fieldops.sovereign.dz',
    phone: '+213 (0) 551 98 76 54',
    assignedFleetId: 'FLEET-GPS-HRV-02',
    sectorAr: 'محور 01 (القطاع الشمالي والغربي NW/SE)',
    sectorEn: 'Pivot 01 (North & East Sector NW/SE)',
    status: 'DISPATCHED',
    alertMethods: ['EMAIL', 'SMS', 'RADIO']
  },
  {
    id: 'TECH-03',
    nameAr: 'سلطان القحطاني',
    nameEn: 'Sultan Al-Qahtani',
    email: 'sultan.qahtani@kareema.fieldops.sovereign.dz',
    phone: '+213 (0) 552 45 67 89',
    assignedFleetId: 'FLEET-GPS-TRC-04',
    sectorAr: 'محور 02 (الربع الشمالي الشرقي NE)',
    sectorEn: 'Pivot 02 (Northeast Quadrant NE)',
    status: 'DISPATCHED',
    alertMethods: ['EMAIL', 'SMS', 'RADIO']
  },
  {
    id: 'TECH-04',
    nameAr: 'طلال السبيعي',
    nameEn: 'Talal Al-Subaie',
    email: 'talal.subaie@kareema.fieldops.sovereign.dz',
    phone: '+213 (0) 553 78 90 12',
    assignedFleetId: 'FLEET-GPS-DRN-05',
    sectorAr: 'محور 04 (الربع الغربي والجنوبي W/S)',
    sectorEn: 'Pivot 04 (West & South Quadrant W/S)',
    status: 'DISPATCHED',
    alertMethods: ['EMAIL', 'SMS', 'RADIO']
  },
  {
    id: 'TECH-05',
    nameAr: 'أحمد بن بلقاسم',
    nameEn: 'Ahmed Belkacem',
    email: 'ahmed.belkacem@kareema.fieldops.sovereign.dz',
    phone: '+213 (0) 554 11 22 33',
    assignedFleetId: 'FLEET-DZ-ALGIERS-01',
    sectorAr: 'منطقة الجزائر الزراعية ومركز الدعم السريع',
    sectorEn: 'Algiers Agricultural Hub & Quick Response Center',
    status: 'ON_DUTY',
    alertMethods: ['EMAIL', 'SMS', 'RADIO']
  }
];

type EmailAlertListener = (alert: AutomatedEmailAlert) => void;

class RealtimeNotificationService {
  private alerts: AutomatedEmailAlert[] = [];
  private listeners: EmailAlertListener[] = [];
  private supervisorEmail: string = 'solkanolk54@gmail.com';
  private autoAlertEnabled: boolean = true;

  constructor() {
    // Subscribe to EventBus work orders to automatically fire emails for P1 drought crises
    eventBus.onWorkOrderDispatched((workOrder: WorkOrder) => {
      if (!this.autoAlertEnabled) return;

      const isDroughtCrisis = 
        workOrder.trigger_event_id.toLowerCase().includes('drought') ||
        workOrder.title.toLowerCase().includes('drought') ||
        workOrder.title.includes('هبوط مائي') ||
        workOrder.description.includes('مائي') ||
        workOrder.order_id.includes('CRISIS');

      const isP1Critical = 
        workOrder.severity === 'CRITICAL' || 
        workOrder.slaLevel === 'P1_CRITICAL';

      if (isP1Critical && isDroughtCrisis) {
        this.dispatchDroughtEmailAlert(workOrder);
      }
    });
  }

  public subscribe(listener: EmailAlertListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getAlerts(): AutomatedEmailAlert[] {
    return [...this.alerts];
  }

  public getSupervisorEmail(): string {
    return this.supervisorEmail;
  }

  public setSupervisorEmail(email: string): void {
    this.supervisorEmail = email;
  }

  public isAutoAlertEnabled(): boolean {
    return this.autoAlertEnabled;
  }

  public setAutoAlertEnabled(enabled: boolean): void {
    this.autoAlertEnabled = enabled;
  }

  public getTechnicians(): TechnicianContact[] {
    return FIELD_TECHNICIANS;
  }

  public findTechnician(nameOrFleet: string): TechnicianContact {
    const found = FIELD_TECHNICIANS.find(
      t => 
        nameOrFleet.toLowerCase().includes(t.nameEn.toLowerCase()) ||
        nameOrFleet.includes(t.nameAr) ||
        (t.assignedFleetId && nameOrFleet.includes(t.assignedFleetId))
    );
    return found || FIELD_TECHNICIANS[0];
  }

  /**
   * Generates and transmits an automated email alert for a P1 Drought Work Order
   */
  public dispatchDroughtEmailAlert(
    workOrder: WorkOrder, 
    customTechnicianEmail?: string
  ): AutomatedEmailAlert {
    const tech = this.findTechnician(workOrder.assignedTechnician || workOrder.assignedFleetId || '');
    const recipientEmail = customTechnicianEmail || tech.email;
    const now = new Date();
    const sentAt = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const alertId = `EML-DROUGHT-${workOrder.order_id}`;

    // Extract asset/sector details
    const assetCode = workOrder.assetName.split(' ')[0] || 'PIVOT-01';
    const sector = workOrder.assetName.includes('(') 
      ? workOrder.assetName.split('(')[1].replace(')', '') 
      : 'Sector SW-1';

    const subjectEn = `[URGENT P1 DROUGHT ALERT] Dispatched: ${workOrder.order_id} - ${workOrder.titleEn}`;
    const subjectAr = `[تنبيه طارئ P1 - جفاف] أمر عمل فوري: ${workOrder.order_id} - ${workOrder.title}`;

    const messageId = `<p1-drought-${workOrder.order_id.toLowerCase()}@kareema.sovereign.dz>`;
    const securitySeal = generateSha256(`${alertId}:${recipientEmail}:${workOrder.order_id}:${sentAt}`);

    const emailBodyText = `
================================================================================
KAREEMA AUTONOMOUS DISPATCH SYSTEM • ATLASCLOUD SOVEREIGN ENCLAVE
AUTOMATED P1 CRITICAL EMERGENCY DISPATCH ALERT (DROUGHT OUTBREAK)
================================================================================

ATTENTION: ${tech.nameEn} (${tech.nameAr})
ASSIGNED FLEET UNIT: ${workOrder.assignedFleetId || tech.assignedFleetId}
EMERGENCY SLA DEADLINE: 15 MINUTES (RESPONSE TIME CRITICAL)

WORK ORDER DETAILS:
-------------------
Order ID:        ${workOrder.order_id}
Trigger Event:   ${workOrder.trigger_event_id}
Target Asset:    ${workOrder.assetName}
Coordinates:     Lat: ${workOrder.coordinates[0].toFixed(5)}, Lng: ${workOrder.coordinates[1].toFixed(5)}
Solution Type:   ${workOrder.solutionType}
Timestamp (UTC): ${sentAt}

SPECTRAL & HYDRAULIC DROUGHT TELEMETRY:
---------------------------------------
Spectral Outbreak: SolVision detected sudden drop in NDVI to 0.28 (< threshold 0.65).
Hydraulic Impact:  Pressure collapsed to 1.5 bar on line (nominal: 3.8 bar).
Urgent Action:     Immediate manual bypass of pressure valves and nozzle inspection required.

DISPATCH ACTION REQUIRED:
1. Open Kareema Mobile Field App on rugged tablet or smartphone.
2. Confirm dispatch acceptance within 3 minutes.
3. Proceed to GPS coordinates: [${workOrder.coordinates.join(', ')}].
4. Upload photographic evidence upon valve restoration.

--------------------------------------------------------------------------------
Security & Compliance:
MTA Relay:      Sovereign MTA Mail-Relay (TLS 1.3 / DZ-North-1 Sovereign Cluster)
Security Seal:  ${securitySeal}
Supervisor CC:  ${this.supervisorEmail}
Message ID:     ${messageId}
================================================================================
    `.trim();

    const emailBodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; max-width: 680px; margin: 0 auto;">
  <!-- Header -->
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #10b981; text-transform: uppercase;">
        ⚡ KAREEMA AUTONOMOUS DISPATCH • ATLASCLOUD SOVEREIGN
      </span>
      <span style="background-color: #7f1d1d; color: #fca5a5; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #ef4444;">
        P1 CRITICAL EMERGENCY
      </span>
    </div>
    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">
      🚨 Immediate Drought Response Dispatched
    </h1>
    <p style="color: #94a3b8; font-size: 13px; margin: 0;">
      ${workOrder.titleEn}
    </p>
  </div>

  <!-- Technician Assignment Banner -->
  <div style="background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
    <div style="color: #c7d2fe; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
      Assigned Field Responder:
    </div>
    <div style="font-size: 16px; font-weight: 800; color: #ffffff;">
      ${tech.nameEn} (${tech.nameAr})
    </div>
    <div style="font-size: 12px; color: #a5b4fc; margin-top: 4px;">
      Fleet Unit: <strong style="color: #ffffff;">${workOrder.assignedFleetId || tech.assignedFleetId}</strong> • Mobile: <strong style="color: #ffffff;">${tech.phone}</strong>
    </div>
  </div>

  <!-- Telemetry Grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
    <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 12px;">
      <div style="color: #9ca3af; font-size: 11px; text-transform: uppercase;">Target Asset & Sector</div>
      <div style="color: #38bdf8; font-size: 14px; font-weight: 700; margin-top: 4px;">${workOrder.assetName}</div>
      <div style="color: #6b7280; font-size: 11px; margin-top: 2px;">GPS: ${workOrder.coordinates[0].toFixed(4)}, ${workOrder.coordinates[1].toFixed(4)}</div>
    </div>
    <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 12px;">
      <div style="color: #9ca3af; font-size: 11px; text-transform: uppercase;">SLA Response Deadline</div>
      <div style="color: #ef4444; font-size: 14px; font-weight: 800; margin-top: 4px;">⏱ &lt; 15 Minutes Target</div>
      <div style="color: #6b7280; font-size: 11px; margin-top: 2px;">Remaining: 8 mins estimated</div>
    </div>
  </div>

  <!-- Anomaly Alert Card -->
  <div style="background-color: #18181b; border-left: 4px solid #ef4444; border-radius: 4px 8px 8px 4px; padding: 14px; margin-bottom: 20px;">
    <div style="color: #f87171; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
      ⚡ Drought Anomaly Breakdown:
    </div>
    <p style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin: 0;">
      Sentinel-2 spectral scan detected rapid collapse in vegetation vigor (<strong>NDVI = 0.28</strong>). Hydraulic telemetry registered acute drop to <strong>1.5 bar</strong>. High probability of clogged intake or pump pressure trip.
    </p>
  </div>

  <!-- Recommended Action Checklist -->
  <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
    <div style="color: #10b981; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">
      Required Immediate Actions:
    </div>
    <ol style="color: #94a3b8; font-size: 12px; margin: 0; padding-left: 20px; line-height: 1.6;">
      <li>Navigate to sector center point via Kareema Field Corridor.</li>
      <li>Perform manual override on hydraulic bypass valve #04.</li>
      <li>Verify flow restoration &gt; 42 L/s on telemetry gauges.</li>
      <li>Sign cryptographic work-order ticket on device (SOP-SOL-OPS-2026-V1 Section 4).</li>
    </ol>
  </div>

  <!-- Security Footer -->
  <div style="border-top: 1px solid #1e293b; padding-top: 14px; font-size: 11px; color: #64748b; line-height: 1.5;">
    <div><strong>MTA Relay:</strong> Sovereign MTA Mail-Relay (TLS 1.3 / DZ-North-1 Sovereign Cluster)</div>
    <div><strong>Security Hash:</strong> ${securitySeal}</div>
    <div><strong>Supervisor CC:</strong> ${this.supervisorEmail}</div>
    <div><strong>Message ID:</strong> ${messageId}</div>
  </div>
</div>
    `.trim();

    const newAlert: AutomatedEmailAlert = {
      id: alertId,
      workOrderId: workOrder.order_id,
      recipientEmail,
      recipientName: tech.nameEn,
      supervisorCc: this.supervisorEmail,
      subject: subjectEn,
      subjectAr,
      sentAt,
      status: 'DELIVERED',
      priority: 'P1_CRITICAL',
      assetCode,
      assetName: workOrder.assetName,
      sector,
      assignedFleet: workOrder.assignedFleetId || tech.assignedFleetId,
      droughtTrigger: {
        eventName: 'EXERCISE-DARK-DROUGHT-2026',
        spectralNdvi: 0.28,
        hydraulicPressureBar: 1.5,
        coordinates: workOrder.coordinates,
        slaDeadlineMinutes: 15,
        emergencyCode: 'DROUGHT-ACUTE-P1'
      },
      emailBodyHtml,
      emailBodyText,
      deliveryMta: 'Sovereign MTA Mail-Relay (TLS 1.3 / DZ-North-1 Cluster)',
      securitySeal,
      messageId
    };

    // Store in alerts list (avoid duplicate IDs, update if already exists)
    const existingIndex = this.alerts.findIndex(a => a.id === newAlert.id);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = newAlert;
    } else {
      this.alerts.unshift(newAlert);
    }

    // Notify listeners
    this.listeners.forEach(fn => fn(newAlert));

    return newAlert;
  }

  /**
   * Mark technician response / acknowledgement
   */
  public acknowledgeAlert(alertId: string, action: 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SITE' = 'ACKNOWLEDGED'): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      alert.technicianActionTaken = action;
      alert.acknowledgedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      this.listeners.forEach(fn => fn(alert));
    }
  }

  /**
   * Batch dispatch email alerts for all active crisis orders
   */
  public batchDispatchCrisisOrders(orders: WorkOrder[]): AutomatedEmailAlert[] {
    const dispatched: AutomatedEmailAlert[] = [];
    orders.forEach(wo => {
      const isDrought = 
        wo.order_id.includes('CRISIS') || 
        wo.trigger_event_id.toLowerCase().includes('drought') ||
        wo.description.includes('مائي');

      if (isDrought && (wo.severity === 'CRITICAL' || wo.slaLevel === 'P1_CRITICAL')) {
        const alert = this.dispatchDroughtEmailAlert(wo);
        dispatched.push(alert);
      }
    });
    return dispatched;
  }
}

export const notificationService = new RealtimeNotificationService();
