'use server';

import { validateAndProcessImport } from '../userActionHandler';
import { UserActionResponse } from 'types/user';

export async function importUsersAction(users: any[]): Promise<UserActionResponse> {
  return await validateAndProcessImport(users);
}
