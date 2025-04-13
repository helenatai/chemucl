'use server';

import { prisma } from 'db';
import { LogWithRelations } from 'types/log';

export const findLogs = async (): Promise<LogWithRelations[]> => {

  const logs = await prisma.log.findMany({
    orderBy: { timestamp: 'desc' }, 
    select: {
      logID: true,
      timestamp: true,
      actionType: true,
      description: true,
      chemicalName: true,
      locationBuilding: true,
      locationRoom: true,
      user: {
        select: {
          id: true,
          name: true,
          permission: true
        }
      }
    }
  });

  return logs;
};

export const addLog = async (params: {
  userID: string;
  chemicalID: number;
  actionType: 'Added' | 'Updated' | 'Deleted';
  description?: string;
  chemicalName: string;
  locationBuilding: string;
  locationRoom: string;
}): Promise<LogWithRelations> => {
  return await prisma.log.create({
    data: {
      userID: params.userID,
      chemicalID: params.chemicalID,
      actionType: params.actionType,
      description: params.description ?? "",
      timestamp: new Date(),
      chemicalName: params.chemicalName,
      locationBuilding: params.locationBuilding,
      locationRoom: params.locationRoom,
    },
    include: {
      user: {
        select: { id: true, name: true, permission: true }
      },
    }
  });
};


export const countLogs = async (): Promise<number> => await prisma.log.count();