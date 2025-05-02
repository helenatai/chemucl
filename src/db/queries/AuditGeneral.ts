'use server';

import { prisma } from 'db';
import { AuditGeneralWithRelations } from 'types/auditGeneral';

export const findAuditGeneral = async (): Promise<AuditGeneralWithRelations[]> => {
  const audits = await prisma.auditGeneral.findMany({
    orderBy: { auditGeneralID: 'desc' },
    include: {
      auditor: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return audits;
};

export const findAuditGeneralByID = async (auditGeneralID: number): Promise<AuditGeneralWithRelations | null> => {
  return prisma.auditGeneral.findUnique({
    where: { auditGeneralID },
    include: {
      auditor: {
        select: { id: true, name: true }
      },
      audits: true
    }
  });
};

export interface AddAuditGeneralParams {
  auditorID: string;
  locations: { buildingName: string; room: string }[];
}

export async function addAuditGeneral(data: AddAuditGeneralParams): Promise<{ audit: AuditGeneralWithRelations }> {
  const lastAudit = await prisma.auditGeneral.findFirst({
    orderBy: { round: 'desc' }
  });
  const newRound = lastAudit ? lastAudit.round + 1 : 1;

  const auditGeneral = await prisma.auditGeneral.create({
    data: {
      round: newRound,
      auditorID: data.auditorID,
      status: 'Ongoing',
      startDate: new Date(),
      pendingCount: data.locations.length,
      finishedCount: 0
    },
    include: { auditor: true }
  });

  for (const loc of data.locations) {
    const foundLocation = await prisma.location.findFirst({
      where: {
        buildingName: loc.buildingName,
        room: loc.room
      }
    });
    if (!foundLocation) {
      console.error(`No matching location found for building=${loc.buildingName}, room=${loc.room}`);
      continue;
    }

    const totalChemicals = await prisma.chemical.count({
      where: { locationID: foundLocation.locationID }
    });

    // Create a new Audit sub-record
    const createdAudit = await prisma.audit.create({
      data: {
        auditGeneralID: auditGeneral.auditGeneralID,
        locationID: foundLocation.locationID,
        auditorID: data.auditorID,
        startDate: new Date(),
        round: newRound,
        notes: '',
        pendingCount: totalChemicals,
        finishedCount: 0
      }
    });

    const chemicals = await prisma.chemical.findMany({
      where: { locationID: foundLocation.locationID }
    });

    for (const chem of chemicals) {
      await prisma.auditRecord.create({
        data: {
          auditID: createdAudit.auditID,
          chemicalID: chem.chemicalID,
          status: 'Unaudited',
          notes: '',
          auditDate: new Date(),
          lastAuditDate: null,
          locationID: foundLocation.locationID,
          people: ''
        }
      });
    }
  }

  return { audit: auditGeneral };
}

export interface UpdateAuditGeneralParams {
  auditGeneralID: number;
  status?: string;
}

export async function updateAuditGeneral(data: UpdateAuditGeneralParams): Promise<{ audit: AuditGeneralWithRelations }> {
  const auditGeneral = await prisma.auditGeneral.update({
    where: { auditGeneralID: data.auditGeneralID },
    data: {
      status: data.status,
      lastAuditDate: new Date()
    },
    include: { auditor: true }
  });
  return { audit: auditGeneral };
}

export async function checkAndUpdateAuditGeneralStatus(auditGeneralID: number): Promise<void> {
  const auditGeneral = await prisma.auditGeneral.findUnique({
    where: { auditGeneralID },
    select: { pendingCount: true, status: true }
  });
  if (auditGeneral && auditGeneral.pendingCount === 0 && auditGeneral.status !== 'Completed') {
    await prisma.auditGeneral.update({
      where: { auditGeneralID },
      data: {
        status: 'Completed',
        lastAuditDate: new Date()
      }
    });
  }
}
