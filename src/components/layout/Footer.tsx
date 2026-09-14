import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      color: '#475569',
      fontSize: '0.8rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          paddingBottom: '1.5rem',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '8px',
              background: '#0f5ca8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(15, 92, 168, 0.25)',
            }}>
              <Shield size={18} color="white" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>DRUG-SEAL AI</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Narcotics Control Bureau • Ministry of Home Affairs
              </div>
            </div>
          </div>

          {/* Only Requested Policies */}
          <nav aria-label="Government Policies Navigation">
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '1rem 1.75rem',
            }}>
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Accessibility Statement', href: '/about#accessibility' },
              ].map(policy => (
                <li key={policy.href}>
                  <Link
                    href={policy.href}
                    style={{
                      color: '#334155',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f5ca8')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#334155')}
                  >
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.74rem',
          color: '#64748b',
        }}>
          <span>
            Content owned by <strong style={{ color: '#0f172a' }}>Narcotics Control Bureau, MHA, GoI</strong>
            {' '}| Designed &amp; Developed for <strong style={{ color: '#0f172a' }}>SIH 2026</strong>
          </span>
          <span>© {year} NCB DRUG-SEAL AI | Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </footer>
  );
}
