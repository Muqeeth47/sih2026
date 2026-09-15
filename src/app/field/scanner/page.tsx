'use client';
import ScannerPage from '@/app/scanner/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function FieldScannerPage() {
  return (
    <RoleGuard allowedRoles={['ncb_io']} featureName="Live Field Scanner">
      <ScannerPage />
    </RoleGuard>
  );
}
