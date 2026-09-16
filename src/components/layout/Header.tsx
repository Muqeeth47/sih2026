'use client';
import Link from 'next/link';
import { Shield, Wifi, WifiOff, LogOut, Menu, X, FlaskConical, Building2, Scale } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      className="sticky top-0 z-50 h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center px-2.5 sm:px-5 gap-1.5 sm:gap-3 shadow-xs"
    >
      {/* Hamburger Toggle (3 horizontal lines) */}
      {mounted && isAuthenticated && (
        <button
          onClick={onMenuToggle}
          style={{
            background: 'transparent',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            cursor: 'pointer',
            padding: '0.38rem 0.42rem',
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
          {isSidebarOpen ? <X size={17} strokeWidth={2.2} /> : <Menu size={17} strokeWidth={2.2} />}
        </button>
      )}

      {/* Logo & Identity */}
      <Link
        href={mounted && isAuthenticated ? '/overview' : '/'}
        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', flexShrink: 0, minWidth: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <img
            src="/images/mha-logo.png"
            alt="Ministry of Home Affairs"
            style={{ width: 'auto', objectFit: 'contain' }}
            className="h-6 sm:h-8"
            loading="eager"
            decoding="async"
          />
          <div style={{ width: '1px', height: '18px', background: '#cbd5e1' }} className="hidden sm:block" />
          <img
            src="/images/ncb-logo.png"
            alt="NCB Emblem"
            style={{ width: 'auto', objectFit: 'contain' }}
            className="h-6 sm:h-8"
            loading="eager"
            decoding="async"
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.86rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span className="truncate">SAKSHYA AI</span>
            <span style={{ fontSize: '0.66rem', color: '#0f5ca8', fontWeight: 800, background: '#e0f2fe', padding: '1px 4px', borderRadius: '4px' }}>
              साक्ष्य
            </span>
          </div>
          <div
            className="hidden md:block text-[9.5px] text-slate-500 font-bold tracking-wider uppercase"
          >
            Narcotics Control Bureau · MHA
          </div>
        </div>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right Controls Container */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Online Status (Desktop) */}
        <div
          className="hidden sm:flex items-center gap-1.5 flex-shrink-0"
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? '#15803d' : '#d97706' }} />
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: isOnline ? '#15803d' : '#d97706' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {mounted && isAuthenticated && (
          <>
            <div className="hidden sm:block flex-shrink-0">
              <OfflineSyncBadge compact />
            </div>

            {/* Compact Role Badge */}
            {user && (
              <Link
                href={
                  user.role === 'ncb_io' ? '/field/vault' :
                  user.role === 'ncb_fsl' ? '/fsl/vault' :
                  user.role === 'ncb_zonal' ? '/zonal/vault' : '/court/vault'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.2rem 0.45rem',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  background:
                    user.role === 'ncb_io' ? '#e0f2fe' :
                    user.role === 'ncb_fsl' ? '#ede9fe' :
                    user.role === 'ncb_zonal' ? '#fef9ec' : '#f0fdf4',
                  color:
                    user.role === 'ncb_io' ? '#0f5ca8' :
                    user.role === 'ncb_fsl' ? '#7c3aed' :
                    user.role === 'ncb_zonal' ? '#b45309' : '#065f46',
                  border: `1px solid ${
                    user.role === 'ncb_io' ? '#bae6fd' :
                    user.role === 'ncb_fsl' ? '#ddd6fe' :
                    user.role === 'ncb_zonal' ? '#fde68a' : '#bbf7d0'
                  }`,
                  flexShrink: 0,
                }}
                title="Current Role — click to open Evidence Vault"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {user.role === 'ncb_io' && <Shield size={11} />}
                  {user.role === 'ncb_fsl' && <FlaskConical size={11} />}
                  {user.role === 'ncb_zonal' && <Building2 size={11} />}
                  {user.role === 'ncb_court' && <Scale size={11} />}
                  <span>{
                    user.role === 'ncb_io' ? 'IO' :
                    user.role === 'ncb_fsl' ? 'FSL' :
                    user.role === 'ncb_zonal' ? 'ZONAL' : 'COURT'
                  }</span>
                </span>
              </Link>
            )}

            {/* User Badge - desktop only */}
            <div
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#0f5ca8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0) ?? 'O'}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {user?.badge}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
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
      </div>
    </header>
  );
}
