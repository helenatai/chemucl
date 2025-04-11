export interface LogWithRelations {
  logID: number;
  timestamp: Date;
  actionType: string;
  chemical?: {
    chemicalID: number;
    chemicalName: string;
  } | null;
  user?: {
    userID: number;
    name: string;
    permission: string; 
  } | null;
  description?: string | null;
  chemicalName?: string | null;
  locationBuilding?: string | null;
  locationRoom?: string | null;
}