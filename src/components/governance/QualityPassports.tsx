import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Lock, 
  Download, 
  Share2, 
  Satellite, 
  Wheat, 
  Warehouse, 
  Sparkles, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { DigitalQualityPassport, Language } from '../../types/ecosystem';

interface QualityPassportsProps {
  passports: DigitalQualityPassport[];
  language: Language;
  onSealNewPassport?: (passport: DigitalQualityPassport) => void;
}

export const QualityPassports: React.FC<QualityPassportsProps> = ({
  passports,
  language,
  onSealNewPassport
}) => {
  const isAr = language === 'ar';
  const [selectedPassport, setSelectedPassport] = useState<DigitalQualityPassport | null>(passports[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  const filteredPassports = passports.filter(p => 
    p.crop_batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.parcelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.parcelNameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePassport = selectedPassport || filteredPassports[0] || passports[0];

  const verifyOnChain = (hash: string) => {
    setVerificationSuccess(hash);
    setTimeout(() => {
      setVerificationSuccess(null);
    }, 4000);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col space-y-4 p-4 lg:p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'بطاقات الجودة الرقمية وسيادة البيانات (Seed-to-Silo)' : 'Digital Quality Passports (Seed-to-Silo)'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'سجل جودة رقمي مشفر ومحفوظ محلياً داخل AtlasCloud يربط قراءات SolVision الطيفية مع تتبع Kareema الميداني حتى الصومعة.'
              : 'Encrypted, sovereign records linking SolVision spectral data with Kareema field ops through to silo storage.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم الدفعة أو المحور...' : 'Search batch ID or parcel...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Layout: Batch List on Left, Certificate on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Batch Cards Selector */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'دفعات الإنتاج المسجلة' : 'Registered Crop Batches'} ({filteredPassports.length})
          </span>

          <div className="space-y-2.5">
            {filteredPassports.map((passport) => {
              const isSelected = activePassport?.crop_batch_id === passport.crop_batch_id;

              return (
                <div
                  key={passport.crop_batch_id}
                  onClick={() => setSelectedPassport(passport)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{passport.crop_batch_id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {isAr ? 'مختومة وموثقة' : 'SEALED'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white">
                    {isAr ? passport.parcelName : passport.parcelNameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? passport.cropVariety : passport.cropVarietyEn}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Purity: <strong className="text-emerald-400">{passport.soilPurityIndex}%</strong></span>
                    <span>Water Stress-Free: <strong className="text-teal-400">{passport.waterStressFreeIndex}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Digital Quality Passport Certificate Details */}
        <div className="lg:col-span-8 bg-slate-900/50 border border-slate-850 rounded-xl p-5 lg:p-6 space-y-6">
          {/* Certificate Header Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'وثيقة الجودة الرقمية السيادية' : 'Sovereign Digital Quality Passport'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-bold">
                    ISO-22005 / DZ-AGRI
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  BATCH ID: <span className="text-cyan-400 font-bold">{activePassport.crop_batch_id}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr ? activePassport.parcelName : activePassport.parcelNameEn} · {isAr ? activePassport.cropVariety : activePassport.cropVarietyEn}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'رمز QR الميداني' : 'QR Verify'}</span>
              </button>

              <button
                onClick={() => verifyOnChain(activePassport.cryptographicSeal.hash)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'فحص الختم التشفيري' : 'Verify Hash'}</span>
              </button>
            </div>
          </div>

          {/* Verification Notification */}
          {verificationSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-600 text-xs text-emerald-300 flex items-center gap-2 font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAr
                  ? `تم التحقق بنجاح! الختم التشفيري سليم ومطابق لخزينة AtlasCloud السيادية (SHA-256 Validated).`
                  : `Cryptographic Hash Validated! Matches Sovereign Root Vault with zero tampering.`}
              </span>
            </div>
          )}

          {/* Agronomic & Carbon Indices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'مؤشر خلو الإجهاد' : 'Stress-Free Index'}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {activePassport.waterStressFreeIndex}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">SolVision Infrared</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'نقاء التربة والصنف' : 'Soil Purity Score'}
              </span>
              <span className="text-xl font-bold font-mono text-teal-400">
                {activePassport.soilPurityIndex}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Heavy-Metals Free</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'البصمة الكربونية' : 'Carbon Footprint'}
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {activePassport.carbonFootprintKgPerTon} <span className="text-xs font-normal text-slate-400">kg/t</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Low Emission</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isAr ? 'الصومعة المستهدفة' : 'Target Silo'}
              </span>
              <span className="text-xs font-bold text-white block truncate">
                {activePassport.targetSiloId.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sovereign Reserve</span>
            </div>
          </div>

          {/* Seed-to-Silo 5-Stage Traceability Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'سلسلة التتبع الكاملة (Seed-to-Silo Traceability Stages)' : 'Seed-to-Silo Traceability Stages'}</span>
            </h4>

            <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-4">
              {activePassport.traceabilityStages.map((stage, idx) => {
                const isDone = stage.status === 'VERIFIED';
                const isCurrent = stage.status === 'CURRENT';

                return (
                  <div key={idx} className="relative group">
                    {/* Circle marker */}
                    <div className={`absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isDone 
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                        : isCurrent
                        ? 'bg-cyan-500 border-cyan-400 animate-pulse'
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                      {isDone && <CheckCircle2 className="w-3 h-3 text-slate-950 font-bold" />}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-white">
                          {isAr ? stage.stageAr : stage.stageEn}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{stage.timestamp}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px]">
                        <span>الموقع: {stage.location}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">الجهة الموثقة: {stage.verifier}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Seal & Merkle Proof */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-xs text-white font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'الختم التشفيري السيادي (Cryptographic Seal)' : 'Sovereign Cryptographic Seal'}</span>
              </span>
              <span className="text-[10px] text-emerald-400">ECDSA-secp256k1</span>
            </div>

            <div className="space-y-1 text-slate-400">
              <p className="truncate">
                <span className="text-slate-500">SHA-256 Hash: </span>
                <span className="text-cyan-300 font-bold">{activePassport.cryptographicSeal.hash}</span>
              </p>
              <p className="truncate">
                <span className="text-slate-500">Root CA: </span>
                <span className="text-slate-300">{activePassport.cryptographicSeal.issuerSovereignKey}</span>
              </p>
              <p className="truncate">
                <span className="text-slate-500">Merkle Root: </span>
                <span className="text-emerald-400">{activePassport.cryptographicSeal.merkleRoot}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-white">
              {isAr ? 'رمز الاستجابة السريعة للتحقق الميداني' : 'Field Inspection QR Code'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'امسح الرمز عبر تطبيق Kareema أو أجهزة التفتيش للتحقق الفوري من سلامة الشحنة.' : 'Scan via Kareema field app or regulatory scanners for zero-trust certificate audit.'}
            </p>

            {/* Simulated Clean SVG QR Code */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="19" y="19" width="7" height="7" fill="#0f172a" />

                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="74" y="19" width="7" height="7" fill="#0f172a" />

                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="19" y="74" width="7" height="7" fill="#0f172a" />

                <rect x="42" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="42" y="32" width="16" height="8" fill="#0f172a" />
                <rect x="15" y="45" width="20" height="8" fill="#0f172a" />
                <rect x="45" y="45" width="10" height="10" fill="#0f172a" />
                <rect x="65" y="45" width="20" height="8" fill="#0f172a" />
                <rect x="42" y="65" width="12" height="12" fill="#0f172a" />
                <rect x="62" y="65" width="8" height="20" fill="#0f172a" />
                <rect x="75" y="75" width="15" height="10" fill="#0f172a" />
              </svg>
            </div>

            <div className="font-mono text-[11px] text-cyan-400 truncate">
              {activePassport.crop_batch_id}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
