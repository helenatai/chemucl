'use server';

import { prisma } from 'db';
import { ChemicalWithRelations } from 'types/chemical';

export const findChemical = async () => {
  const chemicals = await prisma.chemical.findMany({
    select: {
      chemicalID: true,
      qrID: true,
      chemicalName: true,
      supplier: true,
      quantity: true,
      chemicalType: true,
      restrictionStatus: true,
      activeStatus: true,
      location: {
        select: {
          locationID: true,
          building: true,
          buildingName: true,
          room: true,
        },
      },
      researchGroup: {
        select: {
          groupName: true,
          researchGroupID: true,
        },
      },
      dateAdded: true,
      dateUpdated: true,
      subLocation1: true,
      subLocation2: true,
      subLocation3: true,
      subLocation4: true,
      description: true,
    },
  });

  return chemicals.map((chem) => ({
    ...chem,
    qrID: chem.qrID || 'N/A', 
    location: chem.location
    ? {
        ...chem.location,
        buildingName: chem.location.buildingName ?? "", 
      }
    : null,
    researchGroup: chem.researchGroup || null,
  }));
};

export const findChemicalByQrID = async (qrID: string): Promise<ChemicalWithRelations | null> => {
  const chemical = await prisma.chemical.findFirst({
    where: { qrID },
    select: {
      chemicalID: true,
      qrID: true,
      chemicalName: true,
      casNumber: true,
      supplier: true,
      quantity: true,
      chemicalType: true,
      restrictionStatus: true,
      activeStatus: true,
      description: true,
      location: {
        select: {
          locationID: true,
          building: true,
          room: true,
          buildingName: true,
        },
      },
      researchGroup: {
        select: {
          researchGroupID: true,
          groupName: true,
        },
      },
      dateAdded: true,
      dateUpdated: true,
      subLocation1: true,
      subLocation2: true,
      subLocation3: true,
      subLocation4: true,
    },
  });

  if (!chemical) return null;

  return {
    ...chemical,
    qrID: chemical.qrID || 'N/A',
    researchGroup: chemical.researchGroup || null,
    location: chemical.location
    ? { ...chemical.location, buildingName: chemical.location.buildingName ?? "" }
    : null,
  };
};

export const findChemicalsByLocation = async (locationID: number) => {
  const chemicals = await prisma.chemical.findMany({
    where: {
      location: {
        locationID, 
      },
    },
    select: {
      chemicalID: true,
      qrID: true,
      chemicalName: true,
      supplier: true,
      quantity: true,
      chemicalType: true,
      restrictionStatus: true,
      dateAdded: true,
      dateUpdated: true,
      subLocation1: true,
      subLocation2: true,
      subLocation3: true,
      subLocation4: true,
      location: {
        select: {
          building: true,
          room: true,
        },
      },
      researchGroup: {
        select: {
          groupName: true,
        },
      },
    },
  });

  return chemicals;
};

interface AddChemicalParams {
  qrID: string;
  casNumber?: string;
  chemicalName: string;
  chemicalType: string;
  restrictionStatus: boolean;
  locationID?: number;
  researchGroupID: number;
  supplier?: string;
  description?: string;
  auditStatus?: boolean;
  quartzyNumber?: string;
  quantity: number;
  activeStatus?: boolean;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
}

