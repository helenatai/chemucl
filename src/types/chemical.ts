export interface ChemicalWithRelations {
  chemicalID: number;
  chemicalName: string;
  casNumber?: string | null;
  qrID?: string | null;
  restrictionStatus: boolean;
  location?: {
    locationID: number;
    building: string;
    room: string;
  } | null;
  chemicalType: string;
  researchGroup?: {
    researchGroupID: number;
    groupName: string;
  } | null;
  activeStatus: boolean;
  supplier?: string | null;
  description?: string | null;
  quartzyNumber?: string | null;
  quantity: number;
  dateAdded?: Date | null;
  dateUpdated?: Date | null;
  subLocation1?: string | null;
  subLocation2?: string | null;
  subLocation3?: string | null;
  subLocation4?: string | null;
}

export interface ChemicalActionResponse {
  chemicals: ChemicalWithRelations[];
  totalCount?: number;
  error?: any;
  message?: string;
    
}