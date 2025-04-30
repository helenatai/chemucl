'use server';

import { verifyLocationQrHandler, updateAuditRecordForChemicalScanHandler, completeAudit, pauseAudit } from 'db/queries/Audit';

export async function scanLocationAction(auditId: number, scannedQr: string) {
  return verifyLocationQrHandler(auditId, scannedQr);
}

export async function scanChemicalAction(auditId: number, scannedQr: string) {
  return updateAuditRecordForChemicalScanHandler(auditId, scannedQr);
}

export async function completeAuditAction(auditId: number) {
  return completeAudit(auditId);
}

export async function pauseAuditAction(auditId: number) {
  return pauseAudit(auditId);
}
