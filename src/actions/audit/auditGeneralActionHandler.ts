'use server';

import {z} from 'zod';
import { addAuditGeneral, updateAuditGeneral } from 'db/queries/AuditGeneral';
import { AuditGeneralActionResponse } from 'types/auditGeneral';

const AuditGeneralSchema = z.object({
  auditorID: z.string(),

  locations: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }, { message: "Invalid locations data" }).transform(val => JSON.parse(val) as { buildingName: string; room: string }[]),
});

export type AuditGeneralInput = z.infer<typeof AuditGeneralSchema>;

export async function validateAndProcessAuditGeneral(
  operation: 'add' | 'update',
  params: any
): Promise<AuditGeneralActionResponse> {
  try {
    const auditData: AuditGeneralInput = AuditGeneralSchema.parse({
      auditorID: params.auditorID,
      locations: params.locations,
    });

    if (operation === 'add') {
      const result = await addAuditGeneral({
        auditorID: auditData.auditorID,
        locations: auditData.locations,
      });
      return {
        audit: result.audit,
        message: 'Audit added successfully',
        success: true,
      };
    } else if (operation === 'update') {
      const result = await updateAuditGeneral({
        auditGeneralID: params.auditGeneralID,
        status: params.status,
      });
      return {
        audit: result.audit,
        message: 'Audit updated successfully',
        success: true,
      };
    }

    return { error: 'Invalid operation', success: false, audit: null };
  } catch (error: any) {
    return { error: error.message, success: false, audit: null };
  }
}