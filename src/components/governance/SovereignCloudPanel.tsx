import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Server, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Cpu, 
  Globe2, 
  Layers, 
  FileCode2,
  RefreshCw
} from 'lucide-react';
import { SovereignCloudStatus, Language } from '../../types/ecosystem';

interface SovereignCloudPanelProps {
  status: SovereignCloudStatus;
  language: Language;
}

const PRESET_QUERIES = [
  {
    name: "حساب مساحات المحاور بالهكتار (ST_Area & ST_Centroid)",
    nameEn: "Calculate Pivot Areas in Hectares (ST_Area & ST_Centroid)",
    sql: `SELECT asset_id, code, ST_Area(geom::geography)/10000 AS hectares, ST_AsText(ST_Centroid(geom)) AS center_point\nFROM spatial_parcels\nWHERE status IN ('OPTIMAL', 'STRESSED');`,
    result: [
      { asset_id: "8f7b3a1c-9e2d-4f1a-b6c8-0d1e2f3a4b5c", code: "PIVOT-01", hectares: 63.6, center_point: "POINT(47.310 24.155)" },
      { asset_id: "3e5a7b8c-1f4d-4a9e-8c3b-7a6f5e4d3c2b", code: "PIVOT-02", hectares: 55.4, center_point: "POINT(47.338 24.185)" },
      { asset_id: "9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f", code: "PIVOT-03", hectares: 50.2, center_point: "POINT(47.350 24.120)" },
      { asset_id: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e", code: "PIVOT-04", hectares: 66.4, center_point: "POINT(47.380 24.160)" }
    ]
  },
  {
    name: "استخراج Bounding Box للمناطق المجهدة (ST_Envelope)",
    nameEn: "Extract Stress Bounding Box (ST_Envelope & ST_Intersects)",
    sql: `SELECT code, ST_AsGeoJSON(ST_Envelope(geom)) AS bbox_geojson, ndvi_average\nFROM spatial_parcels\nWHERE ndvi_average < 0.40;`,
    result: [
      {
        code: "PIVOT-02",
        ndvi_average: 0.38,
        bbox_geojson: '{"type":"Polygon","coordinates":[[[47.339,24.187],[47.345,24.187],[47.345,24.192],[47.339,24.192],[47.339,24.187]]]}'
      }
    ]
  },
  {
    name: "مطابقة رعي الماشية مع نطاقات الحماية الزراعية (ST_DWithin)",
    nameEn: "Livestock Proximity to Crops (ST_DWithin Buffer)",
    sql: `SELECT h.herd_id, p.code, ROUND(ST_Distance(h.geom::geography, p.geom::geography)) AS distance_meters\nFROM livestock_telemetry h\nCROSS JOIN spatial_parcels p\nWHERE ST_DWithin(h.geom::geography, p.geom::geography, 2500);`,
    result: [
      { herd_id: "HERD-SHP-02", code: "PIVOT-02", distance_meters: 1420 },
      { herd_id: "HERD-CAM-01", code: "PIVOT-01", distance_meters: 2180 }
    ]
  }
];

export const SovereignCloudPanel: React.FC<SovereignCloudPanelProps> = ({
  status,
  language
}) => {
  const isAr = language === 'ar';
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [activeQuerySql, setActiveQuerySql] = useState(PRESET_QUERIES[0].sql);
  const [queryResults, setQueryResults] = useState<any[]>(PRESET_QUERIES[0].result);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState(12);

  const handleSelectPreset = (index: number) => {
    setSelectedQueryIndex(index);
    setActiveQuerySql(PRESET_QUERIES[index].sql);
    setQueryResults(PRESET_QUERIES[index].result);
  };

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionTimeMs(Math.floor(8 + Math.random() * 12));
      setQueryResults(PRESET_QUERIES[selectedQueryIndex].result);
    }, 400);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col space-y-5 p-4 lg:p-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>{isAr ? 'البنية التحتية لسحابة AtlasCloud وقواعد بيانات PostGIS' : 'AtlasCloud Sovereign PostGIS & Infrastructure'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إدارة الحوض الجغرافي المكاني، خوادم GeoServer، ناقل الأحداث عالي الكفاءة، وبروتوكولات التشفير السيادية.'
              : 'Spatial geodatabase management, GeoServer layer engine, high-throughput Event Bus, and national sovereign encryption.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {isAr ? 'البيئة السيادية: نشطة ومطابقة 100%' : 'Sovereign Compliance: 100%'}
          </span>
        </div>
      </div>

      {/* Cluster Nodes & Sovereign Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'العقدة الأساسية' : 'Primary Node'}</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">KSA-Central-1 (Riyadh)</p>
          <p className="text-[11px] text-emerald-400 font-mono">Uptime: 99.998%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'سجلات PostGIS المكانية' : 'PostGIS Records'}</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">1,485,290 geometries</p>
          <p className="text-[11px] text-cyan-400 font-mono">WMS Latency: {status.geoServerWmsLatencyMs}ms</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'تدفق ناقل الأحداث' : 'Kafka Bus Throughput'}</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">{status.eventBusThroughputMsgSec} msg/sec</p>
          <p className="text-[11px] text-indigo-400 font-mono">Packet Loss: 0.00%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{isAr ? 'التخزين السيادي المشفر' : 'Encrypted Storage'}</span>
            <HardDrive className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">{status.storageUsageTb} / {status.storageTotalTb} TB</p>
          <p className="text-[11px] text-teal-400 font-mono">AES-256-GCM Enforced</p>
        </div>
      </div>

      {/* Interactive PostGIS Query Terminal */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'محرك الاستعلامات المكانية PostGIS (Spatial SQL Console)' : 'Interactive PostGIS Spatial SQL Console'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isAr ? 'نماذج جاهزة:' : 'Presets:'}</span>
            <select
              value={selectedQueryIndex}
              onChange={(e) => handleSelectPreset(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              {PRESET_QUERIES.map((q, idx) => (
                <option key={idx} value={idx}>
                  {isAr ? q.name : q.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="relative">
          <textarea
            value={activeQuerySql}
            onChange={(e) => setActiveQuerySql(e.target.value)}
            rows={4}
            className="w-full font-mono text-xs p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 focus:outline-none focus:border-emerald-500 font-semibold"
          />
          <button
            onClick={handleRunQuery}
            disabled={isExecuting}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAr ? 'تنفيذ الاستعلام المكاني' : 'Execute Spatial SQL'}</span>
          </button>
        </div>

        {/* Query Output Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{isAr ? 'مخرجات الاستعلام المكاني' : 'Query Results'} ({queryResults.length} records)</span>
            <span className="text-emerald-400 font-bold">{executionTimeMs}ms execution time</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  {Object.keys(queryResults[0] || {}).map((col) => (
                    <th key={col} className="px-3 py-2 font-bold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {queryResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 text-slate-300 truncate max-w-xs">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sovereign Cryptographic Audit Trail */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'سجلات التدقيق الأمني والتشفير السيادي (Sovereign Audit Log)' : 'Sovereign Audit & Encryption Trail'}</span>
        </h4>

        <div className="font-mono text-xs space-y-2 text-slate-300">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">ENCRYPTION-AT-REST:</span>
            <span>AES-256-GCM Hardware Security Module (HSM) Level 4</span>
            <span className="text-[10px] text-slate-500">VERIFIED</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">IN-TRANSIT SECURITY:</span>
            <span>mTLS v1.3 with Sovereign PKI Certificates</span>
            <span className="text-[10px] text-slate-500">ACTIVE</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-400">DATA RESIDENCY:</span>
            <span>Primary: Riyadh Data Sovereign Center | Secondary: Jeddah Vault</span>
            <span className="text-[10px] text-slate-500">COMPLIANT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
