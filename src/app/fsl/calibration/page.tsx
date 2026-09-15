'use client';
import SettingsPage from '@/app/settings/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function FSLCalibrationPage() {
  return (
    <RoleGuard allowedRoles={['ncb_fsl']} featureName="FSL Sensor Calibration">
      <SettingsPage />
    </RoleGuard>
  );
}
