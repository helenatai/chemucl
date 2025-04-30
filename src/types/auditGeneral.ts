export interface AuditGeneralWithRelations {
  auditGeneralID: number;
  round: number;
  auditorID: string;
  pendingCount: number;
  finishedCount: number;
  startDate: Date | null;
  lastAuditDate: Date | null;
  status: string;
  auditor: {
    id: string;
    name: string;
  } | null;
}

export interface AuditGeneralActionResponse {
  message?: string;
  audit?: AuditGeneralWithRelations | null;
  error?: string;
  success?: boolean;
}
