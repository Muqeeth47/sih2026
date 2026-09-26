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
  const { login, signUp, loginAsRole, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeRoleTab, setActiveRoleTab] = useState<NCBRole>('ncb_io');
  const [badge, setBadge] = useState('Sub Inspector');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [autofillNotice, setAutofillNotice] = useState<string | null>(null);
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
      setAutofillNotice(`✨ Autofilled credentials for ${demo.label}: ${demo.badge} (PIN: ${demo.pin})`);
      setTimeout(() => setAutofillNotice(null), 3500);
    }
    setError('');
    setSuccessMsg('');
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const result = await signInWithGoogle(activeRoleTab);
    setGoogleLoading(false);
    if (result.success) {
      router.push(ROLE_HOME_ROUTES[activeRoleTab] || '/overview');
    } else {
      setError(result.error || 'Failed to sign in with Google.');
    }
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
            {/* Government Agency Logos Container */}
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs p-2 sm:p-2.5 rounded-xl border border-white/20 shadow-md mb-6">
              <img
                src="/images/mha-logo.png"
                alt="Ministry of Home Affairs"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <div className="w-px h-6 bg-slate-300" />
              <img
                src="/images/ncb-logo.png"
                alt="Narcotics Control Bureau"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>

            {/* Main Headline */}
            <div className="mb-2">
              <span className="text-[0.7rem] font-extrabold uppercase text-blue-200 tracking-wider block mb-1">
                MINISTRY OF HOME AFFAIRS · NCB
              </span>
              <h1
                style={{
                  fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 0.5rem',
                  color: '#ffffff',
                }}
              >
                SAKSHYA AI<br />
                <span className="text-blue-200 text-[1.4rem] font-bold">साक्ष्य AI</span>
              </h1>
              <div className="text-[0.82rem] font-semibold text-emerald-300 tracking-wide mb-3">
                सत्यमेव साक्ष्यम् · Digital Evidence Sealing
              </div>
            </div>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                maxWidth: '340px',
              }}
            >
              Transform standard smartphone cameras into calibrated spectrophotometers. Two-step verification and Section 52 NDPS Panchnama certification.
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

            {/* Autofill Callout Banner */}
            {authMode === 'signin' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '0.45rem 0.85rem',
                  marginBottom: '0.65rem',
                  fontSize: '0.76rem',
                  color: '#166534',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(22, 101, 52, 0.06)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} className="animate-ping" />
                  👉 <strong>Click any role below to AUTOFILL credentials</strong>
                </span>
                <span style={{ fontSize: '0.66rem', color: '#15803d', background: '#dcfce7', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>
                  1-Tap Demo
                </span>
              </div>
            )}

            {/* Segmented Role Selector Tabs (All 4 Official Roles with PIN indicators) */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-3"
            >
              {[
                { role: 'ncb_io' as NCBRole, label: 'Sub Inspector', icon: User, pin: '1234' },
                { role: 'ncb_fsl' as NCBRole, label: 'Forensic Lab', icon: FlaskConical, pin: '1234' },
                { role: 'ncb_zonal' as NCBRole, label: 'Zonal Officer', icon: Building2, pin: '1234' },
                { role: 'ncb_court' as NCBRole, label: 'Court', icon: Scale, pin: '1234' },
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
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.2rem',
                      padding: '0.6rem 0.35rem',
                      borderRadius: '8px',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#0f172a' : '#64748b',
                      border: isSelected ? '1.5px solid #0f5ca8' : '1.5px solid transparent',
                      boxShadow: isSelected ? '0 2px 8px rgba(15, 92, 168, 0.12)' : 'none',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Icon size={14} color={isSelected ? '#0f5ca8' : '#64748b'} />
                      <span>{tab.label}</span>
                    </div>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: isSelected ? '#0f5ca8' : '#64748b',
                      background: isSelected ? '#e0f2fe' : '#e2e8f0',
                      padding: '1px 5px',
                      borderRadius: '4px',
                    }}>
                      PIN: {tab.pin}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Autofill Confirmation Flash */}
            {autofillNotice && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>{autofillNotice}</span>
              </div>
            )}

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
                    Officer Role or Official Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="badge-input"
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Sub Inspector, Forensic Lab, or email"
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
                      fontFamily: 'inherit',
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
                      placeholder="Enter password (e.g. 1234)"
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
                    onClick={() => alert('Demo Credentials (PIN: 1234 for all):\n• Sub Inspector (PIN: 1234)\n• Forensic Lab (PIN: 1234)\n• Zonal Officer (PIN: 1234)\n• Court (PIN: 1234)\n\nTip: You can also click the role buttons above to 1-tap autofill.')}
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

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.15rem 0', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    OR
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google…' : 'Sign in with Google'}</span>
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


          </div>
        </div>
      </div>
    </div>
  );
}
