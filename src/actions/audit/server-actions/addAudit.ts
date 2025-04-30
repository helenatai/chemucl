'use server';

import { validateAndProcessAuditGeneral } from 'actions/audit/auditGeneralActionHandler';
import type { AuditGeneralActionResponse } from 'types/auditGeneral';

export async function addAuditAction(formData: FormData): Promise<AuditGeneralActionResponse> {
  if (!(formData instanceof FormData)) {
    return { error: 'Invalid form data', audit: null, success: false };
  }

  const auditorID = formData.get('auditorID') as string | null;
  const locations = formData.get('locations') as string | null;

  if (!auditorID) {
    return { error: 'Auditor ID is required', audit: null, success: false };
  }
  if (!locations) {
    return { error: 'Locations are required', audit: null, success: false };
  }

  const params = {
    auditorID,
    locations
  };

  const auditResult = await validateAndProcessAuditGeneral('add', params);
  if (auditResult.error) {
    return { error: auditResult.error, audit: null, success: false };
  }

  return auditResult;
}
