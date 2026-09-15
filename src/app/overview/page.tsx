'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Camera, FlaskConical, Building2, Scale, FileText, ShieldCheck,
  MapPin, Settings, HelpCircle, ArrowRight, BookOpen, Shield, Map
} from 'lucide-react';

type NCBRole = 'ncb_io' | 'ncb_fsl' | 'ncb_zonal' | 'ncb_court';

const ROLE_META: Record<NCBRole, {
  title: string;
  subtitle: string;
  color: string;
  Icon: React.ElementType;
  features: { Icon: React.ElementType; label: string; desc: string; href: string }[];
}> = {
  ncb_io: {
    title: 'Field Investigating Officer',
    subtitle: 'Interdiction · Evidence Capture · Section 52 NDPS Panchnama',
    color: '#0f5ca8',
    Icon: Camera,
    features: [
      { Icon: Camera, label: 'Live Scanner', desc: 'Photograph colorimetric test pouches and run real-time CIELAB ΔE₂₀₀₀ + Gemini AI dual-engine analysis.', href: '/scanner' },
      { Icon: FileText, label: 'NDPS Panchnama', desc: 'Auto-generate the statutory Section 52 Panchnama PDF with GPS co-ordinates, witness names and SHA-256 seal.', href: '/panchnama' },
      { Icon: ShieldCheck, label: 'Evidence Vault', desc: 'View all sealed scan records, download PDF certificates and track chain of custody.', href: '/vault' },
      { Icon: BookOpen, label: 'NDPS Legal Library', desc: 'Offline reference to NDPS Act sections, schedules and landmark judgments.', href: '/legal' },
      { Icon: HelpCircle, label: 'How to Use', desc: 'Step-by-step training guide for field scanning, Panchnama generation and evidence sealing.', href: '/how-to-use' },
    ],
  },
  ncb_fsl: {
    title: 'Forensic Science Laboratory Analyst',
    subtitle: 'Scientific Verification · Assay Comparison · Reagent Calibration',
    color: '#7c3aed',
    Icon: FlaskConical,
    features: [
      { Icon: ShieldCheck, label: 'Evidence Vault', desc: 'Review all submitted scan assays. Compare OpenCV colorimetric results against Gemini AI outputs.', href: '/vault' },
      { Icon: MapPin, label: 'Zonal Dashboard', desc: 'View cross-zone analytics, heatmaps and seizure trends to identify substance trafficking patterns.', href: '/analytics' },
      { Icon: Settings, label: 'Reagent Calibration', desc: 'Set and update CIELAB reference colour baselines for all supported reagent types.', href: '/settings' },
      { Icon: BookOpen, label: 'NDPS Legal Library', desc: 'Offline reference to NDPS Act sections, schedules and landmark judgments.', href: '/legal' },
      { Icon: HelpCircle, label: 'How to Use', desc: 'Guide for verifying scan data, running calibration and interpreting assay comparisons.', href: '/how-to-use' },
    ],
  },
  ncb_zonal: {
    title: 'Zonal Superintendent / HQ Commissioner',
    subtitle: 'Chain-of-Custody Review · Zone-level Oversight · Court Submission',
    color: '#b45309',
    Icon: Building2,
    features: [
      { Icon: FileText, label: 'NDPS Panchnama', desc: 'Review and approve field Panchnamas before court submission.', href: '/panchnama' },
      { Icon: MapPin, label: 'Zonal Dashboard', desc: 'Cross-zone seizure analytics, status workflows and escalated case overview.', href: '/analytics' },
      { Icon: ShieldCheck, label: 'Evidence Vault', desc: 'Full read access to all sealed evidence dossiers across your zone.', href: '/vault' },
      { Icon: BookOpen, label: 'NDPS Legal Library', desc: 'Offline reference to NDPS Act sections, schedules and landmark judgments.', href: '/legal' },
      { Icon: HelpCircle, label: 'How to Use', desc: 'Guide for reviewing escalated cases and chain-of-custody verification.', href: '/how-to-use' },
    ],
  },
  ncb_court: {
    title: 'NDPS Special Court Reader / Magistrate',
    subtitle: 'Evidence Scrutiny · Dossier Verification · Final Adjudication',
    color: '#065f46',
    Icon: Scale,
    features: [
      { Icon: ShieldCheck, label: 'Evidence Vault', desc: 'Read-only access to the complete tamper-evident evidence dossier including SHA-256 sealed scan reports and Panchnama PDFs.', href: '/vault' },
      { Icon: BookOpen, label: 'NDPS Legal Library', desc: 'Full NDPS Act reference including Sections 52, 57, 21, 22 and supporting judgments for court proceedings.', href: '/legal' },
      { Icon: HelpCircle, label: 'How to Use', desc: 'Guide for verifying digital evidence and navigating the sealed dossier.', href: '/how-to-use' },
    ],
  },
};

export default function OverviewPage() {
  const { user } = useAuth();
  const role = (user?.role as NCBRole) ?? 'ncb_io';
  const meta = ROLE_META[role];
  const { Icon: RoleIcon } = meta;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.25rem 4rem', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '14px',
          background: `${meta.color}15`,
          border: `2px solid ${meta.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <RoleIcon size={26} color={meta.color} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: meta.color }}>
              YOUR WORKSPACE
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>{meta.subtitle}</p>
        </div>
      </div>

      {/* Welcome notice */}
      <div style={{
        background: `${meta.color}08`,
        border: `1px solid ${meta.color}25`,
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <Shield size={18} color={meta.color} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
            Welcome, {user?.name || 'Officer'} — {user?.unit || 'NCB Field Unit'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
            You are logged in with <strong>{meta.title}</strong> clearance. All your accessible modules are listed below. Select any module to open it.
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {meta.features.map(({ Icon, label, desc, href }) => (
          <Link
            key={href}
            href={href}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                height: '100%',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${meta.color}20`;
                (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}50`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '9px',
                background: `${meta.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={19} color={meta.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.55 }}>{desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color }}>Open {label}</span>
                <ArrowRight size={13} color={meta.color} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Architecture link */}
      <Link href="/architecture" style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Map size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>System Architecture & Operational Flow</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>View the full 4-tier hierarchy, escalation protocol, deployment zones and roadmap</div>
            </div>
          </div>
          <ArrowRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
        </div>
      </Link>
    </div>
  );
}
