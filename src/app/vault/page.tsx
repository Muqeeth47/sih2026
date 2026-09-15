'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Hash, MapPin, Calendar, Search, CheckCircle2, Clock,
  FileText, SendHorizonal, ChevronDown, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { getAllScanResults } from '@/utils/offlineQueue';
import { MOCK_SCAN_RESULTS } from '@/data/mockData';
import type { ScanResult } from '@/types/drug';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import {
  canEscalate,
  escalateSeizure,
  ESCALATION_BUTTON_LABEL,
  ESCALATION_STATUS_META,
  ROLE_QUEUE_STATUS,
  type EscalationStatus,
  type NCBRole,
} from '@/utils/escalation';

// ─── Escalation modal ────────────────────────────────────────────────────────

function EscalateModal({
  caseId,
  role,
  badge,
  onClose,
  onDone,
}: {
  caseId: string;
  role: NCBRole;
  badge: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [err,  setErr]        = useState('');
  const label = ESCALATION_BUTTON_LABEL[role];

  const submit = async () => {
    setBusy(true);
    setErr('');
    const res = await escalateSeizure(caseId, role, badge, note);
    setBusy(false);
    if (res.success) { onDone(); onClose(); }
    else setErr(res.error ?? 'Unknown error');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '1.75rem',
        width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        fontFamily: "'Noto Sans', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <SendHorizonal size={18} color="#0f5ca8" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{label}</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.6 }}>
          Case <strong style={{ color: '#0f172a' }}>{caseId}</strong> will be forwarded to the next tier.
          Add an optional note for the receiving officer.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Reason / note for the receiving officer (optional)"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem',
            border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem',
            fontFamily: "'Noto Sans', sans-serif", resize: 'vertical', outline: 'none',
            marginBottom: '0.75rem',
          }}
        />
        {err && <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: '0 0 0.75rem' }}>{err}</p>}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
              background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Noto Sans', sans-serif", color: '#475569',
            }}
          >Cancel</button>
          <button
            onClick={submit}
            disabled={busy}
            style={{
              padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none',
              background: busy ? '#94a3b8' : '#0f5ca8', color: '#fff',
              fontSize: '0.82rem', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: "'Noto Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <SendHorizonal size={14} />
            {busy ? 'Sending…' : label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main vault page ─────────────────────────────────────────────────────────

export default function EvidenceVaultPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'ncb_io') as NCBRole;

  const [scans, setScans]               = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterSubstance, setFilter]    = useState('all');
  // 'all' | 'queue' (pending for my role)
  const [activeTab, setActiveTab]       = useState<'all' | 'queue'>('all');
  // live Supabase escalation statuses keyed by caseId
  const [escStatuses, setEscStatuses]   = useState<Record<string, string>>({});
  const [modalCaseId, setModalCaseId]   = useState<string | null>(null);

  // Load scan results
  useEffect(() => {
    const load = async () => {
      try {
        const stored = (await getAllScanResults()) as ScanResult[];
        const existingIds = new Set(stored.map(s => s.id));
        const combined = stored.length > 0
          ? [...stored, ...MOCK_SCAN_RESULTS.filter(m => !existingIds.has(m.id))]
          : MOCK_SCAN_RESULTS;
        setScans(combined);
      } catch {
        setScans(MOCK_SCAN_RESULTS);
      }
    };
    load();
  }, []);

  // Fetch current escalation statuses from Supabase
  const refreshStatuses = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('seizures')
        .select('case_id, escalation_status');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { if (row.escalation_status) map[row.case_id] = row.escalation_status; });
        setEscStatuses(map);
      }
    } catch { /* offline / not yet migrated — graceful */ }
  }, []);

  useEffect(() => { refreshStatuses(); }, [refreshStatuses]);

  const filtered = scans.filter(scan => {
    const matchSearch =
      scan.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.matchedSubstance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.officerBadge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.photoHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSubstance =
      filterSubstance === 'all' ||
      scan.matchedSubstance.toLowerCase() === filterSubstance.toLowerCase();

    const matchTab = activeTab === 'all'
      ? true
      : ROLE_QUEUE_STATUS[role]
        ? escStatuses[scan.caseId ?? ''] === ROLE_QUEUE_STATUS[role]
        : false;

    return matchSearch && matchSubstance && matchTab;
  });

  const queueCount = scans.filter(s =>
    ROLE_QUEUE_STATUS[role] && escStatuses[s.caseId ?? ''] === ROLE_QUEUE_STATUS[role]
  ).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* Escalation modal */}
      {modalCaseId && user && (
        <EscalateModal
          caseId={modalCaseId}
          role={role}
          badge={user.badge}
          onClose={() => setModalCaseId(null)}
          onDone={refreshStatuses}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={26} color="var(--ncb-navy-primary)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
              Tamper-Proof Evidence Vault
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            Immutable forensic ledger sealed with SHA-256 hashes &amp; GPS locks. Escalate disputed cases to the next tier.
          </p>
        </div>
        <div style={{ background: 'var(--ncb-green-subtle)', border: '1px solid #86efac', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-green)' }}>
          <CheckCircle2 size={14} /> 100% Hash Seals Intact
        </div>
      </div>

      {/* Tabs: All Evidence | My Queue */}
      {ROLE_QUEUE_STATUS[role] && (
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0' }}>
          {(['all', 'queue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.55rem 1.1rem', border: 'none', background: 'transparent',
                fontFamily: "'Noto Sans', sans-serif", fontSize: '0.84rem', fontWeight: 700,
                color: activeTab === tab ? '#0f5ca8' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #0f5ca8' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-2px',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {tab === 'all' ? 'All Evidence' : (
                <>
                  Pending My Review
                  {queueCount > 0 && (
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800 }}>
                      {queueCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--ncb-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Case ID, Officer Badge, Substance, or Hash…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--ncb-border)',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Noto Sans', sans-serif",
            }}
          />
        </div>
        <select
          value={filterSubstance}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--ncb-border)', background: 'white',
            fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
            fontFamily: "'Noto Sans', sans-serif",
          }}
        >
          <option value="all">All Substances</option>
          <option value="heroin">Heroin / Opiates</option>
          <option value="cocaine">Cocaine HCl</option>
          <option value="cannabis">Cannabis</option>
          <option value="methamphetamine">Methamphetamine</option>
        </select>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)' }}>
            <p style={{ color: 'var(--ncb-text-muted)', fontSize: '0.9rem', margin: 0 }}>
              {activeTab === 'queue'
                ? 'No cases pending your review right now.'
                : 'No evidence records match the current filter.'}
            </p>
          </div>
        ) : (
          filtered.map(scan => {
            const isHeroin  = scan.matchedSubstance.includes('heroin');
            const isCocaine = scan.matchedSubstance.includes('cocaine');
            const badgeColor = isHeroin ? 'var(--ncb-crimson)' : isCocaine ? 'var(--ncb-gold)' : 'var(--ncb-green)';
            const escStatus = escStatuses[scan.caseId ?? ''] as EscalationStatus | undefined;
            const escMeta   = escStatus ? ESCALATION_STATUS_META[escStatus] : null;
            const showEscBtn = canEscalate(role, escStatus ?? null);

            return (
              <div
                key={scan.id}
                style={{
                  background: '#fff', borderRadius: '12px',
                  border: `1px solid ${activeTab === 'queue' ? '#fde68a' : '#e2e8f0'}`,
                  padding: '1.25rem',
                  boxShadow: activeTab === 'queue' ? '0 2px 12px rgba(180,83,9,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: '0.85rem',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)' }}>
                    {scan.caseId || 'NCB-SEAL-PENDING'}
                  </span>

                  {/* Substance badge */}
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '4px',
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                    background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}40`,
                  }}>
                    {scan.matchedSubstance.toUpperCase()}
                  </span>

                  {/* Escalation status badge */}
                  {escMeta && (
                    <span style={{
                      padding: '0.15rem 0.55rem', borderRadius: '4px',
                      fontSize: '0.68rem', fontWeight: 700,
                      background: escMeta.bg, color: escMeta.color,
                      border: `1px solid ${escMeta.color}40`,
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                      <ArrowRight size={10} />
                      {escMeta.label}
                    </span>
                  )}

                  {/* Sync badge */}
                  {scan.syncPending
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--ncb-amber)', fontWeight: 600 }}><Clock size={12} /> Local Cache</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--ncb-green)', fontWeight: 600 }}><CheckCircle2 size={12} /> Synced to HQ</span>
                  }
                </div>

                {/* Court summary */}
                <div style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', lineHeight: 1.55 }}>
                  {scan.aiAnalysis?.courtSummary || `Test: ${scan.reagentType.toUpperCase()} reagent. ΔE₂₀₀₀ = ${scan.deltaE}.`}
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--ncb-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> {new Date(scan.timestamp).toLocaleString('en-IN')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> {scan.gps.latitude.toFixed(4)}°N, {scan.gps.longitude.toFixed(4)}°E
                  </span>
                </div>

                {/* Hash + action row */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Hash */}
                  <div style={{ flex: 1, minWidth: 200, background: 'var(--ncb-surface-2)', padding: '0.7rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ncb-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      <Hash size={12} /> SHA-256 Fingerprint
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--ncb-navy-primary)', wordBreak: 'break-all' }}>
                      {scan.photoHash}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', marginTop: '0.35rem' }}>
                      IO: <strong>{scan.officerBadge}</strong>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <Link
                      href={`/panchnama?scanId=${scan.id}&substance=${encodeURIComponent(scan.matchedSubstance)}`}
                      style={{
                        padding: '0.4rem 0.8rem', background: 'var(--ncb-navy-primary)', color: '#fff',
                        borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      <FileText size={13} /> Memo
                    </Link>

                    {/* Escalation button — only shown when role can act */}
                    {showEscBtn && (
                      <button
                        onClick={() => setModalCaseId(scan.caseId ?? scan.id)}
                        style={{
                          padding: '0.4rem 0.85rem', background: '#fef9ec',
                          color: '#92400e', border: '1px solid #fde68a',
                          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif",
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}
                      >
                        <SendHorizonal size={13} />
                        {ESCALATION_BUTTON_LABEL[role]}
                      </button>
                    )}
                  </div>
                </div>

                {/* Escalation note (if any) */}
                {escStatus && (
                  <div style={{
                    background: escMeta?.bg ?? '#f8fafc',
                    border: `1px solid ${escMeta?.color ?? '#e2e8f0'}30`,
                    borderRadius: '6px', padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    <AlertTriangle size={12} color={escMeta?.color ?? '#64748b'} />
                    <span>
                      This case is currently under <strong>{escMeta?.label}</strong>.
                      {role === 'ncb_court' && escStatus === 'court_review' && ' Tap "Mark Resolved" after adjudication.'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
