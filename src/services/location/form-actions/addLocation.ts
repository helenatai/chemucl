'use server';

import { validateAndProcessLocation } from '../locationActionHandler';

export async function addLocationAction(formData: FormData) {
  // Ensure formData is correctly formatted as FormData
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data' };
  }

  const params = {
    building: formData.get('building'),
    room: formData.get('room'),
  };

  // Validate and process the location addition
  console.log('Adding location with params:', params);
  const result = await validateAndProcessLocation('add', params);

  if (result.error) {
    // Handle validation error
    return { error: result.error };
  }

  // Return a success message or the added location object
  return { message: 'Location added successfully', location: result.location };
}
