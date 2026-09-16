'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Camera, FlaskConical, FileCheck, Shield, Wifi, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, User, Building2, Scale, ChevronRight, Layers, Award, FileText
} from 'lucide-react';

const KPI_STATS = [
  { value: '4,521+', label: 'Field Assays Logged', sub: 'Zero human perceptual subjectivity' },
  { value: '< 5ms', label: 'Edge ΔE Analysis', sub: 'Client-side CIELAB computation' },
  { value: '100%', label: 'Offline Capability', sub: 'Zero signal highway readiness' },
  { value: 'SHA-256', label: 'Cryptographic Sealing', sub: 'Section 65B BSA court admissibility' },
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
    name: 'Marquis',
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
    name: 'Scott',
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
    name: 'Duquenois',
    substance: 'Cannabis Resin / Hashish',
    colorName: 'Violet Layer',
    hex: '#6b21a8',
    deltaE: 3.1,
    confidence: '98% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.4.1',
    lab: { L: 22.1, a: 38.7, b: -31.2 },
    purity: 'High Active Profile',
  },
  {
    id: 'mecke',
    name: 'Mecke',
    substance: 'MDMA / Amphetamines',
    colorName: 'Blue-Green → Black',
    hex: '#1a2744',
    deltaE: 6.4,
    confidence: '91% High Confidence',
    unodc: 'UNODC ST/NAR/13 §4.5.2',
    lab: { L: 26.4, a: -12.1, b: -8.4 },
    purity: '70–75% estimated purity',
  },
];

const ROLES_SHOWCASE = [
  {
    role: 'Investigating Officer (Field IO)',
    badge: 'NCB-IO-4092',
    icon: User,
    color: '#0f5ca8',
    desc: 'Conducts highway vehicle searches, live colorimetric camera assays, and instantaneous Form F Panchnama drafting.',
    features: [
      'Live Camera reticle with Laplacian blur & glare rejection',
      'Automatic satellite GPS lock & SHA-256 photo fingerprinting',
      '1-Click statutory Form F Panchnama PDF with embedded evidence',
    ],
  },
  {
    role: 'Forensic Lab Analyst (FSL)',
    badge: 'FSL-DL-8812',
    icon: FlaskConical,
    color: '#15803d',
    desc: 'Calibrates UNODC optical reference curves, inspects incoming evidence vaults, and logs confirmatory assays.',
    features: [
      'Spectrophotometric ΔE sensitivity tuning & optical calibration',
      'Multimodal OCR validation (Lot verification, field cross-checks)',
      'Forensic ledger auditing across regional forensic labs',
    ],
  },
  {
    role: 'Zonal Director (Command)',
    badge: 'HQ-DIR-0001',
    icon: Building2,
    color: '#d97706',
    desc: 'Strategic command oversight across pan-India interdiction hotspots and inter-state trafficking corridors.',
    features: [
      'Pan-India satellite seizure cluster heatmaps and hot-spots',
      'Monthly interdiction volume trends & contraband breakdowns',
      'Multi-agency sharing with ANTF & border enforcement units',
    ],
  },
  {
    role: 'Special NDPS Court Reader',
    badge: 'JUD-NDPS-2026',
    icon: Scale,
    color: '#7c3aed',
    desc: 'Judicial officer verifying tamper-proof chain of custody and Section 52A Magisterial compliance certificates.',
    features: [
      'Client-side SHA-256 cryptographic seal verification on demand',
      'Section 52A Magisterial inventory compliance verification',
      'Immutable digital chain of custody inspection for fast trials',
    ],
  },
];

