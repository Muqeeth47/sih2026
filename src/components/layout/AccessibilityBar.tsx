'use client';
import { useEffect, useState, useRef } from 'react';
import { useFontScale } from '@/hooks/useFontScale';
import { Shield, Globe, ChevronDown, Check } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English'   },
  { code: 'hi', label: 'Hindi',      native: 'हिन्दी'     },
  { code: 'bn', label: 'Bengali',    native: 'বাংলা'     },
  { code: 'te', label: 'Telugu',     native: 'తెలుగు'    },
  { code: 'mr', label: 'Marathi',    native: 'मराठी'     },
  { code: 'ta', label: 'Tamil',      native: 'தமிழ்'    },
  { code: 'gu', label: 'Gujarati',   native: 'ગુજરાતી'   },
  { code: 'kn', label: 'Kannada',    native: 'ಕನ್ನಡ'    },
  { code: 'pa', label: 'Punjabi',    native: 'ਪੰਜਾਬੀ'    },
];

export default function AccessibilityBar() {
  const { scale, setFontScale } = useFontScale();
  const [activeLang, setActiveLang] = useState<string>('en');
  const [dropOpen, setDropOpen]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Init Google Translate widget
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match?.[1] && match[1] !== 'en') setActiveLang(match[1]);

    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        const el = document.getElementById('google_translate_element');
        if (el && el.children.length === 0) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: LANGUAGES.map(l => l.code).join(','),
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              'google_translate_element'
            );
          } catch (e) {
            console.error('GT init failed:', e);
          }
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;

    if (!document.getElementById('google-translate-script')) {
      const s = document.createElement('script');
      s.id   = 'google-translate-script';
      s.src  = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    } else {
      initTranslate();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLanguageSwitch = (code: string) => {
    setActiveLang(code);
    setDropOpen(false);
    if (typeof document === 'undefined') return;
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${code}; path=/;`;
      window.location.reload();
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === activeLang) ?? LANGUAGES[0];

  return (
    <div
      role="toolbar"
      aria-label="Accessibility and language bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 38,
        padding: '0 0.75rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        gap: '0.5rem',
        flexWrap: 'nowrap',
        position: 'relative',
        zIndex: 400,
      }}
    >
      {/* ── Left: Branding ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, overflow: 'hidden' }}>
        <Shield size={14} color="#0f5ca8" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
          SAKSHYA AI (साक्ष्य) · NCB
        </span>
        <span style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'var(--bar-sep-display, none)' }}>|</span>
        <span style={{
          fontSize: '0.68rem', color: '#64748b',
          whiteSpace: 'nowrap',
          display: 'var(--bar-mha-display, none)',
        }}>
          Ministry of Home Affairs
        </span>
      </div>

      {/* ── Right: Language + Font ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>

        {/* Language dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropOpen(o => !o)}
            aria-expanded={dropOpen}
            aria-haspopup="listbox"
            aria-label="Select language"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '3px 8px 3px 6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: "'Noto Sans', sans-serif",
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f5ca8')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
          >
            <Globe size={13} color="#0f5ca8" style={{ flexShrink: 0 }} />
            {/* On mobile show native label only, on wider show "EN · English" style */}
            <span className="lang-native">{currentLang.native}</span>
            <ChevronDown
              size={12}
              color="#64748b"
              style={{
                transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
                flexShrink: 0,
              }}
            />
          </button>

          {/* Dropdown panel */}
          {dropOpen && (
            <div
              role="listbox"
              aria-label="Select language"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 200,
                zIndex: 9999,
                overflow: 'hidden',
                animation: 'fadeDown 0.12s ease',
              }}
            >
              <div style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  Select Language
                </span>
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={activeLang === lang.code}
                  type="button"
                  onClick={() => handleLanguageSwitch(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    border: 'none',
                    background: activeLang === lang.code ? '#eaf4fd' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Noto Sans', sans-serif",
                    gap: '0.5rem',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (activeLang !== lang.code)
                      (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    if (activeLang !== lang.code)
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      {lang.native}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lang.label}</div>
                  </div>
                  {activeLang === lang.code && (
                    <Check size={14} color="#0f5ca8" style={{ flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <span style={{ color: '#e2e8f0', fontSize: '1rem', userSelect: 'none' }}>|</span>

        {/* Text Size Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(['small', 'normal', 'large'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFontScale(s)}
              aria-pressed={scale === s}
              title={s === 'small' ? 'Decrease font size' : s === 'large' ? 'Increase font size' : 'Default font size'}
              style={{
                padding: '2px 5px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                background: scale === s ? '#0f5ca8' : '#ffffff',
                color: scale === s ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: i === 0 ? '0.62rem' : i === 2 ? '0.76rem' : '0.68rem',
                lineHeight: 1.2,
                fontFamily: "'Noto Sans', sans-serif",
                transition: 'all 0.12s',
              }}
            >
              {s === 'small' ? 'A−' : s === 'large' ? 'A+' : 'A'}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Google Translate widget */}
      <div
        id="google_translate_element"
        aria-hidden="true"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
