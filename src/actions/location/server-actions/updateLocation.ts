'use server';

import { validateAndProcessLocation } from '../locationActionHandler';
import { LocationActionResponse } from 'types/location';

export async function updateLocationAction(formData: {
  locationID: number;
  qrID: string;
  building: string;
  buildingName: string;
  room: string;
}): Promise<LocationActionResponse> {
  try {
    // Update location (which now also updates QR code)
    const locationResult = await validateAndProcessLocation('update', {
      locationID: formData.locationID,
      building: formData.building,
      buildingName: formData.buildingName,
      room: formData.room,
      qrID: formData.qrID
    });

    if (locationResult.error) {
      return { error: locationResult.error, locations: [] };
    }

    return { 
      message: 'Location and QR code updated successfully',
      locations: locationResult.locations,
      success: true 
    };
  } catch (error) {
    console.error('Error updating location:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to update location',
      locations: [],
      success: false 
    };
  }
} 