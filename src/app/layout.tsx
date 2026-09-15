import type { Metadata, Viewport } from 'next';
import '@/styles/theme.css';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import RootShell from './RootShell';

export const metadata: Metadata = {
  title: 'SAKSHYA AI (साक्ष्य) | Narcotics Control Bureau | Government of India',
  description: 'Digital companion for field drug testing — NCB, Ministry of Home Affairs, Government of India. NDPS Act compliance, CIELAB colorimetry, court-admissible evidence chain under Bharatiya Sakshya Adhiniyam.',
  keywords: 'SAKSHYA, NCB, drug testing, NDPS, colorimetry, seizure, panchnama, forensic, field officer, MHA',
  authors: [{ name: 'Team Sudophiles (SIH26231)' }],
  robots: 'noindex, nofollow', // Internal govt system
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a192f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Noto Sans font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* GIGW mandatory skip link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <AuthProvider>
          <RootShell>
            {children}
          </RootShell>
        </AuthProvider>
      </body>
    </html>
  );
}
