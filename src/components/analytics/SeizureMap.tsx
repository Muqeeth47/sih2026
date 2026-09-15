'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/utils/supabaseClient';

// Fix default Leaflet marker icon in React/Next.js
const redIcon = new L.Icon({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

interface PinData {
  id: string;
  caseId: string;
  lat: number;
  lng: number;
  substance: string;
  officerBadge: string;
  createdAt: string;
  photoUrl?: string;
  status: string;
}

export default function SeizureMap() {
  const [pins, setPins]       = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const { data, error } = await supabase
          .from('seizures')
          .select('id, case_id, gps_latitude, gps_longitude, substance, officer_badge, created_at, photo_url, status')
          .not('gps_latitude', 'is', null)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPins(data.map((r: any) => ({
            id: r.id,
            caseId: r.case_id,
            lat: r.gps_latitude,
            lng: r.gps_longitude,
            substance: r.substance,
            officerBadge: r.officer_badge,
            createdAt: r.created_at,
            photoUrl: r.photo_url,
            status: r.status,
          })));
        }
      } catch (err) {
        console.warn('SeizureMap: Could not fetch pins from Supabase', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPins();
  }, []);

  return (
    <div style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--ncb-border)', position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,250,252,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
          Loading interdiction locations…
        </div>
      )}
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

        {pins.map(pin => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={redIcon}>
            <Popup maxWidth={260}>
              <div style={{ fontFamily: "'Noto Sans', sans-serif", padding: '0.25rem' }}>
                {/* Photo */}
                {pin.photoUrl && (
                  <img
                    src={pin.photoUrl}
                    alt="Evidence photo"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem', display: 'block' }}
                  />
                )}
                {!pin.photoUrl && (
                  <div style={{ width: '100%', height: 80, background: '#f1f5f9', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    No photo uploaded
                  </div>
                )}

                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  {pin.caseId}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.3rem' }}>
                  {pin.substance}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                  <div>Officer: <strong>{pin.officerBadge}</strong></div>
                  <div>Status: <strong style={{ textTransform: 'capitalize' }}>{pin.status?.replace(/_/g, ' ')}</strong></div>
                  <div>Date: {new Date(pin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                    {pin.lat.toFixed(4)}°N, {pin.lng.toFixed(4)}°E
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {!loading && pins.length === 0 && (
          /* Empty state centre marker */
          <Marker position={[22.5937, 78.9629]} icon={redIcon}>
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
