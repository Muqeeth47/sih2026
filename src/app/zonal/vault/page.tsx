'use client';
import EvidenceVaultPage from '@/app/vault/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function ZonalVaultPage() {
  return (
    <RoleGuard allowedRoles={['ncb_zonal']} featureName="Zonal Command Directorate">
      <EvidenceVaultPage
        roleOverride="ncb_zonal"
        portalTitle="Zonal Command Directorate Vault"
        portalSubtitle="Superintendent Oversight · Seizure Approval and Court Dispatch"
      />
    </RoleGuard>
  );
}
