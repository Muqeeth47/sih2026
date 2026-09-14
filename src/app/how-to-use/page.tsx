'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { NCBRole } from '@/data/mockData';
import {
  HelpCircle, Camera, ShieldCheck, MapPin, Scale, Sliders,
  CheckCircle2, ArrowRight, AlertTriangle, FileText, Cpu, Sparkles,
  Download, Lock, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface RoleManual {
  roleId: NCBRole;
  title: string;
  badge: string;
  subtitle: string;
  statutoryBasis: string;
  sopSteps: { step: string; title: string; desc: string; tip?: string }[];
  keyTools: { name: string; route: string; desc: string }[];
  complianceNotes: string[];
}

const MANUALS: Record<NCBRole, RoleManual> = {
  ncb_io: {
    roleId: 'ncb_io',
    title: 'Field Investigating Officer (Field IO)',
    badge: 'INTERDICTION & SEIZURE SQUAD',
    subtitle: 'Standard Operating Procedure for Field Spot Testing, Rapid Colorimetry, and Digital Panchnama Execution.',
    statutoryBasis: 'Sections 41, 42, 43, 50, and 52 of Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985.',
    sopSteps: [
      {
        step: '01',
        title: 'Chemical Pouch Preparation & Sample Insertion',
        desc: 'Crush the designated reagent ampoule (e.g. Marquis Pouch A for Opiates, Scott Pouch G for Cocaine). Introduce 2-5 mg of suspected substance into the reaction chamber and shake gently for 10-15 seconds.',
        tip: 'Ensure the test pouch ampoules are not pre-broken or expired before introducing the specimen.',
      },
      {
        step: '02',
        title: 'Camera Reticle Alignment & Quality Verification',
        desc: 'Open Live Scanner (/scanner). Center the reaction vial inside the 40% targeting reticle. Maintain stable lighting and hold device 15-20 cm away until the live Laplacian sharpness reads SHARP (≥ 90) and Specular Glare reads CLEAR (≤ 8%).',
        tip: 'If in direct sunlight or field conditions, use the Upload Image button to upload a clear gallery photo.',
      },
      {
        step: '03',
        title: 'Review Dual-Engine Analysis (OpenCV + Gemini AI)',
        desc: 'Once captured, inspect the OpenCV CIEDE2000 ΔE tolerance score (Pass ≤ 15.0) and the Gemini 3.6 Flash multimodal review (purity estimate, lot number verification, tamper check).',
      },
      {
        step: '04',
        title: 'Draft Panchnama & Export Certified PDF Assay Report',
        desc: 'Tap "Download Assay PDF" for immediate physical printout or tap "Draft Panchnama" to auto-populate Form F seizure memorandum with SHA-256 photo hash, GPS interdiction locus, and officer signature.',
      },
      {
        step: '05',
        title: 'Commit to Vault & Seal Chain of Custody',
        desc: 'Tap "Commit to Vault" to seal the record into IndexedDB and queue it for cloud synchronization with the Forensic Science Laboratory (FSL) and Zonal HQ.',
      },
    ],
    keyTools: [
      { name: 'Live Scanner', route: '/scanner', desc: 'Reticle camera with real-time blur/glare filters and dual colorimetric inference.' },
      { name: 'Form F Panchnama', route: '/panchnama', desc: 'Pre-filled statutory seizure memorandum with witness signatures and NDPS sections.' },
      { name: 'Evidence Vault', route: '/vault', desc: 'Immutable local cryptographic store tracking all interdictions and custody events.' },
    ],
    complianceNotes: [
      'Personal search must strictly comply with Section 50 NDPS Act (suspect informed of right to Gazetted Officer / Magistrate).',
      'Grounds of belief recorded under Section 42(2) must be transmitted to immediate official superior within 72 hours.',
      'All chemical spot tests are presumptive; confirmatory testing at FSL is mandatory for judicial filing.',
    ],
  },
  ncb_fsl: {
    roleId: 'ncb_fsl',
    title: 'Forensic Science Laboratory (FSL Analyst)',
    badge: 'GOVERNMENT ANALYST DIVISION',
    subtitle: 'Standard Operating Procedure for Evidence Intake Verification, Spectrophotometer Calibration, and Instrumental Confirmatory Audits.',
    statutoryBasis: 'Section 52A & Section 293 Code of Criminal Procedure (CrPC) / Section 329 Bharatiya Nagarik Suraksha Sanhita (BNSS).',
    sopSteps: [
      {
        step: '01',
        title: 'Evidence Vault Intake & Hash Verification',
        desc: 'Access the Evidence Vault (/vault). Locate incoming field seizure records and verify that the physical specimen tamper-seal matches the SHA-256 cryptographic image hash recorded at the time of interdiction.',
        tip: 'Any discrepancy between the container hash and field hash constitutes chain-of-custody contamination.',
      },
      {
        step: '02',
        title: 'Audit CIELAB ΔE & Color Coordinates',
        desc: 'Cross-reference field spectrophotometric coordinates (L*, a*, b*) against the UNODC ST/NAR/13 standard library. Check that ambient glare and blur were within acceptable forensic tolerances.',
      },
      {
        step: '03',
        title: 'Sensor & White-Balance Calibration',
        desc: 'Navigate to Calibration (/settings). Adjust CIELAB ΔE acceptance thresholds, calibrate D65 illuminant reference matrices, and update FSL spectrometer offsets for field devices.',
      },
      {
        step: '04',
        title: 'Instrumental Confirmatory Testing (GC-MS / HPLC)',
        desc: 'Perform definitive quantitative testing using Gas Chromatography-Mass Spectrometry (GC-MS) or HPLC. Upload lab certificate to append to the existing immutable digital evidence bundle.',
      },
    ],
    keyTools: [
      { name: 'Evidence Vault', route: '/vault', desc: 'Review field seizure packages, verify SHA-256 hashes, and append lab assay numbers.' },
      { name: 'Zonal Dashboard', route: '/analytics', desc: 'Inspect regional purity trends, adulterant patterns, and chemical profiles.' },
      { name: 'Calibration Engine', route: '/settings', desc: 'Fine-tune CIELAB tolerances and camera illuminant offsets.' },
    ],
    complianceNotes: [
      'Chemical test kit spot tests serve as presumptive evidence; final charge-sheet requires Form 13 FSL report.',
      'Maintain unbroken cold-storage and physical seal chain under Central Government NDPS (Disposal) Rules.',
    ],
  },
  ncb_zonal: {
    roleId: 'ncb_zonal',
    title: 'Zonal Director (HQ Command)',
    badge: 'HQ STRATEGIC COMMAND & OVERSIGHT',
    subtitle: 'Standard Operating Procedure for Interdiction Monitoring, Trafficking Corridor Analytics, and Section 52A Disposal Orders.',
    statutoryBasis: 'NDPS Act Section 52A, NCB Standing Instruction No. 1/88, and MHA Border Interdiction Guidelines.',
    sopSteps: [
      {
        step: '01',
        title: 'Monitor Real-Time Interdiction Telemetry',
        desc: 'Open the Zonal Dashboard (/analytics). Review live geospatial seizure points, active field team deployments, and contraband distribution across your jurisdiction.',
      },
      {
        step: '02',
        title: 'Audit Seizure Value & Purity Anomalies',
        desc: 'Inspect high-value contraband interdictions. Monitor purity anomalies detected by Gemini 3.6 Flash (e.g., high-purity Afghan heroin or fentanyl-laced synthetic consignments).',
      },
      {
        step: '03',
        title: 'Verify Chain-of-Custody Timestamps',
        desc: 'Ensure all field teams submit statutory Form F Panchnamas within 24 hours of interdiction. Confirm custody handover to Malkhana repository.',
      },
      {
        step: '04',
        title: 'Authorize Section 52A Pre-Trial Disposal',
        desc: 'Review High-Level Drug Disposal Committee inventories. Approve destruction and incineration dockets once Judicial Magistrate certification is complete.',
      },
    ],
    keyTools: [
      { name: 'Zonal Dashboard', route: '/analytics', desc: 'Interactive geographic interdiction map, contraband volume metrics, and cartel routes.' },
      { name: 'Evidence Vault', route: '/vault', desc: 'Comprehensive oversight of all seized contraband across zonal field units.' },
      { name: 'NDPS Legal Library', route: '/legal', desc: 'Statutory compendium of NDPS Act provisions, bail restrictions, and landmark judicial rulings.' },
    ],
    complianceNotes: [
      'Ensure strict compliance with Section 37 NDPS Act regarding commercial quantity bail restrictions.',
      'Quarterly disposal audit reports must be transmitted to Directorate General, NCB, New Delhi.',
    ],
  },
  ncb_court: {
    roleId: 'ncb_court',
    title: 'Special NDPS Court Reader / Judicial Magistrate',
    badge: 'JUDICIAL OVERSIGHT & TRIAL ADMISSIBILITY',
    subtitle: 'Standard Operating Procedure for Electronic Panchnama Scrutiny, Section 52A Inventory Certification, and 65B Electronic Proof.',
    statutoryBasis: 'Section 52A NDPS Act, Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam, 2023.',
    sopSteps: [
      {
        step: '01',
        title: 'Examine Electronic Seizure Record & Hashes',
        desc: 'Open Evidence Vault (/vault). Scrutinize the digital Form F Panchnama, officer badge credentials, time-stamp, and GPS coordinates recorded at the locus of interdiction.',
      },
      {
        step: '02',
        title: 'Verify Section 65B / BSA Cryptographic Certificate',
        desc: 'Verify the cryptographic SHA-256 photo hash against the field digital negative. Check that client-side spectrophotometric ΔE metrics conform to certified UNODC ST/NAR/13 standards.',
      },
      {
        step: '03',
        title: 'Conduct Section 52A Magistrate Inventory Inspection',
        desc: 'Inspect sample vials drawn in the presence of the Magistrate. Verify packaging marks, gross and net weight, and affix digital certification on the disposal inventory certificate.',
      },
      {
        step: '04',
        title: 'Admit Electronic Proof into Judicial Record',
        desc: 'Print or export the court-certified PDF assay report with embedded SHA-256 seal. Mark as Prosecution Exhibit in the primary trial record under Section 52A(4) NDPS Act.',
      },
    ],
    keyTools: [
      { name: 'Evidence Vault', route: '/vault', desc: 'Scrutinize electronic seizure inventories, photographs, and cryptographic integrity seals.' },
      { name: 'NDPS Legal Library', route: '/legal', desc: 'Statutory reference for mandatory procedural compliance (Sections 42, 50, 52A).' },
    ],
    complianceNotes: [
      'Under Section 52A(4), certified inventories, photographs, and sample lists constitute primary evidence in trial notwithstanding CrPC.',
      'Non-compliance with Section 50 mandatory personal search conditions invalidates seizure (State of Punjab v. Baldev Singh).',
    ],
  },
};

export default function HowToUsePage() {
  const { user } = useAuth();
  const defaultRole = (user?.role as NCBRole) || 'ncb_io';
  const [selectedRole, setSelectedRole] = useState<NCBRole>(defaultRole);

  const manual = MANUALS[selectedRole] || MANUALS.ncb_io;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
          <HelpCircle size={18} />
          <span>DRUG-SEAL AI · OPERATIONAL MANUAL & SOP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Role-Based Field & Judicial Operations Guide
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mb-0">
          Standard Operating Procedures (SOP), statutory compliance mandates under the NDPS Act 1985, and step-by-step instructions for each operational role.
        </p>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-100">
          {(Object.keys(MANUALS) as NCBRole[]).map((r) => {
            const m = MANUALS[r];
            const isCurrent = selectedRole === r;
            const isUserRole = user?.role === r;

            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`py-3 px-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[0.66rem] font-extrabold uppercase tracking-wide ${
                      isCurrent ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {r.replace('ncb_', 'NCB ')}
                  </span>
                  {isUserRole && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-700 text-white text-[0.6rem] font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-xs font-black text-slate-900 truncate">
                  {m.title.split('(')[0].trim()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Content Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="text-blue-400 text-xs font-black uppercase tracking-widest">
            {manual.badge}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            AUTHORITY: {manual.statutoryBasis}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          {manual.title}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-0">
          {manual.subtitle}
        </p>
      </div>

      {/* Step-by-Step SOP */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mb-5 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-blue-700" />
          <span>Step-by-Step Standard Operating Procedure</span>
        </h3>

        <div className="space-y-4">
          {manual.sopSteps.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                {s.step}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-900 mb-1">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {s.desc}
                </p>
                {s.tip && (
                  <div className="text-[0.72rem] text-blue-800 bg-blue-50/80 p-2 rounded-lg border border-blue-200/80 font-medium">
                    <strong>Forensic Tip:</strong> {s.tip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools & Compliance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authorized Modules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-blue-700" />
            <span>Authorized Operational Tools</span>
          </h3>

          <div className="space-y-2.5">
            {manual.keyTools.map((t, i) => (
              <Link
                key={i}
                href={t.route}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 flex items-center justify-between gap-3 text-decoration-none transition-all group"
              >
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-[0.72rem] text-slate-500 leading-normal">
                    {t.desc}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Statutory Compliance Guardrails */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Scale size={16} className="text-red-700" />
            <span>Statutory Evidentiary Safeguards</span>
          </h3>

          <div className="space-y-2.5">
            {manual.complianceNotes.map((note, i) => (
              <div key={i} className="p-3 rounded-xl bg-red-50/50 border border-red-200 flex items-start gap-2.5 text-xs text-red-950 leading-relaxed">
                <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
