'use server';

import { z } from 'zod';
import { UserActionResponse } from 'types/user';
import { addUser, updateUser, deleteUser } from 'db/queries/User';
import { getServerSession } from 'next-auth';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';
import { prisma } from 'db';

const addUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Admin', 'Staff', 'Research Student']),
  researchGroupID: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  activeStatus: z.boolean(),
});

const updateUserDetailsSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  permission: z.string().optional(),
  researchGroupID: z.number().nullable().optional(),
  activeStatus: z.boolean().optional(),
});

// New schema for delete operation
const deleteUserSchema = z.object({
  userIds: z.array(z.string().min(1, 'User ID is required'))
});

type ActionType = 'add' | 'update' | 'updateDetails' | 'delete';
type ParamsType = z.infer<typeof addUserSchema> | z.infer<typeof updateUserSchema> | z.infer<typeof updateUserDetailsSchema> | z.infer<typeof deleteUserSchema>;

export async function validateAndProcessUser(
  action: ActionType,
  params: ParamsType
): Promise<UserActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Unauthorized', users: [] };
    }

    if (!session?.user || session.user.permission?.toLowerCase() !== 'admin') {
      return {
        error: 'Unauthorized: Only administrators can manage users',
        users: []
      };
    }

    if (action === 'add') {
      const validatedData = addUserSchema.parse(params);
      const hashedPassword = await bcrypt.hash('chemucl', 10);
      
      const newUser = await addUser({
        name: validatedData.fullName,
        email: validatedData.email,
        permission: validatedData.role,
        researchGroupID: validatedData.researchGroupID ? parseInt(validatedData.researchGroupID) : undefined,
        password: hashedPassword,
      });

      return { message: 'User added successfully', users: [newUser] };
    } 
    else if (action === 'update') {
      const validatedData = updateUserSchema.parse(params);
      
      const updatedUser = await updateUser({
        id: validatedData.id,
        activeStatus: validatedData.activeStatus,
      });

      return { message: 'User updated successfully', users: [updatedUser] };
    }
    else if (action === 'updateDetails') {
      const validatedData = updateUserDetailsSchema.parse(params);
      
      const updatedUser = await updateUser({
        id: validatedData.id,
        name: validatedData.name,
        email: validatedData.email,
        permission: validatedData.permission,
        researchGroupID: validatedData.researchGroupID,
        activeStatus: validatedData.activeStatus,
      });

      return { message: 'User updated successfully', users: [updatedUser] };
    }
    else if (action === 'delete') {
      const validatedData = deleteUserSchema.parse(params);
      
      await deleteUser(validatedData.userIds);
      return {
        error: undefined,
        users: []
      };
    }

    return { error: 'Invalid action', users: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, users: [] };
    }
    return { error: 'An unexpected error occurred', users: [] };
  }
}

const importUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  permission: z.enum(['Admin', 'Staff', 'Research Student']),
  researchGroup: z.string(),
  activeStatus: z.boolean().default(true),
});

export async function validateAndProcessImport(users: any[]): Promise<UserActionResponse> {
  // Get the user's session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated', users: [] };
  }

  try {
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          // Validate the user data
          const validation = importUserSchema.safeParse(user);
          if (!validation.success) {
            throw new Error(`Validation failed for user ${user.email}: ${JSON.stringify(validation.error.flatten())}`);
          }

          const validatedData = validation.data;

          // Find research group by name
          const researchGroup = await prisma.researchGroup.findFirst({
            where: {
              groupName: validatedData.researchGroup,
            },
            select: {
              researchGroupID: true,
            },
          });

          if (!researchGroup) {
            throw new Error(`Research group "${validatedData.researchGroup}" not found`);
          }

          // Check if email already exists
          const existingUser = await prisma.user.findFirst({
            where: { email: validatedData.email }
          });

          if (existingUser) {
            throw new Error(`User with email "${validatedData.email}" already exists`);
          }

          // Add the user
          const newUser = await addUser({
            name: validatedData.name,
            email: validatedData.email,
            permission: validatedData.permission,
            researchGroupID: researchGroup.researchGroupID,
            activeStatus: validatedData.activeStatus,
          });

          return { success: true, data: newUser };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const errors = results
      .filter((result): result is { success: false; error: string } => !result.success && 'error' in result)
      .map(result => result.error);

    if (errors.length > 0) {
      return { error: errors.join('\n'), users: [] };
    }

    const successfulUsers = results
      .filter((result): result is { success: true; data: any } => result.success && 'data' in result)
      .map(result => result.data);

    return { 
      message: 'Users imported successfully',
      users: successfulUsers
    };
  } catch (error) {
    console.error('Error importing users:', error);
    return { error: error instanceof Error ? error.message : 'Failed to import users', users: [] };
  }
} 