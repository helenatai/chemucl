// types/researchGroup.ts
export type ResearchGroupActionResponse = {
    researchGroups?: Array<{
      researchGroupID: number;
      groupName: string;
    }>;
    researchGroup?: {
      researchGroupID: number;
      groupName: string;
    };
    error?: string | object;
  };
  