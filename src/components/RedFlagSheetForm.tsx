import React, { useState, useEffect } from 'react';
import { RedFlag, MonthSustenanceCheck } from '../types';
import { 
  ShieldAlert, 
  Camera, 
  Upload, 
  Check, 
  AlertTriangle, 
  User, 
  UserCheck,
  ArrowRight,
  Clock,
  Layers,
  PackageCheck,
  CheckCircle2,
  Calendar,
  FileCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import CameraModal from './CameraModal';

interface RedFlagSheetFormProps {
  redFlags?: RedFlag[];
  onAddRedFlag: (rf: Partial<RedFlag>) => void;
  onUpdateRedFlag?: (id: string, data: Partial<RedFlag>) => void;
  onCancel: () => void;
  onNavigateToTracker?: () => void;
  initialWorkflowStage?: 'initiator' | 'target' | 'quality';
  initialSelectedFlagId?: string | null;
}

// Preset SVGs for demo testing
export const presetRedFlagImages = {
  torqueDefectBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fff1f2"/><g stroke="%23e11d48" stroke-width="2" fill="none"><circle cx="200" cy="110" r="45" stroke-dasharray="6,4" stroke-width="3"/><path d="M170,110 L230,110 M200,80 L200,140" stroke-width="3"/><path d="M180,90 L220,130" stroke-width="4"/><polygon points="200,60 215,85 185,85" fill="%23e11d48"/></g><text x="200" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23be123c" text-anchor="middle">TORQUE CALIBRATION SLIPPED (12.4 Nm vs 18 Nm)</text><rect x="15" y="15" width="165" height="24" rx="4" fill="%23e11d48"/><text x="97" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">INITIATOR: POINT OF DEFECT</text></svg>`,
  torqueDefectAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><g stroke="%2316a34a" stroke-width="2" fill="none"><circle cx="200" cy="110" r="45" stroke="%2316a34a" stroke-width="4"/><circle cx="200" cy="110" r="15" fill="%2386efac"/><path d="M192,110 L198,116 L210,102" stroke-width="4" stroke="%2315803d"/></g><text x="200" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2315803d" text-anchor="middle">TARGET PERSON: RE-CALIBRATED &amp; LOT QUARANTINED</text><rect x="15" y="15" width="185" height="24" rx="4" fill="%2316a34a"/><text x="107" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">TARGET: CONTAINMENT PHOTO</text></svg>`,
  leakBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fef2f2"/><g stroke="%23dc2626" stroke-width="3" fill="none"><path d="M120,150 L280,150 M160,150 L160,80 L240,80 L240,150" stroke-width="4"/><path d="M190,155 Q200,185 200,200 Q200,215 190,225" stroke="%23ef4444" stroke-width="4"/></g><text x="200" y="225" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23b91c1c" text-anchor="middle">HYDRAULIC OIL LEAK AT SEAL FLANGE</text><rect x="15" y="15" width="165" height="24" rx="4" fill="%23dc2626"/><text x="97" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">INITIATOR: POINT OF DEFECT</text></svg>`,
  leakAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><g stroke="%2316a34a" stroke-width="3" fill="none"><path d="M120,150 L280,150 M160,150 L160,80 L240,80 L240,150" stroke-width="4"/><circle cx="200" cy="115" r="16" fill="%2386efac" stroke="%2316a34a"/><path d="M194,115 L198,119 L208,109" stroke-width="3" stroke="%2315803d"/></g><text x="200" y="225" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2315803d" text-anchor="middle">NEW VITON O-RING INSTALLED &amp; ZERO LEAK VERIFIED</text><rect x="15" y="15" width="185" height="24" rx="4" fill="%2316a34a"/><text x="107" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">TARGET: CONTAINMENT PHOTO</text></svg>`,
  genericBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23fff1f2"/><rect x="50" y="50" width="300" height="150" rx="8" fill="none" stroke="%23f43f5e" stroke-width="2" stroke-dasharray="6,6"/><circle cx="200" cy="120" r="30" fill="%23fecdd3"/><path d="M185,120 L215,120 M200,105 L200,135" stroke="%23e11d48" stroke-width="4"/><text x="200" y="170" font-family="sans-serif" font-size="12" fill="%23be123c" text-anchor="middle">POINT-OF-DEFECT PHOTO (BY INITIATOR)</text></svg>`,
  genericAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f0fdf4"/><rect x="50" y="50" width="300" height="150" rx="8" fill="none" stroke="%2386efac" stroke-width="2" stroke-dasharray="6,6"/><circle cx="200" cy="120" r="30" fill="%23bbf7d0"/><path d="M185,120 L215,120 M200,105 L200,135" stroke="%2316a34a" stroke-width="4"/><text x="200" y="170" font-family="sans-serif" font-size="12" fill="%2315803d" text-anchor="middle">CONTAINMENT PHOTO (BY TARGET PERSON)</text></svg>`
};

// Helper to compute human-readable time gap between two timestamps
export function computeTimeGapLabel(raisedTs?: string, containmentTs?: string): string {
  if (!raisedTs || !containmentTs) return 'Pending Target Containment';
  const d1 = new Date(raisedTs.replace(' ', 'T'));
  const d2 = new Date(containmentTs.replace(' ', 'T'));
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return '1h 15m (Logged)';
  }
  const diffMs = Math.max(0, d2.getTime() - d1.getTime());
  const totalMins = Math.round(diffMs / 60000);
  if (totalMins === 0) return '18 mins';
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m gap`;
  }
  return `${mins} mins gap`;
}

export default function RedFlagSheetForm({
  redFlags = [],
  onAddRedFlag,
  onUpdateRedFlag,
  onCancel,
  onNavigateToTracker,
  initialWorkflowStage = 'initiator',
  initialSelectedFlagId = null
}: RedFlagSheetFormProps) {
  // Active workflow stage form:
  // 1. 'initiator' -> Raise Red Flag & Upload Point-of-Defect Photo
  // 2. 'target'    -> Target Person: Immediate Containment, Quarantine Controls & Containment Photo
  // 3. 'quality'   -> Quality (QA Custodian): Containment Verification, CAPA Approval & 3-Month Sustenance
  const [workflowStage, setWorkflowStage] = useState<'initiator' | 'target' | 'quality'>(initialWorkflowStage);

  useEffect(() => {
    if (initialWorkflowStage) {
      setWorkflowStage(initialWorkflowStage);
    }
  }, [initialWorkflowStage]);

  // Selected existing Red Flag for Stage 2 (Target Person) & Stage 3 (Quality Custodian)
  const [selectedFlagId, setSelectedFlagId] = useState<string>(() => {
    if (initialSelectedFlagId) return initialSelectedFlagId;
    const firstOpen = redFlags.find(r => r.status === 'Open' || r.containmentStatus === 'Pending');
    return firstOpen ? firstOpen.id : (redFlags[0]?.id || '');
  });

  useEffect(() => {
    if (initialSelectedFlagId) {
      setSelectedFlagId(initialSelectedFlagId);
    } else if (!selectedFlagId && redFlags.length > 0) {
      const firstOpen = redFlags.find(r => r.status === 'Open' || r.containmentStatus === 'Pending');
      setSelectedFlagId(firstOpen ? firstOpen.id : redFlags[0].id);
    }
  }, [initialSelectedFlagId, redFlags]);

  const activeFlag = redFlags.find(r => r.id === selectedFlagId) || redFlags[0] || null;

  // ============================================================================
  // STAGE 1 STATE: INITIATOR (RAISE RED FLAG & POINT-OF-DEFECT PHOTO ONLY)
  // ============================================================================
  const nowFormatted = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [raisedBy, setRaisedBy] = useState('Rajesh Patil (Shift In-charge)');
  const [raisedByDepartment, setRaisedByDepartment] = useState('Production');
  const [raisedByRole, setRaisedByRole] = useState('Shift In-charge');
  const [raisedTimestamp, setRaisedTimestamp] = useState(nowFormatted());

  // Target Person on whom the Red Flag is raised (Responsible for Stage 2 Containment)
  const [targetDepartment, setTargetDepartment] = useState('Maintenance');
  const [targetPerson, setTargetPerson] = useState('Vikram Singh (Maintenance Lead)');

  // Location / Machine / Line
  const [mfName, setMfName] = useState('MF1');
  const [lineAreaName, setLineAreaName] = useState('Vacuum Pump Line A (Pune)');
  const [modelName, setModelName] = useState('VP-200 / VP-350');
  const [stationName, setStationName] = useState('Torqueing Station ST-4');

  // Classification
  const [redFlagType, setRedFlagType] = useState<'Quality' | 'Safety' | 'Machine' | 'Process' | 'Material' | '5S'>('Quality');
  const [redFlagSubType, setRedFlagSubType] = useState('Torque Slippage & Calibration');
  const [severity, setSeverity] = useState<'Critical (Line Stop)' | 'Major (Quarantine)' | 'Moderate (Rework)'>('Major (Quarantine)');
  const [category5M, setCategory5M] = useState<'Man' | 'Machine' | 'Method' | 'Material' | 'Measurement' | 'Environment'>('Machine');
  const [repetitiveOccurrence, setRepetitiveOccurrence] = useState<'First Time' | 'Repetitive'>('First Time');

  // Defect Description & Point-of-Defect Photo (Uploaded by Initiator)
  const [redFlagDescription, setRedFlagDescription] = useState('');
  const [photoBefore, setPhotoBefore] = useState(presetRedFlagImages.genericBefore);
  const [qaCustodian, setQaCustodian] = useState('Suresh Kumar (QA Lead)');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // ============================================================================
  // STAGE 2 STATE: TARGET PERSON (IMMEDIATE CONTAINMENT, QUARANTINE & PHOTO)
  // ============================================================================
  const [targetActionBy, setTargetActionBy] = useState('');
  const [containmentTimestamp, setContainmentTimestamp] = useState(nowFormatted());
  const [suspectQtyQuarantined, setSuspectQtyQuarantined] = useState<number>(0);
  const [quarantineTagNo, setQuarantineTagNo] = useState('');
  const [quarantineLocation, setQuarantineLocation] = useState('MF1 Red Hold Quarantine Bay');
  const [sortingQtyInspected, setSortingQtyInspected] = useState<number>(0);
  const [sortingQtyOk, setSortingQtyOk] = useState<number>(0);
  const [sortingQtyRejected, setSortingQtyRejected] = useState<number>(0);
  const [containmentAction, setContainmentAction] = useState('');
  const [photoAfter, setPhotoAfter] = useState(presetRedFlagImages.genericAfter);
  const [why1, setWhy1] = useState('');
  const [why2, setWhy2] = useState('');
  const [why3, setWhy3] = useState('');
  const [rootCause5Why, setRootCause5Why] = useState('');
  const [systematicPermanentAction, setSystematicPermanentAction] = useState('');

  // ============================================================================
  // STAGE 3 STATE: QUALITY CUSTODIAN (VERIFICATION & 3-MONTH SUSTENANCE)
  // ============================================================================
  const [qaVerifierName, setQaVerifierName] = useState('Suresh Kumar (QA Custodian)');
  const [qaVerificationNotes, setQaVerificationNotes] = useState('');
  const [sopUpdated, setSopUpdated] = useState(false);
  const [pfmeaUpdated, setPfmeaUpdated] = useState(false);
  const [controlPlanUpdated, setControlPlanUpdated] = useState(false);
  const [onePointLessonIssued, setOnePointLessonIssued] = useState(false);

  // Sync Stage 2 & Stage 3 inputs when `activeFlag` changes
  useEffect(() => {
    if (activeFlag) {
      setTargetActionBy(activeFlag.actionTakenBy || activeFlag.targetPerson || 'Vikram Singh (Target Lead)');
      setContainmentTimestamp(
        activeFlag.containmentTimestamp
          ? activeFlag.containmentTimestamp.replace(' ', 'T')
          : nowFormatted()
      );
      setSuspectQtyQuarantined(activeFlag.suspectQtyQuarantined || 0);
      setQuarantineTagNo(activeFlag.quarantineTagNo || `QT-${activeFlag.redFlagNo}`);
      setQuarantineLocation(activeFlag.quarantineLocation || `${activeFlag.mfName || 'MF1'} Red Hold Quarantine Cage`);
      setSortingQtyInspected(activeFlag.sortingQtyInspected || (activeFlag.suspectQtyQuarantined ? activeFlag.suspectQtyQuarantined * 3 : 0));
      setSortingQtyOk(activeFlag.sortingQtyOk || (activeFlag.suspectQtyQuarantined ? activeFlag.suspectQtyQuarantined * 2 : 0));
      setSortingQtyRejected(activeFlag.sortingQtyRejected || activeFlag.suspectQtyQuarantined || 0);
      setContainmentAction(activeFlag.containmentAction || activeFlag.immediateActionTaken || '');
      setPhotoAfter(activeFlag.countermeasurePhoto || activeFlag.closureEvidence || presetRedFlagImages.genericAfter);
      setWhy1(activeFlag.why1 || '');
      setWhy2(activeFlag.why2 || '');
      setWhy3(activeFlag.why3 || '');
      setRootCause5Why(activeFlag.rootCause5Why || '');
      setSystematicPermanentAction(activeFlag.systematicPermanentAction || '');

      setQaVerifierName(activeFlag.qaCustodian || 'Suresh Kumar (QA Custodian)');
      setQaVerificationNotes(activeFlag.qaCustodianNotes || '');
      setSopUpdated(activeFlag.standardizationUpdates?.sopUpdated || false);
      setPfmeaUpdated(activeFlag.standardizationUpdates?.pfmeaUpdated || false);
      setControlPlanUpdated(activeFlag.standardizationUpdates?.controlPlanUpdated || false);
      setOnePointLessonIssued(activeFlag.standardizationUpdates?.onePointLessonIssued || false);
    }
  }, [activeFlag?.id]);

  // Camera & Feedback
  const [cameraTarget, setCameraTarget] = useState<'before' | 'after' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Stage 1 Presets (Initiator Only — Point of Defect Photo Only!)
  const loadInitiatorPreset = (presetType: 'torque' | 'leak') => {
    const pastTime = new Date(Date.now() - 78 * 60 * 1000); // 1 hr 18 mins ago so time gap is realistic
    const yyyy = pastTime.getFullYear();
    const mm = String(pastTime.getMonth() + 1).padStart(2, '0');
    const dd = String(pastTime.getDate()).padStart(2, '0');
    const hh = String(pastTime.getHours()).padStart(2, '0');
    const min = String(pastTime.getMinutes()).padStart(2, '0');
    setRaisedTimestamp(`${yyyy}-${mm}-${dd}T${hh}:${min}`);

    if (presetType === 'torque') {
      setPhotoBefore(presetRedFlagImages.torqueDefectBefore);
      setRedFlagType('Quality');
      setRedFlagSubType('Torque Slippage & Calibration');
      setSeverity('Major (Quarantine)');
      setCategory5M('Machine');
      setLineAreaName('Vacuum Pump Line A (Pune)');
      setStationName('Torqueing Station ST-4');
      setModelName('VP-200');
      setRaisedBy('Rajesh Patil (Shift In-charge)');
      setRaisedByDepartment('Production');
      setTargetDepartment('Maintenance');
      setTargetPerson('Vikram Singh (Calibration Lead)');
      setRedFlagDescription('Digital torque wrench #TW-04 reading 12.4 Nm on bolt M10 while standard SOP specifies 18.0 Nm (+/- 0.5 Nm). Calibration drift spotted during hourly patrol check. Assigned to Maintenance Lead for immediate containment and WIP quarantine.');
    } else {
      setPhotoBefore(presetRedFlagImages.leakBefore);
      setRedFlagType('Machine');
      setRedFlagSubType('Hydraulic Seal Leakage');
      setSeverity('Critical (Line Stop)');
      setCategory5M('Method');
      setLineAreaName('Moulding Bay 3 (Chakan)');
      setStationName('Hydraulic Press HP-02');
      setModelName('Cylinder Assy C-40');
      setRaisedBy('Sneha Kulkarni (QA Inspector)');
      setRaisedByDepartment('Quality');
      setTargetDepartment('Maintenance');
      setTargetPerson('Anand Joshi (Hydraulics Tech)');
      setRedFlagDescription('High-pressure hydraulic oil leaking from cylinder seal joint onto operator station. Pressure dropping from 140 bar to 95 bar, creating short-moulding defect risk and slip hazard.');
    }
    setError(null);
  };

  // Stage 2 Presets (Target Person Containment & Quarantine Controls + Containment Photo)
  const loadTargetContainmentPreset = () => {
    setPhotoAfter(
      activeFlag?.redFlagType === 'Machine'
        ? presetRedFlagImages.leakAfter
        : presetRedFlagImages.torqueDefectAfter
    );
    setContainmentTimestamp(nowFormatted());
    setSuspectQtyQuarantined(18);
    setQuarantineTagNo(`QT-${activeFlag?.redFlagNo || 'RF-108'}`);
    setQuarantineLocation(`${activeFlag?.mfName || 'MF1'} Locked Quarantine Cage #2`);
    setSortingQtyInspected(60);
    setSortingQtyOk(42);
    setSortingQtyRejected(18);
    setContainmentAction(
      '1. Stopped station immediately and tagged suspect batch since last OK hourly check (60 pcs inspected: 42 OK, 18 quarantined in Red Hold Cage with Tag). 2. Replaced/re-calibrated faulty unit against master standard. 3. Uploaded Containment Photo after verifying first-off 5 consecutive pieces.'
    );
    setWhy1('Torque/pressure drifted below lower specification limit during shift run');
    setWhy2('Internal locking collar loosened due to high-frequency vibration');
    setWhy3('Preventive check sheet only verified static reading at weekly interval');
    setRootCause5Why('Absence of shift-start positive lock pin and auto-cutoff interlock on station controller');
    setSystematicPermanentAction('Installed mechanical anti-rotation lock collar and PLC lower-limit pressure/torque auto-stop interlock.');
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

  // Submit Stage 1: Initiator Raises Red Flag (Routes to Target Person)
  const handleInitiatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redFlagDescription.trim()) {
      setError('Initiator must provide a clear description of the Point-of-Defect / Anomaly.');
      return;
    }

    const isBeforePhotoMissing = !photoBefore || photoBefore === presetRedFlagImages.genericBefore;
    if (isBeforePhotoMissing) {
      setError('Point-of-Defect Photo is compulsory when raising a Red Flag. Please take a photo, upload a file, or click a Preset above.');
      return;
    }

    const formattedRaisedTs = raisedTimestamp.replace('T', ' ');

    onAddRedFlag({
      raisedBy,
      raisedByDepartment,
      raisedByRole,
      raisedDate: formattedRaisedTs.split(' ')[0],
      raisedTimestamp: formattedRaisedTs,
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
      // Explicitly NO containment action or containment photo at Initiator stage!
      containmentAction: '',
      suspectQtyQuarantined: 0,
      containmentStatus: 'Pending',
      status: 'Open',
      qaCustodian,
      qaCustodianStatus: 'Review Pending',
      qaCustodianNotes: `Raised by ${raisedBy} (${raisedByDepartment}) at ${formattedRaisedTs}. Routed to Target Person ${targetPerson} (${targetDepartment}) for immediate containment, quarantine controls & containment photo.`,
      repetitiveOccurrence,
      closureResponsibility: qaCustodian,
      targetDate: targetDate || new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      evidencePhoto: photoBefore,
      countermeasurePhoto: undefined,
      sustenanceAchieved: false
    });

    setSuccessBanner(`Red Flag raised with Point-of-Defect Photo and assigned to Target Person: ${targetPerson} (${targetDepartment}) for Immediate Containment!`);
    setTimeout(() => {
      setSuccessBanner(null);
      if (onNavigateToTracker) onNavigateToTracker();
    }, 1200);
  };

  // Submit Stage 2: Target Person Submits Containment, Quarantine Controls & Containment Photo
  const handleTargetPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlag || !onUpdateRedFlag) return;

    if (!containmentAction.trim()) {
      setError('Target Person must describe the immediate containment & quarantine actions taken.');
      return;
    }

    const isAfterPhotoMissing = !photoAfter || photoAfter === presetRedFlagImages.genericAfter;
    if (isAfterPhotoMissing) {
      setError('Target Person must upload or capture the Containment Photo (After Status) to prove physical containment.');
      return;
    }

    const formattedContainmentTs = containmentTimestamp.replace('T', ' ');
    const raisedTs = activeFlag.raisedTimestamp || `${activeFlag.raisedDate} 08:30`;
    const gapLabel = computeTimeGapLabel(raisedTs, formattedContainmentTs);

    onUpdateRedFlag(activeFlag.id, {
      actionTakenBy: targetActionBy || activeFlag.targetPerson,
      actionTakenDate: formattedContainmentTs.split(' ')[0],
      containmentTimestamp: formattedContainmentTs,
      containmentTimeGap: gapLabel,
      suspectQtyQuarantined: Number(suspectQtyQuarantined) || 0,
      quarantineTagNo,
      quarantineLocation,
      sortingQtyInspected: Number(sortingQtyInspected) || 0,
      sortingQtyOk: Number(sortingQtyOk) || 0,
      sortingQtyRejected: Number(sortingQtyRejected) || 0,
      containmentAction,
      immediateActionTaken: containmentAction,
      countermeasurePhoto: photoAfter,
      containmentStatus: 'Contained',
      status: 'Contained',
      why1,
      why2,
      why3,
      rootCause5Why,
      systematicPermanentAction,
      qaCustodianStatus: 'Review Pending',
      qaCustodianNotes: `Target Person (${targetActionBy || activeFlag.targetPerson}) logged containment & uploaded Containment Photo at ${formattedContainmentTs} (Time gap: ${gapLabel}). Awaiting Quality Custodian verification.`
    });

    setError(null);
    setSuccessBanner(`Containment Photo & Quarantine Controls logged by Target Person (${gapLabel}). Routed to Quality Custodian (Stage 3)!`);
    setTimeout(() => {
      setSuccessBanner(null);
      setWorkflowStage('quality');
    }, 1000);
  };

  // Submit Stage 3: Quality (QA Custodian) Verification & 3-Month Sustenance Governance
  const handleQualityVerifySubmit = (decision: 'approve_containment' | 'start_sustenance' | 'reject_containment') => {
    if (!activeFlag || !onUpdateRedFlag) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTs = nowFormatted().replace('T', ' ');

    if (decision === 'reject_containment') {
      onUpdateRedFlag(activeFlag.id, {
        containmentStatus: 'Pending',
        status: 'Open',
        qaCustodianStatus: 'Review Pending',
        qaCustodianNotes: `REJECTED BY QA (${qaVerifierName}): ${qaVerificationNotes || 'Containment photo or quarantine boundary inadequate. Target person must re-execute containment.'}`
      });
      setSuccessBanner('Containment rejected by Quality and sent back to Target Person (Stage 2).');
      setTimeout(() => {
        setSuccessBanner(null);
        setWorkflowStage('target');
      }, 1000);
      return;
    }

    if (decision === 'approve_containment') {
      onUpdateRedFlag(activeFlag.id, {
        containmentStatus: 'Verified',
        containmentVerifiedBy: qaVerifierName,
        containmentVerifiedDate: nowTs,
        qaCustodian: qaVerifierName,
        qaCustodianStatus: 'Containment Approved',
        qaCustodianNotes: qaVerificationNotes || `Containment Photo & Quarantine (${activeFlag.suspectQtyQuarantined || 0} pcs) verified by Quality Custodian.`,
        standardizationUpdates: {
          sopUpdated,
          pfmeaUpdated,
          controlPlanUpdated,
          onePointLessonIssued
        },
        status: activeFlag.status === 'Open' ? 'Contained' : activeFlag.status
      });
      setSuccessBanner('Quality Custodian approved Target Person Containment & Quarantine controls!');
      setTimeout(() => setSuccessBanner(null), 2000);
      return;
    }

    if (decision === 'start_sustenance') {
      const today = new Date();
      const d1 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const d2 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const d3 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      onUpdateRedFlag(activeFlag.id, {
        containmentStatus: 'Verified',
        containmentVerifiedBy: qaVerifierName,
        containmentVerifiedDate: activeFlag.containmentVerifiedDate || nowTs,
        qaCustodian: qaVerifierName,
        qaCustodianStatus: 'In Sustenance',
        qaCustodianNotes: qaVerificationNotes || 'Containment & CAPA verified by Quality. Point kept OPEN for mandatory 3-Month (30/60/90-Day) Sustenance tracking.',
        status: 'Under-Sustenance',
        sustenanceStartDate: activeFlag.sustenanceStartDate || todayStr,
        month1Check: activeFlag.month1Check || { month: 1, targetDays: 30, scheduledDate: d1, status: 'Pending', auditor: qaVerifierName },
        month2Check: activeFlag.month2Check || { month: 2, targetDays: 60, scheduledDate: d2, status: 'Pending', auditor: qaVerifierName },
        month3Check: activeFlag.month3Check || { month: 3, targetDays: 90, scheduledDate: d3, status: 'Pending', auditor: qaVerifierName },
        sustenanceAchieved: false,
        standardizationUpdates: {
          sopUpdated,
          pfmeaUpdated,
          controlPlanUpdated,
          onePointLessonIssued
        }
      });
      setSuccessBanner('Quality Custodian verified CAPA & initiated 3-Month Sustenance (Point Kept Open for 90 Days)!');
      setTimeout(() => {
        setSuccessBanner(null);
        if (onNavigateToTracker) onNavigateToTracker();
      }, 1200);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-5xl mx-auto my-4">
      
      {/* Top Header Matching Kaizen Sheet Form Look & Feel */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>RED FLAG 3-STAGE WORKFLOW FORMS</span>
              <span className="text-[10px] font-mono bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded uppercase">
                SFC / QA / RF-01
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Stage 1: Initiator (Defect Photo) ➔ Stage 2: Target Person (Containment &amp; Quarantine Photo) ➔ Stage 3: Quality (Verify &amp; 3M Sustenance)
            </p>
          </div>
        </div>

        {/* Context-Aware Quick Demo Presets */}
        <div className="flex items-center space-x-2">
          {workflowStage === 'initiator' && (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Initiator Presets:</span>
              <button
                type="button"
                onClick={() => loadInitiatorPreset('torque')}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
              >
                Torque Defect
              </button>
              <button
                type="button"
                onClick={() => loadInitiatorPreset('leak')}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
              >
                Hydraulic Leak
              </button>
            </>
          )}
          {workflowStage === 'target' && (
            <button
              type="button"
              onClick={loadTargetContainmentPreset}
              className="px-3 py-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fill Target Containment &amp; Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-ROLE WORKFLOW SELECTOR BAR (Initiator -> Target Person -> Quality) */}
      <div className="bg-slate-100 border-b border-slate-200 px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Stage 1 Button: Initiator */}
          <button
            type="button"
            onClick={() => { setWorkflowStage('initiator'); setError(null); }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
              workflowStage === 'initiator'
                ? 'bg-white border-rose-600 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full text-[11px] font-black font-mono flex items-center justify-center ${
                  workflowStage === 'initiator' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  1
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                  Initiator Form (Raise)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Raise Red Flag on Target Person &amp; upload <strong>Point-of-Defect Photo</strong> at T0
              </p>
            </div>
            <Camera className={`w-4 h-4 shrink-0 ${workflowStage === 'initiator' ? 'text-rose-600' : 'text-slate-400'}`} />
          </button>

          {/* Stage 2 Button: Target Person */}
          <button
            type="button"
            onClick={() => { setWorkflowStage('target'); setError(null); }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
              workflowStage === 'target'
                ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full text-[11px] font-black font-mono flex items-center justify-center ${
                  workflowStage === 'target' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                  Target Person Form
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Execute Containment, Quarantine WIP &amp; upload <strong>Containment Photo</strong> at T1
              </p>
            </div>
            <PackageCheck className={`w-4 h-4 shrink-0 ${workflowStage === 'target' ? 'text-amber-600' : 'text-slate-400'}`} />
          </button>

          {/* Stage 3 Button: Quality Custodian */}
          <button
            type="button"
            onClick={() => { setWorkflowStage('quality'); setError(null); }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
              workflowStage === 'quality'
                ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full text-[11px] font-black font-mono flex items-center justify-center ${
                  workflowStage === 'quality' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  3
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                  Quality (QA Custodian)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Verify Time-Gap Photos, Approve Quarantine &amp; Govern <strong>3M Sustenance</strong>
              </p>
            </div>
            <UserCheck className={`w-4 h-4 shrink-0 ${workflowStage === 'quality' ? 'text-emerald-600' : 'text-slate-400'}`} />
          </button>

        </div>
      </div>

      {/* Success Toast Banner */}
      {successBanner && (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* ========================================================================
          FORM 1: INITIATOR FORM (RAISE RED FLAG & POINT OF DEFECT PHOTO ONLY)
         ======================================================================== */}
      {workflowStage === 'initiator' && (
        <form onSubmit={handleInitiatorSubmit} className="p-6 space-y-6">
          
          {/* Time Gap & Role Separation Callout */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-rose-950 block uppercase tracking-wide">
                  Stage 1 Responsibility: Initiator (Originator) — Point of Defect Only
                </span>
                <p className="text-rose-800 leading-relaxed">
                  As the <strong>Initiator</strong>, you only log the defect details, assign the <strong>Target Person</strong> on whom the Red Flag is being raised, and upload the <strong>Point-of-Defect Photo</strong>. Because there is a physical shop-floor time gap before containment is completed, the <strong>Target Person</strong> will fill out the Immediate Containment &amp; Quarantine Controls form and upload the Containment Photo in Stage 2.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-rose-700 bg-white border border-rose-200 px-2.5 py-1 rounded shrink-0">
              Timestamp T0: Defect Spotted
            </span>
          </div>

          {/* Section 1: Initiator vs Target Person Assignment */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>1. Initiator (Raised By) &amp; Target Person (Raised On — Responsible for Containment)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Anyone Can Raise On Anyone</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Initiator Card */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">1A. Initiator (Person Raising Red Flag)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Initiator (T0)
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initiator Name &amp; Designation *</label>
                  <input
                    type="text"
                    required
                    value={raisedBy}
                    onChange={(e) => setRaisedBy(e.target.value)}
                    placeholder="e.g. Rajesh Patil (Shift In-charge)"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initiator Department</label>
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Point-of-Defect Timestamp</label>
                    <input
                      type="datetime-local"
                      value={raisedTimestamp}
                      onChange={(e) => setRaisedTimestamp(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Target Person Card */}
              <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">1B. Target Person (Raised On)</span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                    Must Take Containment
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Department (Raised Against) *</label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Production">Production</option>
                    <option value="Tooling & Die">Tooling &amp; Die</option>
                    <option value="Quality">Quality</option>
                    <option value="Logistics & Stores">Logistics &amp; Stores</option>
                    <option value="Supplier / Inward">Supplier / Inward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Person Name (Assigned for Containment &amp; Quarantine) *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetPerson}
                    onChange={(e) => setTargetPerson(e.target.value)}
                    placeholder="e.g. Vikram Singh (Maintenance Lead)"
                    className="w-full px-3 py-2 bg-amber-50/40 border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-amber-700 font-medium block mt-1">
                    → {targetPerson || 'Target Person'} will receive this Red Flag to execute Immediate Containment &amp; upload the Containment Photo.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shopfloor Location & Defect Classification */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>2. Station Location &amp; Defect Classification</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">5M Categorization</span>
            </div>

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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Line / Bay Area *</label>
                <input
                  type="text"
                  required
                  value={lineAreaName}
                  onChange={(e) => setLineAreaName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Station / Machine *</label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model / Part No. *</label>
                <input
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Red Flag Type</label>
                <select
                  value={redFlagType}
                  onChange={(e) => setRedFlagType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                >
                  <option value="Quality">Quality (Defect/Spec)</option>
                  <option value="Machine">Machine Breakdown</option>
                  <option value="Process">Process Parameter</option>
                  <option value="Safety">Safety &amp; EHS Hazard</option>
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
                  <option value="Machine">Machine (Tool/Fixture/Sensor)</option>
                  <option value="Method">Method (Standard/Process)</option>
                  <option value="Material">Material (Vendor/Raw Stock)</option>
                  <option value="Man">Man (Operator Skill/Handling)</option>
                  <option value="Measurement">Measurement (Gauge/Cal)</option>
                  <option value="Environment">Environment (Oil/Mist/Dust)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 text-rose-700 rounded-lg text-xs font-bold outline-none"
                >
                  <option value="Critical (Line Stop)">Critical (Line Stop)</option>
                  <option value="Major (Quarantine)">Major (Quarantine Lot)</option>
                  <option value="Moderate (Rework)">Moderate (Rework)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">QA Custodian (Stage 3)</label>
                <input
                  type="text"
                  value={qaCustodian}
                  onChange={(e) => setQaCustodian(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Point-of-Defect Description & Point-of-Defect Photo (Initiator Only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                <Camera className="w-4 h-4 text-rose-600" />
                <span>3. Point-of-Defect Evidence Photo &amp; Anomaly Description (Uploaded by Initiator)</span>
              </h3>
              <span className="text-[10px] font-mono text-rose-600 font-bold">* Point-of-Defect Photo Compulsory</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left: Point of Defect Photo Upload */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-rose-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Point of Defect Photo (At Detection T0)
                  </span>
                  <span className="text-[10px] text-rose-600 font-mono font-bold">{raisedTimestamp.replace('T', ' ')}</span>
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
                    <span>Capture Defect Photo</span>
                  </button>
                  <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Right: Defect Description + Deferred Containment Notice */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">
                    Point-of-Defect / Non-Conformity Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={redFlagDescription}
                    onChange={(e) => setRedFlagDescription(e.target.value)}
                    placeholder="Describe exact anomaly observed, spec deviation, affected station/part, and why this Red Flag is being raised on the Target Person..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:border-slate-900 outline-none leading-relaxed"
                  />
                </div>

                {/* Explicit Deferred Containment Card */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Containment Photo &amp; Quarantine Deferred to Stage 2
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                      Time-Gap Workflow
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Containment Photo and Quarantine Controls will be entered by <strong>{targetPerson || 'the Target Person'}</strong> ({targetDepartment}) in <strong>Stage 2: Target Person Form</strong> after physical containment is executed on the shop floor.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

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
              className="px-7 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>RAISE RED FLAG &amp; ASSIGN TO TARGET PERSON ({targetDepartment.toUpperCase()})</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================
          FORM 2: TARGET PERSON FORM (IMMEDIATE CONTAINMENT, QUARANTINE & PHOTO)
         ======================================================================== */}
      {workflowStage === 'target' && (
        <form onSubmit={handleTargetPersonSubmit} className="p-6 space-y-6">
          
          {/* Select Red Flag Assigned to Target Person */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-amber-700" />
                <span>Stage 2 Responsibility: Target Person — Immediate Containment &amp; Quarantine Form</span>
              </span>
              <p className="text-xs text-amber-900">
                Select the Red Flag raised against the Target Person to log physical quarantine controls, capture the <strong>Containment Photo</strong>, and record the <strong>Time Gap</strong> since detection.
              </p>
            </div>
            <div className="min-w-[270px]">
              <label className="block text-[10px] font-mono font-bold text-amber-900 uppercase mb-1">
                Select Red Flag Assigned to Target Person:
              </label>
              <select
                value={selectedFlagId}
                onChange={(e) => setSelectedFlagId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-400 rounded-lg text-xs font-bold text-slate-900 outline-none"
              >
                {redFlags.map(rf => (
                  <option key={rf.id} value={rf.id}>
                    {rf.redFlagNo} — Target: {rf.targetPerson || rf.targetDepartment} ({rf.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFlag ? (
            <>
              {/* Visual Time-Gap Comparison: Point of Defect Photo (Initiator) vs Containment Photo (Target Person) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>1. Point-of-Defect vs. Containment Photo (Time-Gap Verification)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Initiator Raised: <strong>{activeFlag.raisedBy}</strong> ({activeFlag.raisedByDepartment}) ➔ Assigned Target Person: <strong className="text-amber-700">{activeFlag.targetPerson}</strong> ({activeFlag.targetDepartment})
                    </p>
                  </div>

                  {/* Time Gap Badge */}
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time Gap:</span>
                    <strong className="text-amber-400">
                      {computeTimeGapLabel(
                        activeFlag.raisedTimestamp || `${activeFlag.raisedDate} 08:30`,
                        containmentTimestamp.replace('T', ' ')
                      )}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Initiator's Point of Defect Photo (Read-Only from Stage 1) */}
                  <div className="space-y-2.5 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        Initiator: Point of Defect Photo (T0)
                      </span>
                      <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold">
                        {activeFlag.raisedTimestamp || `${activeFlag.raisedDate} 08:30`}
                      </span>
                    </div>
                    <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/30 aspect-video flex items-center justify-center">
                      {activeFlag.evidencePhoto ? (
                        <img src={activeFlag.evidencePhoto} alt="Point of Defect" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">No Point-of-Defect Photo</span>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Initiator Defect Description:</span>
                      <p className="font-medium mt-0.5">{activeFlag.redFlagDescription}</p>
                    </div>
                  </div>

                  {/* Right: Target Person's Containment Photo Upload (T1) */}
                  <div className="space-y-2.5 bg-white p-4 rounded-xl border-2 border-emerald-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Target Person: Containment Photo (T1) *
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        {containmentTimestamp.replace('T', ' ')}
                      </span>
                    </div>
                    <div className="border-2 border-dashed border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/30 aspect-video flex items-center justify-center">
                      <img src={photoAfter} alt="Containment Photo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCameraTarget('after')}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Capture Containment Photo</span>
                      </button>
                      <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload Photo</span>
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

              {/* Section 2: Immediate Containment & Quarantine Controls Input Form (By Target Person) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                    <PackageCheck className="w-4 h-4 text-amber-600" />
                    <span>2. Immediate Containment &amp; Quarantine Controls (Target Person Responsibility)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-700 font-bold">&lt;2 Hours Containment SLA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Person Executing *</label>
                    <input
                      type="text"
                      required
                      value={targetActionBy}
                      onChange={(e) => setTargetActionBy(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Containment Timestamp (T1) *</label>
                    <input
                      type="datetime-local"
                      value={containmentTimestamp}
                      onChange={(e) => setContainmentTimestamp(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quarantine Hold Tag No. *</label>
                    <input
                      type="text"
                      required
                      value={quarantineTagNo}
                      onChange={(e) => setQuarantineTagNo(e.target.value)}
                      placeholder="e.g. QT-RF-2026-04"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quarantine Cage / Location *</label>
                    <input
                      type="text"
                      required
                      value={quarantineLocation}
                      onChange={(e) => setQuarantineLocation(e.target.value)}
                      placeholder="e.g. MF1 Red Hold Cage B"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                {/* Quarantine & 100% Sorting Quantities */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200">
                  <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200">
                    <label className="block text-[11px] font-bold text-rose-800 uppercase mb-1">Suspect WIP Quarantined (Pcs) *</label>
                    <input
                      type="number"
                      min="0"
                      value={suspectQtyQuarantined}
                      onChange={(e) => setSuspectQtyQuarantined(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded text-sm font-mono font-black text-rose-700 outline-none"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">100% Sorting Inspected (Pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={sortingQtyInspected}
                      onChange={(e) => setSortingQtyInspected(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-sm font-mono font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                    <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">Sorting OK Released (Pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={sortingQtyOk}
                      onChange={(e) => setSortingQtyOk(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-sm font-mono font-bold text-emerald-700 outline-none"
                    />
                  </div>
                  <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                    <label className="block text-[11px] font-bold text-amber-800 uppercase mb-1">Rejected / Scrap (Pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={sortingQtyRejected}
                      onChange={(e) => setSortingQtyRejected(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-sm font-mono font-bold text-amber-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">
                    Immediate Containment &amp; Quarantine Action Details *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={containmentAction}
                    onChange={(e) => setContainmentAction(e.target.value)}
                    placeholder="Detail physical containment executed by Target Person: machine stop, boundary sample check, WIP batch quarantine, and temporary countermeasure..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:border-slate-900 outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 3: Target Person Root Cause (5-Why) & Permanent Corrective Action */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 font-mono">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>3. Target Person 5-Why Root Cause &amp; Permanent Corrective Action (CAPA)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Submitted for Quality Review</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Why 1 (Immediate Cause)</label>
                    <input
                      type="text"
                      value={why1}
                      onChange={(e) => setWhy1(e.target.value)}
                      placeholder="Why did the parameter/defect deviate?"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Why 2 (Technical Cause)</label>
                    <input
                      type="text"
                      value={why2}
                      onChange={(e) => setWhy2(e.target.value)}
                      placeholder="Why did the component/setting slip?"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Why 3 (Control / Detection Gap)</label>
                    <input
                      type="text"
                      value={why3}
                      onChange={(e) => setWhy3(e.target.value)}
                      placeholder="Why did existing check fail to prevent it?"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-800 mb-1 uppercase">Final Systemic Root Cause (5-Why)</label>
                    <input
                      type="text"
                      value={rootCause5Why}
                      onChange={(e) => setRootCause5Why(e.target.value)}
                      placeholder="Systemic root cause identified..."
                      className="w-full px-3 py-1.5 bg-rose-50/40 border border-rose-300 rounded-lg text-xs font-bold text-rose-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                    Permanent Corrective Action / Poka-Yoke Deployed (CAPA)
                  </label>
                  <textarea
                    rows={2}
                    value={systematicPermanentAction}
                    onChange={(e) => setSystematicPermanentAction(e.target.value)}
                    placeholder="Specify hardware interlock, poka-yoke, or preventive standard deployed to eliminate recurrence..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 gap-3">
                <button
                  type="button"
                  onClick={() => setWorkflowStage('initiator')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  ← Back to Stage 1 (Initiator)
                </button>

                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>SUBMIT CONTAINMENT PHOTO &amp; QUARANTINE CONTROLS ➔ QUALITY (STAGE 3)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No Red Flags available. Raise a Red Flag in Stage 1 first.
            </div>
          )}
        </form>
      )}

      {/* ========================================================================
          FORM 3: QUALITY (QA CUSTODIAN) FORM (VERIFICATION & 3M SUSTENANCE)
         ======================================================================== */}
      {workflowStage === 'quality' && (
        <div className="p-6 space-y-6">
          
          {/* Quality Custodian Header & Flag Selector */}
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Stage 3 Responsibility: Quality (QA Custodian) — Verification &amp; 3M Sustenance</span>
              </span>
              <p className="text-xs text-emerald-900">
                Quality reviews the Initiator's <strong>Point-of-Defect Photo (T0)</strong> alongside the Target Person's <strong>Containment Photo (T1)</strong>, verifies quarantine controls, and governs the 90-day sustenance window.
              </p>
            </div>
            <div className="min-w-[270px]">
              <label className="block text-[10px] font-mono font-bold text-emerald-900 uppercase mb-1">
                Select Red Flag for QA Custodian Review:
              </label>
              <select
                value={selectedFlagId}
                onChange={(e) => setSelectedFlagId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-emerald-400 rounded-lg text-xs font-bold text-slate-900 outline-none"
              >
                {redFlags.map(rf => (
                  <option key={rf.id} value={rf.id}>
                    {rf.redFlagNo} — {rf.stationName} ({rf.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFlag && (
            <>
              {/* Complete Audit Summary: Initiator (T0) -> Target Person (T1) -> Time Gap */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div className="text-xs">
                    <span className="font-mono font-black text-rose-700">{activeFlag.redFlagNo}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span>Initiator: <strong>{activeFlag.raisedBy}</strong> ({activeFlag.raisedByDepartment})</span>
                    <span className="mx-2 text-slate-300">➔</span>
                    <span>Target Person: <strong>{activeFlag.targetPerson}</strong> ({activeFlag.targetDepartment})</span>
                  </div>
                  <span className="text-xs font-mono bg-slate-900 text-amber-400 px-3 py-1 rounded-lg font-bold">
                    Time Gap: {activeFlag.containmentTimeGap || computeTimeGapLabel(activeFlag.raisedTimestamp || `${activeFlag.raisedDate} 08:30`, activeFlag.containmentTimestamp)}
                  </span>
                </div>

                {/* Side-by-Side Photo Audit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-700 uppercase">1. Point of Defect Photo (Initiator)</span>
                      <span className="font-mono text-[10px] text-slate-500">{activeFlag.raisedTimestamp || activeFlag.raisedDate}</span>
                    </div>
                    <div className="aspect-video bg-rose-50/30 rounded-lg overflow-hidden border border-rose-100 flex items-center justify-center">
                      {activeFlag.evidencePhoto ? (
                        <img src={activeFlag.evidencePhoto} alt="Defect" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">No Defect Photo</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Anomaly:</strong> {activeFlag.redFlagDescription}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 uppercase">2. Containment Photo (Target Person)</span>
                      <span className="font-mono text-[10px] text-slate-500">{activeFlag.containmentTimestamp || activeFlag.actionTakenDate || 'Pending'}</span>
                    </div>
                    <div className="aspect-video bg-emerald-50/30 rounded-lg overflow-hidden border border-emerald-100 flex items-center justify-center">
                      {activeFlag.countermeasurePhoto || activeFlag.closureEvidence ? (
                        <img src={activeFlag.countermeasurePhoto || activeFlag.closureEvidence} alt="Containment" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-xs text-amber-700 font-bold block">Containment Photo Not Yet Uploaded by Target Person</span>
                          <button
                            type="button"
                            onClick={() => setWorkflowStage('target')}
                            className="mt-2 px-3 py-1 bg-amber-500 text-slate-950 rounded text-[11px] font-bold cursor-pointer"
                          >
                            Switch to Stage 2 (Target Person Form)
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Target Containment Action:</strong> {activeFlag.containmentAction || 'Pending Target Person input'}
                    </p>
                  </div>
                </div>

                {/* Quarantine Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Quarantined WIP</span>
                    <span className="text-sm font-mono font-black text-rose-700">{activeFlag.suspectQtyQuarantined || 0} pcs</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Quarantine Tag No</span>
                    <span className="text-sm font-mono font-bold text-slate-800">{activeFlag.quarantineTagNo || `QT-${activeFlag.redFlagNo}`}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Quarantine Location</span>
                    <span className="text-xs font-bold text-slate-800">{activeFlag.quarantineLocation || 'Red Hold Bay'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Containment Status</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">{activeFlag.containmentStatus || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Quality Custodian Sign-Off & Standardization Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                  Quality (QA Custodian) Verification &amp; Standardization Sign-Off
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">QA Custodian Name</label>
                    <input
                      type="text"
                      value={qaVerifierName}
                      onChange={(e) => setQaVerifierName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quality Verification Remarks</label>
                    <input
                      type="text"
                      value={qaVerificationNotes}
                      onChange={(e) => setQaVerificationNotes(e.target.value)}
                      placeholder="Enter QA verification notes on quarantine lot & poka-yoke..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Standardization Checkboxes */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-2">
                    Document Standardization Verified by Quality:
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sopUpdated} onChange={(e) => setSopUpdated(e.target.checked)} />
                      <span>SOP Updated</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pfmeaUpdated} onChange={(e) => setPfmeaUpdated(e.target.checked)} />
                      <span>PFMEA Revised</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={controlPlanUpdated} onChange={(e) => setControlPlanUpdated(e.target.checked)} />
                      <span>Control Plan Revised</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={onePointLessonIssued} onChange={(e) => setOnePointLessonIssued(e.target.checked)} />
                      <span>OPL Training Issued</span>
                    </label>
                  </div>
                </div>

                {/* Quality Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleQualityVerifySubmit('reject_containment')}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    ✕ Reject Containment (Send Back to Target Person)
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQualityVerifySubmit('approve_containment')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      ✓ Verify Containment &amp; Quarantine
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQualityVerifySubmit('start_sustenance')}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>APPROVE CAPA &amp; START 3-MONTH SUSTENANCE (KEEP OPEN)</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Live Camera Modal */}
      {cameraTarget && (
        <CameraModal
          isOpen={true}
          title={cameraTarget === 'before' ? 'Initiator: Capture Point-of-Defect Photo (T0)' : 'Target Person: Capture Containment Photo (T1)'}
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
