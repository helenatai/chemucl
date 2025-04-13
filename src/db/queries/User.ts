'use server';

import { prisma } from 'db';
import { UserWithRelations } from 'types/user';

export const findUser = async (): Promise<UserWithRelations[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      activeStatus: true,
      researchGroupID: true,
      permission: true,
      researchGroup: {
        select: {
          researchGroupID: true,
          groupName: true,
        },
      },
    },
  });

  return users;
};

export interface AddUserParams {
  email: string;
  name: string;
  permission?: string;
  researchGroupID?: number;
  activeStatus?: boolean;
}

export const addUser = async (params: AddUserParams): Promise<UserWithRelations> => {
  const { email, name, activeStatus = true, researchGroupID, permission } = params;
  return await prisma.user.create({
    data: {
      email,
      name,
      activeStatus,
      researchGroupID: researchGroupID ?? null,
      permission,
    },
    include: {
      researchGroup: true,
    },
  });
};

export interface UpdateUserParams {
  id: string;
  email?: string;
  name?: string;
  activeStatus?: boolean;
  researchGroupID?: number | null;
  permission?: string;
}

export const updateUser = async (params: UpdateUserParams): Promise<UserWithRelations> => {
  const { id, ...updateFields } = params;
  
  const data = Object.fromEntries(Object.entries(updateFields).filter(([_, value]) => value !== undefined));
  
  return await prisma.user.update({
    where: { id },
    data,
    include: {
      researchGroup: true,
    },
  });
};

export const deleteUser = async (id: string): Promise<UserWithRelations> => {
  return await prisma.user.delete({
    where: { id },
    include: {
      researchGroup: true,
    },
  });
};

export const countData = async (): Promise<number> => await prisma.user.count();

