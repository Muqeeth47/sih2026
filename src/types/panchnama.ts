// src/types/panchnama.ts
// NDPS Act Form 'F' — Section 52 Seizure Panchnama schema

export interface AccusedDetails {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  fatherName: string;
  address: string;
  district: string;
  state: string;
  nationality: string;
  idType: 'aadhaar' | 'passport' | 'voter_id' | 'driving_license' | 'other';
  idNumber: string;
}

export interface SeizureItem {
  substanceName: string;
  apparentForm: 'powder' | 'tablet' | 'liquid' | 'plant_material' | 'resin' | 'oil' | 'crystal' | 'other';
  weightGrams: number;
  netWeightGrams: number;
  grossWeightGrams: number;
  packagingType: string;
  numberOfPackets: number;
  colorDescription: string;
  odorDescription: string;
  reagentTestResult: string;
  sampleDrawn: boolean;
  sampleWeightGrams?: number;
}

export interface WitnessDetails {
  name: string;
  designation: string;
  badge?: string;
  signature?: string;
}

export interface OfficerDetails {
  name: string;
  designation: string;
  badgeNumber: string;
  unit: string;
  phoneNumber?: string;
}

export interface PanchnamaForm {
  id: string;
  formNumber: string;
  /** NDPS Act Section 52 reference */
  ndpsSection: 'Section 52' | 'Section 43' | 'Section 41';
  caseNumber: string;

  seizureDate: string;
  seizureTime: string;

  seizureLocation: {
    description: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    nearestLandmark?: string;
    highwayRoute?: string;
  };

  accused: AccusedDetails[];
  seizureItems: SeizureItem[];

  /** SHA-256 hashes of evidence photos */
  evidencePhotoHashes: string[];
  /** Embedded image Data URLs or URLs of evidence photos */
  evidencePhotoDataUrls?: string[];
  evidencePhotoUrls?: string[];
  /** IDs of scan results linked to this panchnama */
  linkedScanIds: string[];

  investigatingOfficer: OfficerDetails;
  witnesses: WitnessDetails[];
  supervisingOfficer?: OfficerDetails;

  vehicleSeized: boolean;
  vehicleDetails?: {
    registrationNumber: string;
    make: string;
    model: string;
    color: string;
  };

  remarksNarrative: string;
  legalSections: string[];

  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'court_filed' | 'closed';

  /** Generated PDF blob URL */
  pdfBlobUrl?: string;
  pdfGeneratedAt?: string;
}
