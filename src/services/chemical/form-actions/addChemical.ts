'use server';

import { validateAndProcessChemical } from '../chemicalActionHandler';

export async function addChemicalAction(formData: FormData) {
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data' };
  }

  const qrIDValue = formData.get('qrID');
  const groupNameValue = formData.get('groupName');

  const params = {
    chemicalName: formData.get('chemicalName') as string,
    casNumber: formData.get('casNumber') as string,
    qrID: qrIDValue !== '' ? (qrIDValue as string) : null,
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

const result = await validateAndProcessChemical('add', params);

if (result.error) {
    console.error('Error adding chemical:', result.error);
    return { error: result.error };
}

return { message: 'Chemical added successfully', chemicals: result.chemicals };
}
