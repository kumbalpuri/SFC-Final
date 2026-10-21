import React, { useState } from 'react';
import { RedFlag } from '../types';
import { 
  ShieldAlert, 
  Camera, 
  Upload, 
  HelpCircle, 
  Check, 
  AlertTriangle, 
  X, 
  User, 
  Building, 
  Tag, 
  Calendar, 
  CheckSquare, 
  UserCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import CameraModal from './CameraModal';

interface RedFlagSheetFormProps {
  onAddRedFlag: (rf: Partial<RedFlag>) => void;
  onCancel: () => void;
  onNavigateToTracker?: () => void;
}

// Preset SVGs for mock files so operators don't have to search for images during demo
const presetRedFlagImages = {
  torqueDefectBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fff1f2"/><g stroke="%23e11d48" stroke-width="2" fill="none"><circle cx="200" cy="110" r="45" stroke-dasharray="6,4" stroke-width="3"/><path d="M170,110 L230,110 M200,80 L200,140" stroke-width="3"/><path d="M180,90 L220,130" stroke-width="4"/><polygon points="200,60 215,85 185,85" fill="%23e11d48"/></g><text x="200" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23be123c" text-anchor="middle">TORQUE CALIBRATION SLIPPED (12.4 Nm vs 18 Nm)</text><rect x="15" y="15" width="130" height="24" rx="4" fill="%23e11d48"/><text x="80" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">DEFECT / BEFORE</text></svg>`,
  torqueDefectAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><g stroke="%2316a34a" stroke-width="2" fill="none"><circle cx="200" cy="110" r="45" stroke="%2316a34a" stroke-width="4"/><circle cx="200" cy="110" r="15" fill="%2386efac"/><path d="M192,110 L198,116 L210,102" stroke-width="4" stroke="%2315803d"/></g><text x="200" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2315803d" text-anchor="middle">RE-CALIBRATED TORQUE WRENCH &amp; 100% RE-TORQUED</text><rect x="15" y="15" width="140" height="24" rx="4" fill="%2316a34a"/><text x="85" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">CONTAINED / AFTER</text></svg>`,
  leakBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fef2f2"/><g stroke="%23dc2626" stroke-width="3" fill="none"><path d="M120,150 L280,150 M160,150 L160,80 L240,80 L240,150" stroke-width="4"/><path d="M190,155 Q200,185 200,200 Q200,215 190,225" stroke="%23ef4444" stroke-width="4"/></g><text x="200" y="225" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23b91c1c" text-anchor="middle">HYDRAULIC OIL LEAK AT SEAL FLANGE</text><rect x="15" y="15" width="130" height="24" rx="4" fill="%23dc2626"/><text x="80" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">DEFECT / BEFORE</text></svg>`,
  leakAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><g stroke="%2316a34a" stroke-width="3" fill="none"><path d="M120,150 L280,150 M160,150 L160,80 L240,80 L240,150" stroke-width="4"/><circle cx="200" cy="115" r="16" fill="%2386efac" stroke="%2316a34a"/><path d="M194,115 L198,119 L208,109" stroke-width="3" stroke="%2315803d"/></g><text x="200" y="225" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2315803d" text-anchor="middle">NEW VITON O-RING INSTALLED %26 ZERO LEAK VERIFIED</text><rect x="15" y="15" width="140" height="24" rx="4" fill="%2316a34a"/><text x="85" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">CONTAINED / AFTER</text></svg>`,
  genericBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fff1f2"/><rect x="50" y="50" width="300" height="150" rx="8" fill="none" stroke="%23f43f5e" stroke-width="2" stroke-dasharray="6,6"/><circle cx="200" cy="120" r="30" fill="%23fecdd3"/><path d="M185,120 L215,120 M200,105 L200,135" stroke="%23e11d48" stroke-width="4"/><text x="200" y="170" font-family="sans-serif" font-size="12" fill="%23be123c" text-anchor="middle">POINT-OF-DEFECT PHOTO (COMPULSORY)</text></svg>`,
  genericAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><rect x="50" y="50" width="300" height="150" rx="8" fill="none" stroke="%2386efac" stroke-width="2" stroke-dasharray="6,6"/><circle cx="200" cy="120" r="30" fill="%23bbf7d0"/><path d="M185,120 L215,120 M200,105 L200,135" stroke="%2316a34a" stroke-width="4"/><text x="200" y="170" font-family="sans-serif" font-size="12" fill="%2315803d" text-anchor="middle">CONTAINMENT STATUS PHOTO</text></svg>`
};

export default function RedFlagSheetForm({ onAddRedFlag, onCancel, onNavigateToTracker }: RedFlagSheetFormProps) {
  // Originator info (Anyone can raise!)
  const [raisedBy, setRaisedBy] = useState('Rajesh Patil (Shift In-charge)');
  const [raisedByDepartment, setRaisedByDepartment] = useState('Production');
  const [raisedByRole, setRaisedByRole] = useState('Shift In-charge');

  // Target info (Raised on anyone!)
  const [targetDepartment, setTargetDepartment] = useState('Maintenance');
  const [targetPerson, setTargetPerson] = useState('Vikram Singh (Maintenance Lead)');

  // Location / Machine / Line
  const [mfName, setMfName] = useState('MF1');
  const [lineAreaName, setLineAreaName] = useState('Vacuum Pump Line A (Pune)');
  const [modelName, setModelName] = useState('VP-200 / VP-350');
  const [stationName, setStationName] = useState('Torqueing Station ST-4');

  // Classification
  const [redFlagType, setRedFlagType] = useState<'Quality' | 'Safety' | 'Machine' | 'Process' | 'Material' | '5S'>('Quality');
  const [redFlagSubType, setRedFlagSubType] = useState('Torque Defect');
  const [severity, setSeverity] = useState<'Critical (Line Stop)' | 'Major (Quarantine)' | 'Minor (Observation)'>('Major (Quarantine)');
  const [category5M, setCategory5M] = useState<'Man' | 'Machine' | 'Method' | 'Material' | 'Measurement'>('Method');
  const [repetitiveOccurrence, setRepetitiveOccurrence] = useState<'First Time' | 'Repeat (Within 3M)' | 'Frequent (>2 Times)'>('First Time');

  // Problem & Containment
  const [redFlagDescription, setRedFlagDescription] = useState('');
  const [containmentAction, setContainmentAction] = useState('');
  const [suspectQtyQuarantined, setSuspectQtyQuarantined] = useState<number>(0);
  const [containmentStatus, setContainmentStatus] = useState<'Pending' | 'Contained' | 'Verified'>('Pending');

  // QA Custodianship & Target
  const [qaCustodian, setQaCustodian] = useState('Suresh Kumar (QA Lead)');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Photos
  const [photoBefore, setPhotoBefore] = useState(presetRedFlagImages.genericBefore);
  const [photoAfter, setPhotoAfter] = useState(presetRedFlagImages.genericAfter);
  const [cameraTarget, setCameraTarget] = useState<'before' | 'after' | null>(null);

  // Errors & Feedback
  const [error, setError] = useState<string | null>(null);

  // Presets loader
  const loadPreset = (presetType: 'torque' | 'leak') => {
    if (presetType === 'torque') {
      setPhotoBefore(presetRedFlagImages.torqueDefectBefore);
      setPhotoAfter(presetRedFlagImages.torqueDefectAfter);
      setRedFlagType('Quality');
      setRedFlagSubType('Torque Slippage & Calibration');
      setSeverity('Major (Quarantine)');
      setCategory5M('Machine');
      setLineAreaName('Vacuum Pump Line A (Pune)');
      setStationName('Torqueing Station ST-4');
      setModelName('VP-200');
      setTargetDepartment('Maintenance');
      setTargetPerson('Vikram Singh (Calibration Lead)');
      setRedFlagDescription('Digital torque wrench #TW-04 reading 12.4 Nm on bolt M10 while standard SOP specifies 18.0 Nm (+/- 0.5 Nm). Cal slip observed on 14 units during regular quality check.');
      setContainmentAction('14 suspect units quarantined in Red Hold Area with Red Tag #RT-104. Re-calibrated torque wrench against master tester. Shift inspection performed.');
      setSuspectQtyQuarantined(14);
      setContainmentStatus('Contained');
    } else {
      setPhotoBefore(presetRedFlagImages.leakBefore);
      setPhotoAfter(presetRedFlagImages.leakAfter);
      setRedFlagType('Machine');
      setRedFlagSubType('Hydraulic Seal Leakage');
      setSeverity('Critical (Line Stop)');
      setCategory5M('Method');
      setLineAreaName('Moulding Bay 3 (Chakan)');
      setStationName('Hydraulic Press HP-02');
      setModelName('Cylinder Assy C-40');
      setTargetDepartment('Maintenance');
      setTargetPerson('Anand Joshi (Hydraulics Tech)');
      setRedFlagDescription('High-pressure hydraulic oil leaking from cylinder seal joint onto operator foot area. Pressure dropping from 140 bar to 95 bar, creating slipping hazard and short moulding.');
      setContainmentAction('Main valve depressurized and line powered down. Absorbent pads placed. 25 raw moulded pieces segregated for density testing.');
      setSuspectQtyQuarantined(25);
      setContainmentStatus('Contained');
    }
    setError(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'before') setPhotoBefore(reader.result);
          else setPhotoAfter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redFlagDescription.trim()) {
      setError('Please provide a complete description of the defect / anomaly.');
      return;
    }

    const isBeforePhotoMissing = !photoBefore || photoBefore === presetRedFlagImages.genericBefore;
    if (isBeforePhotoMissing) {
      setError('The Point-of-Defect / Before photo is compulsory. Please take or upload a photo.');
      return;
    }

    onAddRedFlag({
      raisedBy,
      raisedByDepartment,
      raisedByRole,
      targetDepartment,
      targetPerson,
      mfName,
      lineAreaName,
      modelName,
      stationName,
      redFlagType,
      redFlagSubType,
      severity,
      category5M,
      responsibleDepartment: targetDepartment,
      redFlagDescription,
      containmentAction,
      suspectQtyQuarantined: Number(suspectQtyQuarantined) || 0,
      containmentStatus: suspectQtyQuarantined > 0 ? 'Verified' : containmentStatus,
      status: suspectQtyQuarantined > 0 ? 'Contained' : 'Open',
      qaCustodian,
      qaCustodianStatus: 'Review Pending',
      qaCustodianNotes: 'QA custodian will oversee 4D immediate containment, root cause analysis, and 3-month sustenance.',
      repetitiveOccurrence,
      closureResponsibility: qaCustodian,
      targetDate: targetDate || new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      evidencePhoto: photoBefore,
      countermeasurePhoto: photoAfter !== presetRedFlagImages.genericAfter ? photoAfter : undefined,
      sustenanceAchieved: false
    });

    if (onNavigateToTracker) {
      onNavigateToTracker();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-5xl mx-auto my-6">
      
      {/* Title Header Matching Kaizen Form */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>RED FLAG ACTION SHEET</span>
              <span className="text-[10px] font-mono bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded uppercase">
                SFC / QA / RF-01
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Empower Anyone to Raise on Anyone • QA Custodian Governed • 3-Month Sustenance
            </p>
          </div>
        </div>
        
        {/* Test Preset Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('torque')}
            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
          >
            Torque Defect
          </button>
          <button
            type="button"
            onClick={() => loadPreset('leak')}
            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
          >
            Hydraulic Leak
          </button>
        </div>
      </div>

      {/* Custodian Policy Banner */}
      <div className="bg-rose-50/70 border-b border-rose-100 px-6 py-3 flex items-center justify-between text-xs text-rose-900">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Shopfloor Control Rule:</strong> Anyone from any department can raise a Red Flag on any person, machine, or department. QA serves as the official Custodian. Point remains open until 3-month sustenance is achieved.
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase text-rose-600 bg-white border border-rose-200 px-2 py-0.5 rounded shrink-0 ml-4">
          QA Custodian: Suresh Kumar
        </span>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Section 1: Originator vs Target Matrix */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>1. Originator &amp; Target Assignment (Anyone On Anyone)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">IATF 16949 Section 8.7</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raised By */}
            <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase">Raised By (Originator)</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Raiser</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name &amp; Role</label>
                <input
                  type="text"
                  required
                  value={raisedBy}
                  onChange={(e) => setRaisedBy(e.target.value)}
                  placeholder="e.g. Rajesh Patil (Shift In-charge)"
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Originator Dept</label>
                  <select
                    value={raisedByDepartment}
                    onChange={(e) => setRaisedByDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                  >
                    <option value="Production">Production</option>
                    <option value="Quality">Quality / QA</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Safety & EHS">Safety &amp; EHS</option>
                    <option value="Logistics & Stores">Logistics &amp; Stores</option>
                    <option value="Tooling & Die">Tooling &amp; Die</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Originator Role</label>
                  <input
                    type="text"
                    value={raisedByRole}
                    onChange={(e) => setRaisedByRole(e.target.value)}
                    placeholder="e.g. Line Operator"
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Raised On */}
            <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase">Raised On (Target Dept &amp; Lead)</span>
                <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Target</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Department</label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="Production">Production</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Tooling & Die">Tooling &amp; Die</option>
                  <option value="Quality">Quality</option>
                  <option value="Logistics & Stores">Logistics &amp; Stores</option>
                  <option value="Supplier / Inward">Supplier / Inward</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Person / Department Lead</label>
                <input
                  type="text"
                  required
                  value={targetPerson}
                  onChange={(e) => setTargetPerson(e.target.value)}
                  placeholder="e.g. Vikram Singh (Maintenance Lead)"
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Machine / Line / Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mini-Factory</label>
            <select
              value={mfName}
              onChange={(e) => setMfName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none"
            >
              <option value="MF1">MF1 (Assembly &amp; Testing)</option>
              <option value="MF2">MF2 (Machining &amp; CNC)</option>
              <option value="MF3">MF3 (Moulding &amp; Tooling)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Line / Area</label>
            <input
              type="text"
              required
              value={lineAreaName}
              onChange={(e) => setLineAreaName(e.target.value)}
              placeholder="e.g. Vacuum Pump Line A"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Station / Machine</label>
            <input
              type="text"
              required
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="e.g. Torqueing Station ST-4"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model / Part No.</label>
            <input
              type="text"
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. VP-200 / VP-350"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
            />
          </div>
        </div>

        {/* Section 3: Visual Proof (Before & After Photos) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
              <Camera className="w-4 h-4 text-rose-600" />
              <span>2. Visual Photographic Evidence (Before Defect &amp; Containment)</span>
            </h3>
            <span className="text-[10px] font-mono text-rose-600 font-bold">* Before Photo Compulsory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before Photo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Point of Defect (Before Status)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Non-conformance</span>
              </div>
              <div className="relative border-2 border-dashed border-rose-200 rounded-xl overflow-hidden bg-rose-50/40 aspect-video flex items-center justify-center">
                <img
                  src={photoBefore}
                  alt="Point of defect before"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCameraTarget('before')}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Live Photo</span>
                </button>
                <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* After Photo (Containment) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Containment Action (After Status)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Quarantine / Fix</span>
              </div>
              <div className="relative border-2 border-dashed border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/40 aspect-video flex items-center justify-center">
                <img
                  src={photoAfter}
                  alt="Containment after status"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCameraTarget('after')}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Live Photo</span>
                </button>
                <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Section 4: Defect Description & Immediate Containment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase">
              Anomaly / Defect Description (Before Status) *
            </label>
            <textarea
              required
              rows={4}
              value={redFlagDescription}
              onChange={(e) => setRedFlagDescription(e.target.value)}
              placeholder="State what anomaly was observed, parameter deviation, affected part numbers, and how it was detected..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:border-slate-900 outline-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase">
              Immediate 4D Containment Action (After Status)
            </label>
            <textarea
              rows={4}
              value={containmentAction}
              onChange={(e) => setContainmentAction(e.target.value)}
              placeholder="State immediate quarantine actions taken, boundary lot marking, sorting criteria, and immediate safety controls..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:border-slate-900 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Section 5: Classification (5M, Type, Severity, Quarantine Qty) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>3. Defect Classification, 5M &amp; Quarantine Controls</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Root Cause Preliminaries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Red Flag Type</label>
              <select
                value={redFlagType}
                onChange={(e) => setRedFlagType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none"
              >
                <option value="Quality">Quality (Defect/Spec)</option>
                <option value="Machine">Machine Breakdown</option>
                <option value="Safety">Safety &amp; EHS Near-Miss</option>
                <option value="Process">Process Parameter</option>
                <option value="Material">Material Inward Defect</option>
                <option value="5S">5S Contamination</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">5M Category</label>
              <select
                value={category5M}
                onChange={(e) => setCategory5M(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none"
              >
                <option value="Method">Method (Standard/Process)</option>
                <option value="Machine">Machine (Tool/Fixture/Sensor)</option>
                <option value="Material">Material (Vendor/Raw Stock)</option>
                <option value="Man">Man (Operator Skill/Handling)</option>
                <option value="Measurement">Measurement (Gauge/Cal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none ${
                  severity.includes('Critical')
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : severity.includes('Major')
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="Critical (Line Stop)">Critical (Line Stop)</option>
                <option value="Major (Quarantine)">Major (Quarantine Lot)</option>
                <option value="Minor (Observation)">Minor (Track &amp; Observe)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quarantined WIP Qty</label>
              <input
                type="number"
                min="0"
                value={suspectQtyQuarantined}
                onChange={(e) => setSuspectQtyQuarantined(parseInt(e.target.value) || 0)}
                placeholder="Pieces quarantined"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Occurrence Frequency</label>
              <select
                value={repetitiveOccurrence}
                onChange={(e) => setRepetitiveOccurrence(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
              >
                <option value="First Time">First Time Occurrence</option>
                <option value="Repeat (Within 3M)">Repeat (Within 3 Months)</option>
                <option value="Frequent (>2 Times)">Frequent (&gt;2 Times)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">QA Custodian Assignee</label>
              <input
                type="text"
                value={qaCustodian}
                onChange={(e) => setQaCustodian(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Resolution Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel / Back to Tracker
          </button>

          <button
            type="submit"
            className="px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>AUTHORIZE &amp; RAISE RED FLAG</span>
          </button>
        </div>

      </form>

      {/* Live Camera Modal */}
      {cameraTarget && (
        <CameraModal
          isOpen={true}
          title={cameraTarget === 'before' ? 'Capture Point of Defect Photo' : 'Capture Immediate Containment Photo'}
          onCapture={(base64) => {
            if (cameraTarget === 'before') setPhotoBefore(base64);
            else setPhotoAfter(base64);
            setCameraTarget(null);
          }}
          onClose={() => setCameraTarget(null)}
        />
      )}

    </div>
  );
}
