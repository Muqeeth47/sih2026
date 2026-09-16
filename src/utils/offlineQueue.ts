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

/** Add a record to the offline queue */
export async function enqueueOffline(entry: OfflineQueueEntry): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.add(entry);
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

/** Count pending sync items */
export async function getPendingCount(): Promise<number> {
  const queue = await getPendingQueue();
  return queue.length;
}

/** Register auto-sync listener — triggers sync when network comes back online */
export function registerAutoSync(syncFn: () => Promise<void>): () => void {
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
    return () => window.removeEventListener('online', handler);
  }
  return () => {};
}
