export interface ResearchGroupWithRelations {
  researchGroupID: number;
  groupName: string;
  // Add any additional fields 
}

export type ResearchGroupActionResponse = {
  researchGroups?: ResearchGroupWithRelations[];
  researchGroup?: ResearchGroupWithRelations;
  error?: string | object;
};
  