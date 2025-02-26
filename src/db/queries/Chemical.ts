'use server';

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

interface FindChemicalParams {
  chemicalID?: number;
  casNumber?: string;
  chemicalName?: string;
  supplier?: string;
  restrictionStatus?: boolean;
  researchGroupID?: number;
  activeStatus?: boolean;
  locationID?: number;
  chemicalType?: string;
  restrictionDescription?: string;
  lastAudit?: string;
  quartzyNumber?: string;
  page?: number;
  rowsPerPage?: number;
}

export const findChemical = async (params: FindChemicalParams) => {
  const {
    chemicalID,
    casNumber,
    chemicalName,
    supplier,
    restrictionStatus,
    researchGroupID,
    activeStatus,
    locationID,
    chemicalType,
    restrictionDescription,
    lastAudit,
    quartzyNumber,
    page,
    rowsPerPage,
  } = params;

  const whereClause: Record<string, any> = {};
  if (chemicalID) whereClause.chemicalID = chemicalID;
  if (casNumber) whereClause.casNumber = casNumber;
  if (chemicalName) whereClause.chemicalName = { contains: chemicalName, mode: 'insensitive' };
  if (supplier) whereClause.supplier = supplier;
  if (restrictionStatus !== undefined) whereClause.restrictionStatus = restrictionStatus;
  if (researchGroupID) whereClause.researchGroupID = researchGroupID;
  if (activeStatus !== undefined) whereClause.activeStatus = activeStatus;
  if (locationID) whereClause.locationID = locationID;
  if (chemicalType) whereClause.chemicalType = chemicalType;
  if (restrictionDescription) whereClause.restrictionDescription = restrictionDescription;
  if (lastAudit) whereClause.lastAudit = lastAudit;
  if (quartzyNumber) whereClause.quartzyNumber = quartzyNumber;

  const skip = page !== undefined && rowsPerPage !== undefined ? page * rowsPerPage : undefined;
  const take = rowsPerPage;

  return await db.chemical.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    skip,
    take,
    include: {
      researchGroup: true,
      location: true,
      qrCode: true,
    },
  });
};

interface AddChemicalParams {
  qrID?: string;
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
  restrictionDescription?: string;
}

export const addChemical = async (params: AddChemicalParams) => {
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
    restrictionDescription,
  } = params;

  const researchGroup = await db.researchGroup.findFirst({
    where: { researchGroupID },
  });

  if (!researchGroup) throw new Error(`Research group with ID '${researchGroupID}' does not exist.`);

  const data = {
    qrID: qrID || null, 
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
    restrictionDescription: restrictionDescription || null, 
    researchGroup: {
      connect: { researchGroupID },
    },
    location: locationID ? { connect: { locationID } } : undefined,
  };

  // Pass the cleaned and typed data object to Prisma
  return await db.chemical.create({ data: { ...data, auditStatus: auditStatus || undefined } });
};

interface UpdateChemicalParams extends Partial<AddChemicalParams> {
  chemicalID: number;
  chemicalName: string;
  casNumber?: string;
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
}

export const updateChemical = async (params: UpdateChemicalParams) => {
  try {
    const updatedChemical = await db.chemical.update({
      where: { chemicalID: params.chemicalID },
      data: {
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
        locationID: params.locationID ?? null,
      },
    });

    return updatedChemical;
  } catch (error) {
    console.error('Error updating chemical:', error);
    return null;
  }
};

export const deleteChemical = async (chemicalID: number) => {
  await db.auditRecord.deleteMany({ where: { chemicalID } });
  return await db.chemical.delete({ where: { chemicalID } });
};

export const countData = async () => await db.chemical.count();
