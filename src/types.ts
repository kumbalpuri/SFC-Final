export interface OpenImpactAction {
  id: string;
  kaizenSrNo: string;
  kaizenTitle: string;
  department: string;
  category: 'Man' | 'Machine' | 'Material' | 'Method' | 'Measurement' | 'Safety' | 'Horizontal Deployment';
  impactDescription: string;
  assignedOwner: string;
  targetDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
  actionTaken: string;
  closedDate?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface ImpactItem {
  required: boolean;
  description?: string;
  assignedTo: string; // Default is the Kaizen initiator
  status: 'Pending' | 'Completed' | 'Not Required';
  completedBy?: string;
  completedDate?: string;
  notes?: string;
}

export interface AllocatedResource {
  id: string;
  name: string;
  role: string; // e.g., Quality Engineer, Safety Officer, Process Lead
  taskAssigned: string; // e.g. "PFMEA Revision", "PFD Drawing", "Safety Risk Assessment"
}

export interface KaizenImpactAssessment {
  decidedInReview: boolean;
  reviewedDate?: string;
  reviewedBy?: string;
  fiveMChange: ImpactItem;
  safetyImpact: ImpactItem;
  pfdUpdate: ImpactItem;
  pfmeaUpdate: ImpactItem;
  allocatedResources: AllocatedResource[];
  overallClosureStatus: 'Pending Review' | 'Actions Allocated' | 'In-Progress' | 'Fully Closed';
  closedBy?: string;
  closureDate?: string;
  closureRemarks?: string;
}

export interface Kaizen {
  id: string;
  srNo: string;
  month: string;
  suggestionDate: string;
  title: string;
  problemBefore: string;
  counterMeasureAfter: string;
  area: string;
  minifactory: string;
  location: string;
  machine: string;
  closingTargetDate: string;
  implementedDate: string;
  costSave: number;
  benefits: {
    p: boolean; // Productivity
    q: boolean; // Quality
    c: boolean; // Cost
    d: boolean; // Delivery
    s: boolean; // Safety
    m: boolean; // Morale
  };
  ideaBy: string;
  implementedBy: string;
  preparedBy: string;
  approvedBy: string;
  verifiedBy: string;
  status: 'Pending' | 'Approved' | 'Good Point' | 'Rejected';
  classification: 'Kaizen' | 'Good Point' | 'Pending' | 'None';
  remark: string;
  photoBefore: string; // Base64 or image URL
  photoAfter: string;  // Base64 or image URL
  result: string;
  impactAssessment?: KaizenImpactAssessment;
  cftVotes?: { voterName: string; rank: 1 | 2 | 3 }[];
  createdAt: string;
}

export interface RedFlagStageAudit {
  stage: 'Detection' | 'Containment' | 'RootCause' | 'CAPA' | 'Effectiveness' | 'Sustenance';
  completedAt: string;
  completedBy: string;
  signOffRole?: string;
  notes?: string;
}

export interface MonthSustenanceCheck {
  month: 1 | 2 | 3;
  targetDays: 30 | 60 | 90;
  scheduledDate: string;
  auditDate?: string;
  auditor?: string;
  status: 'Pending' | 'Passed' | 'Recurrence Detected';
  observations?: string;
  photoEvidence?: string;
}

export interface RedFlag {
  id: string;
  srNo: string;
  raisedDate: string;
  raisedBy: string;
  raisedByDepartment: string;
  raisedByRole?: string;
  mfName: string;
  lineAreaName: string;
  modelName: string;
  stationName: string;
  redFlagNo: string;
  status: 'Open' | 'Contained' | 'In-Progress' | 'Under-Sustenance' | 'Closed';
  redFlagType: 'Quality' | 'Process' | 'Machine' | 'Safety' | 'Material' | '5S';
  redFlagSubType: string;
  severity?: 'Critical (Line Stop)' | 'Major (Quarantine)' | 'Moderate (Rework)';
  category5M?: 'Man' | 'Machine' | 'Material' | 'Method' | 'Measurement' | 'Environment';
  responsibleDepartment: string;
  targetDepartment: string;
  targetPerson: string;
  redFlagDescription: string;
  evidencePhoto: string;
  countermeasurePhoto?: string;
  teamLeader: string;
  repetitiveOccurrence: 'First Time' | 'Repetitive';
  closureResponsibility: string;

  // QA Custodianship (QA is custodian of Red Flag)
  qaCustodian: string;
  qaCustodianStatus?: 'Review Pending' | 'Containment Approved' | 'CAPA Verified' | 'In Sustenance' | 'Closed Approved';
  qaCustodianNotes?: string;

  // Stage 2: Immediate Containment
  containmentStatus?: 'Pending' | 'Contained' | 'Verified';
  suspectQtyQuarantined?: number;
  containmentAction?: string;
  containmentVerifiedBy?: string;
  containmentVerifiedDate?: string;
  immediateActionTaken?: string;
  actionTakenBy?: string;
  actionTakenDate?: string;

  // Stage 3: Cross-Module Escalation & Linkages
  linkedPpsrId?: string;
  linkedPpsrNo?: string;
  linkedKaizenId?: string;
  linkedKaizenNo?: string;
  linkedFiveSRedTagId?: string;
  linkedFiveSRedTagNo?: string;

  // Stage 4: Root Cause (5-Why) & Permanent Action
  why1?: string;
  why2?: string;
  why3?: string;
  why4?: string;
  rootCause5Why?: string;
  systematicPermanentAction?: string;
  targetDate: string;
  standardizationUpdates?: {
    sopUpdated: boolean;
    pfmeaUpdated: boolean;
    controlPlanUpdated: boolean;
    onePointLessonIssued: boolean;
  };

  // Stage 5: 3-Month Sustenance Tracking (Point kept OPEN till 3 months sustenance is achieved)
  sustenanceStartDate?: string;
  month1Check?: MonthSustenanceCheck;
  month2Check?: MonthSustenanceCheck;
  month3Check?: MonthSustenanceCheck;
  sustenanceAchieved?: boolean;

  // Closure Sign-Offs (Authorized only after 3-month sustenance achieved by QA Custodian)
  validationTrialShifts?: number;
  validationTrialResults?: string;
  closureDate?: string;
  closureEvidence?: string;
  approvedByQA?: string;
  approvedByProduction?: string;

  // Audit trail
  stageHistory?: RedFlagStageAudit[];
  createdAt: string;
}

export interface FiveSChecklistItem {
  id: string;
  pillar: '1S-Sort' | '2S-SetInOrder' | '3S-Shine' | '4S-Standardize' | '5S-Sustain';
  checkpoint: string;
  criteria: string;
  standard: string;
  score: number; // 1 to 5
  findingNotes?: string;
  photoUrl?: string;
}

export interface FiveSActionItem {
  id: string;
  auditId?: string;
  pillar: '1S' | '2S' | '3S' | '4S' | '5S';
  findingDescription: string;
  rootCause?: string;
  correctiveAction: string;
  area: string;
  assignedTo: string;
  targetDate: string;
  completedDate?: string;
  status: 'Open' | 'In Progress' | 'Verified Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  photoBefore?: string;
  photoAfter?: string;
  linkedKaizenId?: string;
  createdAt: string;
}

export interface FiveSRedTag {
  id: string;
  tagNo: string;
  dateTagged: string;
  taggedBy: string;
  itemDescription: string;
  category: 'Raw Material' | 'WIP' | 'Tool / Jig / Fixture' | 'Machine Spare' | 'Defective Part' | 'Packaging / Pallet' | 'Documentation / Furniture';
  quantity: string;
  areaFound: string;
  reason: 'Defective / Damaged' | 'Obsolete / Expired' | 'Surplus / Excess Stock' | 'Unidentified' | 'No longer in use' | 'Scrap';
  estimatedValueInr?: number;
  actionRecommended: 'Scrap' | 'Return to Supplier' | 'Relocate to Red Tag Area' | 'Transfer to other Dept' | 'Sell / Salvage' | 'Repair / Re-machine';
  dispositionDeadline: string;
  dispositionApprovedBy?: string;
  disposedDate?: string;
  dispositionNotes?: string;
  status: 'Tagged' | 'In Holding Area' | 'Approved for Disposal' | 'Disposed / Closed';
  photoUrl?: string;
  createdAt: string;
}

export interface FiveSSocLog {
  id: string;
  dateFound: string;
  machineOrArea: string;
  contaminantType: 'Oil Leak / Drip' | 'Coolant Mist' | 'Metal Chips / Swarf' | 'Dust / Powder' | 'Water / Condensate' | 'Pneumatic Exhaust';
  sourceDescription: string;
  countermeasurePlanned: string;
  owner: string;
  targetDate: string;
  status: 'Open' | 'Eliminated';
  photoUrl?: string;
  createdAt: string;
}

export interface FiveSAudit {
  id: string;
  auditDate: string;
  area: string;
  plantZone?: string;
  auditor: string;
  shift?: 'Shift 1' | 'Shift 2' | 'General Shift';
  auditType?: 'Daily Gemba' | 'Weekly Area Audit' | 'Monthly Cross-Plant Audit';
  sortScore: number;       // 1-5
  setInOrderScore: number; // 1-5
  shineScore: number;      // 1-5
  standardizeScore: number;// 1-5
  sustainScore: number;    // 1-5
  totalScore: number;      // average percentage (0-100)
  grade?: 'A+' | 'A' | 'B' | 'C';
  remarks: string;
  status: 'Excellent' | 'Good' | 'Needs Improvement';
  checklist?: FiveSChecklistItem[];
  strengths?: string[];
  opportunities?: string[];
  actionItems?: FiveSActionItem[];
  photoBefore?: string;
  photoAfter?: string;
  createdAt: string;
}

export interface SafetyIncident {
  id: string;
  incidentDate: string;
  type: 'Unsafe Act' | 'Unsafe Condition' | 'Near Miss' | 'Minor Injury';
  area: string;
  description: string;
  reportedBy: string;
  immediateAction: string;
  status: 'Open' | 'Closed';
  targetDate: string;
  closedDate: string;
  createdAt: string;
}

export interface PpsrReport {
  id: string;
  ppsrNo: string;
  title: string;
  problemStatement: string;
  rootCauseAnalysis: string; // fallback string
  containmentAction: string; // fallback string
  permanentCorrectiveAction: string; // fallback string
  validationCheck: string; // fallback string
  status: 'Open' | 'In-Progress' | 'Closed';
  targetDate: string;
  leadOwner: string;
  createdAt: string;

  // Expanded BE detailed fields
  projectLeader?: string;
  teamMembers?: string;
  plant?: string;
  lineStation?: string;
  productComponent?: string;
  amountDefects?: string;
  discoveredOn?: string;
  discoveredBy?: string;
  repeatCase?: 'yes' | 'no';
  sketchPhoto?: string;
  initialEvidenceType?: 'data' | 'photo' | 'both';
  initialDefectTrendData?: Array<{ date: string; defectsCount: number; stage?: string }>;

  factsAnalysis?: {
    whatIs: string; whatIsNot: string;
    whereIs: string; whereIsNot: string;
    howIs: string; howIsNot: string;
    whenIs: string; whenIsNot: string;
  };

  containmentActionsList?: Array<{
    no: number;
    action: string;
    responsible: string;
    date: string;
    status: 'planned' | 'in-progress' | 'implemented' | 'proven';
  }>;

  ishikawa?: {
    man: string[];
    machine: string[];
    material: string[];
    methods: string[];
    milieu: string[];
    measurement: string[];
  };

  causeLocalizationApproach?: 'fishbone' | 'psq' | 'both';
  psqTreeData?: PsqTreeData;

  fiveWhysList?: {
    column1: string[];
    column2: string[];
    column3: string[];
  };

  correctiveActionsList?: Array<{
    no: number;
    measure: string;
    responsible: string;
    deadline: string;
    status: 'planned' | 'in-progress' | 'completed' | 'proven';
  }>;

  effectivenessEvidence?: string;
  effectivenessChartData?: Array<{ name: string; value: number }>;
  evidenceType?: 'data' | 'photo' | 'both';
  defectTrendData?: Array<{ date: string; defectsCount: number; stage?: string }>;

  standardizationList?: Array<{
    no: number;
    measure: string;
    responsible: string;
    date: string;
    status: 'planned' | 'in-progress' | 'completed' | 'proven';
  }>;

  readAcrossList?: Array<{
    no: number;
    proposal: string;
    responsible: string;
    deadline: string;
  }>;
  readAcrossExplanation?: string;

  completionSignatures?: {
    projectLeader: string;
    steeringCommittee: string;
    completedOn: string;
  };

  // Meeting spreadsheet review fields
  jiraNumber?: string;
  week?: string;
  coach?: string;
  cft?: string;
  stdStatusMF?: string;
  stdDate?: string;
  effDaysStd?: number;
  responsibility?: string;
  ppsrEndDate?: string;
  effDaysClosePpsr?: number;
  prodQtyBefore?: number;
  rejectedQtyBefore?: number;
  pctBefore?: number;
  prodQtyAfter?: number;
  rejectedQtyAfter?: number;
  pctAfter?: number;
  effectivityText?: string;
  custDemandQtyMonth?: number;
  custDemandQtyAnnum?: number;
  qtyMonthBeforeRejPct?: number;
  qtyMonthAfterRejPct?: number;
  qtyMonthSavedRejPct?: number;
  perSetRejectionCost?: number;
  costSavePerMonth?: number;
  costSavePerAnnum?: number;
  remarks?: string;

  // Committee Presentation & Review Feedback
  presentationFeedback?: PpsrCommitteeFeedback[];
  committeeDecision?: 'Approved' | 'Re-work Needed' | 'In Review';
  committeeDecisionDate?: string;
}

export interface PpsrCommitteeFeedback {
  id: string;
  stepNumber: number; // 1-8
  stepTitle: string;
  reviewerName: string;
  feedbackType: 'revision_needed' | 'clarification' | 'approved' | 'general';
  comment: string;
  createdAt: string;
  resolved?: boolean;
}

export interface PpsrMeetingLog {
  id: string;
  meetingDate: string;
  chairperson: string;
  attendees: string;
  keyDiscussionPoints: string;
  discussedPpsrIds: string[]; // IDs of PPSRs reviewed in this session
  nextReviewDate: string;
  createdAt: string;
}

export type PsqNodeStatus = 'active' | 'eliminated' | 'target' | 'pending';

export interface PsqTreeNode {
  id: string;
  title: string;
  label?: string; // e.g. "ΔM", "ΔP", "Parts", "Assembly process"
  status: PsqNodeStatus; // 'eliminated' -> shows diagonal strike-through slash & shaded box; 'target' -> highlighted Red X; 'active' -> active branch
  explanation?: string; // reason for elimination or observation
  children?: PsqTreeNode[];
}

export interface PsqChildPartSwapItem {
  id: string;
  partName: string;
  wowInBobValue: string;
  wowInBobResult: 'BOB' | 'WOW' | '';
  bobInWowValue: string;
  bobInWowResult: 'BOB' | 'WOW' | '';
  isDefective: boolean;
  status: 'eliminated' | 'target' | 'pending';
  notes?: string;
}

export interface PsqComponentSearchData {
  productName?: string;
  productNumber?: string;
  customerName?: string;
  testResultSpecification?: string;

  // Stage 0: Measurement System (ΔM vs ΔP)
  stage0: {
    bobOriginal: string;
    wowOriginal: string;
    bobRepeat1: string;
    wowRepeat1: string;
    bobRepeat2: string;
    wowRepeat2: string;
    bobRepeat3: string;
    wowRepeat3: string;
    measurementGood: boolean;
    deltaMStatus: 'eliminated' | 'target' | 'pending';
    deltaPStatus: 'active' | 'eliminated' | 'pending';
    notes?: string;
  };

  // Stage 1: Disassembly & Re-assembly of BOB & WOW parts (Process vs Product)
  stage1: {
    bobRepeat1: string;
    wowRepeat1: string;
    bobRepeat2: string;
    wowRepeat2: string;
    bobRepeat3: string;
    wowRepeat3: string;
    processGood: boolean;
    assemblyProcessStatus: 'eliminated' | 'target' | 'pending';
    partsStatus: 'active' | 'eliminated' | 'pending';
    notes?: string;
  };

  // Stage 2: Swapping Individual Child Parts in BOB & WOW Product
  stage2: {
    childParts: PsqChildPartSwapItem[];
    contributingPartName?: string;
    notes?: string;
  };

  activeStage?: 0 | 1 | 2;
}

export interface PsqTreeData {
  projectStatement?: string;
  bigXTarget?: string;
  ftqRejectionRate?: string;
  estimatedCost?: string;
  treeType?: 'psq_standard' | 'delta_m_delta_p' | 'swap_analysis';
  rootNodes?: PsqTreeNode[];
  swapData?: PsqComponentSearchData;
}

export type UserPersona = 'operator' | 'committee' | 'manager';


