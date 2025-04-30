'use server';

import { validateAndProcessImport } from '../chemicalActionHandler';
import { validateAndProcessQrCode } from 'actions/qr-code/qrCodeActionHandler';
import { ChemicalActionResponse } from 'types/chemical';

export async function importChemicalsAction(chemicals: any[]): Promise<ChemicalActionResponse> {
  // First, process all chemical imports
  const result = await validateAndProcessImport(chemicals);

  if (result.error || !result.success) {
    return result;
  }

  // Process QR codes for successfully imported chemicals
  const qrCodeErrors: string[] = [];

  for (const chemical of result.chemicals) {
    const qrCodeResult = await validateAndProcessQrCode('add', {
      qrID: chemical.qrID,
      type: 'CHEMICAL',
      chemicalID: chemical.chemicalID
    });

    if (qrCodeResult.error) {
      console.error(`Error generating QR Code for chemical ${chemical.chemicalID}:`, qrCodeResult.error);
      qrCodeErrors.push(`Failed to generate QR code for chemical ${chemical.chemicalName}: ${qrCodeResult.error}`);
    }
  }

  // If there were any QR code generation errors, include them in the response
  if (qrCodeErrors.length > 0) {
    return {
      message: 'Chemicals imported successfully, but some QR codes could not be generated.',
      chemicals: result.chemicals,
      success: true,
      error: qrCodeErrors.join('\n')
    };
  }

  return {
    message: 'Chemicals and QR codes created successfully',
    chemicals: result.chemicals,
    success: true
  };
}
