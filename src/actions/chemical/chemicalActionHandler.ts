'use server';

import { z } from 'zod';
import { ChemicalActionResponse } from 'types/chemical';
import { addChemical, deleteChemical, updateChemical } from 'db/queries/Chemical';
import { addLog } from 'db/queries/Log';
import { prisma } from 'db';
import { getServerSession } from 'next-auth';
import { authOptions } from 'utils/authOptions';

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
  quantity: z.number().min(0),
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
  quantity: z.number().min(0),
  subLocation1: z.string().nullable().optional(),
  subLocation2: z.string().nullable().optional(),
  subLocation3: z.string().nullable().optional(),
  subLocation4: z.string().nullable().optional(),
});

const importChemicalSchema = z.object({
  qrID: z.string(),
  chemicalName: z.string(),
  casNumber: z.string().nullable().optional(),
  quantity: z.number().min(0),
  chemicalType: z.string(),
  supplier: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  researchGroup: z.string(),
  building: z.string(),
  room: z.string(),
  subLocation1: z.string().nullable().optional(),
  subLocation2: z.string().nullable().optional(),
  subLocation3: z.string().nullable().optional(),
  subLocation4: z.string().nullable().optional(),
  restrictionStatus: z.boolean(),
  quartzyNumber: z.string().nullable().optional(),
});

export async function validateAndProcessChemical(action: string, params: any): Promise<ChemicalActionResponse> {
  // Get the user's session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated', chemicals: [] };
  }

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
        userID: session.user.id,
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
        userID: session.user.id,
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
          userID: session.user.id,
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

export async function validateAndProcessImport(chemicals: any[]): Promise<ChemicalActionResponse> {
  // Get the user's session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated', chemicals: [] };
  }

  try {
    const results = await Promise.all(
      chemicals.map(async (chemical) => {
        try {
          // Validate the chemical data
          const validation = importChemicalSchema.safeParse(chemical);
          if (!validation.success) {
            throw new Error(`Validation failed for chemical ${chemical.qrID}: ${JSON.stringify(validation.error.flatten())}`);
          }

          const validatedData = validation.data;

          // Find location by building and room
          const location = await prisma.location.findFirst({
            where: {
              building: validatedData.building,
              room: validatedData.room,
            },
            select: {
              locationID: true,
            },
          });

          if (!location) {
            throw new Error(`Location with building "${validatedData.building}" and room "${validatedData.room}" not found`);
          }

          // Find research group by name
          const researchGroup = await prisma.researchGroup.findFirst({
            where: {
              groupName: validatedData.researchGroup,
            },
            select: {
              researchGroupID: true,
            },
          });

          if (!researchGroup) {
            throw new Error(`Research group "${validatedData.researchGroup}" not found`);
          }

          // Check if QR ID already exists
          const existingQrCode = await prisma.qrCode.findFirst({
            where: { qrID: validatedData.qrID }
          });

          if (existingQrCode) {
            throw new Error(`QR ID "${validatedData.qrID}" already exists`);
          }

          // Add the chemical
          const newChemical = await addChemical({
            qrID: validatedData.qrID,
            chemicalName: validatedData.chemicalName,
            casNumber: validatedData.casNumber || undefined,
            quantity: validatedData.quantity,
            chemicalType: validatedData.chemicalType,
            restrictionStatus: validatedData.restrictionStatus,
            supplier: validatedData.supplier || undefined,
            description: validatedData.description || undefined,
            quartzyNumber: validatedData.quartzyNumber || undefined,
            locationID: location.locationID,
            researchGroupID: researchGroup.researchGroupID,
            activeStatus: true,
            subLocation1: validatedData.subLocation1 || undefined,
            subLocation2: validatedData.subLocation2 || undefined,
            subLocation3: validatedData.subLocation3 || undefined,
            subLocation4: validatedData.subLocation4 || undefined,
          });

          // Add log entry
          await addLog({
            userID: session.user.id,
            chemicalID: newChemical.chemicalID,
            actionType: 'Added',
            description: `Chemical '${newChemical.chemicalName}' imported.`,
            chemicalName: newChemical.chemicalName,
            locationBuilding: validatedData.building,
            locationRoom: validatedData.room,
          });

          return { success: true, data: newChemical };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const errors = results
      .filter((result): result is { success: false; error: string } => !result.success && 'error' in result)
      .map(result => result.error);

    if (errors.length > 0) {
      return { error: errors.join('\n'), chemicals: [] };
    }

    const successfulChemicals = results
      .filter((result): result is { success: true; data: any } => result.success && 'data' in result)
      .map(result => result.data);

    return { 
      message: 'Chemicals imported successfully',
      chemicals: successfulChemicals,
      success: true 
    };
  } catch (error) {
    console.error('Error importing chemicals:', error);
    return { error: error instanceof Error ? error.message : 'Failed to import chemicals', chemicals: [] };
  }
}

