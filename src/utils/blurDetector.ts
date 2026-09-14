// src/utils/blurDetector.ts
// Laplacian Variance blur detection — reject blurry reagent test photos

/**
 * Computes the Laplacian variance of a grayscale image region.
 * A low variance (<90) indicates the image is too blurry for forensic analysis.
 * The Laplacian kernel detects edges; blur reduces edge sharpness → low variance.
 */
export function computeLaplacianVariance(imageData: ImageData): number {
  const { data, width, height } = imageData;

  // Convert to grayscale luminance array
  const gray: number[] = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // BT.601 luminance
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Apply Laplacian kernel: [0,1,0; 1,-4,1; 0,1,0]
  const laplacian: number[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const value =
        gray[idx - width] +
        gray[idx + width] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];
      laplacian.push(value);
    }
  }

  // Compute variance of Laplacian
  if (laplacian.length === 0) return 0;
  const mean = laplacian.reduce((s, v) => s + v, 0) / laplacian.length;
  const variance = laplacian.reduce((s, v) => s + (v - mean) ** 2, 0) / laplacian.length;

  return variance;
}

export interface BlurResult {
  laplacianVariance: number;
  isSharp: boolean;
  warningThreshold: number;
  message: string;
  /** 0-100 quality score */
  qualityScore: number;
}

const WARNING_THRESHOLD = 90;
const SHARP_THRESHOLD = 200;

export function analyzeBlur(imageData: ImageData): BlurResult {
  const variance = computeLaplacianVariance(imageData);
  const isSharp = variance >= WARNING_THRESHOLD;
  const qualityScore = Math.min(100, Math.round((variance / SHARP_THRESHOLD) * 100));

  let message: string;
  if (variance < 30) {
    message = 'Image too blurry — retake required';
  } else if (variance < WARNING_THRESHOLD) {
    message = 'Moderate blur detected — hold steady';
  } else if (variance < SHARP_THRESHOLD) {
    message = 'Acceptable sharpness';
  } else {
    message = 'Sharp — excellent quality';
  }

  return {
    laplacianVariance: Math.round(variance * 10) / 10,
    isSharp,
    warningThreshold: WARNING_THRESHOLD,
    message,
    qualityScore,
  };
}
