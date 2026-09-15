// src/utils/escalation.ts
// Escalation handoff logic: ncb_io → ncb_fsl → ncb_zonal → ncb_court
import { supabase } from './supabaseClient';

export type EscalationStatus =
  | 'fsl_review'
  | 'zonal_review'
  | 'court_review'
  | 'resolved'
  | 'dismissed';

export type NCBRole = 'ncb_io' | 'ncb_fsl' | 'ncb_zonal' | 'ncb_court';

/** What status the current role can escalate a case TO */
const ESCALATION_MAP: Record<NCBRole, EscalationStatus | null> = {
  ncb_io:    'fsl_review',
  ncb_fsl:   'zonal_review',
  ncb_zonal: 'court_review',
  ncb_court: 'resolved',
};

/** Which escalation status appears in this role's "action needed" queue */
export const ROLE_QUEUE_STATUS: Record<NCBRole, EscalationStatus | null> = {
  ncb_io:    null,          // IO sees their own cases, no incoming queue
  ncb_fsl:   'fsl_review',
  ncb_zonal: 'zonal_review',
  ncb_court: 'court_review',
};

/** Label shown on the escalation action button */
export const ESCALATION_BUTTON_LABEL: Record<NCBRole, string> = {
  ncb_io:    'Send to FSL Lab',
  ncb_fsl:   'Escalate to Zonal HQ',
  ncb_zonal: 'Submit to NDPS Court',
  ncb_court: 'Mark Resolved',
};

/** Badge colour for the escalation status chip */
export const ESCALATION_STATUS_META: Record<EscalationStatus, { label: string; color: string; bg: string }> = {
  fsl_review:   { label: 'FSL Review',    color: '#7c3aed', bg: '#ede9fe' },
  zonal_review: { label: 'Zonal Review',  color: '#b45309', bg: '#fef9ec' },
  court_review: { label: 'Court Review',  color: '#065f46', bg: '#f0fdf4' },
  resolved:     { label: 'Resolved',      color: '#16a34a', bg: '#dcfce7' },
  dismissed:    { label: 'Dismissed',     color: '#dc2626', bg: '#fee2e2' },
};

/** Can this role take escalation action on a case with the given status? */
export function canEscalate(role: NCBRole, currentEscalationStatus: string | null): boolean {
  if (role === 'ncb_io') {
    // IO can only escalate cases that haven't been escalated yet (null status)
    return currentEscalationStatus === null || currentEscalationStatus === '';
  }
  if (role === 'ncb_fsl')   return currentEscalationStatus === 'fsl_review';
  if (role === 'ncb_zonal') return currentEscalationStatus === 'zonal_review';
  if (role === 'ncb_court') return currentEscalationStatus === 'court_review';
  return false;
}

/** Perform the escalation update in Supabase and local cache */
export async function escalateSeizure(
  caseId: string,
  role: NCBRole,
  officerBadge: string,
  note: string,
  explicitTarget?: EscalationStatus
): Promise<{ success: boolean; error?: string }> {
  const toStatus = explicitTarget || ESCALATION_MAP[role];
  if (!toStatus) return { success: false, error: 'No escalation target for this role.' };

  try {
    const { error } = await supabase
      .from('seizures')
      .update({
        escalation_status: toStatus,
        escalation_note: note || null,
        escalated_by: officerBadge,
        escalated_at: new Date().toISOString(),
        // Also advance the main status to reflect cross-role handoff
        status:
          toStatus === 'fsl_review'   ? 'fsl_testing'      :
          toStatus === 'zonal_review' ? 'fsl_verified'     :
          toStatus === 'court_review' ? 'court_scrutiny'   :
          'court_certified',
      })
      .eq('case_id', caseId);

    if (error) {
      console.warn('Supabase escalation notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline, continuing with local state update:', err);
  }

  // Cache escalation in localStorage so UI reflects changes instantly across all tabs
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ncb_escalations') || '{}';
      const map = JSON.parse(stored);
      map[caseId] = toStatus;
      localStorage.setItem('ncb_escalations', JSON.stringify(map));
    } catch {}
  }

  return { success: true };
}
