import React from 'react';
import AuditLocations from 'views/audit/audit-locations';
import { findAuditGeneralByID } from 'db/queries/AuditGeneral';
import { findAuditsByAuditGeneralID } from 'db/queries/Audit';
import { findMissingRecordsByAuditGeneralID } from 'db/queries/AuditRecord';

export default async function Page({ params }: { params: { auditGeneralID: string } }) {
  const auditGeneralID = parseInt(params.auditGeneralID, 10);

  // Fetch the parent audit round
  const auditGeneral = await findAuditGeneralByID(auditGeneralID);
  // Fetch the child audit records
  const audits = await findAuditsByAuditGeneralID(auditGeneralID);

  const missingRecords = await findMissingRecordsByAuditGeneralID(auditGeneralID);

  return <AuditLocations auditGeneral={auditGeneral} audits={audits} missingRecords={missingRecords} />;
}
