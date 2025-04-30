import { Prisma, QrCodeType } from '@prisma/client';
import { prisma } from 'db';

interface QrCodeParams {
  qrID?: string;
  type?: QrCodeType;
  locationID?: number;
  chemicalID?: number;
}

export const findQrCode = async (params: QrCodeParams) => {
  const { qrID, type, locationID, chemicalID } = params;

  const whereClause: Record<string, any> = {};
  if (qrID) whereClause.qrID = qrID;
  if (type) whereClause.type = type;
  if (locationID) whereClause.locationID = locationID;
  if (chemicalID) whereClause.chemicalID = chemicalID;

  return prisma.qrCode.findMany({ where: Object.keys(whereClause).length > 0 ? whereClause : undefined });
};

export const addQrCode = async (params: QrCodeParams) => {
  const { qrID, type, locationID, chemicalID } = params;

  if (!type) {
    throw new Error('Type is required and must be a valid QrCodeType');
  }

  const data: Prisma.QrCodeCreateInput = {
    qrID: qrID || '',
    type,
    location: locationID ? { connect: { locationID } } : undefined,
    chemical: chemicalID ? { connect: { chemicalID } } : undefined
  };

  return prisma.qrCode.create({ data });
};

export const updateQrCode = async (params: QrCodeParams) => {
  const { qrID, type, locationID, chemicalID } = params;

  const data: Record<string, any> = {};
  if (type !== undefined) data.type = type;
  if (locationID !== undefined) data.locationID = locationID;
  if (chemicalID !== undefined) data.chemicalID = chemicalID;

  return prisma.qrCode.update({ where: { qrID }, data });
};

export const deleteQrCode = async (qrID: string) => {
  return prisma.qrCode.delete({ where: { qrID } });
};

export const lastQrCode = async () => {
  return prisma.qrCode.findFirst({
    orderBy: {
      qrID: 'desc'
    }
  });
};
