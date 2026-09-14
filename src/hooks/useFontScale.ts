'use client';
// src/hooks/useFontScale.ts
// GIGW-compliant font size scaler with localStorage persistence

import { useState, useEffect } from 'react';

type FontScaleLevel = 'small' | 'normal' | 'large';

const FONT_SCALES: Record<FontScaleLevel, number> = {
  small: 14,
  normal: 16,
  large: 18,
};

const STORAGE_KEY = 'ncb_font_scale';

export function useFontScale() {
  const [scale, setScale] = useState<FontScaleLevel>('normal');

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FontScaleLevel | null;
      if (stored && stored in FONT_SCALES) {
        setScale(stored);
        document.documentElement.style.fontSize = `${FONT_SCALES[stored]}px`;
      }
    } catch {
      // ignore
    }
  }, []);

  const setFontScale = (level: FontScaleLevel) => {
    setScale(level);
    document.documentElement.style.fontSize = `${FONT_SCALES[level]}px`;
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch {
      // ignore
    }
  };

  return { scale, setFontScale, fontSizePx: FONT_SCALES[scale] };
}
