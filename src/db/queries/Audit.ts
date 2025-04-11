import { prisma } from 'db';
import { AuditWithRelations } from 'types/audit';

export const findAuditsByAuditGeneralID = async (auditGeneralID: number): Promise<AuditWithRelations[]> => {
  return prisma.audit.findMany({
    where: { auditGeneralID },
    include: {
      location: true, 
    }
  }) as Promise<AuditWithRelations[]>;
};

export async function verifyLocationQrHandler(auditId: number, scannedQr: string): Promise<{ valid: boolean; expected?: string }> {
  const audit = await prisma.audit.findUnique({
    where: { auditID: auditId },
    include: { location: true }
  });
  if (!audit || !audit.location) {
    return { valid: false };
  }
  const expectedQr = audit.location.qrID;
  return { valid: expectedQr === scannedQr, expected: expectedQr };
}

// export async function updateAuditRecordForChemicalScanHandler(auditId: number, scannedChemicalQr: string): Promise<{ success: boolean; message?: string }> {
//   const chemical = await prisma.chemical.findUnique({
//     where: { qrID: scannedChemicalQr },
//   });
//   if (!chemical) {
//     return { success: false, message: "No chemical found for the provided QR code." };
//   }
  
//   const auditRecord = await prisma.auditRecord.findFirst({
//     where: {
//       auditID: auditId,
//       chemicalID: chemical.chemicalID,
//       status: "Unaudited"
//     }
//   });
//   if (!auditRecord) {
//     return { success: false, message: "No unaudited record found for this chemical." };
//   }

//   await prisma.auditRecord.update({
//     where: { auditRecordID: auditRecord.auditRecordID },
//     data: {
//       status: "Audited",
//       lastAuditDate: new Date()
//     }
//   });

//   await prisma.audit.update({
//     where: { auditID: auditId },
//     data: { 
//       finishedCount: { increment: 1 }, 
//       pendingCount: { decrement: 1 }
//     }
//   });

//   return { success: true };
// }

export async function updateAuditRecordForChemicalScanHandler(auditId: number, scannedChemicalQr: string): Promise<{ success: boolean; message?: string; status?: string }> {
  const chemical = await prisma.chemical.findUnique({
    where: { qrID: scannedChemicalQr },
  });
  
  if (!chemical) {
    return { 
      success: false, 
      message: "No chemical found for the provided QR code.", 
      status: "invalid_qr" 
    };
  }
  
  // First check if this chemical has already been audited
  const alreadyAuditedRecord = await prisma.auditRecord.findFirst({
    where: {
      auditID: auditId,
      chemicalID: chemical.chemicalID,
      status: "Audited"
    }
  });
  
  if (alreadyAuditedRecord) {
    return { 
      success: false, 
      message: "Item already scanned", 
      status: "already_scanned" 
    };
  }
  
  // Then check if there's an unaudited record for this chemical
  const auditRecord = await prisma.auditRecord.findFirst({
    where: {
      auditID: auditId,
      chemicalID: chemical.chemicalID,
      status: "Unaudited"
    }
  });
  
  if (!auditRecord) {
    return { 
      success: false, 
      message: "This chemical is not associated with this audit location.", 
      status: "not_in_location" 
    };
  }

  // Mark it "Audited" + increment finishedCount on parent Audit
  await prisma.auditRecord.update({
    where: { auditRecordID: auditRecord.auditRecordID },
    data: {
      status: "Audited",
      lastAuditDate: new Date()
    }
  });

  await prisma.audit.update({
    where: { auditID: auditId },
    data: { 
      finishedCount: { increment: 1 }, 
      pendingCount: { decrement: 1 }
    }
  });

  return { success: true };
}

export async function completeAudit(auditId: number): Promise<{ success: boolean; message?: string }> {
  await prisma.auditRecord.updateMany({
    where: {
      auditID: auditId,
      status: "Unaudited"
    },
    data: {
      status: "Missing",
      lastAuditDate: new Date()
    }
  });

  await prisma.audit.update({
    where: { auditID: auditId },
    data: {
      status: "Completed",
      lastAuditDate: new Date()
    }
  });

  const foundAudit = await prisma.audit.findUnique({
    where: { auditID: auditId },
    select: { auditGeneralID: true }
  });

  if (foundAudit && foundAudit.auditGeneralID) {
    const updatedAuditGeneral = await prisma.auditGeneral.update({
      where: { auditGeneralID: foundAudit.auditGeneralID },
      data: { 
        finishedCount: { increment: 1 },
        pendingCount: { decrement: 1 }
      },
      select: { pendingCount: true }
    });

    if (updatedAuditGeneral.pendingCount <= 0) {
      await prisma.auditGeneral.update({
        where: { auditGeneralID: foundAudit.auditGeneralID },
        data: {
          status: "Completed",
          lastAuditDate: new Date()
        }
      });
    }
  }
  return { success: true };
}

export async function pauseAudit(auditId: number): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.audit.update({
      where: { auditID: auditId },
      data: { status: "Paused" } 
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error pausing audit:", error);
    return { success: false, message: error.message || "Error pausing audit." };
  }
}