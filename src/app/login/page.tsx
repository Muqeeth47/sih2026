'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Eye, EyeOff, Loader2, ArrowRight, User, FlaskConical, Building2, Scale,
  CheckCircle2, Lock, Clock, LogIn, UserPlus
} from 'lucide-react';
import { useAuth, ROLE_HOME_ROUTES } from '@/hooks/useAuth';
import { DEMO_ROLES, type NCBRole } from '@/data/mockData';

export default function LoginPage() {
  const { login, signUp, loginAsRole } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeRoleTab, setActiveRoleTab] = useState<NCBRole>('ncb_io');
  const [badge, setBadge] = useState('NCB-IO-4092');
  const [pin, setPin] = useState('7731');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sign up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<NCBRole>('ncb_io');
  const [signupUnit, setSignupUnit] = useState('NCB Northern Zone');

  // Handle switching role segmented tabs
  const handleRoleTabSelect = (role: NCBRole) => {
    setActiveRoleTab(role);
    setSignupRole(role);
    const demo = DEMO_ROLES.find(r => r.role === role);
    if (demo && authMode === 'signin') {
      setBadge(demo.badge);
      setPin(demo.pin);
    }
    setError('');
    setSuccessMsg('');
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge.trim() || !pin.trim()) {
      setError('Please enter your Badge Number or Email, and PIN or Password.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    const result = await login(badge.trim(), pin.trim());
    setLoading(false);
    if (result.success) {
      const demo = DEMO_ROLES.find(r => r.badge === badge.trim() || r.name.toLowerCase() === badge.trim().toLowerCase());
      if (demo) {
        router.push(ROLE_HOME_ROUTES[demo.role]);
      } else {
        router.push(ROLE_HOME_ROUTES[activeRoleTab] || '/scanner');
      }
    } else {
      setError(result.error || 'Invalid credentials. Please use the demo credentials below or sign up.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Please complete all fields to register your official account.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    const result = await signUp(signupEmail.trim(), signupPassword.trim(), {
      name: signupName.trim(),
      role: signupRole,
      unit: signupUnit.trim(),
    });

    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Account registered successfully!');
      setTimeout(() => {
        router.push(ROLE_HOME_ROUTES[signupRole]);
      }, 1200);
    } else {
      setError(result.error || 'Failed to create account. Please try again.');
    }
  };

  const handleDemoInstantLogin = (role: NCBRole) => {
    loginAsRole(role);
    router.push(ROLE_HOME_ROUTES[role]);
  };

  const currentRoleInfo = DEMO_ROLES.find(r => r.role === activeRoleTab) || DEMO_ROLES[0];

  return (
    <div
      style={{
        minHeight: 'calc(100dvh - 38px)',
        background: '#eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      {/* Split Card Container */}
      <div
        className="w-full max-w-[1060px] bg-white rounded-2xl md:rounded-[24px] shadow-xl flex flex-col md:grid md:grid-cols-[0.9fr_1.2fr] overflow-hidden border border-slate-200"
      >
        {/* ── Left Dark Sidebar Panel ── */}
        <div
          className="bg-[#0a3b69] p-6 sm:p-8 md:p-12 flex flex-col justify-between text-white relative"
        >
          <div>
            {/* Left-Aligned Typographic Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[0.72rem] font-extrabold uppercase text-blue-200 tracking-wider">
                ROLE-BASED CLEARANCE BOUNDARY
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                margin: '0 0 1rem',
                color: '#ffffff',
              }}
            >
              Keep evidence<br />sealed.
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.75)',
                margin: 0,
                maxWidth: '340px',
              }}
            >
              Use DRUG-SEAL AI to eliminate color subjectivity, lock satellite GPS, and certify court-admissible forensic records.
            </p>
          </div>

          {/* Bottom Bullet Points */}
          <div className="flex flex-col gap-3 mt-6 md:mt-12">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              <CheckCircle2 size={16} color="#60a5fa" strokeWidth={2.2} />
              <span>Instant CIELAB colorimetry</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              <Lock size={16} color="#60a5fa" strokeWidth={2.2} />
              <span>SHA-256 tamper-proof seal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              <Clock size={16} color="#60a5fa" strokeWidth={2.2} />
              <span>Section 52 Panchnama in seconds</span>
            </div>
          </div>
        </div>

        {/* ── Right White Form Panel ── */}
        <div className="p-5 sm:p-8 md:p-12 bg-white flex flex-col justify-between">
          <div>
            {/* Top Switcher: Sign In vs Sign Up */}
            <div
              style={{
                display: 'inline-flex',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '3px',
                marginBottom: '1.5rem',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  background: authMode === 'signin' ? '#0f5ca8' : 'transparent',
                  color: authMode === 'signin' ? '#ffffff' : '#64748b',
                  border: 'none',
                  fontWeight: authMode === 'signin' ? 700 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'signin' ? '0 1px 4px rgba(15, 92, 168, 0.2)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <LogIn size={14} strokeWidth={2.4} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  background: authMode === 'signup' ? '#0f5ca8' : 'transparent',
                  color: authMode === 'signup' ? '#ffffff' : '#64748b',
                  border: 'none',
                  fontWeight: authMode === 'signup' ? 700 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'signup' ? '0 1px 4px rgba(15, 92, 168, 0.2)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>

            {/* Segmented Role Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.4rem',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}
            >
              {[
                { role: 'ncb_io' as NCBRole, label: 'Field IO', icon: User },
                { role: 'ncb_fsl' as NCBRole, label: 'Forensic Lab', icon: FlaskConical },
                { role: 'ncb_zonal' as NCBRole, label: 'Zonal HQ', icon: Building2 },
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeRoleTab === tab.role;
                return (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => handleRoleTabSelect(tab.role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#0f172a' : '#64748b',
                      border: isSelected ? '1px solid #e2e8f0' : '1px solid transparent',
                      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={15} color={isSelected ? '#0f5ca8' : '#64748b'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Section Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f5ca8' }} />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#0f5ca8',
                  }}
                >
                  {currentRoleInfo.fullTitle.toUpperCase()}
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
                {authMode === 'signin' ? 'Sign in to your workspace' : 'Create official officer account'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                {authMode === 'signin'
                  ? 'Use your official badge ID, email, and password to proceed.'
                  : 'Register a verified account under Supabase Cloud Authentication.'}
              </p>
            </div>

            {/* Sign In or Sign Up Form */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignInSubmit}>
                {/* Badge Number / Email */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <label
                    htmlFor="badge-input"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}
                  >
                    Badge Number or Official Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="badge-input"
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. NCB-IO-4092 or officer@ncb.gov.in"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      background: '#ffffff',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                  />
                </div>

                {/* Password / PIN */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <label
                    htmlFor="pin-input"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}
                  >
                    Password / Clearance PIN <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="pin-input"
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter your passcode or password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.8rem 0.75rem 1rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                        fontSize: '0.9rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        letterSpacing: showPin ? 'normal' : '0.2em',
                        background: '#ffffff',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(v => !v)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: 0,
                      }}
                      aria-label={showPin ? 'Hide password' : 'Show password'}
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => alert('Demo credentials:\n• Field IO: NCB-IO-4092 / PIN: 7731\n• Forensic Lab: NCB-FSL-1088 / PIN: 9044\n• Zonal HQ: NCB-HQ-0012 / PIN: 1100\n• NDPS Court: NCB-CRT-005 / PIN: 4432\n\nOr create your own account using the Create Account tab.')}
                    style={{ background: 'none', border: 'none', color: '#0f5ca8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password / view credentials
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0f5ca8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(15, 92, 168, 0.3)',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to {currentRoleInfo.label.toLowerCase()} portal</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit}>
                {/* Officer Name */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label
                    htmlFor="signup-name"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                  >
                    Officer Full Name & Designation <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Inspector R. K. Sharma"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                  />
                </div>

                {/* Official Email */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label
                    htmlFor="signup-email"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                  >
                    Official / Personal Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. officer@ncb.gov.in"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '0.9rem' }}>
                  <label
                    htmlFor="signup-password"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                  >
                    Password (min 6 characters) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                  />
                </div>

                {/* Station / Zonal Unit */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label
                    htmlFor="signup-unit"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                  >
                    Station / Zonal Unit <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="signup-unit"
                    type="text"
                    value={signupUnit}
                    onChange={(e) => setSignupUnit(e.target.value)}
                    placeholder="e.g. NCB Delhi Zonal Unit / FSL Rohini"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${error ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0f5ca8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#dc2626' : '#cbd5e1')}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {successMsg && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0f5ca8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(15, 92, 168, 0.3)',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Registering account in Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Register & enter {currentRoleInfo.label.toLowerCase()} portal</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Alternate Access Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>Need NDPS court reader clearance?</span>
              <button
                type="button"
                onClick={() => handleRoleTabSelect('ncb_court')}
                style={{ background: 'none', border: 'none', color: '#0f5ca8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Open court access
              </button>
            </div>
          </div>

          {/* ── Bottom Quick Demo Sign-in Strip (Matching User Reference Image) ── */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f5ca8' }} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#0f5ca8',
                }}
              >
                QUICK DEMO SIGN-IN
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.85rem' }}>
              Open a ready-to-use workspace instantly for evaluation & presentation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_ROLES.map(demo => {
                const Icon = demo.role === 'ncb_io' ? User : demo.role === 'ncb_fsl' ? FlaskConical : demo.role === 'ncb_zonal' ? Building2 : Scale;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoInstantLogin(demo.role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.55rem 0.5rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#0f5ca8';
                      (e.currentTarget as HTMLElement).style.background = '#eaf4fd';
                      (e.currentTarget as HTMLElement).style.color = '#0f5ca8';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                      (e.currentTarget as HTMLElement).style.background = '#ffffff';
                      (e.currentTarget as HTMLElement).style.color = '#0f172a';
                    }}
                  >
                    <Icon size={14} />
                    <span>{demo.label.split(' ')[0]} demo</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
