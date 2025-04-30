'use server';

import { z } from 'zod';
import { prisma } from 'db';
import { ResearchGroupActionResponse } from 'types/researchGroup';
import { revalidatePath } from 'next/cache';

// Schema definitions
const baseResearchGroupSchema = z.object({
  researchGroupID: z.number().optional(),
  groupName: z.string().optional()
});

const addResearchGroupSchema = baseResearchGroupSchema.extend({
  groupName: z.string() // groupName is required for adding
});

const updateResearchGroupSchema = baseResearchGroupSchema.extend({
  researchGroupID: z.number(), // researchGroupID is required for updating
  groupName: z.string().optional()
});

// Main handler function for research group actions
export async function validateAndProcessResearchGroup(action: string, params: any): Promise<ResearchGroupActionResponse> {
  let validationResult;

  // Choose schema based on action type
  if (action === 'add') {
    validationResult = addResearchGroupSchema.safeParse(params);
  } else if (action === 'update') {
    validationResult = updateResearchGroupSchema.safeParse(params);
  } else {
    validationResult = baseResearchGroupSchema.safeParse(params);
  }

  // Return error if validation fails
  if (!validationResult.success) {
    return { error: validationResult.error.flatten() };
  }

  const validatedParams = validationResult.data;

  try {
    switch (action) {
      case 'find': {
        const researchGroups = await prisma.researchGroup.findMany({
          where: validatedParams.groupName
            ? {
                groupName: {
                  contains: validatedParams.groupName,
                  mode: 'insensitive' // Case-insensitive search
                }
              }
            : undefined
        });
        return { researchGroups };
      }

      case 'add': {
        const newResearchGroup = await prisma.researchGroup.create({
          data: {
            groupName: validatedParams.groupName || ''
          }
        });
        revalidatePath('/user-page/research-group');
        return { researchGroup: newResearchGroup };
      }

      case 'update': {
        if (!validatedParams.researchGroupID) {
          return { error: 'researchGroupID is required for update.' };
        }

        const updatedResearchGroup = await prisma.researchGroup.update({
          where: { researchGroupID: validatedParams.researchGroupID },
          data: {
            groupName: validatedParams.groupName
          }
        });
        revalidatePath('/user-page/research-group');
        return { researchGroup: updatedResearchGroup };
      }

      case 'delete': {
        if (!validatedParams.researchGroupID) {
          return { error: 'researchGroupID is required for delete.' };
        }

        const deletedResearchGroup = await prisma.researchGroup.delete({
          where: { researchGroupID: validatedParams.researchGroupID }
        });
        revalidatePath('/user-page/research-group');
        return { researchGroup: deletedResearchGroup };
      }

      default:
        return { error: 'Invalid action specified.' };
    }
  } catch (error) {
    console.error(`Error processing research group ${action}:`, error);
    return { error: 'An error occurred while processing the research group.' };
  }
}
