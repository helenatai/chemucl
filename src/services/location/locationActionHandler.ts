'use server';

import { z } from 'zod';
import { db } from 'db';
import { LocationActionResponse } from 'types/location';

// Schema definitions
const baseLocationSchema = z.object({
  locationID: z.number().optional(),
  building: z.string().optional(),
  room: z.string().optional(),
});

const addLocationSchema = baseLocationSchema.extend({
  building: z.string(),
  room: z.string(),
});

// Main handler function for location actions
export async function validateAndProcessLocation(
  action: string,
  params: any
): Promise<LocationActionResponse> {
  let validationResult;

  // Choose schema based on action type
  if (action === 'add') {
    validationResult = addLocationSchema.safeParse(params);
  } else {
    validationResult = baseLocationSchema.safeParse(params);
  }

  // Return error if validation fails
  if (!validationResult.success) {
    return { error: validationResult.error.flatten() };
  }

  const validatedParams = validationResult.data;

  try {
    switch (action) {
      case 'find': {
        const locations = await db.location.findMany({
          where: {
            ...(validatedParams.building && {
              building: {
                contains: validatedParams.building,
                mode: 'insensitive', // Case-insensitive search
              },
            }),
            ...(validatedParams.room && {
              room: {
                contains: validatedParams.room,
                mode: 'insensitive',
              },
            }),
          },
        });
        return { locations };
      }

      case 'add': {
        const newLocation = await db.location.create({
          data: {
            building: validatedParams.building ?? '',
            room: validatedParams.room ?? '', 
          },
        });
        return { location: newLocation };
      }

      default:
        return { error: 'Invalid action specified.' };
    }
  } catch (error) {
    console.error(`Error processing location ${action}:`, error);
    return { error: 'An error occurred while processing the location.' };
  }
}
