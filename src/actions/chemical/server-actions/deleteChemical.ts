'use server';

import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { ChemicalActionResponse } from 'types/chemical';

export async function deleteChemicalAction(chemicalIDs: number[]): Promise<ChemicalActionResponse> {
  return await validateAndProcessChemical('delete', { chemicalIDs });
}
