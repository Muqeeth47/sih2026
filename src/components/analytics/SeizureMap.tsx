'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/utils/supabaseClient';
import { getAllScanResults } from '@/utils/offlineQueue';
import { generateAssayPDF } from '@/utils/assayPdf';
import type { ScanResult } from '@/types/drug';
import Link from 'next/link';
import {
  ShieldCheck, MapPin, Calendar, CheckCircle2, XCircle,
  Zap, Globe, Download, FileText, SendHorizonal, ArrowRight,
} from 'lucide-react';

// Marker Icons for Leaflet
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const positiveIcon = createCustomIcon('#dc2626'); // Red for positive contraband
const negativeIcon = createCustomIcon('#16a34a'); // Green for negative/inconclusive
const reviewIcon   = createCustomIcon('#0f5ca8'); // Blue for under review

interface MapPinItem {
  id: string;
  caseId: string;
  lat: number;
  lng: number;
  substance: string;
  reagentType: string;
  officerBadge: string;
  timestamp: string;
  photoUrl?: string;
  photoDataUrl?: string;
  photoHash?: string;
  status: string;
  escalationStatus?: string;
  opencvVerdict?: string;
  opencvDeltaE?: number;
  opencvCielab?: { L: number; a: number; b: number };
  geminiVerdict?: string;
  geminiRejectReason?: string;
  geminiObservedColor?: string;
  geminiCourtSummary?: string;
  tamperDetected?: boolean;
}

const DEFAULT_REFERENCE_PINS: MapPinItem[] = [
  {
    id: 'ref_pin_01',
    caseId: 'NCB-DL-2026-0842',
    lat: 28.6139,
    lng: 77.2090,
    substance: 'Heroin (Diacetylmorphine)',
    reagentType: 'marquis',
    officerBadge: 'NCB-IO-4092',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    photoHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    status: 'seized',
    escalationStatus: 'zonal_review',
    opencvVerdict: 'positive',
    opencvDeltaE: 4.2,
    opencvCielab: { L: 14.2, a: 22.1, b: -31.4 },
    geminiVerdict: 'ACCEPTED',
    geminiObservedColor: 'Deep purple to black transition',
    geminiCourtSummary: 'Color reaction matches UNODC Marquis reagent profile for diacetylmorphine.',
    tamperDetected: false,
  },
  {
    id: 'ref_pin_02',
    caseId: 'NCB-MUM-2026-1194',
    lat: 18.9438,
    lng: 72.8354,
    substance: 'Cocaine Hydrochloride',
    reagentType: 'scott',
    officerBadge: 'NCB-IO-8812',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    photoHash: '9f8e7d6c5b4a392817263544536271829304152637485960718293a4b5c6d7e8',
    status: 'seized',
    escalationStatus: 'fsl_review',
    opencvVerdict: 'positive',
    opencvDeltaE: 5.8,
    opencvCielab: { L: 35.8, a: 14.2, b: -52.3 },
    geminiVerdict: 'ACCEPTED',
    geminiObservedColor: 'Cobalt blue precipitate formation in Scott reagent',
    geminiCourtSummary: 'Conforms to UNODC ST/NAR/13 Scott reagent protocol for Cocaine HCl.',
    tamperDetected: false,
  },
  {
    id: 'ref_pin_03',
    caseId: 'NCB-ASR-2026-0312',
    lat: 31.6340,
    lng: 74.8723,
    substance: 'Methamphetamine',
    reagentType: 'mecke',
    officerBadge: 'NCB-IO-5521',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    photoHash: 'c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
    status: 'seized',
    escalationStatus: 'court_review',
    opencvVerdict: 'positive',
    opencvDeltaE: 6.4,
    opencvCielab: { L: 26.4, a: -12.1, b: -8.4 },
    geminiVerdict: 'ACCEPTED',
    geminiObservedColor: 'Blue-green turning dark green',
    geminiCourtSummary: 'Positive reaction for methamphetamine group stimulants.',
    tamperDetected: false,
  },
  {
    id: 'ref_pin_04',
    caseId: 'NCB-CHN-2026-0728',
    lat: 13.0827,
    lng: 80.2707,
    substance: 'Cannabis Resin (Charas)',
    reagentType: 'duquenois_levine',
    officerBadge: 'NCB-IO-3319',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    photoHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    status: 'seized',
    escalationStatus: 'resolved',
    opencvVerdict: 'positive',
    opencvDeltaE: 3.1,
    opencvCielab: { L: 22.1, a: 38.7, b: -31.2 },
    geminiVerdict: 'ACCEPTED',
    geminiObservedColor: 'Violet layer separation in lower chloroform phase',
    geminiCourtSummary: 'Duquenois-Levine test confirms active cannabinoid compounds.',
    tamperDetected: false,
  },
  {
    id: 'ref_pin_05',
    caseId: 'NCB-KOL-2026-0441',
    lat: 22.5726,
    lng: 88.3639,
    substance: 'Negative / Non-Narcotic',
    reagentType: 'marquis',
    officerBadge: 'NCB-IO-1024',
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    photoHash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    status: 'cleared',
    escalationStatus: 'resolved',
    opencvVerdict: 'negative',
    opencvDeltaE: 24.5,
    opencvCielab: { L: 88.2, a: -1.2, b: 3.4 },
    geminiVerdict: 'ACCEPTED',
    geminiObservedColor: 'No reaction / clear reagent unchanged',
    geminiCourtSummary: 'Spectrophotometric baseline test confirms sample is non-contraband carrier material.',
    tamperDetected: false,
  },
];

