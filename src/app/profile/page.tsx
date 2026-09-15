'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import {
  User, Shield, Building2, BadgeCheck, Clock,
  Save, CheckCircle2, AlertCircle, Lock, Mail
} from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ncb_io:    { label: 'Field Investigating Officer',             color: '#0f5ca8' },
  ncb_fsl:   { label: 'Forensic Science Laboratory Analyst',    color: '#7c3aed' },
  ncb_zonal: { label: 'Zonal Superintendent / HQ Commissioner', color: '#b45309' },
  ncb_court: { label: 'NDPS Special Court Reader / Magistrate', color: '#065f46' },
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName]   = useState(user?.name  ?? '');
  const [unit, setUnit]   = useState(user?.unit  ?? '');
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  if (!user) return null;

  const roleMeta = ROLE_LABELS[user.role] ?? { label: user.role, color: '#0f5ca8' };
  const isDemoUser = user.badge.startsWith('NCB-IO-DEMO') ||
    user.badge.startsWith('NCB-FSL-DEMO') ||
    user.badge.startsWith('NCB-ZHQ-DEMO') ||
    user.badge.startsWith('NCB-CRT-DEMO') ||
    ['NCB-IO-4092', 'NCB-FSL-7731', 'NCB-ZHQ-0019', 'NCB-CRT-0001'].includes(user.badge);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast('err', 'Name cannot be empty.');
    setSaving(true);

    try {
      if (isDemoUser) {
        // Demo users: update sessionStorage only
        const stored = sessionStorage.getItem('ncb_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = name.trim();
          parsed.unit = unit.trim();
          sessionStorage.setItem('ncb_auth', JSON.stringify(parsed));
        }
        showToast('ok', 'Profile updated locally (demo account).');
      } else {
        // Real Supabase user: update auth metadata
        const { error } = await supabase.auth.updateUser({
          data: { name: name.trim(), unit: unit.trim() },
        });
        if (error) throw error;
        // Also update sessionStorage to reflect change
        const stored = sessionStorage.getItem('ncb_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = name.trim();
          parsed.unit = unit.trim();
          sessionStorage.setItem('ncb_auth', JSON.stringify(parsed));
        }
        showToast('ok', 'Profile saved successfully.');
      }
    } catch (err: any) {
      showToast('err', err?.message ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem 4rem', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: toast.type === 'ok' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '10px', padding: '0.85rem 1.1rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={16} color="#16a34a" />
            : <AlertCircle  size={16} color="#dc2626" />}
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: toast.type === 'ok' ? '#15803d' : '#dc2626' }}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f5ca8' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f5ca8' }}>
            MY PROFILE
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Officer Profile
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.3rem 0 0' }}>
          Edit your display name and unit. Role and badge are assigned by administration.
        </p>
      </div>

      {/* Role badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: `${roleMeta.color}08`, border: `1px solid ${roleMeta.color}25`,
        borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '12px',
          background: `${roleMeta.color}15`, border: `2px solid ${roleMeta.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={24} color={roleMeta.color} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: roleMeta.color, marginBottom: '0.15rem' }}>
            {user.badge}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{roleMeta.label}</div>
        </div>
        {isDemoUser && (
          <div style={{
            marginLeft: 'auto', background: '#fef9ec', border: '1px solid #fde68a',
            borderRadius: '6px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#92400e',
          }}>
            DEMO ACCOUNT
          </div>
        )}
      </div>

      {/* Editable Fields */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0f5ca8' }} />
          <span style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#64748b' }}>
            EDITABLE FIELDS
          </span>
        </div>

        {/* Name */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
            <User size={13} color="#64748b" /> Display Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.6rem 0.85rem', borderRadius: '8px',
              border: '1px solid #cbd5e1', fontSize: '0.9rem',
              fontFamily: "'Noto Sans', sans-serif", color: '#0f172a',
              outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#0f5ca8')}
            onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        {/* Unit */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
            <Building2 size={13} color="#64748b" /> Unit / Posting
          </label>
          <input
            value={unit}
            onChange={e => setUnit(e.target.value)}
            placeholder="e.g. Field Interdiction Command, Delhi Zone"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.6rem 0.85rem', borderRadius: '8px',
              border: '1px solid #cbd5e1', fontSize: '0.9rem',
              fontFamily: "'Noto Sans', sans-serif", color: '#0f172a',
              outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#0f5ca8')}
            onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.65rem 1.5rem', borderRadius: '8px',
            background: saving ? '#94a3b8' : '#0f5ca8', color: '#ffffff',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Noto Sans', sans-serif",
            alignSelf: 'flex-start', transition: 'background 0.15s',
          }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Read-only fields */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '1.25rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <Lock size={12} color="#94a3b8" />
          <span style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>
            READ-ONLY — ASSIGNED BY ADMINISTRATION
          </span>
        </div>

        {[
          { Icon: BadgeCheck, label: 'Badge Number',   value: user.badge },
          { Icon: Shield,     label: 'Assigned Role',  value: roleMeta.label },
          { Icon: Clock,      label: 'Session Login',  value: new Date(user.loginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
        ].map(({ Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
