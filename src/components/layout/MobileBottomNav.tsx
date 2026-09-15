'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, FilePlus2, Clock3, MapPin, Scale, Sliders, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPendingCount } from '@/utils/offlineQueue';
import { useAuth } from '@/hooks/useAuth';

import type { NCBRole } from '@/utils/escalation';

const ROLE_MOBILE_TABS: Record<NCBRole, { icon: React.ElementType; label: string; href: string }[]> = {
  ncb_io: [
    { icon: Camera,    label: 'Scanner',   href: '/field/scanner' },
    { icon: FilePlus2, label: 'Panchnama', href: '/field/panchnama' },
    { icon: Clock3,    label: 'Vault',     href: '/field/vault' },
    { icon: HelpCircle,label: 'Manual',    href: '/how-to-use' },
  ],
  ncb_fsl: [
    { icon: Clock3,    label: 'Vault',     href: '/fsl/vault' },
    { icon: MapPin,    label: 'Map',       href: '/analytics' },
    { icon: Sliders,   label: 'Calibrate', href: '/fsl/calibration' },
    { icon: HelpCircle,label: 'Manual',    href: '/how-to-use' },
  ],
  ncb_zonal: [
    { icon: Clock3,    label: 'Vault',     href: '/zonal/vault' },
    { icon: FilePlus2, label: 'Review',    href: '/zonal/panchnama' },
    { icon: MapPin,    label: 'Analytics', href: '/zonal/analytics' },
    { icon: HelpCircle,label: 'Manual',    href: '/how-to-use' },
  ],
  ncb_court: [
    { icon: Clock3,    label: 'Dossiers',  href: '/court/vault' },
    { icon: Scale,     label: 'Legal',     href: '/court/legal' },
    { icon: HelpCircle,label: 'Manual',    href: '/how-to-use' },
  ],
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const count = await getPendingCount();
        if (mounted) setPendingCount(count);
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const visibleTabs = user && ROLE_MOBILE_TABS[user.role]
    ? ROLE_MOBILE_TABS[user.role]
    : ROLE_MOBILE_TABS.ncb_io;

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--mobile-nav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        const showBadge = tab.label === 'Vault' && pendingCount > 0;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              textDecoration: 'none',
              color: isActive ? '#0f5ca8' : '#64748b',
              position: 'relative',
              minHeight: 44,
              transition: 'color 0.15s',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: 2,
                background: '#0f5ca8',
                borderRadius: '0 0 2px 2px',
              }} />
            )}

            <div style={{ position: 'relative' }}>
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? '#0f5ca8' : '#64748b'}
              />
              {showBadge && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  background: '#dc2626',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '0.05rem 0.3rem',
                  borderRadius: '4px',
                  minWidth: 16,
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}>
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
