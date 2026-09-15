'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Camera, FileText, ShieldCheck, MapPin, Scale, Settings,
  ChevronLeft, ChevronRight, HelpCircle, LayoutDashboard, Map, User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',        href: '/overview',      roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: Camera,          label: 'Live Scanner',    href: '/scanner',       roles: ['ncb_io'] },
  { icon: FileText,        label: 'NDPS Panchnama',  href: '/panchnama',     roles: ['ncb_io', 'ncb_zonal'] },
  { icon: ShieldCheck,     label: 'Evidence Vault',  href: '/vault',         roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: MapPin,          label: 'Zonal Dashboard', href: '/analytics',     roles: ['ncb_fsl', 'ncb_zonal'] },
  { icon: Scale,           label: 'NDPS Legal Lib',  href: '/legal',         roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: Settings,        label: 'Calibration',     href: '/settings',      roles: ['ncb_fsl'] },
  { icon: HelpCircle,      label: 'How to Use',      href: '/how-to-use',    roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: User,            label: 'My Profile',      href: '/profile',       roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: Map,             label: 'Architecture',    href: '/architecture',  roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    user && (item.roles as readonly string[]).includes(user.role)
  );

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        position: 'sticky',
        top: 'var(--header-height)',
        height: 'calc(100dvh - var(--header-height))',
        zIndex: 150,
      }}
      aria-label="Main navigation"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0.6rem 0.75rem',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #e2e8f0',
          color: '#64748b',
          cursor: 'pointer',
          width: '100%',
          transition: 'color 0.15s',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation links */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.9rem',
                margin: '0.15rem 0.5rem',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? '#0f5ca8' : '#475569',
                background: isActive ? '#eaf4fd' : 'transparent',
                borderLeft: isActive ? '3px solid #0f5ca8' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#0f5ca8' : '#64748b'}
                strokeWidth={isActive ? 2.4 : 1.8}
                style={{ flexShrink: 0 }}
              />
              {!collapsed && (
                <span style={{ fontSize: '0.82rem', letterSpacing: '0.01em' }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Officer info at bottom */}
      {!collapsed && user && (
        <div style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Logged In As
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#0f5ca8', fontFamily: 'monospace', fontWeight: 600 }}>{user.badge}</div>
          <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '0.15rem' }}>{user.unit}</div>
        </div>
      )}
    </aside>
  );
}
