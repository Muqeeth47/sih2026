'use client';
import {
  ArrowDown, Camera, FlaskConical, Building2, Scale,
  AlertTriangle, Zap, Globe, CheckCircle2, ChevronRight,
  Sun, Timer, Gavel, MapPin, Navigation, Plane, Mic,
  Link2, Upload, PenLine, Radio, Anchor, TrendingUp,
  ArrowRight,
} from 'lucide-react';

function Eyebrow({ label, color = '#0f5ca8' }: { label: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
        {label}
      </span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  );
}

const ROLES = [
  {
    tier: '01', who: 'Field Officer',
    fullName: 'Field Investigating Officer',
    Icon: Camera, color: '#0f5ca8',
    does: 'Takes photo of test pouch → AI analyses colour → generates sealed report',
    trigger: 'If the two AI engines disagree → officer taps "Send to FSL Lab"',
    arrow: 'Disputed scan → forwarded to Forensic Lab',
  },
  {
    tier: '02', who: 'Lab Analyst',
    fullName: 'Forensic Science Laboratory Analyst',
    Icon: FlaskConical, color: '#7c3aed',
    does: 'Compares the digital result to the physical pouch test under lab conditions',
    trigger: 'If digital ≠ physical result → analyst taps "Escalate to Zonal HQ"',
    arrow: 'Result mismatch → escalated to Zonal Superintendent',
  },
  {
    tier: '03', who: 'Zonal Commander',
    fullName: 'Zonal Superintendent / HQ Commissioner',
    Icon: Building2, color: '#b45309',
    does: 'Reviews the full chain of custody, cross-checks field Panchnama with lab report',
    trigger: 'If chain-of-custody gap found → submits sealed dossier to NDPS Court',
    arrow: 'Chain-of-custody gap → submitted to NDPS Court',
  },
  {
    tier: '04', who: 'Court Magistrate',
    fullName: 'NDPS Special Court Reader / Magistrate',
    Icon: Scale, color: '#065f46',
    does: 'Reads the tamper-proof evidence dossier (SHA-256 sealed). Makes final legal order.',
    trigger: 'Conviction · Acquittal · Return for re-test',
    arrow: null,
  },
];

const PROBLEMS = [
  {
    Icon: Sun, color: '#dc2626',
    title: 'Bad Lighting',
    body: 'Harsh sunlight or sodium streetlamps change how a colour looks to the naked eye — making results inconsistent.',
  },
  {
    Icon: Timer, color: '#b45309',
    title: 'Colours Fade Fast',
    body: 'Reagent test colours change within minutes post-reaction — no time for a lab before evidence degrades.',
  },
  {
    Icon: Gavel, color: '#0f5ca8',
    title: 'Courts Reject It',
    body: 'Defence lawyers challenge any result not documented scientifically with a chain of custody under Sec. 52 NDPS Act.',
  },
];

const ZONES = [
  { Icon: MapPin,      label: 'Highway Checkposts',         desc: 'Inter-state road corridors under Section 43 NDPS Act.' },
  { Icon: Navigation,  label: 'Land Border Stations',       desc: 'Wagah, Moreh and other immigration transit points.' },
  { Icon: Anchor,      label: 'Coastal Patrol Nodes',       desc: 'Marine Police points along India\'s 7,500 km coastline.' },
  { Icon: Plane,       label: 'Airport Cargo Bays',         desc: 'Customs + NCB joint ops at major international airports.' },
  { Icon: Building2,   label: 'Urban Raid Ops (Sec. 43)',   desc: 'City-level surprise raids in markets and warehouses.' },
];

const ROADMAP = [
  { Icon: Radio,    label: 'Bodycam Integration',       desc: 'Auto-tag evidence from wearable camera feeds.' },
  { Icon: Mic,      label: 'Hindi Voice Commands',      desc: 'Scan and submit by speaking in regional language.' },
  { Icon: Link2,    label: 'CCTNS Case Sync',           desc: 'Pull case numbers from the national crime network.' },
  { Icon: Globe,    label: 'Offline Mesh Sync',         desc: 'Share evidence between devices without internet.' },
  { Icon: Upload,   label: 'Spectral Baseline Push',    desc: 'Update reagent colour references from cloud.' },
  { Icon: PenLine,  label: 'Magistrate e-Signature',    desc: 'Digital DSC signature for court-admissible Panchnama.' },
];

