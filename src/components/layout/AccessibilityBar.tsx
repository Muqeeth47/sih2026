'use client';
import { useFontScale } from '@/hooks/useFontScale';
import { Shield } from 'lucide-react';

export default function AccessibilityBar() {
  const { scale, setFontScale } = useFontScale();

  return (
    <div
      className="flex items-center justify-between min-h-[38px] py-1 px-3 sm:px-5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 gap-2 flex-wrap sm:flex-nowrap"
      role="toolbar"
      aria-label="Accessibility and language bar"
    >
      {/* Left: Project Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <Shield size={14} color="#0f5ca8" />
        <span style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', fontSize: '0.74rem' }}>
          DRUG-SEAL AI · NCB
        </span>
        <span className="hidden sm:inline" style={{ color: '#cbd5e1' }}>|</span>
        <span className="hidden sm:inline text-[11px] text-slate-500">
          Ministry of Home Affairs
        </span>
      </div>

      {/* Right: Translate + Font Controls (No skip-to-content button) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Google Translate Widget */}
        <div id="google_translate_element" style={{ display: 'inline-flex', alignItems: 'center' }} />

        <span style={{ color: '#cbd5e1' }}>|</span>

        {/* Text Size Scaler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>Text:</span>
          <button
            onClick={() => setFontScale('small')}
            aria-pressed={scale === 'small'}
            title="Decrease font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'small' ? '#0f5ca8' : '#ffffff',
              color: scale === 'small' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.68rem',
              lineHeight: 1.2,
            }}
          >
            A−
          </button>
          <button
            onClick={() => setFontScale('normal')}
            aria-pressed={scale === 'normal'}
            title="Default font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'normal' ? '#0f5ca8' : '#ffffff',
              color: scale === 'normal' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.72rem',
              lineHeight: 1.2,
            }}
          >
            A
          </button>
          <button
            onClick={() => setFontScale('large')}
            aria-pressed={scale === 'large'}
            title="Increase font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'large' ? '#0f5ca8' : '#ffffff',
              color: scale === 'large' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.76rem',
              lineHeight: 1.2,
            }}
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
