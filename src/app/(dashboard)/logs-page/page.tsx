import LogsPage from 'views/logs/logs-page';
import { findLogs } from 'db/queries/Log';

export default async function Page() {
  const logs = await findLogs();

  return (
    <LogsPage initialLogs={logs} />
  );
}

