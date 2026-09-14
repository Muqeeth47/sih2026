'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Camera, FlaskConical, FileCheck, Shield, Wifi, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, User, Building2, Scale, Clock, Sparkles,
  ChevronRight, AlertTriangle, Layers, Award, FileText
} from 'lucide-react';

const KPI_STATS = [
  { value: '4,521', label: 'Field Tests Logged', sub: 'Colorimetric assays completed without human subjectivity' },
  { value: '1,847', label: 'Seizures Documented', sub: 'Section 52 statutory panchnama memoranda generated' },
  { value: '312', label: 'Certified Officers', sub: 'Active field personnel across 12 zonal directorates' },
  { value: '< 5ms', label: 'Edge Matching Speed', sub: 'Client-side CIELAB ΔE₂₀₀₀ computation on device' },
];

interface SimReagent {
  id: string;
  name: string;
  substance: string;
  colorName: string;
  hex: string;
  deltaE: number;
  confidence: string;
  unodc: string;
  lab: { L: number; a: number; b: number };
  purity: string;
}

const SIM_REAGENTS: SimReagent[] = [
  {
    id: 'marquis',
    name: 'Marquis Reagent',
    substance: 'Heroin (Diacetylmorphine)',
    colorName: 'Deep Purple → Black',
    hex: '#2d1b69',
    deltaE: 4.2,
    confidence: '96% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.2.1',
    lab: { L: 14.2, a: 22.1, b: -31.4 },
    purity: '62–68% estimated purity',
  },
  {
    id: 'scott',
    name: 'Scott Reagent',
    substance: 'Cocaine Hydrochloride',
    colorName: 'Cobalt Blue Precipitate',
    hex: '#1a56c4',
    deltaE: 5.8,
    confidence: '93% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.3.1',
    lab: { L: 35.8, a: 14.2, b: -52.3 },
    purity: '78–82% estimated purity',
  },
  {
    id: 'duquenois',
    name: 'Duquenois-Levine',
    substance: 'Cannabis Resin / Hashish',
    colorName: 'Violet (Chloroform Layer)',
    hex: '#6b21a8',
    deltaE: 3.1,
    confidence: '98% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.4.1',
    lab: { L: 22.1, a: 38.7, b: -31.2 },
    purity: 'High Active Cannabinoid Profile',
  },
  {
    id: 'mecke',
    name: 'Mecke Reagent',
    substance: 'MDMA / Amphetamines',
    colorName: 'Blue-Green → Black',
    hex: '#1a2744',
    deltaE: 6.4,
    confidence: '91% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.5.2',
    lab: { L: 26.4, a: -12.1, b: -8.4 },
    purity: '70–75% estimated purity',
  },
  {
    id: 'mandelin',
    name: 'Mandelin Reagent',
    substance: 'Ketamine HCl',
    colorName: 'Bright Deep Orange',
    hex: '#e05c1a',
    deltaE: 4.9,
    confidence: '94% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.6.1',
    lab: { L: 52.1, a: 44.2, b: 58.7 },
    purity: '84–88% estimated purity',
  },
];

