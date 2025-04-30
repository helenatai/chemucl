'use server';

import { prisma } from 'db';
import { ResearchGroupWithRelations } from 'types/researchGroup';

export const findResearchGroup = async () => {
  const researchGroups = await prisma.researchGroup.findMany({
    select: {
      researchGroupID: true,
      groupName: true,
      users: {
        select: {
          id: true
        }
      }
    }
  });

  return researchGroups.map((group) => ({
    ...group,
    totalMembers: group.users.length
  }));
};

export const findResearchGroupById = async (researchGroupID: number): Promise<ResearchGroupWithRelations | null> => {
  const researchGroup = await prisma.researchGroup.findUnique({
    where: {
      researchGroupID: researchGroupID
    },
    select: {
      researchGroupID: true,
      groupName: true,
      users: {
        select: {
          id: true
        }
      }
    }
  });

  if (!researchGroup) return null;

  return {
    ...researchGroup,
    totalMembers: researchGroup.users.length
  };
};

export interface AddResearchGroupParams {
  groupName: string;
}

export const addResearchGroup = async (groupName: string) => {
  return await prisma.researchGroup.create({
    data: {
      groupName
    },
    select: {
      researchGroupID: true,
      groupName: true
    }
  });
};

export interface UpdateResearchGroupParams extends AddResearchGroupParams {
  researchGroupID: number;
}

export const updateResearchGroup = async (params: UpdateResearchGroupParams) => {
  const updatedGroup = await prisma.researchGroup.update({
    where: { researchGroupID: params.researchGroupID },
    data: { groupName: params.groupName }
  });
  return updatedGroup;
};

export const deleteResearchGroup = async (researchGroupID: number) => {
  return await prisma.researchGroup.delete({
    where: { researchGroupID }
  });
};

export const countResearchGroups = async () => await prisma.researchGroup.count();
