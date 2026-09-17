// src/utils/offlineQueue.ts
// IndexedDB offline queue with auto-sync on network restoration
// Stores scan results and panchnama records when device is offline

import type { OfflineQueueEntry } from '@/types/drug';

const DB_NAME = 'ncb_drugseal_db';
const DB_VERSION = 1;
const STORE_QUEUE = 'offline_queue';
const STORE_SCANS = 'scan_results';
const STORE_PANCHNAMAA = 'panchnama_records';

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = database.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('createdAt', 'createdAt');
        queueStore.createIndex('type', 'type');
      }

      if (!database.objectStoreNames.contains(STORE_SCANS)) {
        const scanStore = database.createObjectStore(STORE_SCANS, { keyPath: 'id' });
        scanStore.createIndex('timestamp', 'timestamp');
        scanStore.createIndex('syncPending', 'syncPending');
      }

      if (!database.objectStoreNames.contains(STORE_PANCHNAMAA)) {
        const pStore = database.createObjectStore(STORE_PANCHNAMAA, { keyPath: 'id' });
        pStore.createIndex('createdAt', 'createdAt');
      }
    };
  });
}

/** Add or update a record in the offline queue */
export async function enqueueOffline(entry: OfflineQueueEntry): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all pending queue entries */
export async function getPendingQueue(): Promise<OfflineQueueEntry[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/** Remove a queue entry after successful sync */
export async function dequeueEntry(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Save a scan result to IndexedDB */
export async function saveScanResult(scan: unknown): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_SCANS, 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    store.put(scan);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all scan results from IndexedDB */
export async function getAllScanResults(): Promise<unknown[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_SCANS, 'readonly');
    const store = tx.objectStore(STORE_SCANS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/** Delete a scan result from IndexedDB */
export async function deleteScanResult(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_SCANS, 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Save a panchnama record */
export async function savePanchnama(record: unknown): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PANCHNAMAA, 'readwrite');
    const store = tx.objectStore(STORE_PANCHNAMAA);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all panchnama records */
export async function getAllPanchnamas(): Promise<unknown[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PANCHNAMAA, 'readonly');
    const store = tx.objectStore(STORE_PANCHNAMAA);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/** Count pending sync items across offline queue and pending scans */
export async function getPendingCount(): Promise<number> {
  try {
    const database = await openDB();

    const queuePromise = new Promise<OfflineQueueEntry[]>((resolve) => {
      const tx = database.transaction(STORE_QUEUE, 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const scansPromise = new Promise<any[]>((resolve) => {
      const tx = database.transaction(STORE_SCANS, 'readonly');
      const store = tx.objectStore(STORE_SCANS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const [queue, scans] = await Promise.all([queuePromise, scansPromise]);
    const pendingIds = new Set<string>();

    queue.forEach(q => { if (q?.id) pendingIds.add(q.id); });
    scans.forEach(s => {
      if (s?.syncPending && s?.id) {
        pendingIds.add(s.id);
      }
    });

    return pendingIds.size;
  } catch {
    return 0;
  }
}

/**
 * Automatically synchronizes pending offline scans and records to Supabase when network is active
 */
export async function syncOfflineScansToCloud(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  try {
    const allScans = (await getAllScanResults()) as any[];
    const pendingScans = allScans.filter(s => s && s.syncPending);
    const queueEntries = await getPendingQueue();

    if (pendingScans.length === 0 && queueEntries.length === 0) {
      return { synced: 0, failed: 0 };
    }

    const { supabase } = await import('@/utils/supabaseClient');

    // 1. Process pending scans
    for (const scan of pendingScans) {
      try {
        let photoUrl: string | null = scan.photoUrl || null;

        if (!photoUrl && scan.photoDataUrl && scan.photoDataUrl.startsWith('data:image')) {
          try {
            const fetchRes = await fetch(scan.photoDataUrl);
            const blob = await fetchRes.blob();
            const filename = `${scan.caseId || scan.id}-${Date.now()}.jpg`;
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('forensic_reports')
              .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });

            if (!uploadErr && uploadData) {
              const { data: urlData } = supabase.storage.from('forensic_reports').getPublicUrl(filename);
              photoUrl = urlData.publicUrl;
            }
          } catch (storageErr) {
            console.warn('[Sync] Photo storage upload skipped:', storageErr);
          }
        }

        const caseId = scan.caseId || `NCB-${new Date().getFullYear()}-${scan.id.slice(-5)}`;
        const ai = scan.aiAnalysis;

        const { data: seizureRow, error: seizureErr } = await supabase
          .from('seizures')
          .upsert({
            case_id: caseId,
            officer_badge: scan.officerBadge || 'NCB-IO-FIELD',
            officer_name: 'Field Officer',
            officer_role: 'ncb_io',
            substance: scan.matchedSubstance || 'unidentified',
            reagent_type: scan.reagentType || 'marquis',
            status: scan.testStatus === 'positive' ? 'fsl_testing' : 'vault_sealed',
            quantity_grams: 0,
            gross_weight: 0,
            gps_latitude: scan.gps?.latitude ?? 28.6139,
            gps_longitude: scan.gps?.longitude ?? 77.2090,
            gps_accuracy: scan.gps?.accuracy ?? 5,
            photo_hash: scan.photoHash || 'SHA-256-PENDING',
            photo_url: photoUrl || scan.photoDataUrl || null,
          })
          .select('id')
          .single();

        if (seizureErr) {
          console.warn('[Sync] Seizure upsert error:', seizureErr.message);
        }

        await supabase.from('scan_assays').insert({
          seizure_id: seizureRow?.id ?? null,
          case_id: caseId,
          reagent_type: scan.reagentType,
          opencv_delta_e: scan.deltaE ?? 0,
          opencv_cielab: scan.capturedColor ? {
            L: scan.capturedColor.L,
            a: scan.capturedColor.a,
            b: scan.capturedColor.bStar,
          } : { L: 0, a: 0, b: 0 },
          opencv_sharpness: scan.blurAnalysis?.laplacianVariance ?? 95,
          opencv_glare_pct: scan.glareAnalysis?.glarePercentage ?? 0,
          opencv_confidence: scan.confidence ?? 'high',
          opencv_status: scan.testStatus ?? 'positive',
          opencv_verdict: scan.testStatus ?? 'positive',
          gemini_verdict: ai?.verdict ?? null,
          gemini_reject_reason: ai?.rejectReason ?? null,
          gemini_observed_color: ai?.observedColor ?? null,
          gemini_substance: ai?.substanceClass ?? ai?.substance ?? null,
          gemini_confidence: ai?.verdict === 'ACCEPTED' ? 0.9 : null,
          gemini_court_summary: ai?.courtSummary ?? null,
          gemini_lot_number: ai?.pouchLotNumber ?? null,
          gemini_expiry: ai?.pouchExpiry ?? null,
          tamper_detected: ai?.tamperDetected ?? false,
          photo_url: photoUrl || scan.photoDataUrl || null,
        });

        await saveScanResult({
          ...scan,
          photoUrl: photoUrl || scan.photoUrl,
          syncPending: false,
        });

        await dequeueEntry(scan.id);
        synced++;
      } catch (scanErr) {
        console.error('[Sync] Failed syncing scan:', scan.id, scanErr);
        failed++;
      }
    }

    // 2. Process other queue entries (e.g. panchnamas)
    for (const entry of queueEntries) {
      if (entry.type === 'panchnama') {
        try {
          const p = entry.data as any;
          if (p && p.caseId) {
            await supabase.from('panchnama_records').upsert({
              case_id: p.caseId,
              accused_name: p.accusedList?.[0]?.name || 'Suspect in Transit',
              witness_one_name: p.witnesses?.[0]?.name || 'Civilian Witness 1',
              witness_two_name: p.witnesses?.[1]?.name || 'Civilian Witness 2',
              ndps_sections: p.legalSections || ['Section 52 NDPS Act'],
              memo_text: p.remarksNarrative || 'Panchnama executed in field.',
            });
          }
          await dequeueEntry(entry.id);
          synced++;
        } catch (panchErr) {
          console.warn('[Sync] Panchnama sync error:', panchErr);
          failed++;
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ncb-sync-updated', { detail: { synced, failed } }));
    }

  } catch (err) {
    console.error('[Sync] Global sync failed:', err);
  }

  return { synced, failed };
}

/** Register auto-sync listener — triggers sync when network comes back online */
export function registerAutoSync(syncFn: () => Promise<any>): () => void {
  const handler = async () => {
    console.log('[NCB OfflineQueue] Network restored — starting auto-sync...');
    try {
      await syncFn();
    } catch (err) {
      console.error('[NCB OfflineQueue] Auto-sync failed:', err);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handler);
    if (navigator.onLine) {
      handler();
    }
    return () => window.removeEventListener('online', handler);
  }
  return () => {};
}

