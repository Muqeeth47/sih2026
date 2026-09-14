import React from 'react';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', marginBottom: '0.5rem' }}>
        Terms and Conditions of Use
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', marginBottom: '2rem' }}>
        Last Updated: September 14, 2026 | Narcotics Control Bureau, Ministry of Home Affairs
      </p>

      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-md)', lineHeight: 1.7, fontSize: '0.88rem', color: 'var(--ncb-text-main)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)' }}>1. Authorized Official Access Only</h2>
        <p>
          DRUG-SEAL AI is an official software utility designed exclusively for authorized officers of the Narcotics Control Bureau (NCB), State Anti-Narcotics Task Forces (ANTF), Police Departments, and accredited Forensic Science Laboratories (FSL). Unauthorized access or tampering with digital evidence ledgers is an offense under the Information Technology Act, 2000 and Section 58 of the NDPS Act, 1985.
        </p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '1.5rem' }}>2. Presumptive Nature of Spot Tests</h2>
        <p>
          Field colorimetric spot testing using NIK pouches or standard reagents (Marquis, Scott, Duquenois-Levine) is presumptive in nature under UNODC guidelines. While DRUG-SEAL AI provides objective spectrophotometric measurement and cryptographic chain-of-custody sealing, confirmatory testing via GC-MS / HPLC at a certified Forensic Science Laboratory remains the statutory requirement for trial adjudication.
        </p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '1.5rem' }}>3. Cryptographic Chain of Custody</h2>
        <p>
          All evidence photographs captured within the system are sealed on the client device using standard SHA-256 WebCrypto hashing. Alteration of image metadata or modification of the local IndexedDB database voids digital evidentiary admissibility.
        </p>
      </div>
    </div>
  );
}
