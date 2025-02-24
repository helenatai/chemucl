'use server';

import { z } from 'zod';
import { db } from 'db';
import { ChemicalActionResponse } from 'types/chemical';
import { updateChemical } from 'db/queries/Chemical';

const findChemicalsSchema = z.object({
  chemicalName: z.string().optional(),
  qrID: z.string().optional(), 
  page: z.number().min(1).default(1),
  rowsPerPage: z.number().min(1).default(10),
});


const addChemicalSchema = z.object({
  chemicalName: z.string(),
  casNumber: z.string().nullable().optional(),
  qrID: z.string().nullable().optional(),
  restrictionStatus: z.boolean(),
  locationID: z.number(),
  chemicalType: z.string(),
  researchGroupID: z.number().nullable().optional(),
  activeStatus: z.boolean().default(true),
  supplier: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  quartzyNumber: z.string().nullable().optional(),
  quantity: z.number().min(1),
  subLocation1: z.string().nullable().optional(),
  subLocation2: z.string().nullable().optional(),
  subLocation3: z.string().nullable().optional(),
  subLocation4: z.string().nullable().optional(),
});

const updateChemicalSchema = z.object({
  chemicalID: z.number(),
  chemicalName: z.string(),
  casNumber: z.string().nullable().optional(),
  qrID: z.string().nullable().optional(),
  restrictionStatus: z.boolean(),
  locationID: z.number().optional(),
  chemicalType: z.string(),
  researchGroupID: z.number().nullable().optional(),
  activeStatus: z.boolean().default(true),
  supplier: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  quartzyNumber: z.string().nullable().optional(),
  quantity: z.number().min(1),
  subLocation1: z.string().nullable().optional(),
  subLocation2: z.string().nullable().optional(),
  subLocation3: z.string().nullable().optional(),
  subLocation4: z.string().nullable().optional(),
});

// export async function validateAndProcessChemical(action: string, params: any): Promise<ChemicalActionResponse> {
//   if (action === 'find') {
//     const validation = findChemicalsSchema.safeParse(params);
//     if (!validation.success) {
//       return { error: validation.error.flatten(), chemicals: [] };
//     }

//     const { chemicalName, page, rowsPerPage } = validation.data;

//     try {
//       const chemicals = await db.chemical.findMany({
//         where: chemicalName
//           ? {
//               chemicalName: {
//                 contains: chemicalName,
//                 mode: 'insensitive',
//               },
//             }
//           : undefined,
//         skip: (page - 1) * rowsPerPage,
//         take: rowsPerPage,
//         include: {
//           location: true,
//           researchGroup: true,
//         },
//       });

//       const totalCount = await db.chemical.count({
//         where: chemicalName
//           ? {
//               chemicalName: {
//                 contains: chemicalName,
//                 mode: 'insensitive',
//               },
//             }
//           : undefined,
//       });

//       return { chemicals: chemicals || [], totalCount };
//     } catch (error) {
//       console.error('Error fetching chemicals:', error);
//       return { error: 'An error occurred while fetching chemicals.', chemicals: [] };
//     }
//   } else if (action === 'add') {
//     const validation = addChemicalSchema.safeParse(params);
//     if (!validation.success) {
//       return { error: validation.error.flatten(), chemicals: [] };
//     }

//     const validatedData = validation.data;

//     try {
//       const newChemical = await db.chemical.create({
//         data: {
//           chemicalName: validatedData.chemicalName,
//           casNumber: validatedData.casNumber! ?? null,
//           qrID: validatedData.qrID ?? null,
//           restrictionStatus: validatedData.restrictionStatus,
//           locationID: validatedData.locationID,
//           chemicalType: validatedData.chemicalType,
//           researchGroupID: validatedData.researchGroupID ?? null,
//           activeStatus: validatedData.activeStatus,
//           supplier: validatedData.supplier ?? null,
//           description: validatedData.description ?? null,
//           quartzyNumber: validatedData.quartzyNumber ?? null,
//           quantity: validatedData.quantity,
//           subLocation1: validatedData.subLocation1 ?? null,
//           subLocation2: validatedData.subLocation2 ?? null,
//           subLocation3: validatedData.subLocation3 ?? null,
//           subLocation4: validatedData.subLocation4 ?? null,
//         },
//       });

