export interface AuditGeneralWithRelations {
  auditGeneralID: number;
  round: number;
  auditorID: number;
  pendingCount: number;
  finishedCount: number;
  startDate: Date | null;
  lastAuditDate: Date | null;
  status: string;
  auditor: {
    userID: number;
    name: string;
  } | null;
}

export interface AuditGeneralActionResponse {
  message?: string;
  audit?: AuditGeneralWithRelations | null;
  error?: string;
  success?: boolean;
}