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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src="/images/mha-logo.png"
                alt="Ministry of Home Affairs"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
              <div style={{ width: '1px', height: '26px', background: '#cbd5e1' }} />
              <img
                src="/images/ncb-logo.png"
                alt="Narcotics Control Bureau"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>SAKSHYA AI</span>
                <span style={{ fontSize: '0.72rem', color: '#0f5ca8', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                  साक्ष्य
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Narcotics Control Bureau · Ministry of Home Affairs
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
          <span>© {year} Narcotics Control Bureau · SAKSHYA AI (साक्ष्य) | Ministry of Home Affairs</span>
        </div>
      </div>
    </footer>
  );
}
