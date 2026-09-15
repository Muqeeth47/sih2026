'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Hash, MapPin, Calendar, Search, CheckCircle2, Clock,
  FileText, SendHorizonal, AlertTriangle, ArrowRight, Zap, Globe,
  XCircle, Image as ImageIcon, Download,
} from 'lucide-react';
import { getAllScanResults } from '@/utils/offlineQueue';
import { supabase } from '@/utils/supabaseClient';
import { generateAssayPDF } from '@/utils/assayPdf';
import type { ScanResult, ReagentType, SubstanceClass, ConfidenceLevel, TestStatus } from '@/types/drug';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  canEscalate, escalateSeizure, ESCALATION_BUTTON_LABEL,
  ESCALATION_STATUS_META, ROLE_QUEUE_STATUS,
  type EscalationStatus, type NCBRole,
} from '@/utils/escalation';

// ── Escalation modal ──────────────────────────────────────────────────────────
function EscalateModal({ caseId, role, badge, onClose, onDone }: {
  caseId: string; role: NCBRole; badge: string; onClose: () => void; onDone: () => void;
}) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const label = ESCALATION_BUTTON_LABEL[role];

  const submit = async () => {
    setBusy(true); setErr('');
    const res = await escalateSeizure(caseId, role, badge, note);
    setBusy(false);
    if (res.success) { onDone(); onClose(); }
    else setErr(res.error ?? 'Unknown error');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <SendHorizonal size={18} color="#0f5ca8" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{label}</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.6 }}>
          Case <strong style={{ color: '#0f172a' }}>{caseId}</strong> will be forwarded to the next tier.
        </p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Reason / note for the receiving officer (optional)" rows={3}
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem', fontFamily: "'Noto Sans', sans-serif", resize: 'vertical', outline: 'none', marginBottom: '0.75rem' }} />
        {err && <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: '0 0 0.75rem' }}>{err}</p>}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif", color: '#475569' }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none', background: busy ? '#94a3b8' : '#0f5ca8', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Noto Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SendHorizonal size={14} /> {busy ? 'Sending…' : label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unified card data shape (covers Supabase + IndexedDB sources) ─────────────
interface VaultCard {
  id: string;
  caseId: string;
  officerBadge: string;
  matchedSubstance: string;
  reagentType: string;
  photoUrl?: string;
  photoDataUrl?: string;
  photoHash: string;
  timestamp: string;
  gpsLat: number;
  gpsLng: number;
  syncPending: boolean;
  // OpenCV
  opencvDeltaE?: number;
  opencvCielab?: { L: number; a: number; b: number };
  opencvVerdict?: string;
  opencvConfidence?: string;
  // Gemini
  geminiVerdict?: string;
  geminiRejectReason?: string;
  geminiObservedColor?: string;
  geminiCourtSummary?: string;
  geminiLot?: string;
  geminiExpiry?: string;
  tamperDetected?: boolean;
  // Escalation
  escalationStatus?: string;
}

function mapSupabaseRow(row: any): VaultCard {
  const assay = Array.isArray(row.scan_assays) ? row.scan_assays[0] : row.scan_assays;
  return {
    id: row.id,
    caseId: row.case_id,
    officerBadge: row.officer_badge,
    matchedSubstance: row.substance,
    reagentType: assay?.reagent_type ?? row.reagent_type ?? 'unknown',
    photoUrl: row.photo_url ?? assay?.photo_url ?? undefined,
    photoHash: row.photo_hash,
    timestamp: row.created_at,
    gpsLat: row.gps_latitude,
    gpsLng: row.gps_longitude,
    syncPending: false,
    opencvDeltaE: assay?.opencv_delta_e,
    opencvCielab: assay?.opencv_cielab,
    opencvVerdict: assay?.opencv_verdict,
    opencvConfidence: assay?.opencv_confidence,
    geminiVerdict: assay?.gemini_verdict,
    geminiRejectReason: assay?.gemini_reject_reason,
    geminiObservedColor: assay?.gemini_observed_color,
    geminiCourtSummary: assay?.gemini_court_summary,
    geminiLot: assay?.gemini_lot_number,
    geminiExpiry: assay?.gemini_expiry,
    tamperDetected: assay?.tamper_detected,
    escalationStatus: row.escalation_status,
  };
}

