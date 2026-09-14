'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  MOCK_ZONAL_STATS, MOCK_MONTHLY_SEIZURES, MOCK_DRUG_BREAKDOWN, MOCK_ZONE_COMPARISON
} from '@/data/mockData';
import { MapPin, TrendingUp, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

// Dynamic import of Leaflet map (client-only)
const SeizureMap = dynamic(() => import('@/components/analytics/SeizureMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ncb-surface-2)', borderRadius: 'var(--radius-lg)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--ncb-text-muted)', fontWeight: 600 }}>Loading Satellite Interdiction Heatmap...</span>
    </div>
  ),
});

export default function AnalyticsDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ncb_fsl', 'ncb_zonal']} featureName="Zonal Command Strategic Intelligence">
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TrendingUp size={26} color="var(--ncb-navy-primary)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
            Zonal Intelligence & Seizure Heatmaps
          </h1>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
          Real-time forensic telemetry, contraband volume trends, and interdiction geolocation intelligence.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Interdictions</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-navy-primary)', marginTop: '0.2rem' }}>{MOCK_ZONAL_STATS.totalSeizures}</div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Seized Weight</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-crimson)', marginTop: '0.2rem' }}>{MOCK_ZONAL_STATS.totalWeightKg} kg</div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Field Chemical Tests</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-green)', marginTop: '0.2rem' }}>{MOCK_ZONAL_STATS.testsPerformed}</div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--ncb-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Positive Ratio</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ncb-gold)', marginTop: '0.2rem' }}>{MOCK_ZONAL_STATS.positiveRate}%</div>
        </div>
      </div>

      {/* Map Section */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MapPin size={20} color="var(--ncb-navy-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
            Geographic Seizure Pin Clusters (All Zonal Units)
          </h2>
        </div>
        <SeizureMap />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Trend Line */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 1rem' }}>
            Monthly Interdiction Trajectory (2026)
          </h3>
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

        {/* Drug Breakdown Pie */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 1rem' }}>
            Contraband Portfolio Share (%)
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DRUG_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
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

        {/* Zonal Bar Comparison */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: '0 0 1rem' }}>
            Zonal Unit Enforcement Activity (Seizures Count)
          </h3>
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
