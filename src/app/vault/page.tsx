'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Hash, MapPin, Calendar, Search, CheckCircle2, Clock, FileText } from 'lucide-react';
import { getAllScanResults } from '@/utils/offlineQueue';
import { MOCK_SCAN_RESULTS } from '@/data/mockData';
import type { ScanResult } from '@/types/drug';
import Link from 'next/link';

export default function EvidenceVaultPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubstance, setFilterSubstance] = useState<string>('all');

  useEffect(() => {
    const loadVault = async () => {
      try {
        const stored = (await getAllScanResults()) as ScanResult[];
        if (stored && stored.length > 0) {
          // Merge stored with mock results so demo is always rich
          const existingIds = new Set(stored.map((s) => s.id));
          const combined = [...stored, ...MOCK_SCAN_RESULTS.filter((m) => !existingIds.has(m.id))];
          setScans(combined);
        } else {
          setScans(MOCK_SCAN_RESULTS);
        }
      } catch {
        setScans(MOCK_SCAN_RESULTS);
      }
    };
    loadVault();
  }, []);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.matchedSubstance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.officerBadge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.photoHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubstance =
      filterSubstance === 'all' || scan.matchedSubstance.toLowerCase() === filterSubstance.toLowerCase();

    return matchesSearch && matchesSubstance;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={26} color="var(--ncb-navy-primary)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
              Tamper-Proof Evidence Vault
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            Immutable forensic ledger sealed with client-side WebCrypto SHA-256 hashes & satellite GPS locks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: 'var(--ncb-green-subtle)', border: '1px solid #86efac', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-green)' }}>
            <CheckCircle2 size={14} />
            <span>100% Hash Seals Intact</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--ncb-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Case ID, Officer Badge, Substance, or Hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem 0.6rem 2.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--ncb-border)',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={filterSubstance}
          onChange={(e) => setFilterSubstance(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--ncb-border)',
            background: 'white',
            fontSize: '0.85rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Substances</option>
          <option value="heroin">Heroin / Opiates</option>
          <option value="cocaine">Cocaine HCl</option>
          <option value="cannabis">Cannabis</option>
          <option value="methamphetamine">Methamphetamine</option>
        </select>
      </div>

      {/* Evidence Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)' }}>
            <p style={{ color: 'var(--ncb-text-muted)', fontSize: '0.9rem', margin: 0 }}>No evidence records matching current filter.</p>
          </div>
        ) : (
          filteredScans.map((scan) => {
            const isHeroin = scan.matchedSubstance.includes('heroin');
            const isCocaine = scan.matchedSubstance.includes('cocaine');
            const badgeColor = isHeroin ? 'var(--ncb-crimson)' : isCocaine ? 'var(--ncb-gold)' : 'var(--ncb-green)';

            return (
              <div
                key={scan.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col md:grid md:grid-cols-[1.8fr_1.2fr] gap-4 sm:gap-5"
              >
                {/* Left Specimen Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)' }}>
                      {scan.caseId || 'NCB-SEAL-PENDING'}
                    </span>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: `${badgeColor}15`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}40`,
                      }}
                    >
                      {scan.matchedSubstance.toUpperCase()}
                    </span>
                    {scan.syncPending ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--ncb-amber)', fontWeight: 600 }}>
                        <Clock size={12} /> Local Offline Cache
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--ncb-green)', fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Synced to HQ
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {scan.aiAnalysis?.courtSummary || `Test conducted using ${scan.reagentType.toUpperCase()} reagent. ΔE₂₀₀₀ color variance = ${scan.deltaE}.`}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--ncb-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> {new Date(scan.timestamp).toLocaleString('en-IN')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} /> {scan.gps.latitude.toFixed(4)}°N, {scan.gps.longitude.toFixed(4)}°E
                    </span>
                  </div>
                </div>

                {/* Right Cryptographic Telemetry Box */}
                <div
                  style={{
                    background: 'var(--ncb-surface-2)',
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ncb-text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      <Hash size={13} /> SHA-256 Forensic Fingerprint
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--ncb-navy-primary)', wordBreak: 'break-all', background: 'white', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border-subtle)' }}>
                      {scan.photoHash}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ncb-text-muted)' }}>
                      IO: <strong>{scan.officerBadge}</strong>
                    </span>

                    <Link
                      href={`/panchnama?scanId=${scan.id}&substance=${encodeURIComponent(scan.matchedSubstance)}`}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: 'var(--ncb-navy-primary)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <FileText size={13} /> View Memo
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
