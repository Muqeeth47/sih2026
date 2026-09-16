'use client';
import React from 'react';
import { Camera, AlertTriangle, CheckCircle2, RefreshCw, SunMedium, Sparkles } from 'lucide-react';
import type { BlurResult } from '@/utils/blurDetector';
import type { GlareResult } from '@/utils/glareFilter';

interface ViewfinderOverlayProps {
  blurResult: BlurResult | null;
  glareResult: GlareResult | null;
  isCapturing: boolean;
  onCapture: () => void;
  onFlipCamera: () => void;
  cameraActive: boolean;
  reagentName: string;
}

export default function ViewfinderOverlay({
  blurResult,
  glareResult,
  isCapturing,
  onCapture,
  onFlipCamera,
  cameraActive,
  reagentName,
}: ViewfinderOverlayProps) {
  const isSharp = blurResult?.isSharp ?? true;
  const hasGlare = glareResult?.hasGlare ?? false;
  // Always allow capture when camera stream is active (do not disable shutter button)
  const canCapture = cameraActive && !isCapturing;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* Top Telemetry HUD */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: 'rgba(10, 25, 47, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={16} color="var(--ncb-saffron)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>
            Target: {reagentName} Pouch
          </span>
        </div>

        <button
          onClick={onFlipCamera}
          style={{
            background: 'rgba(10, 25, 47, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Switch Camera"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Viewfinder Target Reticle (Center 40%) */}
      <div
        className="viewfinder-reticle"
        style={{
          border: `2px dashed ${!isSharp ? 'var(--ncb-crimson)' : hasGlare ? 'var(--ncb-gold)' : 'var(--ncb-saffron)'}`,
          boxShadow: '0 0 0 9999px rgba(10, 25, 47, 0.55)',
          borderRadius: 'var(--radius-lg)',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* Reticle Brackets */}
        <span className="reticle-corner-tr" />
        <span className="reticle-corner-bl" />

        {/* Center alignment crosshair */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '16px',
            height: '16px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ position: 'absolute', top: '7px', left: 0, width: '16px', height: '2px', background: 'rgba(255,255,255,0.7)' }} />
          <div style={{ position: 'absolute', top: 0, left: '7px', width: '2px', height: '16px', background: 'rgba(255,255,255,0.7)' }} />
        </div>

        {/* Real-time Reticle Telemetry Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2.5rem',
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          {blurResult && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isSharp ? 'rgba(19, 136, 8, 0.85)' : 'rgba(220, 38, 38, 0.85)',
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              {isSharp ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {blurResult.message} ({Math.round(blurResult.laplacianVariance)})
            </div>
          )}

          {hasGlare && glareResult && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(245, 158, 11, 0.9)',
                color: 'var(--ncb-navy-dark)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700,
                marginLeft: '0.4rem',
              }}
            >
              <SunMedium size={12} />
              {glareResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Shutter Capture Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={onCapture}
          disabled={!canCapture}
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: canCapture ? 'white' : 'rgba(255, 255, 255, 0.4)',
            border: '4px solid var(--ncb-saffron)',
            boxShadow: canCapture ? '0 0 25px rgba(255, 153, 51, 0.6)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canCapture ? 'pointer' : 'not-allowed',
            transition: 'transform 0.15s ease, background-color 0.2s',
          }}
          title={canCapture ? 'Capture and Analyze Specimen' : 'Align steady to capture'}
        >
          <Camera size={32} color="var(--ncb-navy-dark)" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
