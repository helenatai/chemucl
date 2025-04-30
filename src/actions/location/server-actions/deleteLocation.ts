'use server';

import { validateAndProcessLocation } from 'actions/location/locationActionHandler';

export async function deleteLocationAction(locationID: number) {
  try {
    // Pass in an array of location IDs (even if just one)
    const result = await validateAndProcessLocation('delete', {
      locationIDs: [locationID]
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting location:', error);
    return { error: 'An error occurred while deleting the location.' };
  }
}
