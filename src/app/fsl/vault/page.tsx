'use client';
import EvidenceVaultPage from '@/app/vault/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function FSLVaultPage() {
  return (
    <RoleGuard allowedRoles={['ncb_fsl']} featureName="Forensic Science Laboratory">
      <EvidenceVaultPage
        roleOverride="ncb_fsl"
        portalTitle="Forensic Science Laboratory (FSL)"
        portalSubtitle="Central Forensic Lab Queue · Chemical Confirmatory GC-MS Review"
      />
    </RoleGuard>
  );
}