export default function ArchitecturePage() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem 5rem', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <Eyebrow label="DRUG-SEAL AI · SIH26231 · Ministry of Home Affairs" />
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
          How It Works
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          A field officer takes a photo of a drug test pouch. Two AI engines analyse the colour. The result travels up the chain — automatically — until a court makes the final call.
        </p>
      </div>

      {/* ── Problem ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <Eyebrow label="The Problem" color="#dc2626" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
          Why can't officers just look at the colour themselves?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {PROBLEMS.map(({ Icon, color, title, body }) => (
            <Card key={title} style={{ borderTop: `3px solid ${color}` }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.55 }}>{body}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Dual Engine ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <Eyebrow label="The Solution — 2 Engines Check Every Photo" color="#7c3aed" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
          Two independent AI systems must agree before a result is trusted
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Card style={{ borderLeft: '4px solid #0f5ca8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={17} color="#0f5ca8" />
              </div>
              <div>
                <div style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f5ca8' }}>ENGINE A — OFFLINE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>OpenCV Colorimetry</div>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
              Measures exact colour using CIELAB ΔE₂₀₀₀ maths. Runs on the device — no internet needed. Takes 5 milliseconds per frame.
            </div>
          </Card>
          <Card style={{ borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={17} color="#7c3aed" />
              </div>
              <div>
                <div style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed' }}>ENGINE B — CLOUD AI</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Gemini 3.6 Flash</div>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
              Google's multimodal AI reads the pouch label, checks for tampering, and writes a court-ready forensic paragraph.
            </div>
          </Card>
        </div>
        <Card style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} color="#16a34a" />
              <span><strong>Both agree</strong> — Result sealed, legally admissible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} color="#dc2626" />
              <span><strong>They disagree</strong> — Flagged DISPUTED, escalated up the chain</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Role Ladder ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <Eyebrow label="The 4-Role Chain — Who Sees What, In Order" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem' }}>
          Follow a disputed case from field to courtroom
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
          Each role only sees what they are cleared for. Escalation is one button-tap — audit trail locked automatically.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ROLES.map((role) => {
            const { Icon } = role;
            return (
              <div key={role.tier}>
                <div style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderLeft: `5px solid ${role.color}`,
                  borderRadius: '12px', padding: '1.25rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '10px', background: `${role.color}15`, border: `2px solid ${role.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={role.color} />
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: `${role.color}90`, letterSpacing: '0.05em' }}>TIER {role.tier}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: role.color, marginBottom: '0.12rem' }}>{role.who}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{role.fullName}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', background: '#f8fafc', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>{role.does}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', background: role.arrow ? '#fef9ec' : '#f0fdf4', border: `1px solid ${role.arrow ? '#fde68a' : '#bbf7d0'}`, borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                      <AlertTriangle size={13} color={role.arrow ? '#b45309' : '#16a34a'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55 }}>
                        <strong style={{ color: role.arrow ? '#92400e' : '#15803d' }}>
                          {role.arrow ? 'Escalates when: ' : 'Final outcome: '}
                        </strong>
                        {role.trigger}
                      </span>
                    </div>
                  </div>
                </div>
                {role.arrow && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.45rem 0', gap: '2px' }}>
                    <ArrowDown size={18} color="#94a3b8" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', textAlign: 'center' }}>
                      {role.arrow.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Zones ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <Eyebrow label="Where Field Officers Operate" color="#b45309" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>Operational deployment zones</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {ZONES.map(({ Icon, label, desc }) => (
            <Card key={label} style={{ padding: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.55rem' }}>
                <Icon size={17} color="#b45309" />
              </div>
              <div style={{ fontSize: '0.83rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section style={{ marginBottom: '2rem' }}>
        <Eyebrow label="Planned Upgrades" color="#065f46" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>What's next</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {ROADMAP.map(({ Icon, label, desc }) => (
            <Card key={label} style={{ padding: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.55rem' }}>
                <Icon size={17} color="#065f46" />
              </div>
              <div style={{ fontSize: '0.83rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {[
          { num: '4', label: 'Roles' },
          { num: '2', label: 'AI Engines' },
          { num: '19', label: 'Routes Built' },
          { num: 'Sec. 52', label: 'NDPS Compliant' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f5ca8', letterSpacing: '-0.02em' }}>{s.num}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
