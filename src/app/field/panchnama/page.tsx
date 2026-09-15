'use client';
import React, { Suspense } from 'react';
import PanchnamaFormPage from '@/app/panchnama/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function FieldPanchnamaPage() {
  return (
    <RoleGuard allowedRoles={['ncb_io']} featureName="Field NDPS Panchnama">
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading NDPS Panchnama…</div>}>
        <PanchnamaFormPage />
      </Suspense>
    </RoleGuard>
  );
}
