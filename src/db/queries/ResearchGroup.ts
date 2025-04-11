'use server';

import { prisma } from 'db';

export const findResearchGroup = async () => {
  const researchGroups = await prisma.researchGroup.findMany({
    select: {
      researchGroupID: true,
      groupName: true,
    },
  });

  const groupsWithMemberCount = await Promise.all(
    researchGroups.map(async (group) => {
      const memberCount = await prisma.user.count({
        where: { researchGroupID: group.researchGroupID },
      });
      return {
        ...group,
        totalMembers: memberCount,
      };
    })
  );

  return groupsWithMemberCount;
};

export interface AddResearchGroupParams {
  groupName: string;
}

export const addResearchGroup = async (params: AddResearchGroupParams) => {
  const newGroup = await prisma.researchGroup.create({
    data: params,
  });
  return newGroup;
};

export interface UpdateResearchGroupParams extends AddResearchGroupParams {
  researchGroupID: number;
}

export const updateResearchGroup = async (params: UpdateResearchGroupParams) => {
  const updatedGroup = await prisma.researchGroup.update({
    where: { researchGroupID: params.researchGroupID },
    data: { groupName: params.groupName },
  });
  return updatedGroup;
};

export const deleteResearchGroup = async (researchGroupID: number) => {
  return await prisma.researchGroup.delete({
    where: { researchGroupID },
  });
};

export const countResearchGroups = async () => await prisma.researchGroup.count();