export const addChemical = async (
  params: AddChemicalParams
): Promise<ChemicalWithRelations> => {
  const {
    qrID,
    casNumber,
    chemicalName,
    chemicalType,
    restrictionStatus,
    locationID,
    researchGroupID,
    supplier,
    description,
    auditStatus,
    quartzyNumber,
    quantity,
    activeStatus,
    subLocation1,
    subLocation2,
    subLocation3,
    subLocation4,
  } = params;

  const researchGroup = await prisma.researchGroup.findFirst({
    where: { researchGroupID },
  });
  if (!researchGroup) {
    throw new Error(`Research group with ID '${researchGroupID}' does not exist.`);
  }

  const data = {
    qrID: qrID, 
    casNumber: casNumber || '',
    chemicalName,
    chemicalType,
    restrictionStatus,
    supplier: supplier || null,
    description: description || '',
    auditStatus: auditStatus ?? null,
    quartzyNumber: quartzyNumber || null,
    quantity,
    activeStatus: activeStatus ?? true,
    researchGroup: { connect: { researchGroupID } },
    location: locationID ? { connect: { locationID } } : undefined,
    subLocation1: subLocation1 ?? null,
    subLocation2: subLocation2 ?? null,
    subLocation3: subLocation3 ?? null,
    subLocation4: subLocation4 ?? null,
  };

  const newChemical = await prisma.chemical.create({
    data: { ...data, auditStatus: auditStatus || undefined },
    include: {
      researchGroup: true,
      location: true,
      qrCode: true,
    },
  });

  if (!newChemical.qrID) {
    throw new Error("New chemical's qrID is null, which is not allowed.");
  }
  if (!newChemical.researchGroup) {
    throw new Error("New chemical's researchGroup is null, which is not allowed.");
  }

  return {
    ...newChemical,
    qrID: newChemical.qrID,  
    researchGroup: newChemical.researchGroup,
  } as ChemicalWithRelations;
};

interface UpdateChemicalParams extends Partial<AddChemicalParams> {
  chemicalID: number;
  chemicalName: string;
  casNumber?: string;
  qrID: string;
  chemicalType: string;
  restrictionStatus: boolean;
  supplier?: string;
  description?: string;
  quantity: number;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
  locationID?: number;
  researchGroupID: number;
}

export const updateChemical = async (params: UpdateChemicalParams) => {
  try {
    // Build the data object without locationID and researchGroupID first.
    const data: any = {
      chemicalName: params.chemicalName,
      casNumber: params.casNumber ?? undefined,
      chemicalType: params.chemicalType,
      restrictionStatus: params.restrictionStatus,
      supplier: params.supplier ?? null,
      description: params.description ?? null,
      quantity: params.quantity,
      subLocation1: params.subLocation1 ?? null,
      subLocation2: params.subLocation2 ?? null,
      subLocation3: params.subLocation3 ?? null,
      subLocation4: params.subLocation4 ?? null,
    };

    if (params.locationID !== undefined && params.locationID !== null) {
      data.location = { connect: { locationID: params.locationID } };
    }

    data.researchGroup = { connect: { researchGroupID: params.researchGroupID } };

    const updatedChemical = await prisma.chemical.update({
      where: { chemicalID: params.chemicalID },
      data,
      include: {
        researchGroup: true, 
        location: true,
        qrCode: true,
      },
    });

    if (!updatedChemical.qrID) {
      throw new Error("Updated chemical's qrID is null, which is not allowed.");
    }
    if (!updatedChemical.researchGroup) {
      throw new Error("Updated chemical's researchGroup is null, which is not allowed.");
    }

    return updatedChemical as ChemicalWithRelations;
  } catch (error) {
    console.error('Error updating chemical:', error);
    return null;
  }
};



export const deleteChemical = async (chemicalID: number) => {
  try {
    // Find the QR ID associated with this chemical
    const chemical = await prisma.chemical.findUnique({
      where: { chemicalID },
      select: { qrID: true },
    });

    // if (!chemical) {
    //   throw new Error(`Chemical with ID ${chemicalID} not found.`);
    // }

    if (!chemical) {
      // Instead of throwing an error, we log a warning and return null
      console.warn(`Chemical with ID ${chemicalID} not found, skipping deletion.`);
      return null;
    }

    // Delete the associated QR code if it exists
    if (chemical.qrID) {
      await prisma.qrCode.deleteMany({ where: { qrID: chemical.qrID } });
    }

    // Delete any associated audit records
    await prisma.auditRecord.deleteMany({ where: { chemicalID } });

    // Finally, delete the chemical itself
    return await prisma.chemical.delete({ where: { chemicalID } });
  } catch (error) {
    console.error('Error deleting chemical and QR code:', error);
    throw error;
  }
};

export const countData = async () => await prisma.chemical.count();
