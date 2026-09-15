'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  MOCK_MONTHLY_SEIZURES, MOCK_DRUG_BREAKDOWN, MOCK_ZONE_COMPARISON,
} from '@/data/mockData';
import { supabase } from '@/utils/supabaseClient';
import { MapPin, TrendingUp, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

const SeizureMap = dynamic(() => import('@/components/analytics/SeizureMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px' }}>
      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Loading Interdiction Map…</span>
    </div>
  ),
});

interface LiveStats {
  totalSeizures: number;
  totalWeightKg: number;
  testsPerformed: number;
  positiveCount: number;
}

export default function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [seizureRes, assayRes, positiveRes, weightRes] = await Promise.all([
          supabase.from('seizures').select('*', { count: 'exact', head: true }),
          supabase.from('scan_assays').select('*', { count: 'exact', head: true }),
          supabase.from('seizures').select('*', { count: 'exact', head: true }).eq('opencv_status', 'positive'),
          supabase.from('seizures').select('quantity_grams'),
        ]);

        const totalWeight = (weightRes.data ?? []).reduce(
          (acc: number, r: any) => acc + (Number(r.quantity_grams) || 0), 0
        );

        setStats({
          totalSeizures: seizureRes.count ?? 0,
          testsPerformed: assayRes.count ?? 0,
          positiveCount: positiveRes.count ?? 0,
          totalWeightKg: totalWeight / 1000,
        });
      } catch {
        setStats({ totalSeizures: 0, testsPerformed: 0, positiveCount: 0, totalWeightKg: 0 });
      }
    };
    fetchStats();
  }, []);

  const positiveRate = stats && stats.testsPerformed > 0
    ? ((stats.positiveCount / stats.testsPerformed) * 100).toFixed(1)
    : '—';

  return (
    <RoleGuard allowedRoles={['ncb_fsl', 'ncb_zonal']} featureName="Zonal Command Strategic Intelligence">
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={26} color="var(--ncb-navy-primary)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
              Zonal Intelligence &amp; Seizure Heatmaps
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            Live forensic telemetry, contraband volume trends, and interdiction geolocation intelligence.
          </p>
        </div>

        {/* KPI Cards — live from Supabase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={12} /> Total Seizures
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-navy-primary)', marginTop: '0.2rem' }}>
              {stats ? stats.totalSeizures : '…'}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>Live from Supabase</div>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Scale size={12} /> Seized Weight
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-crimson)', marginTop: '0.2rem' }}>
              {stats ? `${stats.totalWeightKg.toFixed(1)} kg` : '…'}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>Sum of quantity_grams</div>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} /> Field Chemical Tests
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-green)', marginTop: '0.2rem' }}>
              {stats ? stats.testsPerformed : '…'}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>scan_assays rows</div>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <TrendingUp size={12} /> Positive Ratio
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-gold)', marginTop: '0.2rem' }}>
              {stats ? `${positiveRate}%` : '…'}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>Positive / total tests</div>
          </div>
        </div>

        {/* Map */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MapPin size={20} color="var(--ncb-navy-primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
              Geographic Seizure Pin Clusters — Live Supabase Data
            </h2>
          </div>
          <SeizureMap />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 0.35rem' }}>
              Monthly Interdiction Trajectory (Demo)
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 1rem' }}>Historical demo data — real chart will populate as scans accumulate.</p>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_MONTHLY_SEIZURES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="seizures" stroke="#17375e" strokeWidth={3} />
                  <Line type="monotone" dataKey="weight" stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 0.35rem' }}>
              Contraband Portfolio Share (Demo)
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 1rem' }}>Historical proportions — will update as real scan data grows.</p>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_DRUG_BREAKDOWN} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {MOCK_DRUG_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 0.35rem' }}>
              Zonal Unit Enforcement Activity (Demo)
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 1rem' }}>Projected zonal targets — actual figures tracked in real time via map pins above.</p>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ZONE_COMPARISON}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="zone" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="seizures" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
