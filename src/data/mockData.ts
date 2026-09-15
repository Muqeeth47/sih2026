// src/data/mockData.ts
// Centralised reference data for DRUG-SEAL AI
// NOTE: MOCK_SCAN_RESULTS and MOCK_MAP_SEIZURES have been removed.
// The Evidence Vault and Seizure Map now pull live data directly from
// Supabase (seizures + scan_assays tables). See src/app/vault/page.tsx
// and src/components/analytics/SeizureMap.tsx.

import type { PanchnamaForm } from '@/types/panchnama';

// ─── Demo Panchnama for offline reference ───────────────────────
export const MOCK_PANCHNAMAS: PanchnamaForm[] = [
  {
    id: 'panch_001',
    formNumber: 'NCB/DL/2026/F/001',
    ndpsSection: 'Section 52',
    caseNumber: 'NCB-CASE-2026-00421',
    seizureDate: '2026-09-14',
    seizureTime: '08:23',
    seizureLocation: {
      description: 'NH-44 Bypass, Toll Gate No. 3, Near Singhu Border',
      district: 'North Delhi',
      state: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      nearestLandmark: 'Singhu Border Check Post',
      highwayRoute: 'NH-44 (Delhi-Chandigarh)',
    },
    accused: [
      {
        fullName: 'Rahul Kumar Singh',
        age: 34,
        gender: 'male',
        fatherName: 'Ramesh Singh',
        address: 'Village Bahadurgarh, Near Bus Stand',
        district: 'Jhajjar',
        state: 'Haryana',
        nationality: 'Indian',
        idType: 'aadhaar',
        idNumber: '4721-XXXX-XXXX',
      },
    ],
    seizureItems: [
      {
        substanceName: 'Heroin (Brown Sugar)',
        apparentForm: 'powder',
        weightGrams: 850,
        netWeightGrams: 837.4,
        grossWeightGrams: 862.1,
        packagingType: 'Polythene pouches inside jute bag',
        numberOfPackets: 12,
        colorDescription: 'Brown/light brown granular powder',
        odorDescription: 'Characteristic acetic acid-like odor',
        reagentTestResult: 'Marquis: Purple → Black (Positive for Opiates)',
        sampleDrawn: true,
        sampleWeightGrams: 12.6,
      },
    ],
    evidencePhotoHashes: [
      'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    ],
    linkedScanIds: ['scan_001'],
    investigatingOfficer: {
      name: 'Sub-Inspector Pradeep Sharma',
      designation: 'Sub-Inspector (NCB)',
      badgeNumber: 'NCB-IO-4092',
      unit: 'NCB Delhi Zonal Unit',
      phoneNumber: '9XXXXXXXXX',
    },
    witnesses: [
      { name: 'Constable Vikram Yadav', designation: 'Constable, NCB Delhi', badge: 'NCB-CT-1203' },
      { name: 'Ramesh Gupta', designation: 'Panch Witness (Civilian)' },
    ],
    vehicleSeized: true,
    vehicleDetails: {
      registrationNumber: 'HR 26 AX 4421',
      make: 'Tata',
      model: 'Ace',
      color: 'White',
    },
    remarksNarrative: 'On the intervening night of 13-14 September 2026, acting on specific intelligence, a naka checking was conducted at NH-44 Toll Gate No. 3. A Tata Ace (HR 26 AX 4421) was intercepted. On personal search of the driver Rahul Kumar Singh, 12 polythene pouches containing brown powder were recovered from a concealed compartment beneath the rear cargo floor. Field test using NIK Marquis reagent produced purple-to-black coloration confirming presence of opiates. SHA-256 photo hash sealed via DRUG-SEAL AI system.',
    legalSections: [
      'Section 8(c) NDPS Act 1985',
      'Section 21(c) NDPS Act 1985',
      'Section 52 NDPS Act 1985',
      'Section 67 NDPS Act 1985',
    ],
    createdAt: '2026-09-14T08:30:00Z',
    updatedAt: '2026-09-14T09:15:00Z',
    submittedAt: '2026-09-14T09:15:00Z',
    status: 'submitted',
  },
];

// ─── Analytics Charts Demo Data ─────────────────────────────────
// These fuel the trend/breakdown/zonal charts on the analytics page.
// KPI cards (seizure count, weight, tests) show real Supabase counts.
export const MOCK_ZONAL_STATS = {
  totalSeizures: 0,   // replaced by real Supabase count in analytics page
  totalWeightKg: 0,
  activeOfficers: 312,
  testsPerformed: 0,
  positiveRate: 0,
  pendingSync: 0,
};

export const MOCK_MONTHLY_SEIZURES = [
  { month: 'Apr', seizures: 142, weight: 184.2 },
  { month: 'May', seizures: 168, weight: 210.5 },
  { month: 'Jun', seizures: 155, weight: 198.3 },
  { month: 'Jul', seizures: 201, weight: 267.8 },
  { month: 'Aug', seizures: 189, weight: 241.2 },
  { month: 'Sep', seizures: 147, weight: 192.4 },
];

export const MOCK_DRUG_BREAKDOWN = [
  { name: 'Heroin',          value: 34, color: '#dc2626' },
  { name: 'Cannabis',        value: 28, color: '#138808' },
  { name: 'Cocaine',         value: 18, color: '#f59e0b' },
  { name: 'Methamphetamine', value: 12, color: '#7c3aed' },
  { name: 'MDMA',            value: 5,  color: '#0284c7' },
  { name: 'Others',          value: 3,  color: '#94a3b8' },
];

export const MOCK_ZONE_COMPARISON = [
  { zone: 'Delhi',      seizures: 312, weight: 421.3 },
  { zone: 'Mumbai',     seizures: 287, weight: 389.2 },
  { zone: 'Chennai',    seizures: 198, weight: 264.8 },
  { zone: 'Kolkata',    seizures: 176, weight: 231.4 },
  { zone: 'Lucknow',    seizures: 203, weight: 278.6 },
  { zone: 'Jodhpur',    seizures: 156, weight: 198.7 },
  { zone: 'Chandigarh', seizures: 134, weight: 174.2 },
  { zone: 'Bengaluru',  seizures: 145, weight: 187.9 },
  { zone: 'Patna',      seizures: 121, weight: 156.3 },
  { zone: 'Guwahati',   seizures: 115, weight: 139.2 },
];

// ─── Demo Roles (needed for 1-tap demo login) ───────────────────
export const DEMO_ROLES = [
  {
    role: 'ncb_io' as const,
    label: 'Field Officer (IO)',
    fullTitle: 'Investigating Officer',
    badge: 'NCB-IO-4092',
    pin: '7731',
    name: 'SI Pradeep Sharma',
    unit: 'NCB Delhi Zonal Unit',
    color: '#dc2626',
  },
  {
    role: 'ncb_fsl' as const,
    label: 'Forensic Lab (FSL)',
    fullTitle: 'Forensic Science Laboratory Analyst',
    badge: 'FSL-DL-8812',
    pin: '9044',
    name: 'Dr. Meena Krishnan',
    unit: 'CFSL New Delhi',
    color: '#7c3aed',
  },
  {
    role: 'ncb_zonal' as const,
    label: 'Zonal Director (HQ)',
    fullTitle: 'Zonal Director, NCB Headquarters',
    badge: 'HQ-DIR-0001',
    pin: '1100',
    name: 'DIG Rajesh Kumar',
    unit: 'NCB Headquarters, New Delhi',
    color: '#0284c7',
  },
  {
    role: 'ncb_court' as const,
    label: 'NDPS Court Reader',
    fullTitle: 'Special Court NDPS Act Reader',
    badge: 'JUD-NDPS-2026',
    pin: '4432',
    name: 'Adv. Suresh Patel',
    unit: 'Special NDPS Court, Patiala House',
    color: '#138808',
  },
];

export type NCBRole = (typeof DEMO_ROLES)[number]['role'];
