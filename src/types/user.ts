export interface UserWithRelations {
  id: string;
  email: string;
  name: string;
  activeStatus: boolean;
  researchGroupID: number | null;
  permission: string;
  researchGroup?: {
    researchGroupID: number;
    groupName: string;
  } | null;
}
export interface UserActionResponse {
  error?: string | { [key: string]: any };
  message?: string;
  users: UserWithRelations[];
}

export interface UserStateProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserWithRelations | null;
}

