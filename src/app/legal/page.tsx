'use client';
import React, { useState } from 'react';
import { Scale, BookOpen, ExternalLink, Search } from 'lucide-react';

const NDPS_SECTIONS = [
  {
    section: 'Section 41',
    title: 'Power to issue warrant and authorisation',
    summary: 'Empowers Magistrates and specially empowered gazetted officers of NCB/Police to issue warrants for arrest and search of premises where narcotics or psychotropic substances are suspected to be concealed.',
    penalty: 'Procedural authority clause',
  },
  {
    section: 'Section 42',
    title: 'Power of entry, search, seizure and arrest without warrant',
    summary: 'Allows designated officers between sunrise and sunset to enter, search and seize contraband without warrant if reasonable ground exists that obtaining warrant causes delay facilitating concealment or escape.',
    penalty: 'Mandates recording of grounds of belief within 72 hours to immediate official superior.',
  },
  {
    section: 'Section 43',
    title: 'Power of seizure and arrest in public place',
    summary: 'Authorizes seizure of narcotics in any public place (including transit highways, borders, or public conveyances) and detention/search of any suspect carrying contraband.',
    penalty: 'Field interdiction statutory authority.',
  },
  {
    section: 'Section 50',
    title: 'Conditions under which search of persons shall be conducted',
    summary: 'Mandatory statutory right: Suspect must be informed of their legal right to be searched in the presence of a Gazetted Officer or a Magistrate prior to personal search.',
    penalty: 'Strict compliance mandatory; non-compliance invalidates seizure evidence in special court.',
  },
  {
    section: 'Section 52',
    title: 'Disposal of persons arrested and articles seized (Form F Panchnama)',
    summary: 'Mandates that every person arrested and article seized shall be forwarded without unnecessary delay to the officer in charge of the nearest police station or authorized officer with a formal seizure memorandum.',
    penalty: 'Statutory basis for the SAKSHYA AI (साक्ष्य) automated Form F Seizure Panchnama.',
  },
  {
    section: 'Section 52A',
    title: 'Disposal of seized narcotic drugs and psychotropic substances',
    summary: 'Allows preparing an inventory of seized narcotics with details of description, quality, quantity, mode of packing, marks, numbers and taking samples before a Magistrate who certifies the correctness.',
    penalty: 'Certification by Magistrate forms primary court evidence during trial.',
  },
  {
    section: 'Section 67',
    title: 'Power to call for information, etc.',
    summary: 'Empowers investigating officers during enquiry to examine any person acquainted with facts and circumstances of the case and require production of documents.',
    penalty: 'Voluntary statement recorded under Sec 67 admissible in NDPS proceedings.',
  },
];

export default function LegalLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = NDPS_SECTIONS.filter(
    (item) =>
      item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Scale size={26} color="var(--ncb-navy-primary)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
            NDPS Act Statutory Legal Library
          </h1>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
          Operational compliance reference for Investigating Officers under the Narcotic Drugs and Psychotropic Substances Act, 1985.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} color="var(--ncb-text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search NDPS Sections (e.g. Section 50, Panchnama, Search)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem 0.65rem 2.4rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--ncb-border)',
            fontSize: '0.85rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((item) => (
          <div
            key={item.section}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--ncb-border)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}>
                {item.section}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {item.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ncb-text-muted)', lineHeight: 1.5, margin: '0 0 0.6rem' }}>
              {item.summary}
            </p>
            <div style={{ background: 'var(--ncb-surface-2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--ncb-text-main)', fontWeight: 600 }}>
              Compliance Note: {item.penalty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
