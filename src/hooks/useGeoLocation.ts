'use client';
// src/hooks/useGeoLocation.ts
// Real navigator.geolocation with error state fallback

import { useState, useCallback } from 'react';
import type { GPSCoordinate } from '@/types/drug';

interface GeoState {
  coordinate: GPSCoordinate | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeoLocation() {
  const [state, setState] = useState<GeoState>({
    coordinate: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const capture = useCallback((): Promise<GPSCoordinate> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation API not supported in this browser';
        setState(s => ({ ...s, error: err, loading: false }));
        reject(new Error(err));
        return;
      }

      setState(s => ({ ...s, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coord: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            timestamp: new Date(position.timestamp).toISOString(),
            source: 'device_gps',
          };
          setState({ coordinate: coord, loading: false, error: null, permissionDenied: false });
          resolve(coord);
        },
        (error) => {
          let message: string;
          let permissionDenied = false;

          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              message = 'GPS permission denied. Please allow location access in browser settings.';
              permissionDenied = true;
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              message = 'GPS signal unavailable. Move to an open area.';
              break;
            case GeolocationPositionError.TIMEOUT:
              message = 'GPS timeout — try again in an open area.';
              break;
            default:
              message = 'Unknown GPS error';
          }

          setState(s => ({ ...s, loading: false, error: message, permissionDenied }));
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  const reset = useCallback(() => {
    setState({ coordinate: null, loading: false, error: null, permissionDenied: false });
  }, []);

  return { ...state, capture, reset };
}