export default function LandingPage() {
  const [activeSim, setActiveSim] = useState<SimReagent>(SIM_REAGENTS[0]);
  const [activeRoleTab, setActiveRoleTab] = useState<number>(0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ─── Hero Section ─────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        padding: '2.5rem 1.25rem 2rem',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-10 items-center">

          {/* Left Hero Content */}
          <div>
            {/* Eyebrow badge without duplicate images */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider">
                SAKSHYA AI · SIH 2026 Forensic Platform
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              margin: '0 0 0.85rem',
            }}>
              Field Drug Tests.<br />
              <span style={{ color: '#0f5ca8' }}>Objectively Verified.</span>{' '}
              <span style={{ color: '#15803d' }}>Court Admissible.</span>
            </h1>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#475569', marginBottom: '1.5rem', maxWidth: 520 }}>
              <strong>SAKSHYA AI (साक्ष्य AI)</strong> transforms smartphone cameras into a certified, 100% offline spectrophotometer with CIELAB ΔE₂₀₀₀ colorimetry, SHA-256 tamper-proof photo sealing, and 1-click Section 52 NDPS Panchnama generation.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.5rem',
                  background: '#0f5ca8',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(15, 92, 168, 0.25)',
                }}
              >
                Access Officer Gateway <ArrowRight size={16} />
              </Link>

              <a
                href="#simulator"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.25rem',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                Assay Simulator ↓
              </a>
            </div>

            {/* Mini Telemetry Bar */}
            <div style={{ display: 'flex', gap: '1.75rem', marginTop: '1.5rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
              {[['< 5ms', 'Edge Matching'], ['SHA-256', 'Photo Fingerprint'], ['100% Offline', 'Zero Signal Ready']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating Preview Card */}
          <div>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px -10px rgba(15, 23, 42, 0.12)',
            }}>
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d' }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                    CIELAB ΔE₂₀₀₀ COLORIMETRY
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#0f5ca8', fontWeight: 700, background: '#eaf4fd', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Marquis Protocol
                </span>
              </div>

              <div style={{ padding: '1.25rem' }}>
                {/* Spectral Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ width: 42, height: 42, borderRadius: '8px', background: '#2d1b69', border: '2px solid #cbd5e1' }} />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '0.6rem', color: '#64748b', marginTop: '0.15rem', fontWeight: 700 }}>SAMPLE</span>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 800 }}>→</span>
                    <div>
                      <div style={{ width: 42, height: 42, borderRadius: '8px', background: '#2d1b69', border: '2px solid #15803d' }} />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '0.6rem', color: '#15803d', marginTop: '0.15rem', fontWeight: 700 }}>UNODC STD</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Spectral Match</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d', lineHeight: 1 }}>ΔE 4.2</div>
                    <div style={{ fontSize: '0.62rem', color: '#15803d', fontWeight: 700 }}>Tolerance &le; 12.0 (Match)</div>
                  </div>
                </div>

                {/* Positive Result Card */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#14532d' }}>Heroin (Diacetylmorphine)</span>
                    <span style={{ color: '#15803d', fontSize: '0.66rem', fontWeight: 800 }}>96% CONFIDENCE</span>
                  </div>
                  <div style={{ background: '#dcfce7', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: '96%', height: '100%', background: '#15803d' }} />
                  </div>
                </div>

                {/* Proof tags */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.45rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.6rem' }}>GPS SATELLITE LOCK</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>28.6139°N, 77.2090°E</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.45rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.6rem' }}>SHA-256 EVIDENCE SEAL</div>
                    <div style={{ fontWeight: 800, color: '#0f5ca8', fontFamily: 'monospace' }}>a1b2c3d4...f6a1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Compact KPI Strip ────────────────────────────────────────── */}
      <section style={{ padding: '1.75rem 1.25rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {KPI_STATS.map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f5ca8', lineHeight: 1, marginBottom: '0.2rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Interactive Reagent Assay Simulator ─ */}
      <section id="simulator" style={{ padding: '2.5rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              <FlaskConical size={14} /> Interactive Chemical Simulator
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
              On-Device Spectrophotometry (&lt; 5ms)
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
              Select a reagent to observe instantaneous spectrophotometric matching against UNODC reference standards.
            </p>
          </div>

          {/* Reagent Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {SIM_REAGENTS.map((item) => {
              const isSelected = activeSim.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSim(item)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #0f5ca8' : '1px solid #cbd5e1',
                    background: isSelected ? '#eaf4fd' : '#ffffff',
                    color: isSelected ? '#0f5ca8' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Simulator Display Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-6 items-center">
            {/* Visual Vial Chamber */}
            <div style={{ textAlign: 'center', background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div
                style={{
                  width: '70px',
                  height: '130px',
                  margin: '0 auto 0.75rem',
                  borderRadius: '0 0 35px 35px',
                  border: '3px solid #94a3b8',
                  borderTop: 'none',
                  position: 'relative',
                  background: 'rgba(241, 245, 249, 0.6)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '65%',
                    background: activeSim.hex,
                    transition: 'background-color 0.3s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{activeSim.colorName}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>CIELAB L*={activeSim.lab.L} a*={activeSim.lab.a} b*={activeSim.lab.b}</div>
            </div>

            {/* Assay Telemetry */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
                  {activeSim.confidence}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {activeSim.unodc}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
                {activeSim.substance}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>ΔE₂₀₀₀ Score</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>ΔE {activeSim.deltaE}</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Statutory Threshold &le; 12.0</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Assay Estimation</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f5ca8', marginTop: '0.2rem' }}>{activeSim.purity}</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Adulterants Screened</div>
                </div>
              </div>

              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#0f5ca8',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                }}
              >
                Launch Field Assay in Portal <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Role Separation Strip ─────── */}
      <section style={{ padding: '2.5rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              <Layers size={14} /> Role Clearance Tiers
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Multi-Agency Operational Separation
            </h2>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0f5ca8' : '1px solid #e2e8f0',
                    background: isSelected ? '#ffffff' : '#f1f5f9',
                    color: isSelected ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={16} color={isSelected ? '#0f5ca8' : '#64748b'} />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{roleItem.role.split('(')[0]}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>{roleItem.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Role Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
              {ROLES_SHOWCASE[activeRoleTab].role}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '0.85rem' }}>
              {ROLES_SHOWCASE[activeRoleTab].desc}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
              {ROLES_SHOWCASE[activeRoleTab].features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={14} color="#15803d" />
                  <span style={{ fontSize: '0.76rem', color: '#1e293b', fontWeight: 600 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Statutory Chain of Custody ── */}
      <section style={{ padding: '2.5rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              <Scale size={14} /> NDPS Act &amp; BSA 2023 Compliance
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Unbroken Cryptographic Chain of Custody
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { step: '01', title: 'Highway Interdiction', clause: 'Sec 42 & 43 NDPS', desc: 'Real-time camera assay with glare rejection & GPS lock.' },
              { step: '02', title: 'Edge Colorimetry', clause: 'UNODC Standard', desc: '5ms CIELAB ΔE calculation and SHA-256 photo seal.' },
              { step: '03', title: 'Form F Panchnama', clause: 'Sec 52 NDPS', desc: 'Automated legal seizure memo with witness signatures.' },
              { step: '04', title: 'Court Admissibility', clause: 'Sec 65B BSA', desc: 'Cryptographic hash validation in Special NDPS Court.' },
            ].map((st) => (
              <div key={st.step} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.25rem 1rem',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f5ca8', marginBottom: '0.2rem' }}>
                  STAGE {st.step} · {st.clause}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  {st.title}
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Compact Final CTA ────────────────────────────────────────── */}
      <section style={{ padding: '2.5rem 1.25rem', background: '#f8fafc', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
            Ready for Live Evaluation?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            Access SAKSHYA AI with 1-click evaluation credentials across any of the 4 operational roles.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.75rem 1.75rem',
              background: '#0f5ca8',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 800, fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(15, 92, 168, 0.25)',
            }}
          >
            Launch Officer Portal <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
