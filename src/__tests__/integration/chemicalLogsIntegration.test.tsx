import { validateAndProcessChemical } from 'actions/chemical/chemicalActionHandler';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { addChemical, updateChemical, deleteChemical } from 'db/queries/Chemical';
import { addLog } from 'db/queries/Log';
import { ROLES } from '../../constants/roles';

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock database queries
jest.mock('db/queries/Chemical', () => ({
  addChemical: jest.fn(),
  updateChemical: jest.fn(),
  deleteChemical: jest.fn(),
}));

jest.mock('db/queries/Log', () => ({
  addLog: jest.fn(),
}));

describe('Chemical-Logs Integration Tests', () => {
  const mockAdminSession = {
    user: {
      id: 'admin123',
      name: 'Admin User',
      email: 'admin@example.com',
      permission: ROLES.ADMIN,
    },
  } as Session;

  const mockStaffSession = {
    user: {
      id: 'staff123',
      name: 'Staff User',
      email: 'staff@example.com',
      permission: ROLES.STAFF,
    },
  } as Session;

  const mockResearchStudentSession = {
    user: {
      id: 'student123',
      name: 'Research Student',
      email: 'student@example.com',
      permission: ROLES.RESEARCH_STUDENT,
    },
  } as Session;

  const mockChemical = {
    chemicalID: 1,
    chemicalName: 'Test Chemical',
    casNumber: '123-45-6',
    qrID: 'TEST-001',
    restrictionStatus: false,
    location: {
      locationID: 1,
      building: 'Test Building',
      room: 'Test Room',
      buildingName: 'Test Building Name'
    },
    chemicalType: 'Solvent',
    researchGroup: {
      researchGroupID: 1,
      groupName: 'Test Group'
    },
    quantity: 100,
    activeStatus: true,
    supplier: 'Test Supplier',
    description: 'Test Description',
    quartzyNumber: 'TEST-Q-001',
    subLocation1: 'Cabinet 1',
    subLocation2: 'Shelf 1',
    subLocation3: null,
    subLocation4: null,
    dateAdded: new Date('2024-01-01'),
    dateUpdated: new Date('2024-01-02')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    (addChemical as jest.Mock).mockResolvedValue(mockChemical);
    (updateChemical as jest.Mock).mockResolvedValue(mockChemical);
    (deleteChemical as jest.Mock).mockResolvedValue(true);
    (addLog as jest.Mock).mockResolvedValue({ logID: 1 });
  });

  describe('Logging Chemical Actions', () => {
    it('should log when admin adds a chemical', async () => {
      const result = await validateAndProcessChemical('add', {
        chemicalName: mockChemical.chemicalName,
        casNumber: mockChemical.casNumber,
        qrID: mockChemical.qrID,
        restrictionStatus: mockChemical.restrictionStatus,
        locationID: mockChemical.location.locationID,
        chemicalType: mockChemical.chemicalType,
        researchGroupID: mockChemical.researchGroup.researchGroupID,
        quantity: mockChemical.quantity,
        activeStatus: mockChemical.activeStatus,
        supplier: mockChemical.supplier,
        description: mockChemical.description,
        quartzyNumber: mockChemical.quartzyNumber,
        subLocation1: mockChemical.subLocation1,
        subLocation2: mockChemical.subLocation2,
        subLocation3: mockChemical.subLocation3,
        subLocation4: mockChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockAdminSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Added',
          description: `Chemical '${mockChemical.chemicalName}' added.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when staff adds a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStaffSession);

      const result = await validateAndProcessChemical('add', {
        chemicalName: mockChemical.chemicalName,
        casNumber: mockChemical.casNumber,
        qrID: mockChemical.qrID,
        restrictionStatus: mockChemical.restrictionStatus,
        locationID: mockChemical.location.locationID,
        chemicalType: mockChemical.chemicalType,
        researchGroupID: mockChemical.researchGroup.researchGroupID,
        quantity: mockChemical.quantity,
        activeStatus: mockChemical.activeStatus,
        supplier: mockChemical.supplier,
        description: mockChemical.description,
        quartzyNumber: mockChemical.quartzyNumber,
        subLocation1: mockChemical.subLocation1,
        subLocation2: mockChemical.subLocation2,
        subLocation3: mockChemical.subLocation3,
        subLocation4: mockChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockStaffSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Added',
          description: `Chemical '${mockChemical.chemicalName}' added.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when research student adds a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockResearchStudentSession);

      const result = await validateAndProcessChemical('add', {
        chemicalName: mockChemical.chemicalName,
        casNumber: mockChemical.casNumber,
        qrID: mockChemical.qrID,
        restrictionStatus: mockChemical.restrictionStatus,
        locationID: mockChemical.location.locationID,
        chemicalType: mockChemical.chemicalType,
        researchGroupID: mockChemical.researchGroup.researchGroupID,
        quantity: mockChemical.quantity,
        activeStatus: mockChemical.activeStatus,
        supplier: mockChemical.supplier,
        description: mockChemical.description,
        quartzyNumber: mockChemical.quartzyNumber,
        subLocation1: mockChemical.subLocation1,
        subLocation2: mockChemical.subLocation2,
        subLocation3: mockChemical.subLocation3,
        subLocation4: mockChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockResearchStudentSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Added',
          description: `Chemical '${mockChemical.chemicalName}' added.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when admin updates a chemical', async () => {
      const updatedChemical = {
        ...mockChemical,
        chemicalName: 'Updated Chemical',
        quantity: 200,
      };

      const result = await validateAndProcessChemical('update', {
        chemicalID: updatedChemical.chemicalID,
        chemicalName: updatedChemical.chemicalName,
        casNumber: updatedChemical.casNumber,
        restrictionStatus: updatedChemical.restrictionStatus,
        locationID: updatedChemical.location.locationID,
        chemicalType: updatedChemical.chemicalType,
        researchGroupID: updatedChemical.researchGroup.researchGroupID,
        quantity: updatedChemical.quantity,
        activeStatus: updatedChemical.activeStatus,
        supplier: updatedChemical.supplier,
        description: updatedChemical.description,
        quartzyNumber: updatedChemical.quartzyNumber,
        subLocation1: updatedChemical.subLocation1,
        subLocation2: updatedChemical.subLocation2,
        subLocation3: updatedChemical.subLocation3,
        subLocation4: updatedChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockAdminSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Updated',
          description: `Chemical '${mockChemical.chemicalName}' updated.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when staff updates a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStaffSession);
      const updatedChemical = {
        ...mockChemical,
        chemicalName: 'Updated Chemical',
        quantity: 200,
      };

      const result = await validateAndProcessChemical('update', {
        chemicalID: updatedChemical.chemicalID,
        chemicalName: updatedChemical.chemicalName,
        casNumber: updatedChemical.casNumber,
        restrictionStatus: updatedChemical.restrictionStatus,
        locationID: updatedChemical.location.locationID,
        chemicalType: updatedChemical.chemicalType,
        researchGroupID: updatedChemical.researchGroup.researchGroupID,
        quantity: updatedChemical.quantity,
        activeStatus: updatedChemical.activeStatus,
        supplier: updatedChemical.supplier,
        description: updatedChemical.description,
        quartzyNumber: updatedChemical.quartzyNumber,
        subLocation1: updatedChemical.subLocation1,
        subLocation2: updatedChemical.subLocation2,
        subLocation3: updatedChemical.subLocation3,
        subLocation4: updatedChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockStaffSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Updated',
          description: `Chemical '${mockChemical.chemicalName}' updated.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when research student updates a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockResearchStudentSession);
      const updatedChemical = {
        ...mockChemical,
        chemicalName: 'Updated Chemical',
        quantity: 200,
      };

      const result = await validateAndProcessChemical('update', {
        chemicalID: updatedChemical.chemicalID,
        chemicalName: updatedChemical.chemicalName,
        casNumber: updatedChemical.casNumber,
        restrictionStatus: updatedChemical.restrictionStatus,
        locationID: updatedChemical.location.locationID,
        chemicalType: updatedChemical.chemicalType,
        researchGroupID: updatedChemical.researchGroup.researchGroupID,
        quantity: updatedChemical.quantity,
        activeStatus: updatedChemical.activeStatus,
        supplier: updatedChemical.supplier,
        description: updatedChemical.description,
        quartzyNumber: updatedChemical.quartzyNumber,
        subLocation1: updatedChemical.subLocation1,
        subLocation2: updatedChemical.subLocation2,
        subLocation3: updatedChemical.subLocation3,
        subLocation4: updatedChemical.subLocation4
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockResearchStudentSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Updated',
          description: `Chemical '${mockChemical.chemicalName}' updated.`,
          chemicalName: mockChemical.chemicalName,
          locationBuilding: mockChemical.location.building,
          locationRoom: mockChemical.location.room
        })
      );
    });

    it('should log when admin deletes a chemical', async () => {
      const result = await validateAndProcessChemical('delete', {
        chemicalIDs: [mockChemical.chemicalID],
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockAdminSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Deleted',
          description: `Chemical 'N/A' deleted.`,
          chemicalName: 'N/A',
          locationBuilding: 'N/A',
          locationRoom: 'N/A'
        })
      );
    });

    it('should log when staff deletes a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStaffSession);

      const result = await validateAndProcessChemical('delete', {
        chemicalIDs: [mockChemical.chemicalID],
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockStaffSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Deleted',
          description: `Chemical 'N/A' deleted.`,
          chemicalName: 'N/A',
          locationBuilding: 'N/A',
          locationRoom: 'N/A'
        })
      );
    });

    it('should log when research student deletes a chemical', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockResearchStudentSession);

      const result = await validateAndProcessChemical('delete', {
        chemicalIDs: [mockChemical.chemicalID],
      });

      expect(result.error).toBeUndefined();
      expect(addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: mockResearchStudentSession.user.id,
          chemicalID: mockChemical.chemicalID,
          actionType: 'Deleted',
          description: `Chemical 'N/A' deleted.`,
          chemicalName: 'N/A',
          locationBuilding: 'N/A',
          locationRoom: 'N/A'
        })
      );
    });
  });
}); 