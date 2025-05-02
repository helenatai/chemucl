'use server';

import { z } from 'zod';
import { addAuditGeneral, updateAuditGeneral } from 'db/queries/AuditGeneral';
import { AuditGeneralActionResponse } from 'types/auditGeneral';
import { revalidatePath } from 'next/cache';

const AuditGeneralSchema = z.object({
  auditorID: z.string(),
  locations: z
    .string()
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      { message: 'Invalid locations data' }
    )
    .transform((val) => JSON.parse(val) as { buildingName: string; room: string }[])
});

const UpdateAuditSchema = z.object({
  auditGeneralID: z.number(),
  status: z.string()
});

export type AuditGeneralInput = z.infer<typeof AuditGeneralSchema>;

export async function validateAndProcessAuditGeneral(
  operation: 'add' | 'update' | 'invalid',
  params: any
): Promise<AuditGeneralActionResponse> {
  try {
    if (operation === 'invalid') {
      return { error: 'Invalid operation', success: false, audit: null };
    }

    if (operation === 'add') {
      const validationResult = AuditGeneralSchema.safeParse(params);
      if (!validationResult.success) {
        return { error: validationResult.error.message, success: false, audit: null };
      }

      const auditData = validationResult.data;
      const result = await addAuditGeneral({
        auditorID: auditData.auditorID,
        locations: auditData.locations
      });
      revalidatePath('/audit-page');
      return {
        audit: result.audit,
        message: 'Audit added successfully',
        success: true
      };
    }

    if (operation === 'update') {
      if (!params.auditGeneralID) {
        return { error: 'auditGeneralID is required for update', success: false, audit: null };
      }

      const validationResult = UpdateAuditSchema.safeParse(params);
      if (!validationResult.success) {
        return { error: validationResult.error.message, success: false, audit: null };
      }

      const result = await updateAuditGeneral({
        auditGeneralID: params.auditGeneralID,
        status: params.status
      });
      revalidatePath('/audit-page');
      revalidatePath(`/audit-page/${params.auditGeneralID}`);
      return {
        audit: result.audit,
        message: 'Audit updated successfully',
        success: true
      };
    }

    return { error: 'Invalid operation', success: false, audit: null };
  } catch (error: any) {
    return { error: error.message, success: false, audit: null };
  }
}
