import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '2px solid var(--ncb-crimson)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldAlert size={42} color="var(--ncb-crimson)" />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ncb-navy-dark)', margin: 0 }}>
        404 — Access Boundary
      </h1>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ncb-text-muted)', margin: '0.5rem 0 1.5rem' }}>
        The requested forensic route or evidence dossier does not exist.
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ncb-text-muted)', maxWidth: 450, margin: '0 0 2rem', lineHeight: 1.6 }}>
        Please verify the dossier URL or return to the main operational gateway. All navigational requests within the NCB gateway are logged.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--ncb-navy-primary)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '0.9rem',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <ArrowLeft size={16} /> Return to Portal Gateway
      </Link>
    </div>
  );
}
