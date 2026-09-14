// src/utils/colorMath.ts
// CIELAB ΔE₂₀₀₀ colorimetry engine — 100% offline, <5ms execution
// Used for comparing reagent test color against UNODC reference standards

import type { ColorReading } from '@/types/drug';

/** Convert sRGB [0-255] to linear RGB [0-1] */
function sRGBToLinear(c: number): number {
  const normalized = c / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/** Convert linear RGB to CIE XYZ (D65 illuminant) */
function linearRGBToXYZ(r: number, g: number, b: number): [number, number, number] {
  const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  return [X, Y, Z];
}

/** Convert CIE XYZ to CIELAB L*a*b* */
function xyzToLab(X: number, Y: number, Z: number): [number, number, number] {
  // D65 reference white
  const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
  const epsilon = 0.008856;
  const kappa = 903.3;

  const fx = X / Xn;
  const fy = Y / Yn;
  const fz = Z / Zn;

  const f = (t: number) => t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116;

  const fxv = f(fx), fyv = f(fy), fzv = f(fz);

  const L = 116 * fyv - 16;
  const a = 500 * (fxv - fyv);
  const bStar = 200 * (fyv - fzv);

  return [L, a, bStar];
}

/** Full pipeline: sRGB [0-255] → CIELAB L*a*b* */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = sRGBToLinear(r);
  const lg = sRGBToLinear(g);
  const lb = sRGBToLinear(b);
  const [X, Y, Z] = linearRGBToXYZ(lr, lg, lb);
  return xyzToLab(X, Y, Z);
}

/**
 * CIEDE2000 ΔE calculation between two CIELAB colors.
 * Reference: Luo, Cui & Rigg (2001), Color Research & Application 26(5)
 */
export function deltaE2000(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  const deg = (r: number) => (r * 180) / Math.PI;
  const rad = (d: number) => (d * Math.PI) / 180;

  // Step 1: Calculate C'ab and h'ab
  const C1ab = Math.sqrt(a1 ** 2 + b1 ** 2);
  const C2ab = Math.sqrt(a2 ** 2 + b2 ** 2);
  const CabBar = (C1ab + C2ab) / 2;
  const CabBar7 = CabBar ** 7;
  const G = 0.5 * (1 - Math.sqrt(CabBar7 / (CabBar7 + 25 ** 7)));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);
  const C1p = Math.sqrt(a1p ** 2 + b1 ** 2);
  const C2p = Math.sqrt(a2p ** 2 + b2 ** 2);

  let h1p = deg(Math.atan2(b1, a1p));
  if (h1p < 0) h1p += 360;
  let h2p = deg(Math.atan2(b2, a2p));
  if (h2p < 0) h2p += 360;

  // Step 2: ΔL', ΔC', ΔH'
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

  // Step 3: CIEDE2000 weighting functions
  const Lbar = (L1 + L2) / 2;
  const Cbar = (C1p + C2p) / 2;

  let hbar: number;
  if (C1p * C2p === 0) {
    hbar = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hbar = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hbar = (h1p + h2p + 360) / 2;
  } else {
    hbar = (h1p + h2p - 360) / 2;
  }

  const T = 1
    - 0.17 * Math.cos(rad(hbar - 30))
    + 0.24 * Math.cos(rad(2 * hbar))
    + 0.32 * Math.cos(rad(3 * hbar + 6))
    - 0.20 * Math.cos(rad(4 * hbar - 63));

  const SL = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const SC = 1 + 0.045 * Cbar;
  const SH = 1 + 0.015 * Cbar * T;

  const Cbar7 = Cbar ** 7;
  const RC = 2 * Math.sqrt(Cbar7 / (Cbar7 + 25 ** 7));
  const dTheta = 30 * Math.exp(-Math.pow((hbar - 275) / 25, 2));
  const RT = -Math.sin(rad(2 * dTheta)) * RC;

  const kL = 1, kC = 1, kH = 1;

  return Math.sqrt(
    (dLp / (kL * SL)) ** 2 +
    (dCp / (kC * SC)) ** 2 +
    (dHp / (kH * SH)) ** 2 +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );
}

/** Build a ColorReading from canvas pixel data at a region */
export function extractColorReading(
  imageData: ImageData,
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number
): ColorReading {
  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (let y = regionY; y < regionY + regionH; y++) {
    for (let x = regionX; x < regionX + regionW; x++) {
      const idx = (y * imageData.width + x) * 4;
      totalR += imageData.data[idx];
      totalG += imageData.data[idx + 1];
      totalB += imageData.data[idx + 2];
      count++;
    }
  }

  const r = Math.round(totalR / count);
  const g = Math.round(totalG / count);
  const b = Math.round(totalB / count);
  const [L, a, bStar] = rgbToLab(r, g, b);

  return { r, g, b, L, a, bStar };
}

/** Convert ΔE to human-readable confidence */
export function deltaEToConfidence(deltaE: number, threshold: number): 'high' | 'medium' | 'low' | 'inconclusive' {
  if (deltaE <= threshold * 0.5) return 'high';
  if (deltaE <= threshold * 0.75) return 'medium';
  if (deltaE <= threshold) return 'low';
  return 'inconclusive';
}
