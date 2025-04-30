'use server';

import { validateAndProcessResearchGroup } from '../researchGroupActionHandler';
import { ResearchGroupActionResponse } from 'types/researchGroup';

export async function addResearchGroupAction(formData: FormData): Promise<ResearchGroupActionResponse> {
  // Ensure formData is correctly formatted as FormData
  if (!(formData instanceof FormData)) {
    console.error('formData is not an instance of FormData');
    return { error: 'Invalid form data' };
  }

  const params = {
    groupName: formData.get('groupName') as string
    // Add any other fields you expect from the form
  };

  // Validate and process the research group addition
  console.log('Adding research group with params:', params);
  const result = await validateAndProcessResearchGroup('add', params);

  if (result.error) {
    // Handle validation error
    return { error: result.error };
  }

  // Return a success message or the added research group object
  return result;
}
