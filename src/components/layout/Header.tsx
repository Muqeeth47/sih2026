'use client';
import Link from 'next/link';
import { Shield, Wifi, WifiOff, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OfflineSyncBadge from '@/components/shared/OfflineSyncBadge';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-5 gap-2 sm:gap-3 shadow-xs"
    >
      {/* Hamburger Toggle (3 horizontal lines) */}
      {isAuthenticated && (
        <button
          onClick={onMenuToggle}
          style={{
            background: 'transparent',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            cursor: 'pointer',
            padding: '0.45rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label={isSidebarOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
        >
          {isSidebarOpen ? <X size={18} strokeWidth={2.2} /> : <Menu size={18} strokeWidth={2.2} />}
        </button>
      )}

      {/* Logo & Identity */}
      <Link
        href={isAuthenticated ? '/overview' : '/'}
        style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <img
            src="/images/mha-logo.png"
            alt="Ministry of Home Affairs, Government of India"
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            className="h-7 sm:h-9"
          />
          <div style={{ width: '1px', height: '22px', background: '#cbd5e1' }} className="hidden sm:block" />
          <img
            src="/images/ncb-logo.png"
            alt="Narcotics Control Bureau Emblem"
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            className="h-7 sm:h-9"
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>SAKSHYA AI</span>
            <span style={{ fontSize: '0.72rem', color: '#0f5ca8', fontWeight: 800, background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>
              साक्ष्य
            </span>
          </div>
          <div
            className="hidden sm:block text-[9.5px] text-slate-500 font-bold tracking-wider uppercase"
          >
            Narcotics Control Bureau · MHA
          </div>
        </div>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Online Status (Typographic Status) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? '#15803d' : '#d97706' }} />
        <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-wider" style={{ color: isOnline ? '#15803d' : '#d97706' }}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {isAuthenticated && (
        <>
          <div className="flex-shrink-0">
            <OfflineSyncBadge compact />
          </div>

          {/* User Badge - compact on mobile */}
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#0f5ca8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0) ?? 'O'}
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.64rem', color: '#64748b', fontFamily: 'monospace' }}>
                {user?.badge}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              cursor: 'pointer',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fca5a5';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#475569';
            }}
            title="Sign out"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </>
      )}
    </header>
  );
}
