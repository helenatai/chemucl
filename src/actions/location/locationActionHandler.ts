'use server';

import { z } from 'zod';
import { LocationActionResponse } from 'types/location';
import { addLocation, updateLocation, deleteLocation } from 'db/queries/Location';

const addLocationSchema = z.object({
  building: z.string(),
  buildingName: z.string(),
  room: z.string(),
  qrID: z.string(),
});

const updateLocationSchema = z.object({
  locationID: z.number(),
  building: z.string(),
  buildingName: z.string(),
  room: z.string(),
  qrID: z.string(),
});

export async function validateAndProcessLocation(
  action: string,
  params: any
): Promise<LocationActionResponse> {
  if (action === 'add') {
    const validation = addLocationSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), locations: [] };
    }

    const validatedData = validation.data;

    try {
      const newLocation = await addLocation({
        building: validatedData.building,
        buildingName: validatedData.buildingName,
        room: validatedData.room,
        qrID: validatedData.qrID, 
      });

      return { locations: [newLocation] }; 
    } catch (error) {
      console.error('Error adding location:', error);
      return { error: 'An error occurred while adding the location.', locations: [] };
    }
  } 
  else if (action === 'update') {
    const validation = updateLocationSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), locations: [] };
    }

    try {
      const updatedLocation = await updateLocation({
        locationID: validation.data.locationID,
        building: validation.data.building,
        buildingName: validation.data.buildingName,
        room: validation.data.room,
        qrID: validation.data.qrID, 
      });

      if (!updatedLocation) {
        return { error: 'Failed to update location.', locations: [] };
      }

      return { locations: [updatedLocation] };
    } catch (error) {
      console.error('Error updating location:', error);
      return { error: 'An error occurred while updating the location.', locations: [] };
    }
  } 
  else if (action === 'delete') {
    if (!Array.isArray(params.locationIDs) || params.locationIDs.length === 0) {
      return { error: 'Invalid request: No locations selected for deletion.', locations: [] };
    }

    try {
      for (const id of params.locationIDs) {
        await deleteLocation(id);
      }
      return { locations: [] }; 
    } catch (error) {
      console.error('Error deleting locations:', error);
      return { error: 'An error occurred while deleting locations.', locations: [] };
    }
  }

  return { error: 'Invalid action type. Supported actions: "add", "update", "delete".', locations: [] };
}

