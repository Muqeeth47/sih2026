'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Camera, FileText, ShieldCheck, MapPin, Scale, Settings,
  ChevronLeft, ChevronRight, HelpCircle, LayoutDashboard, Map, User,
  LogOut, ArrowLeftRight, CheckCircle2, Building2, FlaskConical, Shield
} from 'lucide-react';
import { useAuth, ROLE_HOME_ROUTES } from '@/hooks/useAuth';
import { DEMO_ROLES, type NCBRole } from '@/data/mockData';

const NAV_ITEMS: {
  icon: React.ElementType; label: string; href: string; roles: readonly string[];
}[] = [
  { icon: LayoutDashboard, label: 'Overview',          href: '/overview',          roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  // Field IO
  { icon: Camera,          label: 'Live Scanner',      href: '/field/scanner',     roles: ['ncb_io'] },
  { icon: FileText,        label: 'NDPS Panchnama',    href: '/field/panchnama',   roles: ['ncb_io'] },
  { icon: ShieldCheck,     label: 'Evidence Vault',    href: '/field/vault',       roles: ['ncb_io'] },
  // FSL
  { icon: ShieldCheck,     label: 'FSL Vault',         href: '/fsl/vault',         roles: ['ncb_fsl'] },
  { icon: MapPin,          label: 'Interdiction Map',   href: '/analytics',         roles: ['ncb_fsl'] },
  { icon: Settings,        label: 'Calibration',       href: '/fsl/calibration',   roles: ['ncb_fsl'] },
  // Zonal
  { icon: ShieldCheck,     label: 'Zonal Vault',       href: '/zonal/vault',       roles: ['ncb_zonal'] },
  { icon: FileText,        label: 'Panchnama Review',  href: '/zonal/panchnama',   roles: ['ncb_zonal'] },
  { icon: MapPin,          label: 'Analytics',         href: '/zonal/analytics',   roles: ['ncb_zonal'] },
  // Court
  { icon: ShieldCheck,     label: 'Court Dossiers',    href: '/court/vault',       roles: ['ncb_court'] },
  { icon: Scale,           label: 'Legal Repository',  href: '/court/legal',       roles: ['ncb_court'] },
  // Shared
  { icon: Scale,           label: 'NDPS Legal Lib',    href: '/legal',             roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: HelpCircle,      label: 'How to Use',        href: '/how-to-use',        roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: User,            label: 'My Profile',        href: '/profile',           roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
  { icon: Map,             label: 'Architecture',      href: '/architecture',      roles: ['ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court'] },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loginAsRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    user && (item.roles as readonly string[]).includes(user.role)
  );

  const handleSwitchRole = (role: NCBRole) => {
    loginAsRole(role);
    const destination = ROLE_HOME_ROUTES[role] || '/overview';
    router.push(destination);
    onItemClick?.();
  };

  const handleSignOut = () => {
    logout();
    router.push('/login');
    onItemClick?.();
  };

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
      {/* Collapse toggle (Desktop only) */}
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
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => onItemClick?.()}
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
                minHeight: '38px',
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

      {/* Bottom Profile & Role Switcher Area */}
      {!collapsed && user ? (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0.75rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}>
          {/* Officer Info Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.6rem 0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#0f5ca8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                ● Active Officer
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>
                {user.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.unit}
            </div>
          </div>

          {/* Role Switcher Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowRoleSwitcher(s => !s)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                background: '#eef2f6',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#1e293b',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowLeftRight size={13} color="#0f5ca8" />
                <span>Switch Role / Account</span>
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800 }}>
                {showRoleSwitcher ? '▲ Close' : '▼ Switch'}
              </span>
            </button>

            {showRoleSwitcher && (
              <div style={{
                marginTop: '0.4rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.35rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.4rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
              }}>
                {DEMO_ROLES.map((role) => {
                  const isCurrent = user.role === role.role;
                  return (
                    <button
                      key={role.role}
                      type="button"
                      onClick={() => handleSwitchRole(role.role)}
                      style={{
                        padding: '0.45rem 0.35rem',
                        borderRadius: '5px',
                        border: isCurrent ? `1.5px solid ${role.color}` : '1px solid #e2e8f0',
                        background: isCurrent ? '#f0fdf4' : '#ffffff',
                        color: isCurrent ? '#166534' : '#334155',
                        fontSize: '0.68rem',
                        fontWeight: isCurrent ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.15rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {role.label}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.58rem', color: '#15803d', fontWeight: 800 }}>
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '7px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#fee2e2';
              (e.currentTarget as HTMLElement).style.borderColor = '#fca5a5';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#fef2f2';
              (e.currentTarget as HTMLElement).style.borderColor = '#fecaca';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      ) : collapsed ? (
        /* Collapsed Sign Out Button */
        <div style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            style={{
              width: '100%',
              padding: '0.6rem 0',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
