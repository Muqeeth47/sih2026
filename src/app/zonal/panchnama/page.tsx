'use client';
import React, { Suspense } from 'react';
import PanchnamaFormPage from '@/app/panchnama/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function ZonalPanchnamaPage() {
  return (
    <RoleGuard allowedRoles={['ncb_zonal']} featureName="Zonal Panchnama Review">
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading NDPS Panchnama…</div>}>
        <PanchnamaFormPage />
      </Suspense>
    </RoleGuard>
  );
}
