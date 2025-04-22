'use server';

import { validateAndProcessUser } from '../userActionHandler';
import { revalidatePath } from 'next/cache';
import { UserActionResponse } from 'types/user';

export async function deleteUserAction(userIds: string[]): Promise<UserActionResponse> {
  try {
    const result = await validateAndProcessUser('delete', { userIds });
    
    if (!result.error) {
      // Revalidate the users page to reflect changes
      revalidatePath('/user');
    }

    return result;
  } catch (error) {
    console.error('Error deleting users:', error);
    return {
      error: 'Failed to delete users',
      users: []
    };
  }
} 