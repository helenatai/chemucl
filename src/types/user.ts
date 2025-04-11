export interface UserWithRelations {
  userID: number;
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
