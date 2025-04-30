'use server';

import { validateAndProcessUser } from 'actions/user/userActionHandler';
import { UserActionResponse } from 'types/user';

export async function updateUserAction(userId: string, activeStatus: boolean): Promise<UserActionResponse> {
  const params = {
    id: userId,
    activeStatus: activeStatus
  };

  return validateAndProcessUser('update', params);
}

export async function updateUserDetailsAction(params: {
  id: string;
  name?: string;
  email?: string;
  permission?: string;
  researchGroupID?: number | null;
  activeStatus?: boolean;
}): Promise<UserActionResponse> {
  return validateAndProcessUser('updateDetails', params);
}
