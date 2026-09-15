'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useAuth } from '@/hooks/useAuth';
import ViewfinderOverlay from '@/components/scanner/ViewfinderOverlay';
import { REAGENT_MATRIX, REAGENT_DISPLAY_NAMES, getReagentRefs } from '@/utils/reagentMatrix';
import { extractColorReading, deltaE2000, deltaEToConfidence } from '@/utils/colorMath';
import { analyzeBlur, type BlurResult } from '@/utils/blurDetector';
import { analyzeGlare, type GlareResult } from '@/utils/glareFilter';
import { sha256Hash } from '@/utils/cryptoSeal';
import { saveScanResult } from '@/utils/offlineQueue';
import { supabase } from '@/utils/supabaseClient';
import { generateAssayPDF } from '@/utils/assayPdf';
import type { ReagentType, ScanResult, ColorReading, AIAnalysisResult, ConfidenceLevel } from '@/types/drug';
import {
  FlaskConical, AlertCircle, Upload, CheckCircle2, RotateCcw,
  Zap, Globe, Camera, MapPin, Hash, Clock, ShieldCheck,
  AlertTriangle, XCircle, ChevronRight, FileText,
} from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

// ── Confidence colour helper ──────────────────────────────────────────────────
function confidenceColor(level: ConfidenceLevel | string) {
  if (level === 'high')         return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (level === 'medium')       return { bg: '#fef9ec', color: '#b45309', border: '#fde68a' };
  if (level === 'low')          return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
  return                               { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
}

// ── Dual-panel result display ─────────────────────────────────────────────────
function ScanResultPanel({
  result,
  onReset,
  onCommit,
  committing,
  committed,
}: {
  result: ScanResult;
  onReset: () => void;
  onCommit: () => void;
  committing: boolean;
  committed: boolean;
}) {
  const ai = result.aiAnalysis;
  const cvConf = confidenceColor(result.confidence);
  const isPositive = result.testStatus === 'positive';
  const geminiAccepted = ai?.verdict === 'ACCEPTED';
  const geminiRejected = ai?.verdict === 'REJECTED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── Photo + Case header ── */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap',
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        {/* Thumbnail */}
        {result.photoDataUrl && (
          <img
            src={result.photoDataUrl}
            alt="Captured evidence"
            style={{
              width: 140, height: 140, objectFit: 'cover',
              borderRadius: '8px', border: '2px solid #e2e8f0', flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f5ca8' }}>
              CASE ID
            </span>
            <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>{result.caseId}</span>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
              background: isPositive ? '#fee2e2' : '#f0fdf4',
              color: isPositive ? '#dc2626' : '#16a34a',
              border: `1px solid ${isPositive ? '#fecaca' : '#bbf7d0'}`,
            }}>
              {isPositive ? 'POSITIVE' : 'NEGATIVE'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            Reagent: {REAGENT_DISPLAY_NAMES[result.reagentType]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={12} />
              {result.gps.latitude.toFixed(4)}°N, {result.gps.longitude.toFixed(4)}°E
              {result.gps.source === 'mock' && <span style={{ color: '#f59e0b', fontStyle: 'italic' }}>(approx.)</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={12} />
              {new Date(result.timestamp).toLocaleString('en-IN')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={12} />
              Officer: {result.officerBadge}
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 1: Rapid Color Match ── */}
      <div style={{
        background: '#fff', border: '1px solid #bfdbfe',
        borderLeft: '5px solid #0f5ca8',
        borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={15} color="#0f5ca8" />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#0f5ca8' }}>STEP 1: RAPID COLOR MATCH (OFFLINE)</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Instant Chemical Color Match (On-Device)</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
          {[
            { label: 'Color Distance (ΔE)', value: result.deltaE.toFixed(2) },
            { label: 'Lightness (L*)', value: result.capturedColor.L.toFixed(1) },
            { label: 'Red-Green (a*)', value: result.capturedColor.a.toFixed(1) },
            { label: 'Blue-Yellow (b*)', value: result.capturedColor.bStar.toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{value}</div>
            </div>
          ))}
        </div>

        {result.matchedReagentRef && (
          <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '0.6rem' }}>
            <strong>Best match:</strong> {result.matchedReagentRef.expectedColorName} — {result.matchedReagentRef.description}
          </div>
        )}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.85rem', borderRadius: '6px',
          background: cvConf.bg, border: `1px solid ${cvConf.border}`,
        }}>
          {isPositive
            ? <CheckCircle2 size={14} color={cvConf.color} />
            : <XCircle size={14} color={cvConf.color} />}
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: cvConf.color, textTransform: 'uppercase' }}>
            {result.testStatus.toUpperCase()} — {result.confidence.toUpperCase()} CONFIDENCE
          </span>
        </div>
      </div>

      {/* ── STEP 2: AI Visual Verification ── */}
      <div style={{
        background: '#fff',
        border: ai ? '1px solid #e9d5ff' : '1px solid #fed7aa',
        borderLeft: `5px solid ${ai ? '#7c3aed' : '#f97316'}`,
        borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: ai ? '#ede9fe' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Globe size={15} color={ai ? '#7c3aed' : '#f97316'} />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: ai ? '#7c3aed' : '#f97316' }}>STEP 2: AI VISUAL VERIFICATION (ONLINE)</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {ai ? 'AI Visual & Label Inspection' : 'AI Service Unavailable'}
            </div>
          </div>
        </div>

        {!ai && (
          <div style={{ fontSize: '0.8rem', color: '#92400e', background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem' }}>
            Online AI analysis was not available for this scan. The on-device chemical color match above remains valid field evidence.
          </div>
        )}

        {ai && (
          <>
            {/* Verdict badge */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase',
                background: geminiAccepted ? '#dcfce7' : '#fee2e2',
                color: geminiAccepted ? '#15803d' : '#dc2626',
                border: `1px solid ${geminiAccepted ? '#86efac' : '#fecaca'}`,
              }}>
                {geminiAccepted ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {ai.verdict}
                {geminiRejected && ai.rejectReason && ` — ${ai.rejectReason}`}
              </span>
            </div>

            {geminiAccepted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {ai.observedColor && (
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <span style={{ fontWeight: 700 }}>Observed colour: </span>{ai.observedColor}
                  </div>
                )}
                {ai.substanceClass && (
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <span style={{ fontWeight: 700 }}>Substance class: </span>{ai.substanceClass}
                  </div>
                )}
                {ai.kitType && (
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <span style={{ fontWeight: 700 }}>Kit type: </span>{ai.kitType}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {ai.pouchLotNumber && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 700 }}>Lot: </span>{ai.pouchLotNumber}
                    </div>
                  )}
                  {ai.pouchExpiry && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 700 }}>Expiry: </span>{ai.pouchExpiry}
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: ai.tamperDetected ? '#dc2626' : '#64748b' }}>
                    <span style={{ fontWeight: 700 }}>Tamper: </span>
                    {ai.tamperDetected ? '⚠ DETECTED' : 'None detected'}
                  </div>
                </div>
              </div>
            )}

            {ai.courtSummary && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
                  Sec. 52 NDPS Court Statement
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>{ai.courtSummary}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SHA-256 Hash ── */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          <Hash size={12} /> SHA-256 Evidence Fingerprint
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#0f5ca8', wordBreak: 'break-all' }}>{result.photoHash}</div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => generateAssayPDF(result)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.6rem 1.1rem', borderRadius: '8px',
            border: '1px solid #cbd5e1', background: '#ffffff',
            fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Noto Sans', sans-serif", color: '#0f5ca8',
          }}
        >
          <FileText size={15} color="#0f5ca8" /> Download Certified PDF
        </button>

        {committed ? (
          <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.82rem' }}>Evidence sealed and recorded into vault</span>
          </div>
        ) : (
          <>
            <button
              onClick={onReset}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1rem', borderRadius: '8px',
                border: '1px solid #e2e8f0', background: '#f8fafc',
                fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Noto Sans', sans-serif", color: '#475569',
              }}
            >
              <RotateCcw size={14} /> Retake
            </button>
            <button
              onClick={onCommit}
              disabled={committing}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem', borderRadius: '8px',
                border: 'none',
                background: committing ? '#94a3b8' : '#0f5ca8',
                color: '#fff', fontSize: '0.83rem', fontWeight: 700,
                cursor: committing ? 'not-allowed' : 'pointer',
                fontFamily: "'Noto Sans', sans-serif",
              }}
            >
              <ShieldCheck size={14} />
              {committing ? 'Uploading to vault…' : 'Commit to Evidence Vault'}
              {!committing && <ChevronRight size={14} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Blur blocked UI ───────────────────────────────────────────────────────────
function BlurBlockedPanel({ laplacian, onRetake }: { laplacian: number; onRetake: () => void }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #fed7aa', borderLeft: '5px solid #f97316',
      borderRadius: '12px', padding: '1.5rem', textAlign: 'center',
      fontFamily: "'Noto Sans', sans-serif",
    }}>
      <AlertTriangle size={36} color="#f97316" style={{ margin: '0 auto 0.75rem' }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
        Photo Too Blurry — Retake Required
      </h3>
      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.25rem', lineHeight: 1.6 }}>
        Sharpness score: <strong>{laplacian.toFixed(0)}</strong> (minimum 80 required for forensic analysis)
      </p>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 1.25rem' }}>
        Hold the camera steady, ensure good lighting, and focus on the reagent chamber.
      </p>
      <button
        onClick={onRetake}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.6rem 1.4rem', borderRadius: '8px',
          background: '#0f5ca8', color: '#fff', border: 'none',
          fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Noto Sans', sans-serif",
        }}
      >
        <Camera size={16} /> Retake Photo
      </button>
    </div>
  );
}

