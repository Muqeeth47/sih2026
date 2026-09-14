'use client';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'done'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600);
    const t2 = setTimeout(() => setPhase('done'), 1800);
    const t3 = setTimeout(onComplete, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: '1.5rem',
      animation: 'none',
    }}>
      {/* Emblem */}
      <div style={{
        width: 88,
        height: 88,
        borderRadius: '16px',
        background: '#0f5ca8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(15, 92, 168, 0.25)',
        animation: 'ncb-scale-in 0.5s ease',
      }}>
        <Shield size={48} color="white" strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div style={{
        textAlign: 'center',
        opacity: phase === 'text' ? 1 : 0,
        transform: phase === 'text' ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        <div style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.02em',
        }}>
          DRUG-SEAL AI
        </div>
        <div style={{ fontSize: '0.82rem', color: '#0f5ca8', fontWeight: 700, marginTop: '0.25rem', letterSpacing: '0.04em' }}>
          Narcotics Control Bureau
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
          Ministry of Home Affairs · Government of India
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
    </div>
  );
}
