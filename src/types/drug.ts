// src/types/drug.ts
// Drug testing types for DRUG-SEAL AI

export type ReagentType =
  | 'marquis'
  | 'scott'
  | 'duquenois_levine'
  | 'ehrlich'
  | 'mandelin'
  | 'mecke'
  | 'froehde'
  | 'nitric_acid'
  | 'dille_koppanyi';

export type SubstanceClass =
  | 'cannabis'
  | 'cocaine'
  | 'heroin'
  | 'mdma_amphetamines'
  | 'methamphetamine'
  | 'fentanyl'
  | 'opiates'
  | 'benzodiazepines'
  | 'barbiturates'
  | 'ketamine'
  | 'lsd'
  | 'methaqualone'
  | 'synthetic_cannabinoids'
  | 'psychedelics'
  | 'unknown'
  | 'negative';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'inconclusive';
export type TestStatus = 'positive' | 'negative' | 'inconclusive' | 'error';

export interface ColorReading {
  r: number;
  g: number;
  b: number;
  /** CIELAB L* value */
  L: number;
  /** CIELAB a* value */
  a: number;
  /** CIELAB b* value */
  bStar: number;
}

export interface ReagentReference {
  reagentType: ReagentType;
  substanceClass: SubstanceClass;
  expectedColorName: string;
  expectedHex: string;
  labL: number;
  labA: number;
  labB: number;
  /** ΔE threshold for positive match */
  deltaEThreshold: number;
  description: string;
  unodc_reference: string;
}

export interface BlurAnalysis {
  laplacianVariance: number;
  isSharp: boolean;
  warningThreshold: number;
  message: string;
}

export interface GlareAnalysis {
  hasGlare: boolean;
  glarePercentage: number;
  saturationWarning: boolean;
  message?: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  officerBadge: string;
  reagentType: ReagentType;
  capturedColor: ColorReading;
  deltaE: number;
  matchedSubstance: SubstanceClass;
  matchedReagentRef: ReagentReference | null;
  confidence: ConfidenceLevel;
  testStatus: TestStatus;
  blurAnalysis: BlurAnalysis;
  glareAnalysis: GlareAnalysis;
  /** Client-side SHA-256 hash of the captured image */
  photoHash: string;
  /** Base64 JPEG of the captured frame */
  photoDataUrl?: string;
  gps: GPSCoordinate;
  /** Gemini AI analysis result (when online) */
  aiAnalysis?: AIAnalysisResult | null;
  /** Whether this record is pending cloud sync */
  syncPending: boolean;
  syncedAt?: string;
  caseId?: string;
}

export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  timestamp: string;
  source: 'device_gps' | 'mock';
}

export interface AIAnalysisResult {
  substance: string;
  confidence: number;
  purity?: string;
  adulterants?: string[];
  tamperDetected: boolean;
  pouchLotNumber?: string;
  pouchExpiry?: string;
  courtSummary: string;
  reason?: string;
  batchId?: string;
  additionalNotes?: string;
}

export interface OfflineQueueEntry {
  id: string;
  type: 'scan_result' | 'panchnama';
  data: ScanResult | unknown;
  createdAt: string;
  retryCount: number;
}
