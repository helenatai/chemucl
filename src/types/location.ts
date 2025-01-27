export type LocationActionResponse = {
  locations?: Array<{
    locationID: number;
    building: string;
    room: string;
  }>;
  location?: {
    locationID: number;
    building: string;
    room: string;
  };
  error?: string | object;
};
