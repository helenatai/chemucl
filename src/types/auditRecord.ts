import { AuditRecord, Chemical } from '@prisma/client';
import { LocationWithRelations } from './location';

export interface AuditRecordWithRelations extends AuditRecord {
  chemical: Chemical;
  audit: {
    location: LocationWithRelations;
  };
}