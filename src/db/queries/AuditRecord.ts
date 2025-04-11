import { prisma } from 'db';
import { AuditRecordWithRelations } from 'types/auditRecord';

export async function findAuditRecordsByAuditID(auditID: number): Promise<AuditRecordWithRelations[]> {
  return prisma.auditRecord.findMany({
    where: { auditID },
    include: {
      chemical: true, 
      audit: {
        include: {
          location: true,
        },
      },
    },
  }) as Promise<AuditRecordWithRelations[]>;
}

export async function findMissingRecordsByAuditGeneralID(auditGeneralID: number): Promise<AuditRecordWithRelations[]> {
  return prisma.auditRecord.findMany({
    where: {
      status: "Missing",
      audit: {
        auditGeneralID // ensure the parent Audit belongs to the same round
      }
    },
    include: {
      chemical: true,
      audit: {
        include: {
          location: true 
        }
      }
    }
  }) as Promise<AuditRecordWithRelations[]>;
}