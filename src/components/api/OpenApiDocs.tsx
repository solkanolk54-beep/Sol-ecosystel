import React, { useState } from 'react';
import { 
  Code2, 
  Send, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  ExternalLink, 
  Play, 
  Layers, 
  FileJson,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Language } from '../../types/ecosystem';

interface OpenApiDocsProps {
  language: Language;
}

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  service: 'SolVision' | 'Kareema' | 'AtlasCloud';
  summary: string;
  summaryEn: string;
  description: string;
  requestBody?: any;
  responseBody: any;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/solvision/events/stress-detected',
    service: 'SolVision',
    summary: 'إطلاق حدث رصد إجهاد المحصول الطيفي',
    summaryEn: 'Emit Satellite NDVI Crop Stress Event',
    description: 'Triggers EVENT_CROP_STRESS_DETECTED when NDVI calculation drops below configured health threshold.',
    requestBody: {
      asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
      spectral_index: "NDVI",
      current_value: 0.38,
      baseline_threshold: 0.65,
      satellite_source: "Sentinel-2 MSI",
      bbox: [24.187, 47.339, 24.192, 47.345]
    },
    responseBody: {
      status: "PUBLISHED_TO_EVENT_BUS",
      event_id: "8c4e09f1-77d4-4a21-98a0-2f1d9c8e7b6a",
      topic: "solvision.crop-stress.v1",
      signature_hash: "sha256:d8b2e591a45903b12984fe72b0c399e28f1b6214f48419a408e0114a2bf1892d"
    }
  },
  {
    method: 'POST',
    path: '/api/v1/kareema/work-orders',
    service: 'Kareema',
    summary: 'توليد وتوجيه أمر عمل ميداني لأسطول Kareema',
    summaryEn: 'Generate and Dispatch Field Work Order',
    description: 'Consumes AtlasCloud stress event and dispatches autonomous instructions to mobile irrigation technician.',
    requestBody: {
      trigger_event_id: "8c4e09f1-77d4-4a21-98a0-2f1d9c8e7b6a",
      asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b",
      severity: "HIGH",
      assigned_unit: "FLEET-GPS-TRK-01",
      solution_type: "NOZZLE_REPLACEMENT",
      bbox: { minLat: 24.187, minLng: 47.339, maxLat: 24.192, maxLng: 47.345 }
    },
    responseBody: {
      order_id: "WO-2026-1002",
      status: "DISPATCHED",
      assigned_technician: "م. فهد العتيبي",
      eta_minutes: 18,
      push_notification_sent: true
    }
  },
  {
    method: 'GET',
    path: '/api/v1/kareema/livestock/grazing-biomass',
    service: 'Kareema',
    summary: 'فحص كثافة الرعي والتحقق من مخاطر الرعي الجائر',
    summaryEn: 'Query Livestock Density & Overgrazing Risk',
    description: 'Correlates RFID ear-tag locations with SolVision spectral vegetation index for rotational grazing guidance.',
    responseBody: {
      herd_id: "HERD-SHP-02",
      animal_count: 380,
      current_zone: "Zone B (Eastern Hills)",
      biomass_density_index: 0.28,
      grazing_pressure: "OVERGRAZING_DANGER",
      recommended_rotation_corridor: "Zone D (Northern Seasonal)"
    }
  },
  {
    method: 'GET',
    path: '/api/v1/atlas/passports/{crop_batch_id}',
    service: 'AtlasCloud',
    summary: 'استرجاع وثيقة الجودة الرقمية المشفرة (Seed-to-Silo)',
    summaryEn: 'Retrieve Encrypted Digital Quality Passport',
    description: 'Fetches immutable sovereign batch record including SHA-256 seal, soil purity score, and full supply-chain history.',
    responseBody: {
      crop_batch_id: "BATCH-WHT-2026-Q3-089",
      asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c",
      organic_certified: true,
      soil_purity_index: 98.4,
      water_stress_free_index: 96.2,
      cryptographic_seal: {
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        merkle_root: "0x89fbc0214a51e6d98c21a4f02891bbec3820914a",
        verified_on_chain: true
      }
    }
  }
];

export const OpenApiDocs: React.FC<OpenApiDocsProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEndpoint = () => {
    setIsLoading(true);
    setTestResult(null);
    setTimeout(() => {
      setIsLoading(false);
      setTestResult(selectedEndpoint.responseBody);
    }, 450);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'توثيق معمارية واجهات البرمجة (OpenAPI & Swagger)' : 'OpenAPI / Swagger Microservices Specifications'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'مواصفات واجهات RESTful ونماذج الأحداث المعتمدة بين SolVision و Kareema و AtlasCloud.'
              : 'RESTful API specifications and event data contracts connecting SolVision, Kareema, and AtlasCloud.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">OpenAPI 3.1.0</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">ISO-22005 Compliant</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'مسارات التكامل البرمجي' : 'Integration Endpoints'}
          </span>

          <div className="space-y-2">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/80 shadow-md'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'POST' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200 truncate">{ep.path}</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isAr ? ep.summary : ep.summaryEn}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Service: <strong className="text-cyan-400">{ep.service}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Endpoint Playground */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                selectedEndpoint.method === 'POST' ? 'bg-indigo-900 text-indigo-300' : 'bg-emerald-900 text-emerald-300'
              }`}>
                {selectedEndpoint.method}
              </span>
              <span className="text-white font-bold text-xs">{selectedEndpoint.path}</span>
            </div>

            <button
              onClick={handleTestEndpoint}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAr ? 'تجربة الـ API (Try it out)' : 'Send Request'}</span>
            </button>
          </div>

          <p className="text-slate-400 text-xs font-sans">
            {selectedEndpoint.description}
          </p>

          {/* Request Payload */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Request Payload (application/json):
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto text-[11px]">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Response Output (200 OK):
              </span>
              {testResult && (
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>200 SUCCESS</span>
                </span>
              )}
            </div>

            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px]">
              {JSON.stringify(testResult || selectedEndpoint.responseBody, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