export default function SeizureMap() {
  const [pins, setPins]       = useState<MapPinItem[]>(DEFAULT_REFERENCE_PINS);
  const [loading, setLoading] = useState(false);

  const loadAllPins = useCallback(async () => {
    // 1. Start with default reference pins so map is never empty
    const pinMap = new Map<string, MapPinItem>();
    DEFAULT_REFERENCE_PINS.forEach(p => pinMap.set(p.caseId, p));

    // 2. Fetch offline local scans
    let localScans: ScanResult[] = [];
    try {
      localScans = (await getAllScanResults()) as ScanResult[];
    } catch { /* ignore */ }

    // Add local scans with valid GPS
    localScans.forEach(scan => {
      if (scan.gps?.latitude && scan.gps?.longitude) {
        const item: MapPinItem = {
          id: scan.id,
          caseId: scan.caseId || scan.id,
          lat: Number(scan.gps.latitude),
          lng: Number(scan.gps.longitude),
          substance: scan.matchedSubstance,
          reagentType: scan.reagentType,
          officerBadge: scan.officerBadge,
          timestamp: scan.timestamp,
          photoUrl: scan.photoUrl,
          photoDataUrl: scan.photoDataUrl,
          photoHash: scan.photoHash,
          status: scan.testStatus || 'local_intake',
          opencvVerdict: scan.testStatus,
          opencvDeltaE: scan.deltaE,
          opencvCielab: scan.capturedColor ? {
            L: scan.capturedColor.L,
            a: scan.capturedColor.a,
            b: scan.capturedColor.bStar,
          } : undefined,
          geminiVerdict: scan.aiAnalysis?.verdict,
          geminiRejectReason: scan.aiAnalysis?.rejectReason,
          geminiObservedColor: scan.aiAnalysis?.observedColor,
          geminiCourtSummary: scan.aiAnalysis?.courtSummary,
          tamperDetected: scan.aiAnalysis?.tamperDetected,
        };
        pinMap.set(item.caseId, item);
      }
    });

    // 3. Fetch Supabase seizures with scan assays
    try {
      const { data, error } = await supabase
        .from('seizures')
        .select(`
          id, case_id, gps_latitude, gps_longitude, substance, officer_badge,
          created_at, photo_url, photo_hash, status, escalation_status,
          scan_assays(reagent_type, opencv_delta_e, opencv_cielab, opencv_verdict, opencv_confidence, gemini_verdict, gemini_reject_reason, gemini_observed_color, gemini_court_summary, tamper_detected)
        `)
        .not('gps_latitude', 'is', null)
        .order('created_at', { ascending: false });

      if (!error && data) {
        data.forEach((r: any) => {
          const assay = Array.isArray(r.scan_assays) && r.scan_assays.length > 0 ? r.scan_assays[0] : null;
          const existing = pinMap.get(r.case_id);

          const item: MapPinItem = {
            id: r.id,
            caseId: r.case_id,
            lat: Number(r.gps_latitude),
            lng: Number(r.gps_longitude),
            substance: r.substance || 'Unknown Substance',
            reagentType: assay?.reagent_type || 'marquis',
            officerBadge: r.officer_badge || 'NCB-FIELD-IO',
            timestamp: r.created_at,
            photoUrl: r.photo_url || existing?.photoUrl,
            photoDataUrl: existing?.photoDataUrl,
            photoHash: r.photo_hash || existing?.photoHash,
            status: r.status || 'intake',
            escalationStatus: r.escalation_status,
            opencvVerdict: assay?.opencv_verdict,
            opencvDeltaE: assay?.opencv_delta_e,
            opencvCielab: assay?.opencv_cielab,
            geminiVerdict: assay?.gemini_verdict,
            geminiRejectReason: assay?.gemini_reject_reason,
            geminiObservedColor: assay?.gemini_observed_color,
            geminiCourtSummary: assay?.gemini_court_summary,
            tamperDetected: assay?.tamper_detected,
          };
          pinMap.set(r.case_id, item);
        });
      }
    } catch (err) {
      console.warn('SeizureMap: Supabase fetch warning', err);
    }

    setPins(Array.from(pinMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllPins();
  }, [loadAllPins]);

  return (
    <div style={{ height: '480px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,250,252,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
          Loading real-time forensic interdiction coordinates…
        </div>
      )}

      {/* Map telemetry overlay bar */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
          Positive ({pins.filter(p => p.opencvVerdict === 'positive' || p.substance !== 'negative').length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
          Negative ({pins.filter(p => p.opencvVerdict === 'negative').length})
        </div>
        <button onClick={loadAllPins} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.15rem 0.45rem', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}>
          ↺ Refresh
        </button>
      </div>

      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins.map(pin => {
          const isPositive = pin.opencvVerdict === 'positive' || pin.substance.toLowerCase() !== 'negative';
          const icon = isPositive ? positiveIcon : negativeIcon;
          const photo = pin.photoDataUrl || pin.photoUrl;

          return (
            <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={icon}>
              <Popup maxWidth={300} minWidth={260}>
                <div style={{ fontFamily: "'Noto Sans', sans-serif", padding: '0.2rem' }}>
                  
                  {/* Photo Banner */}
                  {photo ? (
                    <div style={{ width: '100%', height: 120, borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <img
                        src={photo}
                        alt="Evidence"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: 70, background: '#f8fafc', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                      Evidence Photo Sealed
                    </div>
                  )}

                  {/* Header Title & Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{pin.caseId}</span>
                    <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', background: isPositive ? '#fee2e2' : '#f0fdf4', color: isPositive ? '#dc2626' : '#16a34a', border: `1px solid ${isPositive ? '#fecaca' : '#bbf7d0'}` }}>
                      {pin.substance.toUpperCase()}
                    </span>
                  </div>

                  {/* Forensic Checks Summary */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.45rem', marginBottom: '0.5rem', fontSize: '0.68rem', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#0f5ca8', fontWeight: 700 }}>Color ΔE:</span>
                      <strong style={{ color: '#0f172a' }}>{pin.opencvDeltaE !== undefined ? pin.opencvDeltaE.toFixed(2) : '—'} ({pin.opencvVerdict?.toUpperCase() || 'RECORDED'})</strong>
                    </div>
                    {pin.geminiVerdict && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ color: '#7c3aed', fontWeight: 700 }}>AI Verdict:</span>
                        <strong style={{ color: pin.geminiVerdict === 'ACCEPTED' ? '#16a34a' : '#dc2626' }}>{pin.geminiVerdict}</strong>
                      </div>
                    )}
                    {pin.escalationStatus && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#b45309', fontWeight: 700 }}>Routing:</span>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{pin.escalationStatus.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Officer & GPS Meta */}
                  <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.6rem' }}>
                    <div>Officer: <strong style={{ color: '#1e293b' }}>{pin.officerBadge}</strong></div>
                    <div>Date: {new Date(pin.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{pin.lat.toFixed(4)}°N, {pin.lng.toFixed(4)}°E</div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => {
                        const scanObj: ScanResult = {
                          id: pin.id,
                          timestamp: pin.timestamp,
                          officerBadge: pin.officerBadge,
                          reagentType: (pin.reagentType as any) || 'marquis',
                          capturedColor: {
                            r: 100, g: 100, b: 100,
                            L: pin.opencvCielab?.L ?? 25,
                            a: pin.opencvCielab?.a ?? 20,
                            bStar: pin.opencvCielab?.b ?? -20,
                          },
                          deltaE: pin.opencvDeltaE ?? 4.2,
                          matchedSubstance: (pin.substance as any) || 'unknown',
                          matchedReagentRef: null,
                          confidence: 'high',
                          testStatus: (pin.opencvVerdict as any) || 'positive',
                          blurAnalysis: { laplacianVariance: 250, isSharp: true, warningThreshold: 80, message: 'Sharp' },
                          glareAnalysis: { hasGlare: false, glarePercentage: 1.0, saturationWarning: false },
                          photoHash: pin.photoHash || 'SHA-PENDING',
                          photoDataUrl: pin.photoDataUrl,
                          photoUrl: pin.photoUrl,
                          gps: { latitude: pin.lat, longitude: pin.lng, accuracy: 5, timestamp: pin.timestamp, source: 'device_gps' },
                          aiAnalysis: pin.geminiVerdict ? {
                            verdict: pin.geminiVerdict as any,
                            rejectReason: pin.geminiRejectReason,
                            observedColor: pin.geminiObservedColor,
                            kitType: 'Field Chemical Test Kit',
                            substanceClass: pin.substance,
                            substance: pin.substance,
                            confidence: 0.9,
                            tamperDetected: pin.tamperDetected ?? false,
                            courtSummary: pin.geminiCourtSummary || '',
                          } : null,
                          syncPending: false,
                          caseId: pin.caseId,
                        };
                        generateAssayPDF(scanObj);
                      }}
                      style={{ flex: 1, padding: '0.35rem 0.5rem', background: '#ffffff', color: '#0f5ca8', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                    >
                      <Download size={11} /> PDF Report
                    </button>

                    <Link
                      href={`/panchnama?scanId=${pin.id}&substance=${encodeURIComponent(pin.substance)}`}
                      style={{ flex: 1, padding: '0.35rem 0.5rem', background: '#0f172a', color: '#ffffff', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                    >
                      <FileText size={11} /> Panchnama
                    </Link>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}

        {!loading && pins.length === 0 && (
          <Marker position={[22.5937, 78.9629]} icon={positiveIcon}>
            <Popup>
              <div style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '0.5rem' }}>
                No interdiction records yet.<br />Submit a field scan to add pins.
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