//     return { message: 'Chemical added successfully.', chemicals: [newChemical] };
//     } catch (error) {
//         console.error('Error adding chemical:', error);
//         return { error: 'An error occurred while adding the chemical.', chemicals: [] };
//     }
//   } else {
//     return { error: 'Invalid action type. Supported actions: "find", "add".', chemicals: [] };
//   }
// }

export async function validateAndProcessChemical(action: string, params: any): Promise<ChemicalActionResponse> {
  if (action === 'find') {
    const validation = findChemicalsSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), chemicals: [] };
    }

    const { chemicalName, qrID, page, rowsPerPage } = validation.data;

    const whereClause: Record<string, any> = {};
    if (chemicalName) {
      whereClause.chemicalName = {
        contains: chemicalName,
        mode: 'insensitive',
      };
    }
    if (qrID) {
      whereClause.qrID = qrID;
    }

    try {
      const chemicals = await db.chemical.findMany({
        where: Object.keys(whereClause).length ? whereClause : undefined, // ✅ No unnecessary filters
        skip: (page - 1) * rowsPerPage,
        take: rowsPerPage,
        include: {
          location: true,
          researchGroup: true,
        },
      });

      const totalCount = await db.chemical.count({
        where: Object.keys(whereClause).length ? whereClause : undefined,
      });

      console.log("API Response:", chemicals);
      return { chemicals: chemicals || [], totalCount };
    } catch (error) {
      console.error("Error fetching chemicals:", error);
      return { error: "An error occurred while fetching chemicals.", chemicals: [] };
    }
  }

   else if (action === 'add') {
    const validation = addChemicalSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), chemicals: [] };
    }

    const validatedData = validation.data;

    try {
      const newChemical = await db.chemical.create({
        data: {
          chemicalName: validatedData.chemicalName,
          casNumber: validatedData.casNumber! ?? null,
          qrID: validatedData.qrID ?? null,
          restrictionStatus: validatedData.restrictionStatus,
          locationID: validatedData.locationID,
          chemicalType: validatedData.chemicalType,
          researchGroupID: validatedData.researchGroupID ?? null,
          activeStatus: validatedData.activeStatus,
          supplier: validatedData.supplier ?? null,
          description: validatedData.description ?? null,
          quartzyNumber: validatedData.quartzyNumber ?? null,
          quantity: validatedData.quantity,
          subLocation1: validatedData.subLocation1 ?? null,
          subLocation2: validatedData.subLocation2 ?? null,
          subLocation3: validatedData.subLocation3 ?? null,
          subLocation4: validatedData.subLocation4 ?? null,
        },
      });

    return { message: 'Chemical added successfully.', chemicals: [newChemical] };
    } catch (error) {
        console.error('Error adding chemical:', error);
        return { error: 'An error occurred while adding the chemical.', chemicals: [] };
    }
  } 

  else if (action === 'update') {
    console.log("Validated Params Before Update:", params);
    
    const validation = updateChemicalSchema.safeParse(params);
    if (!validation.success) {
      console.error("Validation Failed:", validation.error.flatten());
      return { error: validation.error.flatten(), chemicals: [] };
    }

    console.log("Updating chemical in DB with data", params);
    try {
      const updatedChemical = await updateChemical(params);

      if (!updatedChemical) {
        return { error: 'Failed to update chemical.', chemicals: [] };
      }

      return { message: 'Chemical updated successfully.', chemicals: [updatedChemical] };
    } catch (error) {
      console.error('Error updating chemical:', error);
      return { error: 'An error occurred while updating the chemical.', chemicals: [] };
    }
  }

  else {
    return { error: 'Invalid action type. Supported actions: "find", "add".', chemicals: [] };
  }

}

