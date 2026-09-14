'use client';
import { useEffect, useState } from 'react';
import { getPendingCount } from '@/utils/offlineQueue';
import { CloudOff, Cloud } from 'lucide-react';

export default function OfflineSyncBadge({ compact = false }: { compact?: boolean }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const refresh = async () => {
      try { setPendingCount(await getPendingCount()); } catch { /* ignore */ }
    };
    refresh();
    const interval = setInterval(refresh, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    if (compact) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 600 }}>Synced</span>
        </div>
      );
    }
    return null;
  }

  const color = isOnline ? '#f59e0b' : '#ef4444';
  const Icon = isOnline ? Cloud : CloudOff;
  const label = isOnline
    ? `${pendingCount} record${pendingCount !== 1 ? 's' : ''} syncing...`
    : `${pendingCount} queued offline`;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>{pendingCount}</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 0.75rem',
      background: isOnline ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${color}40`,
      borderRadius: '6px',
      fontSize: '0.72rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color,
    }}>
      <Icon size={14} />
      {label}
    </div>
  );
}
