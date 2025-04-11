import type { Audit } from '@prisma/client';
import type { LocationWithRelations } from './location';

export type AuditWithRelations = Audit & {
  location: LocationWithRelations;
};