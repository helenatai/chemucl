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
          groupName: true
        }
      }
    }
  });

  return users;
};

export const getCurrentUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      permission: true,
      activeStatus: true,
      researchGroup: {
        select: {
          groupName: true
        }
      }
    }
  });
  return user;
};

export const findUserById = async (id: string): Promise<UserWithRelations | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
            groupName: true
          }
        }
      }
    });
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export interface AddUserParams {
  email: string;
  name: string;
  permission?: string;
  researchGroupID?: number;
  activeStatus?: boolean;
  password?: string;
}

export const addUser = async (params: AddUserParams): Promise<UserWithRelations> => {
  const { email, name, activeStatus = true, researchGroupID, permission, password } = params;
  return await prisma.user.create({
    data: {
      email,
      name,
      activeStatus,
      researchGroupID: researchGroupID ?? null,
      permission,
      password
    },
    include: {
      researchGroup: true
    }
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

  // Filter out undefined values and ensure activeStatus is properly handled
  const data = Object.fromEntries(Object.entries(updateFields).filter(([_, value]) => value !== undefined));

  try {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        researchGroup: true
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

export const deleteUser = async (ids: string[]): Promise<void> => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const countData = async (): Promise<number> => await prisma.user.count();

export const findUsersByResearchGroup = async (researchGroupID: number): Promise<UserWithRelations[]> => {
  const users = await prisma.user.findMany({
    where: {
      researchGroupID: researchGroupID
    },
    select: {
      id: true,
      name: true,
      email: true,
      permission: true,
      activeStatus: true,
      researchGroupID: true,
      researchGroup: {
        select: {
          researchGroupID: true,
          groupName: true
        }
      }
    }
  });

  return users.map((user) => ({
    ...user,
    researchGroup: user.researchGroup
      ? {
          researchGroupID: user.researchGroup.researchGroupID,
          groupName: user.researchGroup.groupName
        }
      : null
  }));
};
