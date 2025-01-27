'use server';

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

interface FindLocationParams {
  locationID?: number;
  building?: string;
  room?: string;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
  locationName?: string;
  qrID?: string;
  page?: number;
  rowsPerPage?: number;
}

export const findLocation = async (params: FindLocationParams) => {
  const {
    locationID,
    building,
    room,
    subLocation1,
    subLocation2,
    subLocation3,
    subLocation4,
    locationName,
    qrID,
    page,
    rowsPerPage,
  } = params;

  const whereClause: Record<string, any> = {};
  if (locationID) whereClause.locationID = locationID;
  if (building) whereClause.building = building;
  if (room) whereClause.room = room;
  if (subLocation1) whereClause.subLocation1 = subLocation1;
  if (subLocation2) whereClause.subLocation2 = subLocation2;
  if (subLocation3) whereClause.subLocation3 = subLocation3;
  if (subLocation4) whereClause.subLocation4 = subLocation4;
  if (qrID) whereClause.qrID = qrID;

  if (locationName) {
    whereClause.OR = [
      { building: { contains: locationName, mode: 'insensitive' } },
      { room: { contains: locationName, mode: 'insensitive' } },
      { subLocation1: { contains: locationName, mode: 'insensitive' } },
      { subLocation2: { contains: locationName, mode: 'insensitive' } },
      { subLocation3: { contains: locationName, mode: 'insensitive' } },
      { subLocation4: { contains: locationName, mode: 'insensitive' } },
    ];
  }

  const skip = page !== undefined && rowsPerPage !== undefined ? page * rowsPerPage : undefined;
  const take = rowsPerPage;

  return await db.location.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    skip,
    take,
    include: {
      qrCode: true,
    },
  });
};

interface AddLocationParams {
  building: string;
  room: string;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
  qrID?: string;
}

export const addLocation = async (params: AddLocationParams) => {
  return await db.location.create({
    data: params,
  });
};

interface UpdateLocationParams extends Partial<AddLocationParams> {
  locationID: number;
}

export const updateLocation = async (params: UpdateLocationParams) => {
  const { locationID, ...updateFields } = params;
  return await db.location.update({
    where: { locationID },
    data: updateFields,
  });
};

export const deleteLocation = async (locationID: number) => {
  return await db.location.delete({
    where: { locationID },
  });
};

export const countData = async () => await db.location.count();
