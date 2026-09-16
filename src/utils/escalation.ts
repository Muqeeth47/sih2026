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

export interface EscalationInfo {
  note: string;
  by: string;
  role: NCBRole;
  toStatus: EscalationStatus;
  at: string;
}

/** What status the current role can escalate a case TO (Strict 4-tier hierarchy) */
export const ESCALATION_MAP: Record<NCBRole, EscalationStatus | null> = {
  ncb_io:    'fsl_review',      // IO passes ONLY to FSL Lab
  ncb_fsl:   'zonal_review',    // FSL Lab passes ONLY to Zonal HQ
  ncb_zonal: 'court_review',    // Zonal HQ passes ONLY to NDPS Court
  ncb_court: 'resolved',        // Court marks case resolved
};

/** Destination details per role */
export const ROLE_ESCALATION_DESTINATIONS: Record<NCBRole, { target: EscalationStatus; label: string; recipient: string; stepNumber: string }> = {
  ncb_io: {
    target: 'fsl_review',
    label: 'Forward to Forensic Science Lab (FSL)',
    recipient: 'FSL Chemical Analyst / Senior Scientific Officer',
    stepNumber: 'Step 1 → Step 2 (Field to Lab)',
  },
  ncb_fsl: {
    target: 'zonal_review',
    label: 'Forward to Zonal Headquarters (Zonal Director)',
    recipient: 'Zonal Director / Superintendent of Narcotics',
    stepNumber: 'Step 2 → Step 3 (Lab to Zonal HQ)',
  },
  ncb_zonal: {
    target: 'court_review',
    label: 'Submit to NDPS Special Court',
    recipient: 'Hon’ble Special Judge (NDPS Act)',
    stepNumber: 'Step 3 → Step 4 (Zonal to Court)',
  },
  ncb_court: {
    target: 'resolved',
    label: 'Certify & Mark Case Resolved',
    recipient: 'Judicial Vault & Disposal Registry',
    stepNumber: 'Step 4 (Final Judicial Certification)',
  },
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
  fsl_review:   { label: 'FSL Lab Testing',   color: '#7c3aed', bg: '#ede9fe' },
  zonal_review: { label: 'Zonal HQ Review',   color: '#b45309', bg: '#fef9ec' },
  court_review: { label: 'Court Scrutiny',    color: '#065f46', bg: '#f0fdf4' },
  resolved:     { label: 'Court Certified',   color: '#16a34a', bg: '#dcfce7' },
  dismissed:    { label: 'Dismissed',         color: '#dc2626', bg: '#fee2e2' },
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

  const now = new Date().toISOString();
  const cleanNote = note.trim();

  try {
    const { error } = await supabase
      .from('seizures')
      .update({
        escalation_status: toStatus,
        escalation_note: cleanNote || null,
        escalated_by: officerBadge,
        escalated_at: now,
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

    // Also record in custody_chain
    try {
      await supabase.from('custody_chain').insert({
        case_id: caseId,
        actor_badge: officerBadge,
        actor_role: role,
        action: `Escalated to ${toStatus.replace(/_/g, ' ').toUpperCase()}`,
        notes: cleanNote || 'Handover passed to next tier',
        sha256_verification: `ESC-${Date.now().toString(36).toUpperCase()}`,
        timestamp: now,
      });
    } catch {}
  } catch (err) {
    console.warn('Supabase offline, continuing with local state update:', err);
  }

  // Cache escalation status & note in localStorage so all roles/tabs see it immediately
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ncb_escalations') || '{}';
      const map = JSON.parse(stored);
      map[caseId] = toStatus;
      localStorage.setItem('ncb_escalations', JSON.stringify(map));

      const storedNotes = localStorage.getItem('ncb_escalation_notes') || '{}';
      const notesMap = JSON.parse(storedNotes);
      notesMap[caseId] = {
        note: cleanNote,
        by: officerBadge,
        role: role,
        toStatus: toStatus,
        at: now,
      };
      localStorage.setItem('ncb_escalation_notes', JSON.stringify(notesMap));
    } catch {}
  }

  return { success: true };
}

/** Retrieve cached escalation note for a case */
export function getStoredEscalationInfo(caseId: string): EscalationInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('ncb_escalation_notes');
    if (!stored) return null;
    const map = JSON.parse(stored);
    return map[caseId] || null;
  } catch {
    return null;
  }
}
