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
  groupName: z.string().min(1, { message: 'Group name is required' }) // groupName is required for adding
});

const updateResearchGroupSchema = baseResearchGroupSchema.extend({
  researchGroupID: z.number(), // researchGroupID is required for updating
  groupName: z.string().optional()
});

// Main handler function for research group actions
export async function validateAndProcessResearchGroup(action: string, params: any): Promise<ResearchGroupActionResponse> {
  try {
    switch (action) {
      case 'find': {
        const validationResult = baseResearchGroupSchema.safeParse(params);
        if (!validationResult.success) {
          return { error: validationResult.error.message };
        }

        const validatedParams = validationResult.data;
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
        const validationResult = addResearchGroupSchema.safeParse(params);
        if (!validationResult.success) {
          return { error: validationResult.error.message };
        }

        const validatedParams = validationResult.data;
        const newResearchGroup = await prisma.researchGroup.create({
          data: {
            groupName: validatedParams.groupName
          }
        });
        revalidatePath('/user-page/research-group');
        return { researchGroup: newResearchGroup };
      }

      case 'update': {
        if (!params.researchGroupID) {
          return { error: 'researchGroupID is required for update.' };
        }

        const validationResult = updateResearchGroupSchema.safeParse(params);
        if (!validationResult.success) {
          return { error: validationResult.error.message };
        }

        const validatedParams = validationResult.data;
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
        if (!params.researchGroupID) {
          return { error: 'researchGroupID is required for delete.' };
        }

        const deletedResearchGroup = await prisma.researchGroup.delete({
          where: { researchGroupID: params.researchGroupID }
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