const ROLES_SHOWCASE = [
  {
    role: 'Investigating Officer (Field IO)',
    badge: 'NCB-IO-4092',
    icon: User,
    color: '#0f5ca8',
    desc: 'Empowered under Sections 42 & 43 of NDPS Act. Conducts on-highway interdictions, live spectrophotometric testing, and instant Panchnama drafting.',
    features: [
      'Live WebRTC Camera Viewfinder with 40% target reticle',
      'Real-time Laplacian blur variance (>90 sharpness filter)',
      'Specular glare rejection preventing glove reflection errors',
      'Automatic satellite GPS lock & SHA-256 photo fingerprinting',
      '1-Click statutory Form F Panchnama PDF generation',
    ],
  },
  {
    role: 'Forensic Lab Analyst (CFSL / FSL)',
    badge: 'FSL-DL-8812',
    icon: FlaskConical,
    color: '#15803d',
    desc: 'State & Central Forensic Science Laboratory analyst. Calibrates reference optical curves, reviews evidence vaults, and performs confirmatory cross-assays.',
    features: [
      'Spectrophotometric ΔE sensitivity tuning & optical calibration',
      'UNODC ST/NAR/13 reagent batch reference spectrum management',
      'Gemini multimodal OCR validation (Lot verification, adulterants)',
      'Forensic ledger auditing across regional forensic labs',
      'GC-MS / HPLC cross-verification documentation logs',
    ],
  },
  {
    role: 'Zonal Director (HQ Strategic Command)',
    badge: 'HQ-DIR-0001',
    icon: Building2,
    color: '#d97706',
    desc: 'Executive intelligence command oversight. Monitors pan-India contraband trajectories, interdiction hot-spots, and inter-state trafficking syndicates.',
    features: [
      'Interactive Pan-India Leaflet satellite seizure cluster heatmaps',
      'Monthly interdiction volume trends & contraband portfolio breakdown',
      'Cross-zone enforcement performance analytics (12 Zonal Units)',
      'Full legal audit oversight of pending and filed Form F dossiers',
      'Direct inter-agency sharing with ANTF & Border Security Forces',
    ],
  },
  {
    role: 'Special NDPS Court Reader',
    badge: 'JUD-NDPS-2026',
    icon: Scale,
    color: '#7c3aed',
    desc: 'Judicial officer in Special NDPS Court. Audits cryptographic chain of custody, verifies magistrate inventory certificates, and inspects immutable evidence.',
    features: [
      'Client-side SHA-256 cryptographic seal verification on demand',
      'Section 52A Magisterial inventory compliance verification',
      'Chain of custody inspection without raw database tampering risk',
      'Full statutory NDPS legal section compliance indexing',
      'Tamper-proof evidence certification for speedy trial admissions',
    ],
  },
];

