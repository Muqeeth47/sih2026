'use client';
import EvidenceVaultPage from '@/app/vault/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function CourtVaultPage() {
  return (
    <RoleGuard allowedRoles={['ncb_court']} featureName="Special NDPS Court Repository">
      <EvidenceVaultPage
        roleOverride="ncb_court"
        portalTitle="Special NDPS Court Repository"
        portalSubtitle="Trial Dossiers and Electronic Evidence Records (Sec 63 BSA)"
      />
    </RoleGuard>
  );
}
