'use client';
import EvidenceVaultPage from '@/app/vault/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function FieldVaultPage() {
  return (
    <RoleGuard allowedRoles={['ncb_io']} featureName="Field Evidence Locker">
      <EvidenceVaultPage
        roleOverride="ncb_io"
        portalTitle="Field Evidence Locker"
        portalSubtitle="Field Interdiction Unit · Spot Seizure and Chain-of-Custody Intake"
      />
    </RoleGuard>
  );
}
