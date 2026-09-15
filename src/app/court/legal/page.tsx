'use client';
import LegalPage from '@/app/legal/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function CourtLegalPage() {
  return (
    <RoleGuard allowedRoles={['ncb_court']} featureName="Special NDPS Legal Repository">
      <LegalPage />
    </RoleGuard>
  );
}
