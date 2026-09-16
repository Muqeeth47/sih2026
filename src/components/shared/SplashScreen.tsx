'use client';
import { useEffect, useState, useRef } from 'react';
import { Shield } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'done'>('logo');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 450);
    const t2 = setTimeout(() => setPhase('done'), 1200);
    const t3 = setTimeout(() => {
      onCompleteRef.current?.();
    }, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // Run once on mount — never reset by parent re-renders

  if (phase === 'done') return null;

  return (
    <div
      onClick={() => {
        setPhase('done');
        onCompleteRef.current?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: '1.5rem',
        cursor: 'pointer',
        userSelect: 'none',
        animation: 'ncb-splash-exit 0.35s ease 1.5s forwards',
      }}
    >
      <style>{`
        @keyframes ncb-splash-exit {
          0% { opacity: 1; }
          99% { opacity: 0; }
          100% { opacity: 0; pointer-events: none; visibility: hidden; display: none; }
        }
        @keyframes ncb-scale-in {
          from { transform: scale(0.92); opacity: 0.5; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes ncb-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      {/* Emblems */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        animation: 'ncb-scale-in 0.5s ease',
      }}>
        <div style={{
          padding: '0.6rem 0.9rem',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <img
            src="/images/mha-logo.png"
            alt="Ministry of Home Affairs"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: '1px', height: '36px', background: '#cbd5e1' }} />
          <img
            src="/images/ncb-logo.png"
            alt="Narcotics Control Bureau"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Text */}
      <div style={{
        textAlign: 'center',
        opacity: phase === 'text' ? 1 : 0,
        transform: phase === 'text' ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}>
          <span>SAKSHYA AI</span>
          <span style={{ fontSize: '0.9rem', color: '#0f5ca8', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
            साक्ष्य
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#0f5ca8', fontWeight: 700, marginTop: '0.35rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          सत्यमेव साक्ष्यम् · Narcotics Evidence Protocol
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
          Narcotics Control Bureau · Ministry of Home Affairs
        </div>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#0f5ca8',
            animation: `ncb-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem', fontWeight: 600 }}>
        Tap anywhere to continue
      </div>
    </div>
  );
}
