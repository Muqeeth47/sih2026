'use client';
// src/hooks/useCameraStream.ts
// WebRTC getUserMedia camera feed with canvas capture

import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraState {
  isActive: boolean;
  error: string | null;
  permissionDenied: boolean;
  facingMode: 'environment' | 'user';
}

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    isActive: false,
    error: null,
    permissionDenied: false,
    facingMode: 'environment',
  });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState(s => ({ ...s, isActive: false }));
  }, []);

  const startCamera = useCallback(async (facingMode: 'environment' | 'user' = 'environment') => {
    try {
      // Stop existing stream first without causing re-render loop
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({ isActive: true, error: null, permissionDenied: false, facingMode });
    } catch (err) {
      const error = err as Error;
      const isDenied = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError';
      setState(s => ({
        ...s,
        isActive: false,
        error: isDenied
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Camera unavailable. Ensure no other application is using it.',
        permissionDenied: isDenied,
      }));
    }
  }, []);

  const flipCamera = useCallback(() => {
    const next = state.facingMode === 'environment' ? 'user' : 'environment';
    startCamera(next);
  }, [state.facingMode, startCamera]);

  /**
   * Capture current video frame to canvas and return ImageData + dataURL
   */
  const captureFrame = useCallback((targetSize = 1280): { dataUrl: string; imageData: ImageData } | null => {
    if (!videoRef.current || !streamRef.current) return null;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    const aspect = video.videoWidth / video.videoHeight;
    canvas.width = targetSize;
    canvas.height = Math.round(targetSize / aspect);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    return { dataUrl, imageData };
  }, []);

  /**
   * Extract center 40% region ImageData for colorimetric analysis
   */
  const captureReticleRegion = useCallback((): { dataUrl: string; imageData: ImageData; regionImageData: ImageData } | null => {
    const frame = captureFrame();
    if (!frame) return null;

    const { imageData, dataUrl } = frame;
    const w = imageData.width;
    const h = imageData.height;

    // Center 40% region
    const rx = Math.round(w * 0.3);
    const ry = Math.round(h * 0.3);
    const rw = Math.round(w * 0.4);
    const rh = Math.round(h * 0.4);

    const regionCanvas = document.createElement('canvas');
    regionCanvas.width = rw;
    regionCanvas.height = rh;
    const rCtx = regionCanvas.getContext('2d');
    if (!rCtx) return null;

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = w;
    srcCanvas.height = h;
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) return null;
    srcCtx.putImageData(imageData, 0, 0);
    rCtx.drawImage(srcCanvas, rx, ry, rw, rh, 0, 0, rw, rh);
    const regionImageData = rCtx.getImageData(0, 0, rw, rh);

    return { dataUrl, imageData, regionImageData };
  }, [captureFrame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    ...state,
    startCamera,
    stopCamera,
    flipCamera,
    captureFrame,
    captureReticleRegion,
  };
}