export default function LandingPage() {
  const [activeSim, setActiveSim] = useState<SimReagent>(SIM_REAGENTS[0]);
  const [activeRoleTab, setActiveRoleTab] = useState<number>(0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ─── Hero Section with Layered Visual Depth ─────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
        padding: 'clamp(3rem, 6vw, 5.5rem) 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient background glow accents */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(15, 92, 168, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-14 items-center relative">

          {/* Left Hero Content */}
          <div className="animate-fade-in">
            {/* Left-Aligned Typographic Eyebrow with Inline SOP Link */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                Forensic Field Intelligence · SIH26231
              </span>
              <span className="text-slate-300">|</span>
              <Link
                href="/how-to-use"
                className="text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors no-underline inline-flex items-center gap-1"
              >
                <span>Read Standard Operating Procedures</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Headline with High Contrast Depth */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              color: '#0f172a',
              margin: '0 0 1.25rem',
            }}>
              Field Drug Tests.<br />
              <span style={{ color: '#0f5ca8' }}>Objectively Verified.</span><br />
              <span style={{ color: '#15803d' }}>Court Admissible.</span>
            </h1>

            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#475569', marginBottom: '2.25rem', maxWidth: 540 }}>
              DRUG-SEAL AI transforms standard smartphone optics into a certified, 100% offline spectrophotometer. CIELAB ΔE₂₀₀₀ colorimetry, SHA-256 tamper-proof photo sealing, and 1-click Section 52 NDPS Panchnama PDF — purpose-built for NCB & ANTF officers during highway interdictions.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 1.85rem',
                  background: '#0f5ca8',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(15, 92, 168, 0.3)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Access Officer Gateway <ArrowRight size={17} />
              </Link>

              <a
                href="#simulator"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 1.6rem',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
              >
                Interactive Assay Demo
              </a>
            </div>

            {/* Mini Telemetry Bar */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap', paddingTop: '1.75rem', borderTop: '1px solid #e2e8f0' }}>
              {[['< 5ms', 'On-Device Analysis'], ['SHA-256', 'Hardware Photo Seal'], ['100% Offline', 'Zero Signal Dependency']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{val}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '0.15rem' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Layered Floating Preview Card with Drop Shadow Depth */}
          <div className="animate-scale-in" style={{ animationDelay: '0.15s' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '22px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            }}>
              {/* Card topbar */}
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d', animation: 'ncb-pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
                    CIELAB ΔE₂₀₀₀ COLORIMETRY
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#0f5ca8', fontWeight: 700, background: '#eaf4fd', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Marquis Protocol
                </span>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {/* Spectral Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#2d1b69', border: '2px solid #cbd5e1', boxShadow: '0 4px 10px rgba(45,27,105,0.25)' }} />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 700 }}>SPECIMEN</span>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 800 }}>→</span>
                    <div>
                      <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#2d1b69', border: '2px solid #15803d', boxShadow: '0 4px 10px rgba(45,27,105,0.25)' }} />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '0.62rem', color: '#15803d', marginTop: '0.2rem', fontWeight: 700 }}>UNODC STD</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem 0.85rem' }}>
                    <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Spectral Distance</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', lineHeight: 1 }}>ΔE 4.2</div>
                    <div style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 700 }}>Tolerance &le; 12.0 (Matched)</div>
                  </div>
                </div>

                {/* Positive Result Card */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#14532d' }}>Heroin (Diacetylmorphine)</span>
                    <span style={{ color: '#15803d', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      96% CONFIDENCE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#166534', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                    Immediate purple-to-black spectral transition. Conforms to UNODC ST/NAR/13 Section 4.2.1 guidelines.
                  </p>
                  <div style={{ background: '#dcfce7', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: '96%', height: '100%', background: '#15803d' }} />
                  </div>
                </div>

                {/* Chain of Custody Proof */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.74rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.66rem', marginBottom: '0.15rem' }}>SATELLITE GPS LOCK</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.7rem' }}>28.6139°N 77.2090°E</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.66rem', marginBottom: '0.15rem' }}>SHA-256 FINGERPRINT</div>
                    <div style={{ fontWeight: 800, color: '#0f5ca8', fontFamily: 'monospace', fontSize: '0.7rem' }}>a1b2c3d4...f6a1b2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KPI Strip ────────────────────────────────────────── */}
      <section style={{ padding: '2.75rem 1.5rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {KPI_STATS.map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f5ca8', lineHeight: 1, marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Interactive Reagent Assay Simulator (Deep Content) ─ */}
      <section id="simulator" style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              <FlaskConical size={14} /> Interactive Chemical Simulator
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
              Experience the 5ms Edge Colorimetry Engine
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 580, margin: '0 auto', lineHeight: 1.65 }}>
              Select a field reagent to observe instantaneous spectrophotometric matching against official UNODC reference standards.
            </p>
          </div>

          {/* Reagent Selector Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {SIM_REAGENTS.map((item) => {
              const isSelected = activeSim.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSim(item)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #0f5ca8' : '1px solid #cbd5e1',
                    background: isSelected ? '#eaf4fd' : '#ffffff',
                    color: isSelected ? '#0f5ca8' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 92, 168, 0.15)' : 'none',
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Simulator Display Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-8 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-10 items-center shadow-sm">
            {/* Visual Vial Chamber */}
            <div style={{ textAlign: 'center', background: '#ffffff', padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                Simulated Spot Reaction Chamber
              </div>

              {/* Vial Tube with animated reagent color */}
              <div
                style={{
                  width: '90px',
                  height: '180px',
                  margin: '0 auto 1.5rem',
                  borderRadius: '0 0 45px 45px',
                  border: '3px solid #94a3b8',
                  borderTop: 'none',
                  position: 'relative',
                  background: 'rgba(241, 245, 249, 0.6)',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.06)',
                }}
              >
                {/* Fluid level */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '65%',
                    background: activeSim.hex,
                    transition: 'background-color 0.4s ease',
                    boxShadow: `0 0 20px ${activeSim.hex}60`,
                  }}
                />
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{activeSim.colorName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>CIELAB L*={activeSim.lab.L} a*={activeSim.lab.a} b*={activeSim.lab.b}</div>
            </div>

            {/* Assay Breakdown Telemetry */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {activeSim.confidence}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {activeSim.unodc}
                </span>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
                {activeSim.substance}
              </h3>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Color absorption conforms mathematically to the UNODC spectrophotometric envelope. No human perceptual bias, sodium lamp interference, or parallax distortion.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>CIEDE2000 Score</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d' }}>ΔE {activeSim.deltaE}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Statutory Threshold &le; 12.0</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Assay Estimation</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f5ca8', marginTop: '0.3rem' }}>{activeSim.purity}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Adulterant Cross-Screened</div>
                </div>
              </div>

              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#0f5ca8',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                Launch Field Assay in Portal <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Role Capabilities & Strict Separation Matrix ─────── */}
      <section style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              <Layers size={14} /> Role-Based Access Control (RBAC)
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
              Strict Feature Separation Per Operational Tier
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 580, margin: '0 auto', lineHeight: 1.65 }}>
              Each officer role has dedicated clearance boundaries under the NDPS Act. Features strictly belong to their authorized jurisdiction.
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {ROLES_SHOWCASE.map((roleItem, idx) => {
              const Icon = roleItem.icon;
              const isSelected = activeRoleTab === idx;
              return (
                <button
                  key={roleItem.role}
                  onClick={() => setActiveRoleTab(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0f5ca8' : '1px solid #e2e8f0',
                    background: isSelected ? '#ffffff' : '#f1f5f9',
                    color: isSelected ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 92, 168, 0.12)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '8px',
                    background: isSelected ? '#eaf4fd' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={isSelected ? '#0f5ca8' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>{roleItem.role.split('(')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{roleItem.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Role Detail Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '2rem',
            boxShadow: '0 8px 25px -5px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="text-[0.72rem] text-blue-700 font-extrabold uppercase tracking-wider block">
                  AUTHORIZED OPERATIONAL CLEARANCE
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0' }}>
                  {ROLES_SHOWCASE[activeRoleTab].role}
                </h3>
              </div>

              <Link
                href="/login"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors no-underline inline-flex items-center gap-1"
              >
                <span>Sign In As This Role</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '750px' }}>
              {ROLES_SHOWCASE[activeRoleTab].desc}
            </p>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assigned Role Capabilities (Strict Clearance):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {ROLES_SHOWCASE[activeRoleTab].features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <CheckCircle2 size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.4 }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Statutory Chain of Custody (Highway Interdiction -> Court) ── */}
      <section style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              <Scale size={14} /> NDPS Act 1985 Compliance Pathway
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
              Unbroken Cryptographic Chain of Custody
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 580, margin: '0 auto', lineHeight: 1.65 }}>
              From initial vehicle interdiction at remote toll barriers to final special court sentencing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              {
                step: '01',
                title: 'Highway Interdiction',
                clause: 'Sections 42 & 43 NDPS Act',
                desc: 'Vehicle interception, suspect personal search under Section 50. Live reticle framing with blur & glare rejection.',
                icon: Camera,
              },
              {
                step: '02',
                title: '5ms Spectrophotometry',
                clause: 'UNODC ST/NAR/13 Standards',
                desc: 'Client-side CIELAB ΔE₂₀₀₀ colorimetry. Immediate WebCrypto SHA-256 photo seal and satellite GPS coordinate lock.',
                icon: FlaskConical,
              },
              {
                step: '03',
                title: 'Form F Panchnama',
                clause: 'Section 52 NDPS Act',
                desc: 'Automated digital seizure memorandum generation. Two independent panch witnesses and IO digital signatures embedded.',
                icon: FileText,
              },
              {
                step: '04',
                title: 'Court Admissibility',
                clause: 'Section 52A Magisterial Audit',
                desc: 'Tamper-proof hash validation in Special NDPS Court. Eliminates subjective color disputes during cross-examination.',
                icon: Award,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.step} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '10px',
                    background: '#0f5ca8', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 10px rgba(15, 92, 168, 0.25)',
                  }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f5ca8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    STAGE {st.step} · {st.clause}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    {st.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem', background: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '14px',
            background: '#0f5ca8', margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(15, 92, 168, 0.25)',
          }}>
            <Shield size={28} color="white" strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            Ready for live evaluation?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.94rem' }}>
            Access the DRUG-SEAL AI portal with 1-click evaluation credentials across any of the 4 operational roles.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.95rem 2.25rem',
              background: '#0f5ca8',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 800, fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(15, 92, 168, 0.3)',
            }}
          >
            Launch Officer Portal <ArrowRight size={17} />
          </Link>
        </div>
      </section>

    </div>
  );
}
