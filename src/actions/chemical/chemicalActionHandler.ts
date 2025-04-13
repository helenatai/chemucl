'use server';

import { z } from 'zod';
import { ChemicalActionResponse } from 'types/chemical';
import { addChemical, deleteChemical, updateChemical } from 'db/queries/Chemical';
import { addLog } from 'db/queries/Log';
import { prisma } from 'db';

const DUMMY_USER_ID = 'cm9dhwo4t00011lk3vs4sfly8';

const addChemicalSchema = z.object({
  chemicalName: z.string(),
  casNumber: z.string().nullable().optional(),
  qrID: z.string(),
  restrictionStatus: z.boolean(),
  locationID: z.number(),
  chemicalType: z.string(),
  researchGroupID: z.number(),
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
  restrictionStatus: z.boolean(),
  locationID: z.number().optional(),
  chemicalType: z.string(),
  researchGroupID: z.number(),
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

export async function validateAndProcessChemical(action: string, params: any): Promise<ChemicalActionResponse> {
  if (action === 'add') {
    const validation = addChemicalSchema.safeParse(params);
    if (!validation.success) {
      return { error: validation.error.flatten(), chemicals: [] };
    }

    const validatedData = validation.data;

    try {
      const newChemical = await addChemical({
        chemicalName: validatedData.chemicalName,
        casNumber: validatedData.casNumber ?? undefined,      
        qrID: validatedData.qrID,                                
        restrictionStatus: validatedData.restrictionStatus,
        locationID: validatedData.locationID,
        chemicalType: validatedData.chemicalType,
        researchGroupID: validatedData.researchGroupID,
        activeStatus: validatedData.activeStatus,
        supplier: validatedData.supplier ?? undefined,
        description: validatedData.description ?? undefined,
        quartzyNumber: validatedData.quartzyNumber ?? undefined,
        quantity: validatedData.quantity,
        subLocation1: validatedData.subLocation1 ?? undefined,
        subLocation2: validatedData.subLocation2 ?? undefined,
        subLocation3: validatedData.subLocation3 ?? undefined,
        subLocation4: validatedData.subLocation4 ?? undefined,
      });

      await addLog({
        userID: DUMMY_USER_ID.toString(), // Replace with the real userID from session later
        chemicalID: newChemical.chemicalID,
        actionType: 'Added',
        description: `Chemical '${newChemical.chemicalName}' added.`,
        chemicalName: newChemical.chemicalName,
        locationBuilding: newChemical.location?.building ?? 'N/A',
        locationRoom: newChemical.location?.room ?? 'N/A',
      });

      return { message: 'Chemical added successfully.', chemicals: [newChemical] };
    } catch (error) {
      console.error('Full error object:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return { error: 'An error occurred while adding the chemical.', chemicals: [] };
    }
  } else if (action === 'update') {
    
    const validation = updateChemicalSchema.safeParse(params);
    if (!validation.success) {
      console.error("Validation Failed:", validation.error.flatten());
      return { error: validation.error.flatten(), chemicals: [] };
    }

    try {
      const updatedChemical = await updateChemical(params);

      if (!updatedChemical) {
        return { error: 'Failed to update chemical.', chemicals: [] };
      }

      await addLog({
        userID: DUMMY_USER_ID.toString(), // Replace with real userID from session later
        chemicalID: updatedChemical.chemicalID,
        actionType: 'Updated',
        description: `Chemical '${updatedChemical.chemicalName}' updated.`,
        chemicalName: updatedChemical.chemicalName,
        locationBuilding: updatedChemical.location?.building ?? 'N/A',
        locationRoom: updatedChemical.location?.room ?? 'N/A',
      });

      return { message: 'Chemical updated successfully.', chemicals: [updatedChemical] };
    } catch (error) {
      console.error('Error updating chemical:', error);
      return { error: 'An error occurred while updating the chemical.', chemicals: [] };
    }
  }

  else if (action === 'delete') {
    if (!Array.isArray(params.chemicalIDs) || params.chemicalIDs.length === 0) {
      return { error: 'Invalid request: No chemicals selected for deletion.', chemicals: [] };
    }
    try {
      for (const id of params.chemicalIDs) {
        // Take a snapshot of the chemical before deletion
        const chemicalSnapshot = await prisma.chemical.findUnique({
          where: { chemicalID: id },
          select: {
            chemicalName: true,
            location: {
              select: {
                building: true,
                room: true,
              },
            },
          },
        });

        const chemicalName = chemicalSnapshot?.chemicalName ?? "N/A";
        const locationBuilding = chemicalSnapshot?.location?.building ?? "N/A";
        const locationRoom = chemicalSnapshot?.location?.room ?? "N/A";

        await addLog({
          userID: DUMMY_USER_ID.toString(),
          chemicalID: id,
          actionType: 'Deleted',
          description: `Chemical '${chemicalName}' deleted.`,
          chemicalName,
          locationBuilding,
          locationRoom,
        });
        await deleteChemical(id);
      }
      return { message: 'Selected chemicals and their QR codes deleted successfully.', chemicals: [] };
    } catch (error) {
      console.error('Error deleting chemicals:', error);
      return { error: 'An error occurred while deleting chemicals.', chemicals: [] };
    }
  }

  else {
    return { error: 'Invalid action type. Supported actions: "add", "update", "delete".', chemicals: [] };
  }

}

