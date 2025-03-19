export interface LocationWithRelations {
  locationID: number;
  qrID: string;
  building: string;
  buildingName: string;
  room: string;
  totalChemicals?: number | null;
}

export type LocationActionResponse = {
  locations?: LocationWithRelations[];
  location?: LocationWithRelations;
  error?: string | object;
};