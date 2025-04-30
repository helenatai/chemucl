'use server';

import { validateAndProcessChemical } from '../chemicalActionHandler';
import { validateAndProcessQrCode } from 'actions/qr-code/qrCodeActionHandler';
import { findQrCode } from 'db/queries/QrCode';
import { ChemicalActionResponse } from 'types/chemical';

export async function addChemicalAction(formData: FormData): Promise<ChemicalActionResponse> {
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data', chemicals: [] };
  }

  const qrIDValue = formData.get('qrID') as string | null;
  if (!qrIDValue) {
    return { error: 'QR ID is required.', chemicals: [] };
  }

  const existingQrCode = await findQrCode({ qrID: qrIDValue });
  if (existingQrCode.length > 0) {
    return { error: `QR ID "${qrIDValue}" already exists. Please enter a unique QR ID.`, chemicals: [] };
  }

  const params = {
    chemicalName: formData.get('chemicalName') as string,
    casNumber: formData.get('casNumber') as string,
    qrID: qrIDValue,
    restrictionStatus: formData.get('restrictionStatus') === 'true',
    locationID: parseInt(formData.get('locationID') as string, 10),
    chemicalType: formData.get('chemicalType') as string,
    researchGroupID: parseInt(formData.get('researchGroupID') as string, 10),
    activeStatus: formData.get('activeStatus') === 'true',
    supplier: formData.get('supplier') as string,
    description: formData.get('description') as string,
    quartzyNumber: formData.get('quartzyNumber') as string,
    quantity: parseInt(formData.get('quantity') as string, 10),
    subLocation1: formData.get('subLocation1') as string,
    subLocation2: formData.get('subLocation2') as string,
    subLocation3: formData.get('subLocation3') as string,
    subLocation4: formData.get('subLocation4') as string
  };

  const chemicalResult = await validateAndProcessChemical('add', params);
  if (chemicalResult.error) {
    console.error('Error adding chemical:', chemicalResult.error);
    return { error: chemicalResult.error, chemicals: [] };
  }

  const chemical = chemicalResult.chemicals?.[0];
  if (!chemical) {
    return { error: 'Failed to retrieve the added chemical.', chemicals: [] };
  }

  const qrCodeResult = await validateAndProcessQrCode('add', {
    qrID: qrIDValue,
    type: 'CHEMICAL',
    chemicalID: chemical.chemicalID
  });

  if (qrCodeResult.error) {
    console.error('Error generating QR Code:', qrCodeResult.error);
    return { error: 'Chemical added, but QR Code could not be stored.', chemicals: [chemical] };
  }

  return {
    message: 'Chemical added successfully',
    chemicals: [chemical],
    success: true,
    qrCode: qrCodeResult.qrCode
  };
}
