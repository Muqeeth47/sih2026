'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Shield, Sliders, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

export default function SettingsPage() {
  const { user } = useAuth();
  const [deltaEThreshold, setDeltaEThreshold] = useState(15);
  const [blurCutoff, setBlurCutoff] = useState(90);
  const [glareMaxPercent, setGlareMaxPercent] = useState(8);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <RoleGuard allowedRoles={['ncb_fsl']} featureName="Spectrophotometric Optical Calibration">
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={26} color="var(--ncb-navy-primary)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
            System Calibration & Officer Profile
          </h1>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
          On-device colorimetric sensitivity tuning and authorized officer credentials.
        </p>
      </div>

      {saved && (
        <div style={{ background: 'var(--ncb-green-subtle)', border: '1px solid #86efac', color: 'var(--ncb-green)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
          <CheckCircle2 size={18} />
          <span>Calibration parameters updated in local hardware profile.</span>
        </div>
      )}

      {/* Officer Credential Card */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
          <UserCheck size={18} color="var(--ncb-navy-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: 0 }}>
            Authorized Officer Profile
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--ncb-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Officer Name</span>
            <div style={{ fontWeight: 700, color: 'var(--ncb-text-main)', marginTop: '0.2rem' }}>{user?.name || 'SI Pradeep Sharma'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--ncb-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Badge ID</span>
            <div style={{ fontWeight: 700, color: 'var(--ncb-navy-primary)', fontFamily: 'monospace', marginTop: '0.2rem' }}>{user?.badge || 'NCB-IO-4092'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--ncb-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Jurisdiction Unit</span>
            <div style={{ fontWeight: 600, color: 'var(--ncb-text-main)', marginTop: '0.2rem' }}>{user?.unit || 'NCB Delhi Zonal Unit'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--ncb-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Role Clearance</span>
            <div style={{ fontWeight: 700, color: 'var(--ncb-saffron)', marginTop: '0.2rem', textTransform: 'uppercase' }}>{user?.role || 'ncb_io'}</div>
          </div>
        </div>
      </div>

      {/* Optical Calibration Settings */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
          <Sliders size={18} color="var(--ncb-navy-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: 0 }}>
            Computer Vision & Spectrophotometry Thresholds
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ncb-text-main)' }}>
                CIELAB ΔE₂₀₀₀ Positive Match Threshold: &le; {deltaEThreshold}
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--ncb-text-muted)' }}>Default: 15.0</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={deltaEThreshold}
              onChange={(e) => setDeltaEThreshold(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ncb-navy-primary)' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)' }}>
              Controls the permissible spectrophotometric variance between captured specimen and UNODC standards.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ncb-text-main)' }}>
                Laplacian Blur Rejection Score: &ge; {blurCutoff}
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--ncb-text-muted)' }}>Default: 90</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={blurCutoff}
              onChange={(e) => setBlurCutoff(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ncb-navy-primary)' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)' }}>
              Images below this sharpness variance will trigger mandatory retake warning in viewfinder.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ncb-text-main)' }}>
                Maximum Specular Glare Tolerance: {glareMaxPercent}%
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--ncb-text-muted)' }}>Default: 8%</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={glareMaxPercent}
              onChange={(e) => setGlareMaxPercent(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ncb-navy-primary)' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)' }}>
              Shutter locks if specular white reflections exceed this proportion of the reticle surface.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'var(--ncb-navy-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Save Calibration
            </button>
          </div>
        </div>
      </div>
      </div>
    </RoleGuard>
  );
}
