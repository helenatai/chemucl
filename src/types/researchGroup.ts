export interface ResearchGroupWithRelations {
  researchGroupID: number;
  groupName: string;
  totalMembers?: number | null;
}

export type ResearchGroupActionResponse = {
  researchGroups?: ResearchGroupWithRelations[];
  researchGroup?: ResearchGroupWithRelations;
  error?: string | object;
};
  