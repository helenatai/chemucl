'use server';

import { validateAndProcessChemical } from '../chemicalActionHandler';
import { validateAndProcessQrCode } from 'services/qr-code/qrCodeActionHandler';
import { findQrCode } from 'db/queries/QrCode';

export async function addChemicalAction(formData: FormData) {
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data' };
  }

  const qrIDValue = formData.get('qrID') as string | null;
  const groupNameValue = formData.get('groupName') as string | null;

  if (!qrIDValue) {
    return { error: 'QR ID is required.' };
  }

  const existingQrCode = await findQrCode({ qrID: qrIDValue });
  if (existingQrCode.length > 0) {
    return { error: `QR ID "${qrIDValue}" already exists. Please enter a unique QR ID.` };
  }

  const params = {
    chemicalName: formData.get('chemicalName') as string,
    casNumber: formData.get('casNumber') as string,
    qrID: qrIDValue,
    restrictionStatus: formData.get('restrictionStatus') === 'true',
    locationID: parseInt(formData.get('locationID') as string, 10),
    chemicalType: formData.get('chemicalType') as string,
    researchGroupID: parseInt(formData.get('researchGroupID') as string, 10) || null,
    researchGroup: groupNameValue || null,
    activeStatus: formData.get('activeStatus') === 'true',
    supplier: formData.get('supplier') as string,
    description: formData.get('description') as string,
    quartzyNumber: formData.get('quartzyNumber') as string,
    quantity: parseInt(formData.get('quantity') as string, 10),
  };

  const chemicalResult = await validateAndProcessChemical('add', params);
  if (chemicalResult.error) {
    console.error('Error adding chemical:', chemicalResult.error);
    return { error: chemicalResult.error };
  }

  const chemical = chemicalResult.chemicals?.[0];
  if (!chemical) {
    return { error: 'Failed to retrieve the added chemical.' };
  }

  const qrCodeResult = await validateAndProcessQrCode('add', {
    qrID: qrIDValue, 
    type: 'CHEMICAL',
    chemicalID: chemical.chemicalID,
  });

  if (qrCodeResult.error) {
    console.error('Error generating QR Code:', qrCodeResult.error);
    return { error: 'Chemical added, but QR Code could not be stored.' };
  }

return { message: 'Chemical added successfully', chemicals: [chemical], qrCode: qrCodeResult.qrCode };
}
