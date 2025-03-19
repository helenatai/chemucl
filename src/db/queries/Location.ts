'use server';

import { prisma } from 'db';

export const findLocation = async () => {
  const locations = await prisma.location.findMany({
    select: {
      locationID: true,
      qrID: true,
      building: true,
      buildingName: true,
      room: true,
    },
  });

  const locationsWithChemicals = await Promise.all(
    locations.map(async (loc) => {
      const chemicalCount = await prisma.chemical.count({
        where: { locationID: loc.locationID },
      });

      return {
        ...loc,
        qrID: loc.qrID, 
        buildingName: loc.buildingName ?? "",
        totalChemicals: chemicalCount, 
      };
    })
  );

  return locationsWithChemicals;
};

export const findLocationByQrID = async (qrID: string) => {
  const loc = await prisma.location.findFirst({
    where: { qrID },
    select: {
      locationID: true,
      qrID: true,
      building: true,
      buildingName: true,
      room: true,
    },
  });

  if (!loc) {
    return null; 
  }

  return {
    ...loc,
    buildingName: loc.buildingName ?? "",
  };
};

interface AddLocationParams {
  building: string;
  buildingName: string;
  room: string;
  subLocation1?: string;
  subLocation2?: string;
  subLocation3?: string;
  subLocation4?: string;
  qrID: string;
}

export const addLocation = async (params: AddLocationParams) => {
  const newLocation = await prisma.location.create({
    data: params,
  });
  return {
    ...newLocation,
    buildingName: newLocation.buildingName ?? "",
  };
};

interface UpdateLocationParams extends Partial<AddLocationParams> {
  locationID: number;
}

export const updateLocation = async (params: UpdateLocationParams) => {
  const { locationID, ...updateFields } = params;
  const updatedLocation = await prisma.location.update({
    where: { locationID },
    data: updateFields,
  });
  // Transform the returned object so that buildingName is always a string.
  return {
    ...updatedLocation,
    buildingName: updatedLocation.buildingName ?? "", 
  };
};

export const deleteLocation = async (locationID: number) => {
  return await prisma.location.delete({
    where: { locationID },
  });
};

export const countData = async () => await prisma.location.count();