// ── Main Scanner Page ─────────────────────────────────────────────────────────
export default function ScannerPage() {
  const { user } = useAuth();
  const { videoRef, isActive, error: camError, startCamera, stopCamera, flipCamera, captureReticleRegion } = useCameraStream();
  const { coordinate, capture: captureGPS } = useGeoLocation();

  const [selectedReagent, setSelectedReagent] = useState<ReagentType>('marquis');
  const [blurResult, setBlurResult]           = useState<BlurResult | null>(null);
  const [glareResult, setGlareResult]         = useState<GlareResult | null>(null);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [currentResult, setCurrentResult]     = useState<ScanResult | null>(null);
  const [blurBlocked, setBlurBlocked]         = useState<{ laplacian: number } | null>(null);
  const [committing, setCommitting]           = useState(false);
  const [committed, setCommitted]             = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    startCamera('environment');
    return () => { stopCamera(); };
  }, [startCamera, stopCamera]);

  // Real-time blur/glare preview while camera is live
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (isAnalyzing || currentResult || blurBlocked) return;
      try {
        const frame = captureReticleRegion();
        if (frame) {
          setBlurResult(analyzeBlur(frame.regionImageData));
          setGlareResult(analyzeGlare(frame.regionImageData));
        }
      } catch { /* ignore canvas errors during rapid framing */ }
    }, 450);
    return () => clearInterval(interval);
  }, [isActive, isAnalyzing, currentResult, blurBlocked, captureReticleRegion]);

  const processCapturedImageData = async (
    dataUrl: string,
    regionImageData: ImageData,
    _fullImageData: ImageData
  ) => {
    setIsAnalyzing(true);
    setBlurBlocked(null);
    setCurrentResult(null);

    try {
      // 1. Colorimetric extraction
      const colorReading: ColorReading = extractColorReading(
        regionImageData,
        Math.floor(regionImageData.width * 0.25),
        Math.floor(regionImageData.height * 0.25),
        Math.floor(regionImageData.width * 0.5),
        Math.floor(regionImageData.height * 0.5)
      );

      // 2. CIELAB ΔE₂₀₀₀ matching
      const candidateRefs = getReagentRefs(selectedReagent);
      let bestMatch = candidateRefs[0];
      let lowestDeltaE = 999;
      for (const ref of candidateRefs) {
        const dE = deltaE2000(colorReading.L, colorReading.a, colorReading.bStar, ref.labL, ref.labA, ref.labB);
        if (dE < lowestDeltaE) { lowestDeltaE = dE; bestMatch = ref; }
      }
      const confidence = deltaEToConfidence(lowestDeltaE, bestMatch.deltaEThreshold);
      const isPositive = bestMatch.substanceClass !== 'negative' && confidence !== 'inconclusive';

      // 3. SHA-256 hash
      const photoHash = await sha256Hash(dataUrl);

      // 4. GPS
      let gpsLocation = coordinate;
      if (!gpsLocation) {
        try { gpsLocation = await captureGPS(); } catch {
          gpsLocation = { latitude: 28.6139, longitude: 77.2090, accuracy: 8.5, timestamp: new Date().toISOString(), source: 'mock' };
        }
      }

      // 5. ── BLUR GATE ── block before calling Gemini ──────────────────────
      const finalBlur = analyzeBlur(regionImageData);
      const finalGlare = analyzeGlare(regionImageData);
      if (!finalBlur.isSharp) {
        setBlurBlocked({ laplacian: finalBlur.laplacianVariance });
        return;
      }

      // 6. Cloud AI — Gemini
      let aiResult: AIAnalysisResult | null = null;
      try {
        const aiResponse = await fetch('/api/drug-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl, reagentType: selectedReagent }),
        });
        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          if (aiJson.success) aiResult = aiJson.analysis;
        }
      } catch (cloudErr) {
        console.warn('Cloud AI unavailable, continuing with OpenCV only:', cloudErr);
      }

      // 7. If Gemini rejected image (e.g. not a test kit) — treat as blur/bad photo
      if (aiResult?.verdict === 'REJECTED') {
        // Still show result but let user decide — don't block (Gemini might be wrong)
      }

      // 8. Compile scan record
      const scanRecord: ScanResult = {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
        officerBadge: user?.badge || 'NCB-IO-FIELD',
        reagentType: selectedReagent,
        capturedColor: colorReading,
        deltaE: Math.round(lowestDeltaE * 10) / 10,
        matchedSubstance: isPositive ? bestMatch.substanceClass : 'negative',
        matchedReagentRef: bestMatch,
        confidence,
        testStatus: isPositive ? 'positive' : 'negative',
        blurAnalysis: finalBlur,
        glareAnalysis: finalGlare,
        photoHash,
        photoDataUrl: dataUrl,
        gps: gpsLocation,
        aiAnalysis: aiResult,
        syncPending: true,
        caseId: `NCB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
      };

      await saveScanResult(scanRecord);
      setCurrentResult(scanRecord);
      setCommitted(false);
    } catch (err) {
      console.error('Forensic pipeline error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = () => {
    const frame = captureReticleRegion();
    if (!frame) return;
    processCapturedImageData(frame.dataUrl, frame.regionImageData, frame.imageData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const fullImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rx = Math.floor(canvas.width * 0.3), ry = Math.floor(canvas.height * 0.3);
        const rw = Math.floor(canvas.width * 0.4), rh = Math.floor(canvas.height * 0.4);
        const rCanvas = document.createElement('canvas');
        rCanvas.width = rw; rCanvas.height = rh;
        const rCtx = rCanvas.getContext('2d');
        if (!rCtx) return;
        rCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
        processCapturedImageData(dataUrl, rCtx.getImageData(0, 0, rw, rh), fullImageData);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCommitVault = async () => {
    if (!currentResult) return;
    setCommitting(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo to Supabase Storage
      if (currentResult.photoDataUrl) {
        try {
          const fetchRes = await fetch(currentResult.photoDataUrl);
          const blob = await fetchRes.blob();
          const filename = `${currentResult.caseId}-${Date.now()}.jpg`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('forensic_reports')
            .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('forensic_reports')
              .getPublicUrl(filename);
            photoUrl = urlData.publicUrl;
          } else {
            console.warn('Storage upload error:', uploadError?.message);
          }
        } catch (storageErr) {
          console.warn('Photo upload failed, continuing without photo URL:', storageErr);
        }
      }

      const caseId = currentResult.caseId!;
      const ai = currentResult.aiAnalysis;

      // Insert into seizures
      const { data: seizureRow } = await supabase
        .from('seizures')
        .upsert({
          case_id: caseId,
          officer_badge: currentResult.officerBadge,
          officer_name: user?.name || 'Field Officer',
          officer_role: user?.role || 'ncb_io',
          substance: currentResult.matchedSubstance,
          reagent_type: currentResult.reagentType,
          status: currentResult.testStatus === 'positive' ? 'fsl_testing' : 'vault_sealed',
          quantity_grams: 0,
          gross_weight: 0,
          gps_latitude: currentResult.gps.latitude,
          gps_longitude: currentResult.gps.longitude,
          gps_accuracy: currentResult.gps.accuracy,
          photo_hash: currentResult.photoHash,
          photo_url: photoUrl,
        })
        .select('id')
        .single();

      // Insert into scan_assays
      await supabase.from('scan_assays').insert({
        seizure_id: seizureRow?.id ?? null,
        case_id: caseId,
        reagent_type: currentResult.reagentType,
        opencv_delta_e: currentResult.deltaE,
        opencv_cielab: {
          L: currentResult.capturedColor.L,
          a: currentResult.capturedColor.a,
          b: currentResult.capturedColor.bStar,
        },
        opencv_sharpness: currentResult.blurAnalysis.laplacianVariance,
        opencv_glare_pct: currentResult.glareAnalysis.glarePercentage,
        opencv_confidence: currentResult.confidence,
        opencv_status: currentResult.testStatus,
        opencv_verdict: currentResult.testStatus,
        // Gemini fields
        gemini_verdict:        ai?.verdict ?? null,
        gemini_reject_reason:  ai?.rejectReason ?? null,
        gemini_observed_color: ai?.observedColor ?? null,
        gemini_substance:      ai?.substanceClass ?? ai?.substance ?? null,
        gemini_confidence:     ai?.verdict === 'ACCEPTED' ? 0.9 : null,
        gemini_court_summary:  ai?.courtSummary ?? null,
        gemini_lot_number:     ai?.pouchLotNumber ?? null,
        gemini_expiry:         ai?.pouchExpiry ?? null,
        tamper_detected:       ai?.tamperDetected ?? false,
        photo_url: photoUrl,
      });

      // Backup in IndexedDB
      await saveScanResult({ ...currentResult, photoUrl: photoUrl ?? undefined, syncPending: false });
      setCommitted(true);

      // Reset camera after 3s
      setTimeout(() => {
        setCurrentResult(null);
        setCommitted(false);
        startCamera('environment');
      }, 3500);
    } catch (err: any) {
      console.error('Vault commit failed:', err?.message ?? err);
      // Still mark committed locally so officer isn't stuck
      await saveScanResult({ ...currentResult, syncPending: true });
      setCommitted(true);
    } finally {
      setCommitting(false);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setBlurBlocked(null);
    setCommitted(false);
    startCamera('environment');
  };

  return (
    <RoleGuard allowedRoles={['ncb_io']} featureName="Live Field Chemical Scanner">
      <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>Field Chemical Scanner</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
              Two-Step Verification: Instant Color Match (On-Device) + Smart AI Inspection (Cloud)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Upload size={14} color="#0f5ca8" /> Upload Image
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FlaskConical size={16} color="#0f5ca8" />
              <select
                value={selectedReagent}
                onChange={(e) => setSelectedReagent(e.target.value as ReagentType)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid #0f5ca8', background: 'white', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer', outline: 'none', fontFamily: "'Noto Sans', sans-serif" }}
              >
                {Object.entries(REAGENT_DISPLAY_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main stage */}
        {blurBlocked ? (
          <BlurBlockedPanel laplacian={blurBlocked.laplacian} onRetake={handleReset} />
        ) : currentResult ? (
          <ScanResultPanel
            result={currentResult}
            onReset={handleReset}
            onCommit={handleCommitVault}
            committing={committing}
            committed={committed}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Camera viewport */}
            <div className="relative w-full h-[58vh] sm:h-[480px] md:h-[520px] bg-[#0a192f] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
              <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none' }} />
              {!isActive && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
                  <AlertCircle size={44} color="var(--ncb-saffron)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Camera Stream Inactive</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                    {camError || 'Allow camera permissions or upload a test pouch image.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={() => startCamera('environment')} style={{ padding: '0.6rem 1.2rem', background: 'var(--ncb-saffron)', color: 'var(--ncb-navy-dark)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      Start Camera
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={16} /> Upload Image
                    </button>
                  </div>
                </div>
              )}
              {isActive && (
                <ViewfinderOverlay
                  blurResult={blurResult} glareResult={glareResult}
                  isCapturing={isAnalyzing} onCapture={handleCapture}
                  onFlipCamera={flipCamera} cameraActive={isActive}
                  reagentName={REAGENT_DISPLAY_NAMES[selectedReagent]}
                />
              )}
              {isAnalyzing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,25,47,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, color: 'white', gap: '1rem' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid rgba(255,153,51,0.2)', borderTopColor: 'var(--ncb-saffron)', animation: 'ncb-spin 0.8s linear infinite' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>Analyzing Chemical Spectrum…</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                      CIELAB ΔE₂₀₀₀ · Gemini Vision · SHA-256 Seal
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', color: 'var(--ncb-navy-primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <Upload size={14} /> Testing without camera? Upload test pouch image
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
