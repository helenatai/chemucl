'use server';

import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { ChemicalActionResponse } from 'types/chemical';

export async function updateChemicalAction(params: any): Promise<ChemicalActionResponse> {
  return await validateAndProcessChemical('update', params);
}
