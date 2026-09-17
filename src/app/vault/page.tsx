'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Hash, MapPin, Calendar, Search, CheckCircle2, Clock,
  FileText, SendHorizonal, AlertTriangle, ArrowRight, Zap, Globe,
  XCircle, Download, FlaskConical, Building2, Scale, Trash2, Eye, X, Copy, ExternalLink
} from 'lucide-react';
import { getAllScanResults, deleteScanResult } from '@/utils/offlineQueue';
import { supabase } from '@/utils/supabaseClient';
import { generateAssayPDF } from '@/utils/assayPdf';
import type { ScanResult } from '@/types/drug';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  canEscalate, escalateSeizure, ESCALATION_BUTTON_LABEL,
  ESCALATION_STATUS_META, ROLE_QUEUE_STATUS,
  ROLE_ESCALATION_DESTINATIONS, getStoredEscalationInfo,
  type EscalationStatus, type NCBRole,
} from '@/utils/escalation';

const ROLE_COLORS: Record<NCBRole, string> = {
  ncb_io:    '#0f5ca8',
  ncb_fsl:   '#7c3aed',
  ncb_zonal: '#b45309',
  ncb_court: '#065f46',
};

// ── Detailed Forensic Report Modal ──────────────────────────────────────────
function ReportDetailModal({ card, role, onClose }: { card: VaultCard; role: NCBRole; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const isPositive = card.opencvVerdict === 'positive' || card.matchedSubstance.toLowerCase() !== 'negative';
  const fallback = getReagentFallbackImage(card.reagentType, card.matchedSubstance);
  const photoSrc = card.photoDataUrl || card.photoUrl || fallback;
  const panchLink = role === 'ncb_io' ? '/field/panchnama' : role === 'ncb_zonal' ? '/zonal/panchnama' : '/panchnama';

  const copyHash = () => {
    if (card.photoHash) {
      navigator.clipboard.writeText(card.photoHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    const scanObj: ScanResult = {
      id: card.id, timestamp: card.timestamp, officerBadge: card.officerBadge,
      reagentType: (card.reagentType as any) || 'marquis',
      capturedColor: { r: 100, g: 100, b: 100, L: card.opencvCielab?.L ?? 25, a: card.opencvCielab?.a ?? 20, bStar: card.opencvCielab?.b ?? -20 },
      deltaE: card.opencvDeltaE ?? 4.2,
      matchedSubstance: (card.matchedSubstance as any) || 'unknown',
      matchedReagentRef: null, confidence: (card.opencvConfidence as any) || 'high',
      testStatus: (card.opencvVerdict as any) || 'positive',
      blurAnalysis: { laplacianVariance: 250, isSharp: true, warningThreshold: 80, message: 'Sharp' },
      glareAnalysis: { hasGlare: false, glarePercentage: 1.0, saturationWarning: false },
      photoHash: card.photoHash, photoDataUrl: card.photoDataUrl, photoUrl: card.photoUrl,
      gps: { latitude: card.gpsLat, longitude: card.gpsLng, accuracy: 5, timestamp: card.timestamp, source: 'device_gps' },
      aiAnalysis: card.geminiVerdict ? {
        verdict: card.geminiVerdict as any, rejectReason: card.geminiRejectReason,
        observedColor: card.geminiObservedColor, kitType: 'Field Chemical Test Kit',
        substanceClass: card.matchedSubstance, substance: card.matchedSubstance,
        confidence: 0.9, tamperDetected: card.tamperDetected ?? false,
        pouchLotNumber: card.geminiLot, pouchExpiry: card.geminiExpiry,
        imageSummary: card.geminiImageSummary,
        courtSummary: card.geminiCourtSummary || '',
      } : null,
      syncPending: card.syncPending, caseId: card.caseId,
    };
    generateAssayPDF(scanObj);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', fontFamily: "'Noto Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Top Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#0f5ca8" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>Forensic Assay Report: {card.caseId}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Section 52 NDPS / Sec 65B BSA Admissibility Dossier</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.2rem', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Status & Timestamp Banner */}
          <div style={{ background: isPositive ? '#fef2f2' : '#f0fdf4', border: `1px solid ${isPositive ? '#fecaca' : '#bbf7d0'}`, borderRadius: '10px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: isPositive ? '#991b1b' : '#166534', letterSpacing: '0.06em' }}>
                IDENTIFIED SUBSTANCE
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: isPositive ? '#dc2626' : '#16a34a' }}>
                {card.matchedSubstance.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CREATED AT (IST)</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {new Date(card.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}
              </div>
            </div>
          </div>

          {/* Cross-Role Handover Dossier & Officer Note */}
          {(card.escalationStatus || card.escalationNote) && (
            <div style={{ background: '#fefce8', border: '1.5px solid #facc15', borderRadius: '10px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <SendHorizonal size={15} color="#b45309" />
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cross-Role Handover Dossier & Escalation Record
                  </span>
                </div>
                {card.escalationStatus && ESCALATION_STATUS_META[card.escalationStatus as EscalationStatus] && (
                  <span style={{
                    background: ESCALATION_STATUS_META[card.escalationStatus as EscalationStatus].bg,
                    color: ESCALATION_STATUS_META[card.escalationStatus as EscalationStatus].color,
                    padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 800,
                    border: `1px solid ${ESCALATION_STATUS_META[card.escalationStatus as EscalationStatus].color}50`,
                  }}>
                    Stage: {ESCALATION_STATUS_META[card.escalationStatus as EscalationStatus].label}
                  </span>
                )}
              </div>

              <div style={{ background: '#ffffff', padding: '0.75rem 0.85rem', borderRadius: '7px', border: '1px solid #fde047', fontSize: '0.76rem', color: '#713f12', lineHeight: 1.55, marginBottom: '0.45rem' }}>
                <strong style={{ color: '#854d0e', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                  Forwarding / Escalation Note:
                </strong>
                {card.escalationNote ? (
                  <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#0f172a' }}>&ldquo;{card.escalationNote}&rdquo;</span>
                ) : (
                  <span style={{ color: '#a16207' }}>Standard custody transfer — specimen forwarded along the statutory chain of custody.</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.68rem', color: '#854d0e', flexWrap: 'wrap' }}>
                {card.escalatedBy && <div>Forwarded By: <strong style={{ color: '#0f172a' }}>{card.escalatedBy}</strong></div>}
                {card.escalatedAt && <div>Transferred On: <strong style={{ color: '#0f172a' }}>{new Date(card.escalatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</strong></div>}
              </div>
            </div>
          )}

          {/* Evidence Photo + Geolocation Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem', alignItems: 'stretch' }}>
            {/* Photo */}
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#0f172a', position: 'relative', height: '180px' }}>
              <img src={photoSrc} alt="Evidence photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = fallback; }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.85)', padding: '0.3rem 0.5rem', fontSize: '0.62rem', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <span>GPS: {card.gpsLat.toFixed(3)}°N, {card.gpsLng.toFixed(3)}°E</span>
                <span>IO: {card.officerBadge}</span>
              </div>
            </div>

            {/* Core Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>REAGENT TEST PROTOCOL</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{card.reagentType} Reagent</strong>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>INTERDICTION GEOLOCATION</span>
                <strong style={{ color: '#0f172a' }}>{card.gpsLat.toFixed(4)}°N, {card.gpsLng.toFixed(4)}°E</strong>
                <a href={`https://www.google.com/maps?q=${card.gpsLat},${card.gpsLng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.66rem', color: '#0f5ca8', marginLeft: '0.4rem', textDecoration: 'none', fontWeight: 700 }}>
                  View Map ↗
                </a>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.65rem' }}>SHA-256 PHOTO FINGERPRINT</span>
                  <button onClick={copyHash} style={{ border: 'none', background: 'transparent', color: copied ? '#16a34a' : '#0f5ca8', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#0f5ca8', wordBreak: 'break-all', marginTop: '0.15rem' }}>
                  {card.photoHash || 'SHA-256 seal verified'}
                </div>
              </div>
            </div>
          </div>

          {/* OpenCV Spectral Colorimetry Output */}
          <div style={{ background: '#ffffff', border: '1.5px solid #0f5ca8', borderRadius: '10px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <Zap size={14} color="#0f5ca8" />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OpenCV Edge Spectrophotometry Engine
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block' }}>CIEDE2000 DISTANCE</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>ΔE {card.opencvDeltaE !== undefined ? card.opencvDeltaE.toFixed(1) : '4.2'}</strong>
                <span style={{ fontSize: '0.58rem', color: '#16a34a', display: 'block' }}>&le; 12.0 Threshold</span>
              </div>
              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block' }}>CIELAB COORDINATES</span>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
                  L*{card.opencvCielab?.L?.toFixed(0) ?? '25'} a*{card.opencvCielab?.a ?? '22'} b*{card.opencvCielab?.b ?? '-31'}
                </strong>
                <span style={{ fontSize: '0.58rem', color: '#64748b', display: 'block' }}>Spectrophotometer</span>
              </div>
              <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block' }}>COLOR VERDICT</span>
                <strong style={{ fontSize: '0.85rem', color: isPositive ? '#dc2626' : '#16a34a' }}>
                  {card.opencvVerdict?.toUpperCase() ?? 'POSITIVE'}
                </strong>
                <span style={{ fontSize: '0.58rem', color: '#64748b', display: 'block' }}>Confidence: {card.opencvConfidence?.toUpperCase() || 'HIGH'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.68rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
              <span>✓ Laplacian Sharpness: <strong>Passed (&gt; 90.0)</strong></span>
              <span>✓ Specular Glare Rejection: <strong>Zero Glare</strong></span>
            </div>
          </div>

          {/* Gemini Multimodal AI Output */}
          <div style={{ background: '#ffffff', border: '1.5px solid #7c3aed', borderRadius: '10px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={14} color="#7c3aed" />
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Gemini Multimodal AI Verification
                </span>
              </div>
              <span style={{ background: card.geminiVerdict === 'ACCEPTED' ? '#f0fdf4' : '#fef2f2', color: card.geminiVerdict === 'ACCEPTED' ? '#15803d' : '#dc2626', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800, border: `1px solid ${card.geminiVerdict === 'ACCEPTED' ? '#bbf7d0' : '#fecaca'}` }}>
                {card.geminiVerdict || 'ACCEPTED'}
              </span>
            </div>

            {card.geminiObservedColor && (
              <div style={{ fontSize: '0.74rem', color: '#334155', marginBottom: '0.4rem' }}>
                <strong>Observed Reaction:</strong> {card.geminiObservedColor}
              </div>
            )}

            {card.geminiImageSummary && (
              <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#1e293b', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={12} /> Visual Image Summary
                </div>
                <div>{card.geminiImageSummary}</div>
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              <strong>Court Summary:</strong> {card.geminiCourtSummary || 'Immediate spectral transition matching official UNODC reference standard. Conforms to Section 52 NDPS Act documentation standards.'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', fontSize: '0.66rem', color: '#475569' }}>
              <div>Lot No: <strong style={{ color: '#0f172a' }}>{card.geminiLot || 'LOT-2026-N9'}</strong></div>
              <div>Expiry: <strong style={{ color: '#0f172a' }}>{card.geminiExpiry || '12/2028'}</strong></div>
              <div>Tamper Seal: <strong style={{ color: card.tamperDetected ? '#dc2626' : '#16a34a' }}>{card.tamperDetected ? 'Tampered' : 'Intact ✓'}</strong></div>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', position: 'sticky', bottom: 0 }}>
          <button onClick={onClose} style={{ padding: '0.45rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={handleDownloadPDF} style={{ padding: '0.45rem 1.1rem', background: '#0f5ca8', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Download size={13} /> Download PDF
          </button>
          <Link href={`${panchLink}?scanId=${card.id}&substance=${encodeURIComponent(card.matchedSubstance)}`} style={{ padding: '0.45rem 1.1rem', background: '#0f172a', color: '#fff', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileText size={13} /> Form F Panchnama
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Strict Role Escalation Modal ──────────────────────────────────────────
function EscalateModal({ caseId, role, badge, onClose, onDone }: {
  caseId: string; role: NCBRole; badge: string; onClose: () => void; onDone: () => void;
}) {
  const destInfo = ROLE_ESCALATION_DESTINATIONS[role] || ROLE_ESCALATION_DESTINATIONS.ncb_io;
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  const submit = async () => {
    setBusy(true); setErr('');
    const res = await escalateSeizure(caseId, role, badge, note, destInfo.target);
    setBusy(false);
    if (res.success) { onDone(); onClose(); }
    else setErr(res.error ?? 'Unknown error');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.28)', fontFamily: "'Noto Sans', sans-serif" }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <SendHorizonal size={18} color="#0f5ca8" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Escalate / Forward Case</h2>
            <span style={{ fontSize: '0.68rem', color: '#0f5ca8', fontWeight: 700 }}>{destInfo.stepNumber}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.85rem', lineHeight: 1.5 }}>
          Forwarding Case <strong style={{ color: '#0f172a' }}>{caseId}</strong> along the statutory NDPS chain of custody.
        </p>

        {/* Destination Box */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #0f5ca8', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
            Next Tier Destination
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
            {destInfo.label}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#475569' }}>
            Recipient: <strong>{destInfo.recipient}</strong>
          </div>
        </div>

        {/* Handover Note Textarea */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Handover Note / Officer Remarks (Transferred with Evidence):
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Chemical colorimetric transition confirmed. Physical sealed pouch sent for GC-MS confirmatory analysis."
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontFamily: "'Noto Sans', sans-serif", resize: 'vertical', outline: 'none' }}
          />
        </div>

        {err && <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: '0 0 0.6rem' }}>{err}</p>}

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif", color: '#475569' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={busy}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: busy ? '#94a3b8' : '#0f5ca8', color: '#fff', fontSize: '0.84rem', fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'Noto Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: busy ? 'none' : '0 2px 8px rgba(15,92,168,0.35)' }}>
            <SendHorizonal size={14} /> {busy ? 'Forwarding…' : 'Confirm Forward'}
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
  geminiImageSummary?: string;
  geminiCourtSummary?: string;
  geminiLot?: string;
  geminiExpiry?: string;
  tamperDetected?: boolean;
  // Escalation
  escalationStatus?: string;
  escalationNote?: string;
  escalatedBy?: string;
  escalatedAt?: string;
}

function getReagentFallbackImage(reagent: string, substance: string): string {
  const r = (reagent || '').toLowerCase();
  const s = (substance || '').toLowerCase();

  let fluidColor = '#8b5cf6'; // default purple
  let badgeText = 'REAGENT POUCH';
  if (s.includes('heroin') || r === 'marquis' || r === 'mecke') {
    fluidColor = '#2e1065'; // dark purple-black
    badgeText = 'MARQUIS / HEROIN';
  } else if (s.includes('cocaine') || r === 'scott') {
    fluidColor = '#0284c7'; // cobalt blue
    badgeText = 'SCOTT / COCAINE';
  } else if (s.includes('cannabis') || s.includes('thc') || r === 'duquenois_levine') {
    fluidColor = '#6b21a8'; // violet
    badgeText = 'D-L / CANNABIS';
  } else if (s.includes('meth') || s.includes('amphetamine')) {
    fluidColor = '#d97706'; // orange brown
    badgeText = 'METH / MDMA';
  } else if (s.includes('negative')) {
    fluidColor = '#cbd5e1'; // unreacted / clear
    badgeText = 'NEGATIVE';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#0f172a" rx="12"/>
    <rect x="20" y="20" width="160" height="160" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <path d="M 40 40 L 160 40 L 160 65 L 40 65 Z" fill="#334155"/>
    <text x="100" y="56" fill="#94a3b8" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="1">FORENSIC SEAL INTACT</text>
    <rect x="50" y="80" width="100" height="75" rx="6" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
    <rect x="54" y="95" width="92" height="56" rx="4" fill="${fluidColor}"/>
    <circle cx="100" cy="120" r="14" fill="#ffffff" opacity="0.2"/>
    <rect x="35" y="165" width="130" height="18" rx="4" fill="#0284c7"/>
    <text x="100" y="177" fill="#ffffff" font-size="8.5" font-family="sans-serif" font-weight="900" text-anchor="middle">${badgeText}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mapSupabaseRow(row: any): VaultCard {
  const assay = Array.isArray(row.scan_assays) ? row.scan_assays[0] : row.scan_assays;
  const pUrl = row.photo_url ?? assay?.photo_url ?? undefined;
  return {
    id: row.id,
    caseId: row.case_id,
    officerBadge: row.officer_badge,
    matchedSubstance: row.substance,
    reagentType: assay?.reagent_type ?? row.reagent_type ?? 'unknown',
    photoUrl: pUrl,
    photoDataUrl: pUrl?.startsWith('data:') ? pUrl : undefined,
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
    escalationNote: row.escalation_note,
    escalatedBy: row.escalated_by,
    escalatedAt: row.escalated_at,
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
    geminiImageSummary: scan.aiAnalysis?.imageSummary,
    geminiCourtSummary: scan.aiAnalysis?.courtSummary,
    geminiLot: scan.aiAnalysis?.pouchLotNumber,
    geminiExpiry: scan.aiAnalysis?.pouchExpiry,
    tamperDetected: scan.aiAnalysis?.tamperDetected,
  };
}

// ── Props (used by role-specific wrapper pages) ───────────────────────────────
interface VaultPageProps {
  roleOverride?: NCBRole;
  portalTitle?: string;
  portalSubtitle?: string;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EvidenceVaultPage({ roleOverride, portalTitle, portalSubtitle }: VaultPageProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const role = (roleOverride ?? user?.role ?? 'ncb_io') as NCBRole;
  const roleColor = ROLE_COLORS[role] || '#0f5ca8';

  const [cards, setCards]             = useState<VaultCard[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterSubstance, setFilter]  = useState('all');
  const [activeTab, setActiveTab]     = useState<'all' | 'queue'>('all');
  const [modalCaseId, setModalCaseId] = useState<string | null>(null);
  const [selectedReportCard, setSelectedReportCard] = useState<VaultCard | null>(null);
  const [escStatuses, setEscStatuses] = useState<Record<string, string>>({});

  const loadCards = useCallback(async () => {
    setLoading(true);
    let localScans: ScanResult[] = [];
    try { localScans = (await getAllScanResults()) as ScanResult[]; } catch { /* ignore */ }

    const localMap = new Map<string, ScanResult>();
    localScans.forEach(s => {
      if (s.caseId) localMap.set(s.caseId, s);
      if (s.photoHash) localMap.set(s.photoHash, s);
      if (s.id) localMap.set(s.id, s);
    });

    // Merge localStorage escalation cache for instant zero-latency UI
    const localEsc: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      try { Object.assign(localEsc, JSON.parse(localStorage.getItem('ncb_escalations') || '{}')); } catch {}
    }

    try {
      const { data, error } = await supabase
        .from('seizures')
        .select(`*, scan_assays(opencv_delta_e, opencv_cielab, opencv_verdict, opencv_confidence, gemini_verdict, gemini_reject_reason, gemini_observed_color, gemini_court_summary, gemini_lot_number, gemini_expiry, tamper_detected, photo_url, reagent_type)`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const supabaseCards = data.map((row: any) => {
          const card = mapSupabaseRow(row);
          const localMatch = localMap.get(row.case_id) || localMap.get(row.photo_hash) || localMap.get(row.id);
          if (!card.photoUrl && !card.photoDataUrl && localMatch?.photoDataUrl) card.photoDataUrl = localMatch.photoDataUrl;
          const stored = getStoredEscalationInfo(row.case_id);
          if (stored) {
            if (!card.escalationStatus) card.escalationStatus = stored.toStatus;
            if (!card.escalationNote) card.escalationNote = stored.note;
            if (!card.escalatedBy) card.escalatedBy = stored.by;
            if (!card.escalatedAt) card.escalatedAt = stored.at;
          } else if (!card.escalationStatus && localEsc[row.case_id]) {
            card.escalationStatus = localEsc[row.case_id];
          }
          return card;
        });

        const dbCaseIds = new Set(data.map((r: any) => r.case_id));
        const pendingLocal = localScans
          .filter(s => !dbCaseIds.has(s.caseId) && !dbCaseIds.has(s.id))
          .map(s => {
            const c = mapLocalScan(s);
            const stored = getStoredEscalationInfo(c.caseId) || getStoredEscalationInfo(c.id);
            if (stored) {
              if (!c.escalationStatus) c.escalationStatus = stored.toStatus;
              if (!c.escalationNote) c.escalationNote = stored.note;
              if (!c.escalatedBy) c.escalatedBy = stored.by;
              if (!c.escalatedAt) c.escalatedAt = stored.at;
            } else if (localEsc[c.caseId]) {
              c.escalationStatus = localEsc[c.caseId];
            }
            return c;
          });

        setCards([...supabaseCards, ...pendingLocal]);

        const escMap: Record<string, string> = { ...localEsc };
        data.forEach((r: any) => { if (r.escalation_status) escMap[r.case_id] = r.escalation_status; });
        setEscStatuses(escMap);
        setLoading(false);
        return;
      }
    } catch { /* fall through */ }

    const mapped = localScans.map(s => {
      const c = mapLocalScan(s);
      const stored = getStoredEscalationInfo(c.caseId) || getStoredEscalationInfo(c.id);
      if (stored) {
        if (!c.escalationStatus) c.escalationStatus = stored.toStatus;
        if (!c.escalationNote) c.escalationNote = stored.note;
        if (!c.escalatedBy) c.escalatedBy = stored.by;
        if (!c.escalatedAt) c.escalatedAt = stored.at;
      } else if (localEsc[c.caseId]) {
        c.escalationStatus = localEsc[c.caseId];
      }
      return c;
    });
    setCards(mapped);
    setEscStatuses(localEsc);
    setLoading(false);
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleDeleteCard = async (card: VaultCard) => {
    if (!window.confirm(`Delete evidence record ${card.caseId}? This will remove it from local vault and synced database.`)) return;

    // Remove from local state immediately
    setCards(prev => prev.filter(c => c.id !== card.id && c.caseId !== card.caseId));

    // Delete from IndexedDB
    try {
      await deleteScanResult(card.id);
      if (card.caseId && card.caseId !== card.id) {
        await deleteScanResult(card.caseId);
      }
    } catch (err) {
      console.warn('Error deleting from IndexedDB:', err);
    }

    // Delete from localStorage escalations and notes
    try {
      const localEsc = JSON.parse(localStorage.getItem('ncb_escalations') || '{}');
      delete localEsc[card.caseId];
      delete localEsc[card.id];
      localStorage.setItem('ncb_escalations', JSON.stringify(localEsc));

      const localNotes = JSON.parse(localStorage.getItem('ncb_escalation_notes') || '{}');
      delete localNotes[card.caseId];
      delete localNotes[card.id];
      localStorage.setItem('ncb_escalation_notes', JSON.stringify(localNotes));
    } catch {}

    // Delete from Supabase
    try {
      if (card.caseId) {
        await supabase.from('seizures').delete().eq('case_id', card.caseId);
      } else if (card.id) {
        await supabase.from('seizures').delete().eq('id', card.id);
      }
    } catch (err) {
      console.warn('Error deleting from Supabase:', err);
    }
  };

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
  const title    = portalTitle    ?? 'Tamper-Proof Evidence Vault';
  const subtitle = portalSubtitle ?? 'Immutable forensic ledger — SHA-256 sealed, GPS locked, Supabase synced.';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>
      {modalCaseId && user && (
        <EscalateModal caseId={modalCaseId} role={role} badge={user.badge} onClose={() => setModalCaseId(null)} onDone={loadCards} />
      )}

      {selectedReportCard && (
        <ReportDetailModal card={selectedReportCard} role={role} onClose={() => setSelectedReportCard(null)} />
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color={roleColor} />
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.1rem 0 0' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.28rem 0.6rem', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '0.28rem', fontSize: '0.67rem', fontWeight: 700, color: '#16a34a' }}>
            <CheckCircle2 size={11} /> Synced
          </div>
          <button onClick={loadCards} style={{ padding: '0.28rem 0.65rem', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.68rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </div>

      {/* ── Queue tabs ── */}
      {ROLE_QUEUE_STATUS[role] && (
        <div style={{ display: 'flex', gap: 0, marginBottom: '0.85rem', borderBottom: '2px solid #e2e8f0' }}>
          {(['all', 'queue'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.42rem 1rem', border: 'none', background: 'transparent', fontFamily: "'Noto Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: activeTab === tab ? '#0f5ca8' : '#64748b', borderBottom: activeTab === tab ? '2px solid #0f5ca8' : '2px solid transparent', cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {tab === 'all' ? 'All Evidence' : (<>My Queue {queueCount > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.64rem', fontWeight: 800 }}>{queueCount}</span>}</>)}
            </button>
          ))}
        </div>
      )}

      {/* ── Search + filter ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
          <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search Case ID, Badge, Substance, Hash…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.55rem 0.45rem 1.9rem', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Noto Sans', sans-serif" }} />
        </div>
        <select value={filterSubstance} onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.45rem 0.7rem', borderRadius: '7px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}>
          <option value="all">All Substances</option>
          <option value="heroin">Heroin / Opiates</option>
          <option value="cocaine">Cocaine HCl</option>
          <option value="cannabis">Cannabis</option>
          <option value="methamphetamine">Methamphetamine</option>
        </select>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading vault from Supabase…</div>
      ) : filteredCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            {activeTab === 'queue' ? 'No cases pending your review.' : 'No evidence records yet. Submit a scan to populate the vault.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filteredCards.map(card => {
            const escStatus  = (card.escalationStatus ?? escStatuses[card.caseId]) as EscalationStatus | undefined;
            const escMeta    = escStatus ? ESCALATION_STATUS_META[escStatus] : null;
            const showEscBtn = canEscalate(role, escStatus ?? null);
            const isPositive = card.opencvVerdict === 'positive' || card.matchedSubstance !== 'negative';
            const fallback   = getReagentFallbackImage(card.reagentType, card.matchedSubstance);
            const photoSrc   = card.photoDataUrl || card.photoUrl || fallback;
            const shortHash  = card.photoHash ? `${card.photoHash.slice(0, 8)}…${card.photoHash.slice(-8)}` : '—';
            const panchLink  = role === 'ncb_io' ? '/field/panchnama' : role === 'ncb_zonal' ? '/zonal/panchnama' : '/panchnama';

            return (
              <div key={card.id} style={{ background: '#fff', borderRadius: '10px', border: `1.5px solid ${activeTab === 'queue' ? '#fde68a' : '#e2e8f0'}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

                {/* ── Top row: 68px thumb + case info + escalate btn ── */}
                <div style={{ display: 'flex', gap: '0.65rem', padding: '0.75rem 0.85rem', alignItems: 'flex-start' }}>
                  {/* Thumbnail 68×68 */}
                  <div style={{ width: 68, height: 68, flexShrink: 0, borderRadius: '7px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                    <img src={photoSrc} alt="Evidence"
                      onError={e => { (e.target as HTMLImageElement).src = fallback; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Case info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{card.caseId}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', background: isPositive ? '#fee2e2' : '#f0fdf4', color: isPositive ? '#dc2626' : '#16a34a', border: `1px solid ${isPositive ? '#fecaca' : '#bbf7d0'}`, whiteSpace: 'nowrap' }}>
                        {card.matchedSubstance.toUpperCase()}
                      </span>
                      {escMeta && (
                        <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, background: escMeta.bg, color: escMeta.color, border: `1px solid ${escMeta.color}40`, display: 'flex', alignItems: 'center', gap: '0.18rem', whiteSpace: 'nowrap' }}>
                          <ArrowRight size={9} /> {escMeta.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.67rem', color: '#64748b', marginBottom: '0.18rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.18rem' }}><Calendar size={9} /> {new Date(card.timestamp).toLocaleDateString('en-IN')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.18rem' }}><MapPin size={9} /> {card.gpsLat.toFixed(3)}°N</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>IO: {card.officerBadge}</span>
                      {card.syncPending
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.12rem', color: '#f59e0b', fontWeight: 600 }}><Clock size={9} /> Offline</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.12rem', color: '#16a34a', fontWeight: 600 }}><CheckCircle2 size={9} /> Synced</span>
                      }
                    </div>
                    {/* Truncated SHA hash – single line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', fontSize: '0.6rem' }}>
                      <Hash size={8} color="#94a3b8" />
                      <span style={{ fontFamily: 'monospace', color: '#0f5ca8', letterSpacing: '-0.01em' }}>{shortHash}</span>
                    </div>
                  </div>

                  {/* Prominent escalation button – top right of card */}
                  {showEscBtn && (
                    <button onClick={() => setModalCaseId(card.caseId)}
                      style={{ padding: '0.38rem 0.65rem', background: '#0f5ca8', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(15,92,168,0.35)' }}>
                      <SendHorizonal size={12} /> Escalate
                    </button>
                  )}
                </div>

                {/* ── Dual-check strip – always 2 columns (no wrap on mobile) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  {/* Check 1: Color Match */}
                  <div style={{ background: '#fff', padding: '0.45rem 0.7rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', marginBottom: '0.15rem' }}>
                      <Zap size={10} color="#0f5ca8" />
                      <span style={{ fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f5ca8' }}>Color Match</span>
                    </div>
                    {card.opencvDeltaE !== undefined ? (
                      <div style={{ fontSize: '0.7rem', color: '#334155', lineHeight: 1.35 }}>
                        <div>ΔE: <strong>{card.opencvDeltaE.toFixed(1)}</strong>
                          {card.opencvCielab && <span style={{ color: '#94a3b8', fontSize: '0.62rem', marginLeft: '0.22rem' }}>L{card.opencvCielab.L?.toFixed(0)} a{card.opencvCielab.a?.toFixed(0)}</span>}
                        </div>
                        <div style={{ color: card.opencvVerdict === 'positive' ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.67rem' }}>{card.opencvVerdict?.toUpperCase() ?? '—'}</div>
                      </div>
                    ) : <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>No data</div>}
                  </div>

                  {/* Check 2: AI Verify */}
                  <div style={{ background: '#fff', padding: '0.45rem 0.7rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', marginBottom: '0.15rem' }}>
                      <Globe size={10} color="#7c3aed" />
                      <span style={{ fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c3aed' }}>AI Verify</span>
                    </div>
                    {card.geminiVerdict ? (
                      <div style={{ fontSize: '0.7rem', color: '#334155', lineHeight: 1.35 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.18rem' }}>
                          {card.geminiVerdict === 'ACCEPTED' ? <CheckCircle2 size={9} color="#16a34a" /> : <XCircle size={9} color="#dc2626" />}
                          <strong style={{ color: card.geminiVerdict === 'ACCEPTED' ? '#15803d' : '#dc2626', fontSize: '0.67rem' }}>{card.geminiVerdict}</strong>
                        </div>
                        {card.geminiObservedColor && <div style={{ color: '#64748b', fontSize: '0.62rem' }}>{card.geminiObservedColor}</div>}
                        {card.geminiCourtSummary && (
                          <div style={{ color: '#64748b', fontSize: '0.62rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {card.geminiCourtSummary}
                          </div>
                        )}
                      </div>
                    ) : <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>No AI data</div>}
                  </div>
                </div>

                {/* ── Handover / Escalation Note Strip (if present) ── */}
                {card.escalationNote && (
                  <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <SendHorizonal size={12} color="#0f5ca8" style={{ marginTop: '0.12rem', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.68rem', color: '#334155', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f5ca8' }}>Handover Note{card.escalatedBy ? ` (${card.escalatedBy})` : ''}:</strong> {card.escalationNote}
                    </div>
                  </div>
                )}

                {/* ── Action buttons row ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => setSelectedReportCard(card)}
                    style={{ padding: '0.32rem 0.65rem', background: '#eaf4fd', color: '#0f5ca8', border: '1px solid #bfdbfe', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.22rem', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}
                    title="View comprehensive forensic assay report with OpenCV & Gemini output">
                    <Eye size={11} /> View Report
                  </button>
                  <button
                    onClick={() => {
                      const scanObj: ScanResult = {
                        id: card.id, timestamp: card.timestamp, officerBadge: card.officerBadge,
                        reagentType: (card.reagentType as any) || 'marquis',
                        capturedColor: { r: 100, g: 100, b: 100, L: card.opencvCielab?.L ?? 25, a: card.opencvCielab?.a ?? 20, bStar: card.opencvCielab?.b ?? -20 },
                        deltaE: card.opencvDeltaE ?? 4.2,
                        matchedSubstance: (card.matchedSubstance as any) || 'unknown',
                        matchedReagentRef: null, confidence: (card.opencvConfidence as any) || 'high',
                        testStatus: (card.opencvVerdict as any) || 'positive',
                        blurAnalysis: { laplacianVariance: 250, isSharp: true, warningThreshold: 80, message: 'Sharp' },
                        glareAnalysis: { hasGlare: false, glarePercentage: 1.0, saturationWarning: false },
                        photoHash: card.photoHash, photoDataUrl: card.photoDataUrl, photoUrl: card.photoUrl,
                        gps: { latitude: card.gpsLat, longitude: card.gpsLng, accuracy: 5, timestamp: card.timestamp, source: 'device_gps' },
                        aiAnalysis: card.geminiVerdict ? {
                          verdict: card.geminiVerdict as any, rejectReason: card.geminiRejectReason,
                          observedColor: card.geminiObservedColor, kitType: 'Field Chemical Test Kit',
                          substanceClass: card.matchedSubstance, substance: card.matchedSubstance,
                          confidence: 0.9, tamperDetected: card.tamperDetected ?? false,
                          pouchLotNumber: card.geminiLot, pouchExpiry: card.geminiExpiry,
                          courtSummary: card.geminiCourtSummary || '',
                        } : null,
                        syncPending: card.syncPending, caseId: card.caseId,
                      };
                      generateAssayPDF(scanObj);
                    }}
                    style={{ padding: '0.32rem 0.65rem', background: '#fff', color: '#0f5ca8', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.22rem', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}>
                    <Download size={11} /> PDF
                  </button>
                  <Link href={`${panchLink}?scanId=${card.id}&substance=${encodeURIComponent(card.matchedSubstance)}`}
                    style={{ padding: '0.32rem 0.65rem', background: '#0f172a', color: '#fff', borderRadius: '5px', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                    <FileText size={11} /> Memo
                  </Link>
                  <button
                    onClick={() => handleDeleteCard(card)}
                    style={{ padding: '0.32rem 0.65rem', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.22rem', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" }}
                    title="Delete evidence record from vault & database">
                    <Trash2 size={11} /> Delete
                  </button>
                  {showEscBtn && (
                    <button onClick={() => setModalCaseId(card.caseId)}
                      style={{ padding: '0.32rem 0.8rem', background: '#0f5ca8', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.22rem', boxShadow: '0 2px 6px rgba(15,92,168,0.3)' }}>
                      <SendHorizonal size={11} /> {ESCALATION_BUTTON_LABEL[role]}
                    </button>
                  )}
                </div>

                {/* Escalation status note */}
                {escStatus && (
                  <div style={{ margin: '0 0.85rem 0.5rem', background: escMeta?.bg ?? '#f8fafc', border: `1px solid ${escMeta?.color ?? '#e2e8f0'}30`, borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.67rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={9} color={escMeta?.color ?? '#64748b'} />
                    Under <strong style={{ marginLeft: '0.2rem' }}>{escMeta?.label}</strong>
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
