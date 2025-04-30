'use server';

import { validateAndProcessUser } from 'actions/user/userActionHandler';
import { UserActionResponse } from 'types/user';

export async function addUserAction(formData: FormData): Promise<UserActionResponse> {
  const params = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    role: formData.get('role') as 'Admin' | 'Staff' | 'Research Student',
    researchGroupID: formData.get('researchGroupID') as string
  };

  return validateAndProcessUser('add', params);
}