function mapLocalScan(scan: ScanResult): VaultCard {
  return {
    id: scan.id,
    caseId: scan.caseId ?? scan.id,
    officerBadge: scan.officerBadge,
    matchedSubstance: scan.matchedSubstance,
    reagentType: scan.reagentType,
    photoUrl: scan.photoUrl,
    photoDataUrl: scan.photoDataUrl,
    photoHash: scan.photoHash,
    timestamp: scan.timestamp,
    gpsLat: scan.gps.latitude,
    gpsLng: scan.gps.longitude,
    syncPending: scan.syncPending,
    opencvDeltaE: scan.deltaE,
    opencvCielab: { L: scan.capturedColor.L, a: scan.capturedColor.a, b: scan.capturedColor.bStar },
    opencvVerdict: scan.testStatus,
    opencvConfidence: scan.confidence,
    geminiVerdict: scan.aiAnalysis?.verdict,
    geminiRejectReason: scan.aiAnalysis?.rejectReason,
    geminiObservedColor: scan.aiAnalysis?.observedColor,
    geminiCourtSummary: scan.aiAnalysis?.courtSummary,
    geminiLot: scan.aiAnalysis?.pouchLotNumber,
    geminiExpiry: scan.aiAnalysis?.pouchExpiry,
    tamperDetected: scan.aiAnalysis?.tamperDetected,
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EvidenceVaultPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'ncb_io') as NCBRole;

  const [cards, setCards]             = useState<VaultCard[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterSubstance, setFilter]  = useState('all');
  const [activeTab, setActiveTab]     = useState<'all' | 'queue'>('all');
  const [modalCaseId, setModalCaseId] = useState<string | null>(null);
  const [escStatuses, setEscStatuses] = useState<Record<string, string>>({});

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seizures')
        .select(`*, scan_assays(opencv_delta_e, opencv_cielab, opencv_verdict, opencv_confidence, gemini_verdict, gemini_reject_reason, gemini_observed_color, gemini_court_summary, gemini_lot_number, gemini_expiry, tamper_detected, photo_url, reagent_type)`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setCards(data.map(mapSupabaseRow));
        const escMap: Record<string, string> = {};
        data.forEach((r: any) => { if (r.escalation_status) escMap[r.case_id] = r.escalation_status; });
        setEscStatuses(escMap);
        setLoading(false);
        return;
      }
    } catch { /* fall through */ }

    // Fallback: IndexedDB (offline scans)
    try {
      const local = (await getAllScanResults()) as ScanResult[];
      setCards(local.map(mapLocalScan));
    } catch {
      setCards([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const filteredCards = cards.filter(card => {
    const matchSearch =
      card.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.matchedSubstance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.officerBadge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.photoHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubstance = filterSubstance === 'all' || card.matchedSubstance.toLowerCase().includes(filterSubstance.toLowerCase());
    const matchTab = activeTab === 'all' ? true : ROLE_QUEUE_STATUS[role] ? card.escalationStatus === ROLE_QUEUE_STATUS[role] : false;
    return matchSearch && matchSubstance && matchTab;
  });

  const queueCount = cards.filter(c => ROLE_QUEUE_STATUS[role] && c.escalationStatus === ROLE_QUEUE_STATUS[role]).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>
      {modalCaseId && user && (
        <EscalateModal caseId={modalCaseId} role={role} badge={user.badge} onClose={() => setModalCaseId(null)} onDone={loadCards} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={26} color="var(--ncb-navy-primary)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>Tamper-Proof Evidence Vault</h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            Immutable forensic ledger — SHA-256 sealed, GPS locked, Supabase synced.
          </p>
        </div>
        <div style={{ background: 'var(--ncb-green-subtle)', border: '1px solid #86efac', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-green)' }}>
          <CheckCircle2 size={14} /> Supabase Realtime Sync
        </div>
      </div>

      {/* Queue tabs */}
      {ROLE_QUEUE_STATUS[role] && (
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0' }}>
          {(['all', 'queue'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.55rem 1.1rem', border: 'none', background: 'transparent', fontFamily: "'Noto Sans', sans-serif", fontSize: '0.84rem', fontWeight: 700, color: activeTab === tab ? '#0f5ca8' : '#64748b', borderBottom: activeTab === tab ? '2px solid #0f5ca8' : '2px solid transparent', cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {tab === 'all' ? 'All Evidence' : (<>Pending My Review {queueCount > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800 }}>{queueCount}</span>}</>)}
            </button>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--ncb-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search Case ID, Badge, Substance, Hash…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Noto Sans', sans-serif" }} />
        </div>
        <select value={filterSubstance} onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--ncb-border)', background: 'white', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}>
          <option value="all">All Substances</option>
          <option value="heroin">Heroin / Opiates</option>
          <option value="cocaine">Cocaine HCl</option>
          <option value="cannabis">Cannabis</option>
          <option value="methamphetamine">Methamphetamine</option>
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading vault from Supabase…</div>
      ) : filteredCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: 'var(--ncb-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {activeTab === 'queue' ? 'No cases pending your review.' : 'No evidence records yet. Submit a scan to populate the vault.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCards.map(card => {
            const escStatus = (card.escalationStatus ?? escStatuses[card.caseId]) as EscalationStatus | undefined;
            const escMeta   = escStatus ? ESCALATION_STATUS_META[escStatus] : null;
            const showEscBtn = canEscalate(role, escStatus ?? null);
            const isPositive = card.opencvVerdict === 'positive' || card.matchedSubstance !== 'negative';
            const photoSrc   = card.photoUrl || card.photoDataUrl;

            return (
              <div key={card.id} style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${activeTab === 'queue' ? '#fde68a' : '#e2e8f0'}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Top: photo + header */}
                <div style={{ display: 'flex', gap: '1rem', padding: '1.1rem', flexWrap: 'wrap' }}>
                  {/* Photo thumbnail */}
                  <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {photoSrc ? (
                      <img src={photoSrc} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={28} color="#94a3b8" />
                    )}
                  </div>

                  {/* Case info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>{card.caseId}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', background: isPositive ? '#fee2e2' : '#f0fdf4', color: isPositive ? '#dc2626' : '#16a34a', border: `1px solid ${isPositive ? '#fecaca' : '#bbf7d0'}` }}>
                        {card.matchedSubstance.toUpperCase()}
                      </span>
                      {escMeta && (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, background: escMeta.bg, color: escMeta.color, border: `1px solid ${escMeta.color}40`, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ArrowRight size={10} /> {escMeta.label}
                        </span>
                      )}
                      {card.syncPending
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: '#f59e0b', fontWeight: 600 }}><Clock size={12} /> Local Cache</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}><CheckCircle2 size={12} /> Synced</span>
                      }
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.74rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {new Date(card.timestamp).toLocaleString('en-IN')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {card.gpsLat.toFixed(4)}°N, {card.gpsLng.toFixed(4)}°E</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>IO: {card.officerBadge}</span>
                    </div>
                  </div>
                </div>

                {/* Dual-panel result strip */}
                {/* Dual-panel result strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  {/* Color Match panel */}
                  <div style={{ background: '#fff', padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                      <Zap size={13} color="#0f5ca8" />
                      <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f5ca8' }}>Check 1: Instant Color Match</span>
                    </div>
                    {card.opencvDeltaE !== undefined && (
                      <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55 }}>
                        <div>Color Distance (ΔE): <strong>{card.opencvDeltaE.toFixed(2)}</strong></div>
                        {card.opencvCielab && (
                          <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>
                            L*{card.opencvCielab.L?.toFixed(1)} a*{card.opencvCielab.a?.toFixed(1)} b*{card.opencvCielab.b?.toFixed(1)}
                          </div>
                        )}
                        <div style={{ marginTop: '0.25rem' }}>
                          Finding: <strong style={{ color: card.opencvVerdict === 'positive' ? '#dc2626' : '#16a34a' }}>{card.opencvVerdict?.toUpperCase() ?? '—'}</strong>
                          {card.opencvConfidence && <span style={{ color: '#64748b' }}> ({card.opencvConfidence} confidence)</span>}
                        </div>
                      </div>
                    )}
                    {card.opencvDeltaE === undefined && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No color data recorded</div>}
                  </div>

                  {/* AI panel */}
                  <div style={{ background: '#fff', padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                      <Globe size={13} color="#7c3aed" />
                      <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed' }}>Check 2: AI Verification</span>
                    </div>
                    {card.geminiVerdict ? (
                      <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {card.geminiVerdict === 'ACCEPTED' ? <CheckCircle2 size={12} color="#16a34a" /> : <XCircle size={12} color="#dc2626" />}
                          <strong style={{ color: card.geminiVerdict === 'ACCEPTED' ? '#15803d' : '#dc2626' }}>{card.geminiVerdict}</strong>
                          {card.geminiRejectReason && <span style={{ color: '#64748b' }}>— {card.geminiRejectReason}</span>}
                        </div>
                        {card.geminiObservedColor && <div>Colour: {card.geminiObservedColor}</div>}
                        {card.geminiCourtSummary && (
                          <div style={{ marginTop: '0.25rem', color: '#64748b', fontSize: '0.72rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {card.geminiCourtSummary}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No AI analysis recorded</div>
                    )}
                  </div>
                </div>

                {/* Hash + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '0.85rem 1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                      <Hash size={11} /> SHA-256 Fingerprint
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#0f5ca8', wordBreak: 'break-all' }}>{card.photoHash}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        const scanObj: ScanResult = {
                          id: card.id,
                          timestamp: card.timestamp,
                          officerBadge: card.officerBadge,
                          reagentType: (card.reagentType as any) || 'marquis',
                          capturedColor: {
                            r: 100, g: 100, b: 100,
                            L: card.opencvCielab?.L ?? 25,
                            a: card.opencvCielab?.a ?? 20,
                            bStar: card.opencvCielab?.b ?? -20,
                          },
                          deltaE: card.opencvDeltaE ?? 4.2,
                          matchedSubstance: (card.matchedSubstance as any) || 'unknown',
                          matchedReagentRef: null,
                          confidence: (card.opencvConfidence as any) || 'high',
                          testStatus: (card.opencvVerdict as any) || 'positive',
                          blurAnalysis: { laplacianVariance: 250, isSharp: true, warningThreshold: 80, message: 'Sharp' },
                          glareAnalysis: { hasGlare: false, glarePercentage: 1.0, saturationWarning: false },
                          photoHash: card.photoHash,
                          photoDataUrl: card.photoDataUrl,
                          photoUrl: card.photoUrl,
                          gps: { latitude: card.gpsLat, longitude: card.gpsLng, accuracy: 5, timestamp: card.timestamp, source: 'device_gps' },
                          aiAnalysis: card.geminiVerdict ? {
                            verdict: card.geminiVerdict as any,
                            rejectReason: card.geminiRejectReason,
                            observedColor: card.geminiObservedColor,
                            kitType: 'Field Chemical Test Kit',
                            substanceClass: card.matchedSubstance,
                            substance: card.matchedSubstance,
                            confidence: 0.9,
                            tamperDetected: card.tamperDetected ?? false,
                            pouchLotNumber: card.geminiLot,
                            pouchExpiry: card.geminiExpiry,
                            courtSummary: card.geminiCourtSummary || '',
                          } : null,
                          syncPending: card.syncPending,
                          caseId: card.caseId,
                        };
                        generateAssayPDF(scanObj);
                      }}
                      style={{ padding: '0.4rem 0.8rem', background: '#ffffff', color: '#0f5ca8', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      <Download size={13} /> Assay PDF
                    </button>
                    <Link href={`/panchnama?scanId=${card.id}&substance=${encodeURIComponent(card.matchedSubstance)}`}
                      style={{ padding: '0.4rem 0.8rem', background: 'var(--ncb-navy-primary)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={13} /> Memo
                    </Link>
                    {showEscBtn && (
                      <button onClick={() => setModalCaseId(card.caseId)}
                        style={{ padding: '0.4rem 0.85rem', background: '#fef9ec', color: '#92400e', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <SendHorizonal size={13} /> {ESCALATION_BUTTON_LABEL[role]}
                      </button>
                    )}
                  </div>
                </div>

                {/* Escalation note */}
                {escStatus && (
                  <div style={{ margin: '0 1rem 0.85rem', background: escMeta?.bg ?? '#f8fafc', border: `1px solid ${escMeta?.color ?? '#e2e8f0'}30`, borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={12} color={escMeta?.color ?? '#64748b'} />
                    This case is under <strong style={{ marginLeft: '0.25rem' }}>{escMeta?.label}</strong>.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
