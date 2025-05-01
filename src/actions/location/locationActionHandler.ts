'use server';

import { z } from 'zod';
import { LocationActionResponse } from 'types/location';
import { addLocation, updateLocation, deleteLocation, findLocation } from 'db/queries/Location';
import { revalidatePath } from 'next/cache';

const addLocationSchema = z.object({
  building: z.string().min(1, 'Building is required'),
  buildingName: z.string().min(1, 'Building name is required'),
  room: z.string().min(1, 'Room is required'),
  qrID: z.string().min(1, 'QR ID is required')
});

const updateLocationSchema = z.object({
  locationID: z.number(),
  building: z.string(),
  buildingName: z.string(),
  room: z.string(),
  qrID: z.string()
});

export async function validateAndProcessLocation(action: string, params: any): Promise<LocationActionResponse> {
  try {
    if (action === 'add') {
      const validation = addLocationSchema.safeParse(params);
      if (!validation.success) {
        return { error: validation.error.errors[0].message, locations: [] };
      }

      const validatedData = validation.data;

      try {
        const newLocation = await addLocation({
          building: validatedData.building,
          buildingName: validatedData.buildingName,
          room: validatedData.room,
          qrID: validatedData.qrID
        });

        revalidatePath('/location-page');
        return { locations: [newLocation] };
      } catch (error) {
        return { error: (error as Error).message, locations: [] };
      }
    }

    if (action === 'update') {
      const validation = updateLocationSchema.safeParse(params);
      if (!validation.success) {
        return { error: validation.error.flatten(), locations: [] };
      }

      const validatedData = validation.data;

      // First check if location exists
      const existingLocation = await findLocation();
      const locationExists = existingLocation.some((loc) => loc.locationID === validatedData.locationID);

      if (!locationExists) {
        return { error: 'Location not found', locations: [] };
      }

      const updatedLocation = await updateLocation({
        locationID: validatedData.locationID,
        building: validatedData.building,
        buildingName: validatedData.buildingName,
        room: validatedData.room,
        qrID: validatedData.qrID
      });

      revalidatePath('/location-page');
      revalidatePath(`/location-page/${validatedData.qrID}`);
      return { locations: [updatedLocation] };
    }

    if (action === 'delete') {
      if (!Array.isArray(params.locationIDs) || params.locationIDs.length === 0) {
        return { error: 'Invalid request: No locations selected for deletion.', locations: [] };
      }

      for (const id of params.locationIDs) {
        await deleteLocation(id);
      }
      revalidatePath('/location-page');
      return { locations: [] };
    }

    return { error: 'Invalid action specified', locations: [] };
  } catch (error) {
    return { error: (error as Error).message, locations: [] };
  }
}
