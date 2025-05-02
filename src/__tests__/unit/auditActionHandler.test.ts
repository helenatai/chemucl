import { validateAndProcessAuditGeneral } from 'actions/audit/auditGeneralActionHandler';
import { prisma } from 'db';
import { revalidatePath } from 'next/cache';

// Mock the database
jest.mock('db', () => ({
  prisma: {
    auditGeneral: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn()
    },
    location: {
      findFirst: jest.fn()
    },
    chemical: {
      count: jest.fn(),
      findMany: jest.fn()
    },
    audit: {
      create: jest.fn()
    },
    auditRecord: {
      create: jest.fn()
    }
  }
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

describe('Audit Action Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Audit', () => {
    it('should successfully add an audit', async () => {
      const mockLocations = [
        { buildingName: 'Building A', room: 'Room 1' },
        { buildingName: 'Building B', room: 'Room 2' }
      ];

      const mockAuditGeneral = {
        auditGeneralID: 1,
        round: 1,
        auditorID: 'auditor1',
        pendingCount: 2,
        finishedCount: 0,
        startDate: new Date(),
        lastAuditDate: null,
        status: 'Ongoing',
        auditor: { id: 'auditor1', name: 'John Doe' }
      };

      const mockLocation = {
        locationID: 1,
        buildingName: 'Building A',
        room: 'Room 1'
      };

      const mockChemicals = [
        { chemicalID: 1, locationID: 1 },
        { chemicalID: 2, locationID: 1 }
      ];

      (prisma.auditGeneral.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditGeneral.create as jest.Mock).mockResolvedValue(mockAuditGeneral);
      (prisma.location.findFirst as jest.Mock).mockResolvedValue(mockLocation);
      (prisma.chemical.count as jest.Mock).mockResolvedValue(2);
      (prisma.chemical.findMany as jest.Mock).mockResolvedValue(mockChemicals);
      (prisma.audit.create as jest.Mock).mockResolvedValue({ auditID: 1 });
      (prisma.auditRecord.create as jest.Mock).mockResolvedValue({});

      const result = await validateAndProcessAuditGeneral('add', {
        auditorID: 'auditor1',
        locations: JSON.stringify(mockLocations)
      });

      expect(result.error).toBeUndefined();
      expect(result.audit).toEqual(mockAuditGeneral);
      expect(result.message).toBe('Audit added successfully');
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/audit-page');
    });

    it('should handle validation errors for invalid locations data', async () => {
      const result = await validateAndProcessAuditGeneral('add', {
        auditorID: 'auditor1',
        locations: 'invalid json'
      });

      expect(result.error).toBeDefined();
      expect(result.audit).toBeNull();
      expect(result.success).toBe(false);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle missing auditorID', async () => {
      const result = await validateAndProcessAuditGeneral('add', {
        locations: JSON.stringify([{ buildingName: 'Building A', room: 'Room 1' }])
      });

      expect(result.error).toBeDefined();
      expect(result.audit).toBeNull();
      expect(result.success).toBe(false);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Update Audit', () => {
    it('should successfully update an audit', async () => {
      const mockAuditGeneral = {
        auditGeneralID: 1,
        round: 1,
        auditorID: 'auditor1',
        pendingCount: 2,
        finishedCount: 0,
        startDate: new Date(),
        lastAuditDate: new Date(),
        status: 'Completed',
        auditor: { id: 'auditor1', name: 'John Doe' }
      };

      (prisma.auditGeneral.update as jest.Mock).mockResolvedValue(mockAuditGeneral);

      const result = await validateAndProcessAuditGeneral('update', {
        auditGeneralID: 1,
        status: 'Completed'
      });

      expect(result.error).toBeUndefined();
      expect(result.audit).toEqual(mockAuditGeneral);
      expect(result.message).toBe('Audit updated successfully');
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/audit-page');
      expect(revalidatePath).toHaveBeenCalledWith('/audit-page/1');
    });

    it('should handle missing auditGeneralID', async () => {
      const result = await validateAndProcessAuditGeneral('update', {
        status: 'Completed'
      });

      expect(result.error).toBeDefined();
      expect(result.audit).toBeNull();
      expect(result.success).toBe(false);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Operation', () => {
    it('should handle invalid operation', async () => {
      const result = await validateAndProcessAuditGeneral('invalid' as any, {});

      expect(result.error).toBe('Invalid operation');
      expect(result.audit).toBeNull();
      expect(result.success).toBe(false);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
