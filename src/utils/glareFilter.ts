// src/utils/glareFilter.ts
// Specular reflection and glare detection for reagent test photos

export interface GlareResult {
  hasGlare: boolean;
  glarePercentage: number;
  saturationWarning: boolean;
  message: string;
}

/** 
 * Detects specular glare by identifying pixels with near-maximum brightness
 * (all RGB channels > 220 simultaneously indicates white specular highlights)
 * and over-saturation (which masks true reagent color).
 */
export function analyzeGlare(imageData: ImageData): GlareResult {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  let glarePixels = 0;
  let oversatPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    // Specular glare: all channels very bright
    if (r > 220 && g > 220 && b > 220) {
      glarePixels++;
    }

    // Over-saturation: at least one channel maxed while others are low
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;
    if (saturation > 0.95 && maxC > 200) {
      oversatPixels++;
    }
  }

  const glarePercentage = (glarePixels / totalPixels) * 100;
  const saturationWarning = (oversatPixels / totalPixels) * 100 > 5;
  const hasGlare = glarePercentage > 8; // >8% glare pixels = problem

  let message: string;
  if (glarePercentage > 25) {
    message = 'Severe glare — shield from direct light and retake';
  } else if (glarePercentage > 8) {
    message = 'Glare detected — angle away from light source';
  } else if (saturationWarning) {
    message = 'Color over-saturation — reduce exposure';
  } else {
    message = 'No glare detected';
  }

  return {
    hasGlare,
    glarePercentage: Math.round(glarePercentage * 10) / 10,
    saturationWarning,
    message,
  };
}
