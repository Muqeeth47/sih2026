import React from 'react';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', marginBottom: '0.5rem' }}>
        Privacy & Data Protection Policy
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', marginBottom: '2rem' }}>
        Compliant with Digital Personal Data Protection (DPDP) Act, 2023 | Government of India
      </p>

      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-md)', lineHeight: 1.7, fontSize: '0.88rem', color: 'var(--ncb-text-main)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)' }}>1. Geolocation Data</h2>
        <p>
          High-accuracy device coordinates are captured only during the moment of evidence interdiction to establish court-admissible locus of seizure under Section 43 & 52 of the NDPS Act. Geolocation data is never tracked in the background.
        </p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '1.5rem' }}>2. Offline Evidence Storage</h2>
        <p>
          Evidence photographs, spectrophotometric data, and panchnama memoranda are stored locally within the browser&apos;s sandboxed offline storage. No raw photographic data is transmitted to commercial third-party cloud analytics services.
        </p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '1.5rem' }}>3. Cloud Forensic Intelligence</h2>
        <p>
          When network connectivity is available and officer requests AI verification, specimen photos are processed via secure server-side Google Gemini Flash API proxy exclusively for chemical OCR and tamper verification without retention.
        </p>
      </div>
    </div>
  );
}
