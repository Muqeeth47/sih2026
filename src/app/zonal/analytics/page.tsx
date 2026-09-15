'use client';
import AnalyticsPage from '@/app/analytics/page';
import RoleGuard from '@/components/shared/RoleGuard';

export default function ZonalAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={['ncb_zonal']} featureName="Zonal Intelligence & Analytics">
      <AnalyticsPage />
    </RoleGuard>
  );
}
