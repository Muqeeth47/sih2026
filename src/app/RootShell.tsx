'use client';
// RootShell.tsx — Handles splash screen + layout switching between public/authed views
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AccessibilityBar from '@/components/layout/AccessibilityBar';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import OfflineSyncBadge from '@/components/shared/OfflineSyncBadge';
import SplashScreen from '@/components/shared/SplashScreen';

const PUBLIC_PATHS = ['/', '/login', '/about', '/terms', '/privacy', '/architecture', '/how-to-use'];

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Safely trigger splash on client mount once hydration completes without SSR mismatch
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('sakshya_splash_seen');
      if (!seen) {
        setShowSplash(true);
      }
    } catch {}
  }, []);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Redirect unauthenticated users from protected routes once auth state is resolved
  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === '/';
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  // If authenticated, always show app shell (with sidebar) across all routes including /architecture and /how-to-use
  // Only hide shell on login page or when user is not authenticated
  const isLoginPage = pathname === '/login';
  const showShell = isAuthenticated && !isLoginPage;
  const isPublicPage = !isAuthenticated && (PUBLIC_PATHS.includes(pathname) || pathname === '/');

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            try {
              sessionStorage.setItem('sakshya_splash_seen', '1');
            } catch {}
            setShowSplash(false);
          }}
        />
      )}

      {/* Top chrome: always visible */}
      <AccessibilityBar />
      <Header
        onMenuToggle={() => setSidebarOpen(o => !o)}
        isSidebarOpen={sidebarOpen}
      />

      {showShell ? (
        /* Authenticated app shell */
        <div style={{ display: 'flex', minHeight: 'calc(100dvh - var(--header-height) - var(--accessibility-bar-height))' }}>
          {/* Desktop sidebar */}
          {!isMobile && sidebarOpen && <Sidebar />}

          {/* Mobile slide-out drawer overlay */}
          {isMobile && sidebarOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
              <div
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)' }}
              />
              <div style={{ position: 'relative', width: '260px', maxWidth: '80vw', height: '100%', background: '#ffffff', zIndex: 10, display: 'flex' }}>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Main content */}
          <main
            id="main-content"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '1rem 1rem calc(var(--mobile-nav-height) + 1rem)' : '1.5rem',
              background: 'var(--ncb-bg)',
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </div>
      ) : (
        /* Public pages — full width */
        <main id="main-content" style={{ background: 'var(--ncb-bg)', flex: 1 }}>
          {children}
        </main>
      )}

      {/* Footer — always shown on public pages, hidden in app shell */}
      {isPublicPage && <Footer />}

      {/* Mobile bottom nav — only in authenticated app shell */}
      {showShell && isMobile && <MobileBottomNav />}

      {/* Global offline banner */}
      <OfflineBannerGlobal />
    </>
  );
}

function OfflineBannerGlobal() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="alert" aria-live="assertive">
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c', flexShrink: 0, animation: 'ncb-pulse 1.5s ease infinite' }} />
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: '0.8rem', color: '#9a3412', display: 'block' }}>Offline Mode Active</strong>
        <span style={{ fontSize: '0.72rem', color: '#7c2d12' }}>Evidence and scans are queued locally. Auto-sync when network restores.</span>
      </div>
    </div>
  );
}
