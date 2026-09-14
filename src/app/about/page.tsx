import React from 'react';
import { Shield, Award, Users, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #b45309)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)' }}>
          <Shield size={32} color="white" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
          About DRUG-SEAL AI
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ncb-text-muted)', marginTop: '0.4rem' }}>
          Problem Statement SIH26231 | Ministry of Home Affairs | Narcotics Control Bureau (NCB)
        </p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-md)', lineHeight: 1.7, fontSize: '0.9rem', color: 'var(--ncb-text-main)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: 0 }}>
          Mission Statement
        </h2>
        <p>
          During narcotics interdictions on remote Indian highways, border transit posts, and coastal checkpoints, field officers from the Narcotics Control Bureau (NCB) and State Anti-Narcotics Task Forces (ANTF) rely on disposable chemical colorimetric test pouches (NIK Kits, Marquis, Scott, and Duquenois-Levine reagents).
        </p>
        <p>
          However, visual color interpretation under harsh sunlight, sodium streetlights, or vehicle headlights introduces human bias, parallax errors, and subjective disagreement that defense attorneys frequently challenge in Special NDPS Courts.
        </p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '2rem' }}>
          Our Technological Solution
        </h2>
        <p>
          <strong>DRUG-SEAL AI</strong> transforms standard smartphone optics into a certified, court-admissible spectrophotometer:
        </p>
        <ul style={{ paddingLeft: '1.25rem' }}>
          <li><strong>5ms Edge Colorimetry:</strong> Mathematical CIELAB &Delta;E<sub>2000</sub> matching running 100% offline in browser canvas.</li>
          <li><strong>Quality Guardians:</strong> Laplacian variance edge detector rejects blurry hand-shake frames; specular glare filtering eliminates false reflections.</li>
          <li><strong>Cloud Forensic Intelligence:</strong> Multimodal Gemini 2.5 Flash API reads pouch lot numbers, detects adulterants, and performs tamper checks.</li>
          <li><strong>Section 52 NDPS Panchnama:</strong> One-click automated compilation and digital export of the statutory seizure memorandum.</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', marginTop: '2rem' }} id="accessibility">
          Accessibility & Compliance Commitment
        </h2>
        <p>
          Built strictly in accordance with <strong>UX4G v2.0.8</strong>, <strong>GIGW 3.0</strong>, and <strong>WCAG 2.1 AA</strong> standards, ensuring full screen reader accessibility, bilingual English/Hindi support, and high-contrast ergonomics.
        </p>
      </div>
    </div>
  );
}
