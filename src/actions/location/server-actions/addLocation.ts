'use server';

import { validateAndProcessLocation } from '../locationActionHandler';
import { validateAndProcessQrCode } from 'actions/qr-code/qrCodeActionHandler';
import { findQrCode } from 'db/queries/QrCode';

export async function addLocationAction(formData: FormData) {
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data', location: null };
  }

  // Extract form data
  const qrIDValue = formData.get('qrID') as string | null;
  const buildingCode = formData.get('building') as string | null;
  const buildingName = formData.get('buildingName') as string | null;
  const room = formData.get('room') as string | null;

  // Validate required fields
  if (!qrIDValue || !buildingCode || !buildingName || !room) {
    return { error: 'All fields (QR Code, Building Name, Building Code, and Room) are required.', location: null };
  }

  // Check if QR Code already exists
  const existingQrCode = await findQrCode({ qrID: qrIDValue });
  if (existingQrCode.length > 0) {
    return { error: `QR ID "${qrIDValue}" already exists. Please enter a unique QR ID.`, location: null };
  }

  // Prepare location parameters
  const params = {
    qrID: qrIDValue,
    building: buildingCode,
    buildingName,
    room
  };

  console.log('Adding location with params:', params);

  // Validate and process location addition
  const locationResult = await validateAndProcessLocation('add', params);
  if (locationResult.error) {
    return { error: locationResult.error, location: null };
  }

  const location = locationResult.locations?.[0];
  if (!location) {
    return { error: 'Failed to retrieve the added location.', location: null };
  }

  // Generate a QR Code entry for the location
  const qrCodeResult = await validateAndProcessQrCode('add', {
    qrID: qrIDValue,
    type: 'LOCATION',
    locationID: location.locationID // Attach QR code to location
  });

  if (qrCodeResult.error) {
    console.error('Error generating QR Code:', qrCodeResult.error);
    return { error: 'Location added, but QR Code could not be stored.', location };
  }

  return {
    message: 'Location added successfully',
    location,
    success: true,
    qrCode: qrCodeResult.qrCode
  };
}
