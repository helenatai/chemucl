import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { addChemical, updateChemical, deleteChemical } from 'db/queries/Chemical';
import { addLog } from 'db/queries/Log';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Session } from 'next-auth';

// Mock the imports
jest.mock('db/queries/Chemical');
jest.mock('db/queries/Log');
jest.mock('next-auth');
jest.mock('next/cache');
jest.mock('db', () => ({
  prisma: {
    chemical: {
      findUnique: jest.fn()
    }
  }
}));

describe('Chemical Action Handler', () => {
  const mockSession: Session = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@ucl.ac.uk',
      permission: 'ADMIN'
    },
    expires: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
  });

  describe('Add Chemical', () => {
    const validChemicalData = {
      chemicalName: 'Test Chemical',
      casNumber: '123-45-6',
      qrID: 'AAA25',
      restrictionStatus: false,
      locationID: 1,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 100
    };

    it('should successfully add a chemical', async () => {
      const mockNewChemical = {
        ...validChemicalData,
        chemicalID: 1,
        location: {
          building: 'Test Building',
          room: 'Test Room'
        }
      };

      (addChemical as any).mockResolvedValue(mockNewChemical);
      (addLog as any).mockResolvedValue({});

      const result = await validateAndProcessChemical('add', validChemicalData);

      expect(result).toEqual({
        message: 'Chemical added successfully.',
        chemicals: [mockNewChemical]
      });
      expect(addChemical).toHaveBeenCalledWith(expect.objectContaining(validChemicalData));
      expect(addLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/inventory-page');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...validChemicalData,
        quantity: -1 // Invalid quantity
      };

      const result = await validateAndProcessChemical('add', invalidData);

      expect(result.error).toBeDefined();
      expect(addChemical).not.toHaveBeenCalled();
      expect(addLog).not.toHaveBeenCalled();
    });
  });

  describe('Update Chemical', () => {
    const validUpdateData = {
      chemicalID: 1,
      chemicalName: 'Updated Chemical',
      casNumber: '123-45-6',
      restrictionStatus: false,
      locationID: 1,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 100
    };

    it('should successfully update a chemical', async () => {
      const mockUpdatedChemical = {
        ...validUpdateData,
        location: {
          building: 'Test Building',
          room: 'Test Room'
        }
      };

      (updateChemical as any).mockResolvedValue(mockUpdatedChemical);
      (addLog as any).mockResolvedValue({});

      const result = await validateAndProcessChemical('update', validUpdateData);

      expect(result).toEqual({
        message: 'Chemical updated successfully.',
        chemicals: [mockUpdatedChemical]
      });
      expect(updateChemical).toHaveBeenCalledWith(expect.objectContaining(validUpdateData));
      expect(addLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/inventory-page');
      expect(revalidatePath).toHaveBeenCalledWith('/inventory-page/undefined');
    });
  });

  describe('Delete Chemical', () => {
    const validDeleteData = {
      chemicalIDs: [1, 2]
    };

    it('should successfully delete chemicals', async () => {
      const mockChemicalData = {
        chemicalName: 'Test Chemical',
        location: {
          building: 'Test Building',
          room: 'Test Room'
        }
      };

      (deleteChemical as any).mockResolvedValue({});
      (addLog as any).mockResolvedValue({});
      jest.spyOn(global.console, 'error').mockImplementation(() => {});

      const prismaFindUnique = jest.spyOn(require('db').prisma.chemical, 'findUnique');
      prismaFindUnique.mockResolvedValue(mockChemicalData);

      const result = await validateAndProcessChemical('delete', validDeleteData);

      expect(result).toEqual({
        message: 'Selected chemicals and their QR codes deleted successfully.',
        chemicals: []
      });
      expect(deleteChemical).toHaveBeenCalledTimes(2);
      expect(addLog).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith('/inventory-page');
    });
  });
});
