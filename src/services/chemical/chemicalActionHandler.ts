'use server';

import { z } from 'zod'; // For validation
import { db } from 'db'; // Import the Prisma client


// Define the schema for the "find" action
const findChemicalsSchema = z.object({
  chemicalName: z.string().optional(), // Optional search term
  page: z.number().min(1).default(1), // Page number, default is 1
  rowsPerPage: z.number().min(1).default(10), // Number of rows per page, default is 10
});

// Fetch and process chemicals
export async function validateAndProcessChemical(action: string, params: any) {
    if (action !== 'find') {
      return { error: 'Invalid action type. Supported action: "find"', chemicals: [] };
    }
  
    const validation = findChemicalsSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), chemicals: [] };
    }
  
    const { chemicalName, page, rowsPerPage } = validation.data;
  
    try {
      console.log('Query Params:', { chemicalName, page, rowsPerPage });
      const chemicals = await db.chemical.findMany({
        where: chemicalName
          ? {
              chemicalName: {
                contains: chemicalName,
                mode: 'insensitive',
              },
            }
          : undefined,
        skip: (page - 1) * rowsPerPage,
        take: rowsPerPage,
        include: {
          location: true,
          researchGroup: true,
        },
      });
  
      const totalCount = await db.chemical.count({
        where: chemicalName
          ? {
              chemicalName: {
                contains: chemicalName,
                mode: 'insensitive',
              },
            }
          : undefined,
      });
      
      console.log('Fetched Chemicals from DB:', chemicals);
      
      return { chemicals, totalCount };
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      return { error: 'An error occurred while fetching chemicals.', chemicals: [] };
    }
  }
  
