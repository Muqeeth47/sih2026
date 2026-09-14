'use client';
import { useEffect, useState } from 'react';
import { useFontScale } from '@/hooks/useFontScale';
import { Shield, Globe, Languages } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function AccessibilityBar() {
  const { scale, setFontScale } = useFontScale();
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    // Detect existing translation cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
      if (match && match[1] === 'hi') {
        setActiveLang('hi');
      }
    }

    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        const el = document.getElementById('google_translate_element');
        if (el && el.children.length === 0) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'hi,en,bn,te,mr,ta,gu,kn,ml,pa',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              'google_translate_element'
            );
          } catch (e) {
            console.error('Google Translate init failed:', e);
          }
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;

    // Dynamically ensure the script is loaded and executed after React hydration
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      initTranslate();
    }
  }, []);

  const handleLanguageSwitch = (targetLang: 'en' | 'hi') => {
    setActiveLang(targetLang);

    if (typeof document !== 'undefined') {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
      } else {
        // Fallback cookie injection for full-page translate
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=/en/${targetLang}; path=/;`;
        window.location.reload();
      }
    }
  };

  return (
    <div
      className="flex items-center justify-between min-h-[38px] py-1 px-3 sm:px-5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 gap-2 flex-wrap sm:flex-nowrap"
      role="toolbar"
      aria-label="Accessibility and language bar"
    >
      {/* Left: Project Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <Shield size={14} color="#0f5ca8" />
        <span style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', fontSize: '0.74rem' }}>
          DRUG-SEAL AI · NCB
        </span>
        <span className="hidden sm:inline" style={{ color: '#cbd5e1' }}>|</span>
        <span className="hidden sm:inline text-[11px] text-slate-500">
          Ministry of Home Affairs
        </span>
      </div>

      {/* Right: Translate + Font Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        {/* Quick Language Toggle (English / हिन्दी) */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('en')}
            style={{
              padding: '2px 7px',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              background: activeLang === 'en' ? '#0f5ca8' : 'transparent',
              color: activeLang === 'en' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('hi')}
            style={{
              padding: '2px 7px',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              background: activeLang === 'hi' ? '#0f5ca8' : 'transparent',
              color: activeLang === 'hi' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            हिन्दी
          </button>
        </div>

        {/* Google Translate Dropdown Container */}
        <div
          id="google_translate_element"
          style={{ display: 'inline-flex', alignItems: 'center' }}
          title="Translate page into regional Indian languages"
        />

        <span style={{ color: '#cbd5e1' }}>|</span>

        {/* Text Size Scaler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>Text:</span>
          <button
            onClick={() => setFontScale('small')}
            aria-pressed={scale === 'small'}
            title="Decrease font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'small' ? '#0f5ca8' : '#ffffff',
              color: scale === 'small' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.68rem',
              lineHeight: 1.2,
            }}
          >
            A−
          </button>
          <button
            onClick={() => setFontScale('normal')}
            aria-pressed={scale === 'normal'}
            title="Default font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'normal' ? '#0f5ca8' : '#ffffff',
              color: scale === 'normal' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.72rem',
              lineHeight: 1.2,
            }}
          >
            A
          </button>
          <button
            onClick={() => setFontScale('large')}
            aria-pressed={scale === 'large'}
            title="Increase font size"
            style={{
              padding: '0.12rem 0.4rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: scale === 'large' ? '#0f5ca8' : '#ffffff',
              color: scale === 'large' ? '#ffffff' : '#1e293b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.76rem',
              lineHeight: 1.2,
            }}
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
