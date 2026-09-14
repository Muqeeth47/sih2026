'use client';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MOCK_MAP_SEIZURES } from '@/data/mockData';

// Fix default leaflet marker icon path in React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function SeizureMap() {
  return (
    <div style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--ncb-border)' }}>
      <MapContainer
        center={[22.5937, 78.9629]} // Center of India
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {MOCK_MAP_SEIZURES.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={customIcon}>
            <Popup>
              <div style={{ padding: '0.2rem', fontFamily: 'sans-serif' }}>
                <strong style={{ fontSize: '0.85rem', color: '#0a192f', display: 'block' }}>{item.substance} Seizure</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Location: {item.district}</span><br />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626' }}>Seized: {item.weight}g</span><br />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Date: {item.date}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
