'use server';

import { z } from 'zod';
import { QrCodeType } from '@prisma/client';
import {
  findQrCode,
  addQrCode,
  updateQrCode,
  deleteQrCode,
  lastQrCode,
} from 'db/queries/QrCode';
import { findChemical } from 'db/queries/Chemical';

const baseQrCodeSchema = z.object({
  qrID: z.string().optional(),
  type: z.nativeEnum(QrCodeType).optional(),
  locationID: z.number().optional(),
  chemicalID: z.number().optional(),
});

const addQrCodeSchema = baseQrCodeSchema.extend({
  type: z.nativeEnum(QrCodeType),
});

const updateQrCodeSchema = baseQrCodeSchema.extend({
  qrID: z.string(),
});

export async function validateAndProcessQrCode(
  action: string,
  params: any
): Promise<{ error?: string; qrCode?: any; qrCodes?: any[] }> {
  let validationResult;

  if (action === 'add') {
    validationResult = addQrCodeSchema.safeParse(params);
  } else if (action === 'update') {
    validationResult = updateQrCodeSchema.safeParse(params);
  } else {
    validationResult = baseQrCodeSchema.safeParse(params);
  }

  if (!validationResult.success) {
    return { error: validationResult.error.flatten().toString() };
  }

  const validatedParams = validationResult.data;

  try {
    switch (action) {
      case 'find': {
        const qrCodes = await findQrCode(validatedParams);
        return { qrCodes };
      }
      case 'add': {
        const newQrCode = await addQrCode(validatedParams);
        return { qrCode: newQrCode };
      }
      case 'update': {
        if (!validatedParams.qrID) {
          return { error: 'qrID is required for update action' };
        }
        const updatedQrCode = await updateQrCode(validatedParams);
        return { qrCode: updatedQrCode };
      }
      case 'delete': {
        if (!validatedParams.qrID) {
          return { error: 'qrID is required for delete action' };
        }
        const deletedQrCode = await deleteQrCode(validatedParams.qrID);
        return { qrCode: deletedQrCode };
      }
      case 'latest': {
        const lastQRCode = await lastQrCode();
        return { qrCode: lastQRCode };
      }
      default:
        return { error: 'Invalid action specified' };
    }
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function getChemicalByQrCode(qrID: string) {
  try {
    const qrCode = await findQrCode({ qrID });
    if (qrCode.length === 0) {
      throw new Error(`QR Code with ID ${qrID} not found`);
    }

    const chemicalID = qrCode[0].chemicalID;
    if (!chemicalID) {
      throw new Error(`No chemicalID associated with QR Code ${qrID}`);
    }

    const chemical = await findChemical({ chemicalID });
    return chemical[0];
  } catch (error) {
    return { error: (error as Error).message };
  }
}
