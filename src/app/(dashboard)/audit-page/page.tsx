import AuditGeneralPage from 'views/audit/audit-page';
import { findAuditGeneral } from 'db/queries/AuditGeneral';
import { findLocation } from 'db/queries/Location';

export default async function Page() {
  const audits = await findAuditGeneral();
  const locations = await findLocation();
  return <AuditGeneralPage initialAudits={audits} initialLocations={locations} />;
}
