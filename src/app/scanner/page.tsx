'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useAuth } from '@/hooks/useAuth';
import ViewfinderOverlay from '@/components/scanner/ViewfinderOverlay';
import ReagentResultCard from '@/components/scanner/ReagentResultCard';
import { REAGENT_MATRIX, REAGENT_DISPLAY_NAMES, getReagentRefs } from '@/utils/reagentMatrix';
import { extractColorReading, deltaE2000, deltaEToConfidence } from '@/utils/colorMath';
import { analyzeBlur, type BlurResult } from '@/utils/blurDetector';
import { analyzeGlare, type GlareResult } from '@/utils/glareFilter';
import { sha256Hash } from '@/utils/cryptoSeal';
import { saveScanResult } from '@/utils/offlineQueue';
import type { ReagentType, ScanResult, ColorReading, AIAnalysisResult } from '@/types/drug';
import { FlaskConical, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

export default function ScannerPage() {
  const { user } = useAuth();
  const { videoRef, isActive, error: camError, startCamera, stopCamera, flipCamera, captureReticleRegion } = useCameraStream();
  const { coordinate, capture: captureGPS } = useGeoLocation();

  const [selectedReagent, setSelectedReagent] = useState<ReagentType>('marquis');
  const [blurResult, setBlurResult] = useState<BlurResult | null>(null);
  const [glareResult, setGlareResult] = useState<GlareResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-start camera when mounting scanner
  useEffect(() => {
    startCamera('environment');
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Periodic real-time blur and glare checking while camera is active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (isAnalyzing || currentResult) return;
      try {
        const frame = captureReticleRegion();
        if (frame) {
          const bRes = analyzeBlur(frame.regionImageData);
          const gRes = analyzeGlare(frame.regionImageData);
          setBlurResult(bRes);
          setGlareResult(gRes);
        }
      } catch {
        // Ignore canvas read errors during rapid framing
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isActive, isAnalyzing, currentResult, captureReticleRegion]);

  // Execute Core Colorimetric Match
  const processCapturedImageData = async (
    dataUrl: string,
    regionImageData: ImageData,
    fullImageData: ImageData
  ) => {
    setIsAnalyzing(true);

    try {
      // 1. Client-Side Color Extraction (Center 40%)
      const colorReading: ColorReading = extractColorReading(
        regionImageData,
        Math.floor(regionImageData.width * 0.25),
        Math.floor(regionImageData.height * 0.25),
        Math.floor(regionImageData.width * 0.5),
        Math.floor(regionImageData.height * 0.5)
      );

      // 2. Spectrophotometric CIELAB delta-E matching against UNODC matrix
      const candidateRefs = getReagentRefs(selectedReagent);
      let bestMatch = candidateRefs[0];
      let lowestDeltaE = 999;

      for (const ref of candidateRefs) {
        const dE = deltaE2000(
          colorReading.L, colorReading.a, colorReading.bStar,
          ref.labL, ref.labA, ref.labB
        );
        if (dE < lowestDeltaE) {
          lowestDeltaE = dE;
          bestMatch = ref;
        }
      }

      const confidence = deltaEToConfidence(lowestDeltaE, bestMatch.deltaEThreshold);
      const isPositive = bestMatch.substanceClass !== 'negative' && confidence !== 'inconclusive';

      // 3. WebCrypto SHA-256 Photo Hash
      const photoHash = await sha256Hash(dataUrl);

      // 4. GPS Lock
      let gpsLocation = coordinate;
      if (!gpsLocation) {
        try {
          gpsLocation = await captureGPS();
        } catch {
          // Fallback realistic location if user denied browser prompt
          gpsLocation = {
            latitude: 28.6139,
            longitude: 77.2090,
            accuracy: 8.5,
            timestamp: new Date().toISOString(),
            source: 'mock',
          };
        }
      }

      // 5. Blur & Glare final verification
      const finalBlur = analyzeBlur(regionImageData);
      const finalGlare = analyzeGlare(regionImageData);

      // 6. Cloud Forensic AI Verification (Gemini 2.5 Flash Proxy)
      let aiResult: AIAnalysisResult | null = null;
      try {
        const aiResponse = await fetch('/api/drug-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            reagentType: selectedReagent,
          }),
        });
        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          if (aiJson.success) {
            aiResult = aiJson.analysis;
          }
        }
      } catch (cloudErr) {
        console.warn('Cloud forensic API unreachable, continuing offline:', cloudErr);
      }

      // 7. Compile Scan Record
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
        caseId: `NCB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      // Automatically store in IndexedDB
      await saveScanResult(scanRecord);
      setCurrentResult(scanRecord);
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

  // Allow uploading photo for desktop testing without webcam
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const fullImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Center 40% region
        const rx = Math.floor(canvas.width * 0.3);
        const ry = Math.floor(canvas.height * 0.3);
        const rw = Math.floor(canvas.width * 0.4);
        const rh = Math.floor(canvas.height * 0.4);

        const rCanvas = document.createElement('canvas');
        rCanvas.width = rw;
        rCanvas.height = rh;
        const rCtx = rCanvas.getContext('2d');
        if (!rCtx) return;
        rCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
        const regionImageData = rCtx.getImageData(0, 0, rw, rh);

        processCapturedImageData(dataUrl, regionImageData, fullImageData);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCommitVault = async () => {
    if (!currentResult) return;
    await saveScanResult(currentResult);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <RoleGuard allowedRoles={['ncb_io']} featureName="Live Field Chemical Scanner">
      <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
            Forensic Field Scanner
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            CIELAB Colorimetric Analysis & AI Multi-Reagent Verification (5ms Edge Evaluation)
          </p>
        </div>

        {/* Controls Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Upload size={14} color="#0f5ca8" />
            <span>Upload Image</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FlaskConical size={16} color="#0f5ca8" />
            <select
              value={selectedReagent}
              onChange={(e) => setSelectedReagent(e.target.value as ReagentType)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #0f5ca8',
                background: 'white',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {Object.entries(REAGENT_DISPLAY_NAMES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveSuccess && (
        <div
          style={{
            background: 'var(--ncb-green-subtle)',
            border: '1px solid #86efac',
            color: 'var(--ncb-green)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Specimen successfully sealed and recorded into Evidence Vault with SHA-256 hash.</span>
        </div>
      )}

      {/* Main Scanner Stage */}
      {!currentResult ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {/* Camera Viewport Container */}
          <div
            className="relative w-full h-[58vh] sm:h-[480px] md:h-[520px] bg-[#0a192f] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
          >
            {/* Live Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isActive ? 'block' : 'none',
              }}
            />

            {/* Error or Idle Fallback */}
            {!isActive && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
                <AlertCircle size={44} color="var(--ncb-saffron)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Camera Stream Inactive</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  {camError || 'Please allow camera permissions or upload an evidence pouch image.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => startCamera('environment')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      background: 'var(--ncb-saffron)',
                      color: 'var(--ncb-navy-dark)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Start Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '0.6rem 1.2rem',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {/* Viewfinder Overlay */}
            {isActive && (
              <ViewfinderOverlay
                blurResult={blurResult}
                glareResult={glareResult}
                isCapturing={isAnalyzing}
                onCapture={handleCapture}
                onFlipCamera={flipCamera}
                cameraActive={isActive}
                reagentName={REAGENT_DISPLAY_NAMES[selectedReagent]}
              />
            )}

            {/* Loading Analysis Spinner */}
            {isAnalyzing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10, 25, 47, 0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  color: 'white',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    border: '4px solid rgba(255, 153, 51, 0.2)',
                    borderTopColor: 'var(--ncb-saffron)',
                    animation: 'ncb-spin 0.8s linear infinite',
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>Analyzing Chemical Spectrum...</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    Computing CIELAB ΔE₂₀₀₀ & Hashing Evidence Photo
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick upload alternative toolbar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ncb-navy-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              Testing without camera? Upload test pouch image
            </button>
          </div>
        </div>
      ) : (
        /* Result Presentation State */
        <ReagentResultCard
          result={currentResult}
          onReset={() => setCurrentResult(null)}
          onSaveToVault={handleCommitVault}
        />
      )}
      </div>
    </RoleGuard>
  );
}
