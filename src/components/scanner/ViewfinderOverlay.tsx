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

      {/* Viewfinder Target Reticle (Large Pouch Framing Zone) */}
      <div
        className="viewfinder-reticle"
        style={{
          border: '2.5px dashed rgba(2, 132, 199, 0.85)',
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
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ position: 'absolute', top: '9px', left: 0, width: '20px', height: '2px', background: 'rgba(255,255,255,0.75)' }} />
          <div style={{ position: 'absolute', top: 0, left: '9px', width: '2px', height: '20px', background: 'rgba(255,255,255,0.75)' }} />
        </div>

        {/* Alignment Guide Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2.2rem',
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(10, 25, 47, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.22rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={12} color="#0284c7" />
            Align test kit inside box
          </div>
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
