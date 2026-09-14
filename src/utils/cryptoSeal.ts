// src/utils/cryptoSeal.ts
// WebCrypto SHA-256 tamper-proof photo hash generator
// Runs 100% client-side — no network required

/**
 * Compute SHA-256 hash of an image data URL (or any string).
 * Returns the hex digest string.
 */
export async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 of a Blob (raw image file).
 */
export async function sha256HashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a hash matches a data URL.
 * Returns true if the hash is valid (tamper-proof seal intact).
 */
export async function verifySeal(dataUrl: string, expectedHash: string): Promise<boolean> {
  const actualHash = await sha256Hash(dataUrl);
  return actualHash === expectedHash;
}

/**
 * Format a hash for display: show first 8 and last 8 chars separated by ...
 */
export function formatHashDisplay(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

/**
 * Generate a unique case ID from timestamp + random bytes
 */
export function generateCaseId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NCB-${timestamp}-${random}`;
}
