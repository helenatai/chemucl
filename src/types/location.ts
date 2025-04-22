export interface LocationWithRelations {
  locationID: number;
  qrID: string;
  building: string;
  buildingName: string;
  room: string;
  totalChemicals?: number;
  qrCode?: {
    qrID: string;
    type: 'LOCATION' | 'CHEMICAL';
    locationID: number | null;
    chemicalID: number | null;
  } | null;
}

export type LocationActionResponse = {
  locations: LocationWithRelations[];
  totalCount?: number;
  error?: any;
  message?: string;
  success?: boolean;
  qrCode?: any;
};