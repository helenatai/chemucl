import React from 'react';
import { findAuditRecordsByAuditID } from 'db/queries/AuditRecord';
import AuditLocationChemicals from 'views/audit/audit-location-chemicals';

export default async function Page({ params }: { params: { auditGeneralID: string; auditID: string } }) {
  const auditID = parseInt(params.auditID, 10);

  // Fetch the AuditRecords for this location of this round
  const records = await findAuditRecordsByAuditID(auditID);

  // Render a client component to display them
  return <AuditLocationChemicals auditID={auditID} records={records} />;
}