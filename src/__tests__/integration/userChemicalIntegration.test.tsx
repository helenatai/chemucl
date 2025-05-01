import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { addChemical, updateChemical, deleteChemical } from 'db/queries/Chemical';
import { addLog } from 'db/queries/Log';
import { getServerSession } from 'next-auth';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Session } from 'next-auth';
import { ChemicalWithRelations } from 'types/chemical';

// Mock the imports
jest.mock('db/queries/Chemical');
jest.mock('db/queries/Log');
jest.mock('next-auth');
jest.mock('next/cache');

describe('User-Chemical Integration Tests', () => {
  const mockAdminSession: Session = {
    user: {
      id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@ucl.ac.uk',
      permission: 'Admin',
    },
    expires: new Date().toISOString(),
  };

  const mockStaffSession: Session = {
    user: {
      id: 'staff-user-id',
      name: 'Staff User',
      email: 'staff@ucl.ac.uk',
      permission: 'Staff',
    },
    expires: new Date().toISOString(),
  };

  const mockResearchStudentSession: Session = {
    user: {
      id: 'student-user-id',
      name: 'Research Student',
      email: 'student@ucl.ac.uk',
      permission: 'Research Student',
    },
    expires: new Date().toISOString(),
  };

  const mockChemical: ChemicalWithRelations = {
    chemicalID: 1,
    chemicalName: 'Test Chemical',
    casNumber: '123-45-6',
    qrID: 'ABC12',
    restrictionStatus: false,
    location: {
      locationID: 1,
      building: 'Test Building',
      buildingName: 'Test Building',
      room: 'Test Room',
    },
    chemicalType: 'Chemical',
    researchGroup: {
      researchGroupID: 1,
      groupName: 'Test Group',
    },
    activeStatus: true,
    quantity: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockAdminSession);
    (addChemical as any).mockResolvedValue(mockChemical);
    (updateChemical as any).mockResolvedValue(mockChemical);
    (deleteChemical as any).mockResolvedValue(mockChemical);
    (addLog as any).mockResolvedValue({});
  });

  it('should allow admin to add a chemical', async () => {
    const result = await validateAndProcessChemical('add', {
      chemicalName: 'Test Chemical',
      casNumber: null,
      qrID: 'ABC12',
      restrictionStatus: false,
      locationID: 1,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 1000,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockAdminSession.user.id,
        actionType: 'Added',
        chemicalName: 'Test Chemical',
      })
    );
  });

  it('should allow staff to add a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockStaffSession);

    const result = await validateAndProcessChemical('add', {
      chemicalName: 'Test Chemical',
      casNumber: null,
      qrID: 'ABC12',
      restrictionStatus: false,
      locationID: 1,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 1000,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockStaffSession.user.id,
        actionType: 'Added',
        chemicalName: 'Test Chemical',
      })
    );
  });

  it('should allow research students to add a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockResearchStudentSession);

    const result = await validateAndProcessChemical('add', {
      chemicalName: 'Test Chemical',
      casNumber: null,
      qrID: 'ABC12',
      restrictionStatus: false,
      locationID: 1,
      chemicalType: 'Chemical',
      researchGroupID: 1,
      quantity: 1000,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockResearchStudentSession.user.id,
        actionType: 'Added',
        chemicalName: 'Test Chemical',
      })
    );
  });

  it('should allow admin to update a chemical', async () => {
    const updatedChemical = {
      ...mockChemical,
      chemicalName: 'Updated Chemical',
    };

    (updateChemical as any).mockResolvedValue(updatedChemical);

    const result = await validateAndProcessChemical('update', {
      chemicalID: mockChemical.chemicalID,
      chemicalName: 'Updated Chemical',
      casNumber: mockChemical.casNumber,
      qrID: mockChemical.qrID,
      restrictionStatus: mockChemical.restrictionStatus,
      locationID: mockChemical.location?.locationID ?? 1,
      chemicalType: mockChemical.chemicalType,
      researchGroupID: mockChemical.researchGroup.researchGroupID,
      quantity: mockChemical.quantity,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockAdminSession.user.id,
        actionType: 'Updated',
        chemicalName: 'Updated Chemical',
      })
    );
  });

  it('should allow staff to update a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockStaffSession);
    const updatedChemical = {
      ...mockChemical,
      chemicalName: 'Updated Chemical',
    };

    (updateChemical as any).mockResolvedValue(updatedChemical);

    const result = await validateAndProcessChemical('update', {
      chemicalID: mockChemical.chemicalID,
      chemicalName: 'Updated Chemical',
      casNumber: mockChemical.casNumber,
      qrID: mockChemical.qrID,
      restrictionStatus: mockChemical.restrictionStatus,
      locationID: mockChemical.location?.locationID ?? 1,
      chemicalType: mockChemical.chemicalType,
      researchGroupID: mockChemical.researchGroup.researchGroupID,
      quantity: mockChemical.quantity,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockStaffSession.user.id,
        actionType: 'Updated',
        chemicalName: 'Updated Chemical',
      })
    );
  });

  it('should allow research students to update a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockResearchStudentSession);
    const updatedChemical = {
      ...mockChemical,
      chemicalName: 'Updated Chemical',
    };

    (updateChemical as any).mockResolvedValue(updatedChemical);

    const result = await validateAndProcessChemical('update', {
      chemicalID: mockChemical.chemicalID,
      chemicalName: 'Updated Chemical',
      casNumber: mockChemical.casNumber,
      qrID: mockChemical.qrID,
      restrictionStatus: mockChemical.restrictionStatus,
      locationID: mockChemical.location?.locationID ?? 1,
      chemicalType: mockChemical.chemicalType,
      researchGroupID: mockChemical.researchGroup.researchGroupID,
      quantity: mockChemical.quantity,
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockResearchStudentSession.user.id,
        actionType: 'Updated',
        chemicalName: 'Updated Chemical',
      })
    );
  });

  it('should allow admin to delete a chemical', async () => {
    const result = await validateAndProcessChemical('delete', {
      chemicalIDs: [mockChemical.chemicalID],
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockAdminSession.user.id,
        actionType: 'Deleted',
        chemicalID: mockChemical.chemicalID,
        chemicalName: 'N/A',
        description: "Chemical 'N/A' deleted.",
        locationBuilding: 'N/A',
        locationRoom: 'N/A',
      })
    );
  });

  it('should allow staff to delete a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockStaffSession);

    const result = await validateAndProcessChemical('delete', {
      chemicalIDs: [mockChemical.chemicalID],
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockStaffSession.user.id,
        actionType: 'Deleted',
        chemicalID: mockChemical.chemicalID,
        chemicalName: 'N/A',
        description: "Chemical 'N/A' deleted.",
        locationBuilding: 'N/A',
        locationRoom: 'N/A',
      })
    );
  });

  it('should allow research students to delete a chemical', async () => {
    (getServerSession as any).mockResolvedValue(mockResearchStudentSession);

    const result = await validateAndProcessChemical('delete', {
      chemicalIDs: [mockChemical.chemicalID],
    });

    expect(result.error).toBeUndefined();
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockResearchStudentSession.user.id,
        actionType: 'Deleted',
        chemicalID: mockChemical.chemicalID,
        chemicalName: 'N/A',
        description: "Chemical 'N/A' deleted.",
        locationBuilding: 'N/A',
        locationRoom: 'N/A',
      })
    );
  });
});